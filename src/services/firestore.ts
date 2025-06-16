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
    label?: string; // e.g., "Home", "Work", etc.
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
  label: z.string().optional()
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
const handleError = (error: any, context: string): never => {
  console.error(`Error in ${context}:`, error);
  throw new FirestoreError(
    error.message || 'An unknown error occurred',
    error.code || 'unknown',
    error
  );
};

const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new FirestoreError(
        'Validation error',
        'invalid-data',
        error.errors
      );
    }
    throw error;
  }
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
    
    return { user: null, error: new FirestoreError('User not found', 'not-found') };
  } catch (error) {
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
        throw new FirestoreError('Product not found', 'not-found');
      }
      
      const currentInventory = productSnap.data().inventory;
      const newInventory = operation === 'add' 
        ? currentInventory + quantity 
        : currentInventory - quantity;
      
      if (newInventory < 0) {
        throw new FirestoreError('Insufficient inventory', 'invalid-operation');
      }
      
      transaction.update(productRef, { 
        inventory: newInventory,
        updatedAt: serverTimestamp()
      });
    });
    
    return { success: true, error: null };
  } catch (error) {
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
  } catch (error) {
    console.error('Error in getProducts:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return { 
      products: [], 
      lastDoc: null, 
      total: 0, 
      error: error instanceof Error ? error.message : 'Failed to fetch products'
    };
  }
};

// Order operations
const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const ordersRef = collection(db, 'orders');
    const timestamp = serverTimestamp();
    
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    
    // Update the document with its ID
    await updateDoc(docRef, { id: docRef.id });
    
    return { orderId: docRef.id, error: null };
  } catch (error: any) {
    return { orderId: null, error: error.message };
  }
};

const getOrderById = async (orderId: string) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return { order: orderSnap.data() as Order, error: null };
    } else {
      return { order: null, error: 'Order not found' };
    }
  } catch (error: any) {
    return { order: null, error: error.message };
  }
};

const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now()
    });
    
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const getUserOrders = async (userId: string) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push(doc.data() as Order);
    });
    
    return { orders, error: null };
  } catch (error: any) {
    return { orders: [], error: error.message };
  }
};

const getArtisanOrders = async (artisanId: string) => {
  try {
    const ordersRef = collection(db, 'orders');
    // This query structure assumes your order items have artisanId fields
    const q = query(
      ordersRef, 
      where('items.artisanId', 'array-contains', artisanId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push(doc.data() as Order);
    });
    
    return { orders, error: null };
  } catch (error: any) {
    return { orders: [], error: error.message };
  }
};

// Review operations
const createReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const timestamp = serverTimestamp();
    
    const docRef = await addDoc(reviewsRef, {
      ...reviewData,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    
    // Update the document with its ID
    await updateDoc(docRef, { id: docRef.id });
    
    // Update product's average rating
    await updateProductRating(reviewData.productId);
    
    return { reviewId: docRef.id, error: null };
  } catch (error: any) {
    return { reviewId: null, error: error.message };
  }
};

const getProductReviews = async (productId: string) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef, 
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const reviews: Review[] = [];
    querySnapshot.forEach((doc) => {
      reviews.push(doc.data() as Review);
    });
    
    return { reviews, error: null };
  } catch (error: any) {
    return { reviews: [], error: error.message };
  }
};

const addArtisanResponseToReview = async (reviewId: string, response: string) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      artisanResponse: {
        response,
        createdAt: Timestamp.now()
      },
      updatedAt: Timestamp.now()
    });
    
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Helper function to update product's average rating
const updateProductRating = async (productId: string) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('productId', '==', productId));
    const querySnapshot = await getDocs(q);
    
    let totalRating = 0;
    let reviewCount = 0;
    
    querySnapshot.forEach((doc) => {
      const review = doc.data() as Review;
      totalRating += review.rating;
      reviewCount++;
    });
    
    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
    
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      averageRating,
      totalReviews: reviewCount,
      updatedAt: Timestamp.now()
    });
    
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Product Management
export const createProduct = async (productData: ProductData) => {
  try {
    const productRef = doc(collection(db, 'products'));
    await setDoc(productRef, {
      ...productData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return productRef.id;
  } catch (error) {
    throw new FirestoreError('Error creating product', error);
  }
};

export const updateProduct = async (productId: string, productData: Partial<ProductData>) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      ...productData,
      updatedAt: Timestamp.now()
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to update product'
    };
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: handleError(error, 'deleteProduct') };
  }
};

export const getProductById = async (productId: string) => {
  try {
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);
    if (!productDoc.exists()) {
      throw new FirestoreError('Product not found', 'not-found');
    }
    const data = productDoc.data();
    return {
      id: productDoc.id,
      ...data
    } as ProductData;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new FirestoreError(message, 'error');
  }
};

export const getProductsByArtisan = async (artisanId: string) => {
  try {
    const productsQuery = query(
      collection(db, 'products'),
      where('artisanId', '==', artisanId)
    );
    const productsSnapshot = await getDocs(productsQuery);
    
    const products = productsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as ProductData;
    });
    
    return { products, error: null };
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return { 
      products: [], 
      error: error.message || 'Failed to fetch products'
    };
  }
};

// User Management
export const getUserData = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new FirestoreError('User not found', 'not-found');
    }
    const data = userDoc.data();
    return {
      uid: userId,
      displayName: data.displayName || '',
      email: data.email || '',
      role: data.role || 'customer',
      ...data
    } as UserData;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new FirestoreError(message, 'error');
  }
};

export const updateUserProfile = async (userId: string, userData: Partial<UserData>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: Timestamp.now()
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error updating user profile' };
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