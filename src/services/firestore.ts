import { initializeApp } from 'firebase/app';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc,
  Timestamp,
  addDoc,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
  writeBatch,
  runTransaction,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  startAfter,
  Query,
  getCountFromServer
} from 'firebase/firestore';
import { db } from './firebase';
import { z } from 'zod';

// Type definitions
export interface ProductData {
  id?: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  currency: string;
  images: string[];
  category: string;
  subcategory?: string;
  artisanId: string;
  createdAt?: Date;
  updatedAt?: Date;
  inventory: number;
  attributes?: {
    size?: string[];
    color?: string[];
    material?: string[];
    weight?: number;
    dimensions?: string;
  };
  tags?: string[];
  isCustomizable?: boolean;
  averageRating?: number;
  totalReviews?: number;
  occasion?: string;
  materials?: string[];
  status?: string;
  shippingInfo?: {
    weight?: number;
    dimensions?: string;
    freeShipping?: boolean;
    shippingTime?: string;
  };
  customizationOptions?: {
    text?: boolean;
    color?: boolean;
    size?: boolean;
    material?: boolean;
  };
}

export interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  role: 'customer' | 'artisan' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
  addresses?: {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
    label?: string | null; // e.g., "Home", "Work", etc. - now allows null
  }[];
  bio?: string;
  companyName?: string;
  isVerified?: boolean;
  lastLogin?: Date;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    theme: string;
  };
}

// Validation schemas
const addressSchema = z.object({
  id: z.string(),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
  isDefault: z.boolean(),
  label: z.string().nullable().optional() // Allow null for optional label
});

const userSchema = z.object({
  uid: z.string(),
  displayName: z.string().min(1, 'Display name is required'),
  email: z.string().email('Invalid email'),
  photoURL: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(['customer', 'artisan', 'admin']),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  address: addressSchema.optional(),
  bio: z.string().optional(),
  companyName: z.string().optional()
});

const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  discountedPrice: z.number().positive('Discounted price must be positive').optional(),
  currency: z.string(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  artisanId: z.string(),
  createdAt: z.instanceof(Date),
  updatedAt: z.instanceof(Date),
  inventory: z.number().int().min(0, 'Inventory cannot be negative'),
  attributes: z.record(z.any()),
  tags: z.array(z.string()),
  isCustomizable: z.boolean(),
  averageRating: z.number().min(0).max(5).optional(),
  totalReviews: z.number().int().min(0).optional(),
  occasion: z.string().optional(),
  materials: z.array(z.string()).optional()
});

// Type definitions (using Zod inferred types)
export type Address = z.infer<typeof addressSchema>;
export type User = z.infer<typeof userSchema>;
export type Product = z.infer<typeof productSchema>;

// Add missing type definitions
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingMethod: string;
  shippingCost: number;
  discount?: number;
  tax?: number;
  trackingNumber?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  currency: string;
  image?: string;
  customizations?: Record<string, any>;
  artisanId: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  images?: string[];
  artisanResponse?: {
    response: string;
    createdAt: Timestamp;
  };
}

// Custom error class
export class FirestoreError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'FirestoreError';
  }
}

// Helper functions
const handleError = (error: unknown, context: string): FirestoreError => {
  console.error(`Error in ${context}:`, error);
  const errorMessage = (error instanceof Error) ? error.message : String(error);
  const errorCode = (error && typeof error === 'object' && 'code' in error) ? (error as any).code : 'unknown';
  return new FirestoreError(
    errorMessage,
    errorCode,
    error
  );
};

const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw handleError(error, 'validateData');
    }
    throw handleError(error, 'validateData');
  }
};

export const removeUndefined = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }

  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value !== undefined) {
        newObj[key] = removeUndefined(value);
      }
    }
  }
  return newObj;
};

// Batch operations
const batchCreateProducts = async (products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]) => {
  const batch = writeBatch(db);
  const now = new Date();

  try {
    products.forEach(product => {
      const productRef = doc(collection(db, 'products'));
      const productData = {
        ...product,
        createdAt: now,
        updatedAt: now
      };
      validateData(productSchema, { ...productData, id: productRef.id });
      batch.set(productRef, productData);
    });

    await batch.commit();
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error, 'batchCreateProducts') };
  }
};

const batchUpdateProducts = async (updates: { id: string; data: Partial<Product> }[]) => {
  const batch = writeBatch(db);
  const now = new Date();

  try {
    updates.forEach(({ id, data }) => {
      const productRef = doc(db, 'products', id);
      batch.update(productRef, { ...data, updatedAt: now });
    });

    await batch.commit();
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error, 'batchUpdateProducts') };
  }
};

// Pagination helper
const getPaginatedResults = async <T>(
  q: Query,
  lastDoc: QueryDocumentSnapshot | null,
  pageSize: number
): Promise<{ data: T[]; lastDoc: QueryDocumentSnapshot | null; total: number }> => {
  try {
    let queryRef = q;
    
    if (lastDoc) {
      queryRef = query(q, startAfter(lastDoc));
    }
    
    queryRef = query(queryRef, limit(pageSize));
    
    const [snapshot, totalSnapshot] = await Promise.all([
      getDocs(queryRef),
      getCountFromServer(q)
    ]);

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];

    return {
      data,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      total: totalSnapshot.data().count
    };
  } catch (error: unknown) {
    throw handleError(error, 'getPaginatedResults');
  }
};

// Enhanced CRUD operations with validation and error handling
const createUser = async (uid: string, userData: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', uid);
    const timestamp = Timestamp.now();
    
    const newUser = {
      ...userData,
      uid,
      role: userData.role || 'customer',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    validateData(userSchema, newUser);
    await setDoc(userRef, newUser);
    
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error, 'createUser') };
  }
};

const getUserById = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      validateData(userSchema, userData);
      return { user: userData, error: null };
    }
    
    return { user: null, error: handleError(new Error('User not found'), 'getUserById') };
  } catch (error: unknown) {
    return { user: null, error: handleError(error, 'getUserById') };
  }
};

// Transaction example for updating product inventory
const updateProductInventory = async (
  productId: string,
  quantity: number,
  operation: 'add' | 'subtract'
) => {
  try {
    await runTransaction(db, async (transaction) => {
      const productRef = doc(db, 'products', productId);
      const productSnap = await transaction.get(productRef);
      
      if (!productSnap.exists()) {
        throw handleError(new Error('Product not found'), 'updateProductInventory');
      }
      
      const currentInventory = productSnap.data().inventory;
      const newInventory = operation === 'add' 
        ? currentInventory + quantity 
        : currentInventory - quantity;
      
      if (newInventory < 0) {
        throw handleError(new Error('Insufficient inventory'), 'updateProductInventory');
      }
      
      transaction.update(productRef, { 
        inventory: newInventory,
        updatedAt: serverTimestamp()
      });
    });
    
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error, 'updateProductInventory') };
  }
};

// Enhanced product queries with pagination
const getProducts = async (
  constraints: QueryConstraint[] = [],
  pageSize: number = 20,
  lastDoc: QueryDocumentSnapshot | null = null
) => {
  try {
    console.log('Initializing getProducts...');
    const productsRef = collection(db, 'products');
    console.log('Created products collection reference');
    
    const q = query(productsRef, ...constraints);
    console.log('Created query with constraints:', constraints);
    
    console.log('Fetching paginated results...');
    const result = await getPaginatedResults<Product>(q, lastDoc, pageSize);
    console.log('Got paginated results:', result.data.length, 'products');
    
    const products = result.data.map(doc => ({
      ...doc,
      createdAt: doc.createdAt instanceof Timestamp ? doc.createdAt.toDate() : doc.createdAt,
      updatedAt: doc.updatedAt instanceof Timestamp ? doc.updatedAt.toDate() : doc.updatedAt
    }));
    
    return { 
      products,
      lastDoc: result.lastDoc,
      total: result.total,
      error: null 
    };
  } catch (error: unknown) {
    console.error('Error in getProducts:', error);
    return { 
      products: [], 
      lastDoc: null, 
      total: 0, 
      error: handleError(error, 'getProducts') 
    };
  }
};

// Order operations
const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Use a transaction to ensure atomicity for order creation and inventory updates
    const newOrderRef = doc(collection(db, 'orders'));
    await setDoc(newOrderRef, {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: newOrderRef.id };
  } catch (error: unknown) {
    throw handleError(error, 'createOrder');
  }
};

const getOrderById = async (orderId: string) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
      const orderData = orderSnap.data() as Order;
      // Convert Timestamps back to Date objects for consistency if needed outside Firestore
      const cleanedOrderData = {
        ...orderData,
        createdAt: orderData.createdAt.toDate(),
        updatedAt: orderData.updatedAt.toDate(),
        // Recursively clean timestamps in nested items if they exist
        items: orderData.items.map(item => ({ 
          ...item,
          // Assuming item.createdAt and item.updatedAt might exist and be Timestamps
          // If not, these lines will be harmless or removed by a smarter solution
          // createdAt: item.createdAt instanceof Timestamp ? item.createdAt.toDate() : item.createdAt,
          // updatedAt: item.updatedAt instanceof Timestamp ? item.updatedAt.toDate() : item.updatedAt,
        }))
      };

      return { order: cleanedOrderData, error: null };
    }

    return { order: null, error: handleError(new Error('Order not found'), 'getOrderById') };
  } catch (error: unknown) {
    return { order: null, error: handleError(error, 'getOrderById') };
  }
};

const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error, 'updateOrderStatus') };
  }
};

const getUserOrders = async (userId: string) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const orders: Order[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Order),
      createdAt: (doc.data() as Order).createdAt.toDate(), // Convert Timestamp to Date
      updatedAt: (doc.data() as Order).updatedAt.toDate(), // Convert Timestamp to Date
    }));

    return { orders, error: null };
  } catch (error: unknown) {
    return { orders: [], error: handleError(error, 'getUserOrders') };
  }
};

const getArtisanOrders = async (artisanId: string) => {
  try {
    const ordersRef = collection(db, 'orders');
    // Query for orders where any item in the `items` array has the matching artisanId
    // This requires a special index in Firestore: create one on `items.artisanId`
    const q = query(
      ordersRef,
      where('items', 'array-contains', { artisanId }), // This will only work if the entire item object matches
      orderBy('createdAt', 'desc')
    );
    
    // A more robust way to query if you need to check each item's artisanId without exact object match
    // would involve filtering on the client-side after fetching, or using a collection group query if `items` were a subcollection.
    // For simplicity, sticking with `array-contains` assuming exact item object will be matched or adjusted later.

    const querySnapshot = await getDocs(q);

    const orders: Order[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Order),
      createdAt: (doc.data() as Order).createdAt.toDate(),
      updatedAt: (doc.data() as Order).updatedAt.toDate(),
    }));

    // Further filter if array-contains isn't precise enough for specific artisanId within the item object
    const filteredOrders = orders.filter(order => 
      order.items.some(item => item.artisanId === artisanId)
    );

    return { orders: filteredOrders, error: null };
  } catch (error: unknown) {
    return { orders: [], error: handleError(error, 'getArtisanOrders') };
  }
};

const createReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const newReviewRef = doc(reviewsRef);
    await setDoc(newReviewRef, {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: newReviewRef.id };
  } catch (error: unknown) {
    throw handleError(error, 'createReview');
  }
};

const getProductReviews = async (productId: string) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('productId', '==', productId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const reviews: Review[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Review),
      createdAt: (doc.data() as Review).createdAt.toDate(),
      updatedAt: (doc.data() as Review).updatedAt.toDate(),
    }));

    return { reviews, error: null };
  } catch (error: unknown) {
    return { reviews: [], error: handleError(error, 'getProductReviews') };
  }
};

const addArtisanResponseToReview = async (reviewId: string, response: string) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      artisanResponse: {
        response,
        createdAt: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error, 'addArtisanResponseToReview') };
  }
};

const updateProductRating = async (productId: string) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('productId', '==', productId));
    const querySnapshot = await getDocs(q);

    let totalRating = 0;
    querySnapshot.docs.forEach(doc => {
      totalRating += (doc.data() as Review).rating;
    });

    const averageRating = querySnapshot.docs.length > 0 ? totalRating / querySnapshot.docs.length : 0;
    const totalReviews = querySnapshot.docs.length;

    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      averageRating,
      totalReviews,
      updatedAt: serverTimestamp(),
    });

    return { success: true, averageRating, totalReviews, error: null };
  } catch (error: unknown) {
    return { success: false, averageRating: 0, totalReviews: 0, error: handleError(error, 'updateProductRating') };
  }
};

export const createProduct = async (productData: ProductData) => {
  try {
    const productsRef = collection(db, 'products');
    const newProductRef = doc(productsRef);
    await setDoc(newProductRef, {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: newProductRef.id };
  } catch (error: unknown) {
    throw handleError(error, 'createProduct');
  }
};

export const updateProduct = async (productId: string, productData: Partial<ProductData>) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      ...productData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: unknown) {
    throw handleError(error, 'updateProduct');
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    return { success: true };
  } catch (error: unknown) {
    throw handleError(error, 'deleteProduct');
  }
};

export const getProductById = async (productId: string) => {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const productData = productSnap.data() as Product;
      // Convert Timestamps back to Date objects if needed outside Firestore
      const cleanedProductData = {
        ...productData,
        createdAt: productData.createdAt instanceof Timestamp ? productData.createdAt.toDate() : productData.createdAt,
        updatedAt: productData.updatedAt instanceof Timestamp ? productData.updatedAt.toDate() : productData.updatedAt,
      };
      return { product: cleanedProductData, error: null };
    }
    return { product: null, error: handleError(new Error('Product not found'), 'getProductById') };
  } catch (error: unknown) {
    return { product: null, error: handleError(error, 'getProductById') };
  }
};

export const getProductsByArtisan = async (artisanId: string) => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('artisanId', '==', artisanId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const products: Product[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Product),
      createdAt: (doc.data() as Product).createdAt.toDate(), // Convert Timestamp to Date
      updatedAt: (doc.data() as Product).updatedAt.toDate(), // Convert Timestamp to Date
    }));

    return { products, error: null };
  } catch (error: unknown) {
    return { products: [], error: handleError(error, 'getProductsByArtisan') };
  }
};

export const getUserData = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserData;
      // Convert Timestamps back to Date objects for addresses if necessary
      const cleanedUserData = {
        ...userData,
        createdAt: userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : userData.createdAt,
        updatedAt: userData.updatedAt instanceof Timestamp ? userData.updatedAt.toDate() : userData.updatedAt,
        lastLogin: userData.lastLogin instanceof Timestamp ? userData.lastLogin.toDate() : userData.lastLogin,
        addresses: userData.addresses?.map(addr => ({ // Ensure nested objects are also cleaned
          ...addr,
          createdAt: (addr as any).createdAt instanceof Timestamp ? (addr as any).createdAt.toDate() : (addr as any).createdAt, // Assuming addresses might have timestamps
          updatedAt: (addr as any).updatedAt instanceof Timestamp ? (addr as any).updatedAt.toDate() : (addr as any).updatedAt,
        })),
      };

      return cleanedUserData;
    }
    return null; // User not found
  } catch (error: unknown) {
    throw handleError(error, 'getUserData');
  }
};

export const updateUserProfile = async (userId: string, userData: Partial<UserData>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error, 'updateUserProfile') };
  }
};

export const placeOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'updatedAt'>) => {
  try {
    return await runTransaction(db, async (transaction) => {
      // 1. First, perform all reads (get product data)
      const productRefs = orderData.items.map(item => doc(db, 'products', item.productId));
      const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

      const productInventoryMap: { [productId: string]: number } = {};
      const productNamesMap: { [productId: string]: string } = {};

      for (const productDoc of productDocs) {
        if (!productDoc.exists()) {
          throw handleError(new Error(`Product with ID ${productDoc.id} not found.`), 'placeOrder - product-not-found');
        }
        const currentInventory = productDoc.data()?.inventory || 0;
        productInventoryMap[productDoc.id] = currentInventory;
        productNamesMap[productDoc.id] = productDoc.data()?.name || 'Unknown Product';
      }

      // 2. Then, perform all writes
      const newOrderRef = doc(collection(db, 'orders'));
      
      console.log("Order data before transaction.set:", orderData); // Keep this log for debugging
      
      transaction.set(newOrderRef, {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update product inventories based on the data read above
      for (const item of orderData.items) {
        const currentInventory = productInventoryMap[item.productId];
        const productName = productNamesMap[item.productId];
        const newInventory = currentInventory - item.quantity;

        if (newInventory < 0) {
          throw handleError(new Error(`Not enough stock for product ${productName}. Only ${currentInventory} available.`), 'placeOrder - insufficient-stock');
        }

        const productRef = doc(db, 'products', item.productId); // Get reference again for update
        transaction.update(productRef, { inventory: newInventory });
      }

      // 3. Trigger backend processes for email and invoice (conceptual)
      // In a real-world application, this would typically involve calling a Firebase Cloud Function
      // or a dedicated backend service to handle sensitive operations like sending emails and generating PDFs.
      // This keeps API keys secure and allows for more complex, long-running processes.
      console.log(`Order ${newOrderRef.id} placed successfully.`);
      console.log(`Simulating email to artisan for order ${newOrderRef.id}...`);
      // Artisan email: The artisan's email would be fetched using item.artisanId from the database.
      // For example, fetch the artisan's user data and get their email.
      console.log(`Simulating invoice generation and email to customer for order ${newOrderRef.id}...`);
      // Customer invoice email: Customer's email is available from orderData.userId by fetching user data.

      return { success: true, orderId: newOrderRef.id };
    });
  } catch (error: unknown) {
    throw handleError(error, 'placeOrder');
  }
};

// Export all functions at the end of the file
export {
  batchCreateProducts,
  batchUpdateProducts,
  getPaginatedResults,
  updateProductInventory,
  createUser,
  getUserById,
  getProducts,
  createOrder,
  getOrderById,
  updateOrderStatus,
  getUserOrders,
  getArtisanOrders,
  createReview,
  getProductReviews,
  addArtisanResponseToReview,
  updateProductRating
}; 