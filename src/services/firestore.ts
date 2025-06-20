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
  DocumentData,
  QueryConstraint,
  serverTimestamp,
  writeBatch,
  runTransaction,
  QueryDocumentSnapshot,
  startAfter,
  Query,
  getCountFromServer
} from 'firebase/firestore';
import { db } from './firebase';
import { z } from 'zod';

// Define the roles for users
export type UserRole = 'customer' | 'artisan' | 'admin';

// Type definitions
export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  currency: string;
  images: string[];
  category: string;
  subcategory?: string;
  artisanId: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
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
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  addresses?: {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
    label?: string | null; // e.g., "Home", "Work", etc. - NOW ALLOWS NULL
    phoneNumber?: string;
  }[];
  bio?: string;
  companyName?: string;
  isVerified?: boolean;
  lastLogin?: Timestamp | Date;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    theme: string;
  };
  // Added for artisan settings compatibility
  description?: string;
  category?: string;
  bankAccount?: string;
  payoutSchedule?: string;
  automaticPayout?: boolean;
  shippingFrom?: string;
  shippingStandard?: boolean;
  shippingExpress?: boolean;
  shippingInternational?: boolean;
  notifyNewOrder?: boolean;
  notifyOrderShipped?: boolean;
  notifyPaymentReceived?: boolean;
  notifyNewOrderEmail?: boolean;
  notifyNewOrderSms?: boolean;
  notifyOrderShippedEmail?: boolean;
  notifyOrderShippedSms?: boolean;
  notifyPaymentReceivedEmail?: boolean;
  notifyPaymentReceivedSms?: boolean;
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
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
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
  label: z.string().nullable().optional(), // ALLOW NULL FOR OPTIONAL LABEL
  phoneNumber: z.string().optional(),
});

const userSchema = z.object({
  uid: z.string(),
  displayName: z.string().min(1, 'Display name is required'),
  email: z.string().email('Invalid email'),
  photoURL: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(['customer', 'artisan', 'admin']),
  createdAt: z.union([z.instanceof(Timestamp), z.instanceof(Date)]), // Allow Date or Timestamp
  updatedAt: z.union([z.instanceof(Timestamp), z.instanceof(Date)]), // Allow Date or Timestamp
  addresses: z.array(addressSchema).optional(),
  bio: z.string().optional(),
  companyName: z.string().optional(),
  isVerified: z.boolean().optional(),
  lastLogin: z.union([z.instanceof(Timestamp), z.instanceof(Date)]).optional(), // Allow Date or Timestamp
  preferences: z.object({
    notifications: z.boolean(),
    emailUpdates: z.boolean(),
    theme: z.string(),
  }).optional(),
});

const productSchema = z.object({
  id: z.string().optional(), // Make ID optional as it's typically the document ID
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  discountedPrice: z.number().positive('Discounted price must be positive').optional(),
  currency: z.string(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  artisanId: z.string(),
  createdAt: z.union([z.instanceof(Timestamp), z.instanceof(Date)]).optional(),
  updatedAt: z.union([z.instanceof(Timestamp), z.instanceof(Date)]).optional(),
  inventory: z.number().int().min(0, 'Inventory cannot be negative'),
  attributes: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  isCustomizable: z.boolean().optional(),
  averageRating: z.number().min(0).max(5).optional(),
  totalReviews: z.number().int().min(0).optional(),
  occasion: z.string().optional(),
  materials: z.array(z.string()).optional(),
  status: z.string().optional(),
  shippingInfo: z.object({
    weight: z.number().optional(),
    dimensions: z.string().optional(),
    freeShipping: z.boolean().optional(),
    shippingTime: z.string().optional(),
  }).optional(),
  customizationOptions: z.object({
    text: z.boolean().optional(),
    color: z.boolean().optional(),
    size: z.boolean().optional(),
    material: z.boolean().optional(),
  }).optional(),
});

const orderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().int().min(1),
  price: z.number().positive(),
  totalPrice: z.number().positive(),
  currency: z.string(),
  image: z.string().optional(),
  customizations: z.record(z.any()).optional(),
  artisanId: z.string(),
  createdAt: z.union([z.instanceof(Timestamp), z.instanceof(Date)]).optional(),
  updatedAt: z.union([z.instanceof(Timestamp), z.instanceof(Date)]).optional(),
});

const orderSchema = z.object({
  id: z.string().optional(), // Make ID optional as it's typically the document ID
  userId: z.string(),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  total: z.number().positive(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  createdAt: z.union([z.instanceof(Timestamp), z.instanceof(Date)]).optional(),
  updatedAt: z.union([z.instanceof(Timestamp), z.instanceof(Date)]).optional(),
  shippingAddress: addressSchema,
  paymentMethod: z.string(),
  paymentStatus: z.enum(['pending', 'paid', 'failed']),
  shippingMethod: z.string(),
  shippingCost: z.number().min(0),
  discount: z.number().optional(),
  tax: z.number().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

const reviewSchema = z.object({
  id: z.string().optional(), // Make ID optional as it's typically the document ID
  productId: z.string(),
  userId: z.string(),
  userName: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
  createdAt: z.union([z.instanceof(Timestamp), z.instanceof(Date)]).optional(),
  updatedAt: z.union([z.instanceof(Timestamp), z.instanceof(Date)]).optional(),
  images: z.array(z.string().url()).optional(),
  artisanResponse: z.object({
    response: z.string(),
    createdAt: z.instanceof(Timestamp),
  }).optional(),
});

export type Address = z.infer<typeof addressSchema>;
export type User = z.infer<typeof userSchema>;
export type Product = z.infer<typeof productSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Review = z.infer<typeof reviewSchema>;

export interface Wishlist {
  id: string;
  userId: string;
  items: string[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

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

const handleError = (error: unknown, context: string): FirestoreError => {
  if (error instanceof FirestoreError) {
    console.error(`Firestore Error (${context}):`, error.message, error.details);
    return error;
  } else if (error instanceof z.ZodError) {
    const errorDetails = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    console.error(`Validation Error (${context}):`, errorDetails);
    return new FirestoreError(`Validation failed: ${errorDetails}`, 'VALIDATION_ERROR', error.issues);
  } else if (error instanceof Error) {
    console.error(`Unexpected Error (${context}):`, error.message);
    return new FirestoreError(error.message, 'UNKNOWN_ERROR', error);
  } else {
    console.error(`Unknown Error (${context}):`, error);
    return new FirestoreError('An unknown error occurred', 'UNKNOWN_ERROR', error);
  }
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
    return obj.map(item => removeUndefined(item));
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

export const batchCreateProducts = async (products: Omit<ProductData, 'id' | 'createdAt' | 'updatedAt'>[]) => {
  try {
    const batch = writeBatch(db);
    const productsRef = collection(db, 'products');
    const timestamp = serverTimestamp();

    products.forEach(product => {
      const newProductRef = doc(productsRef);
      const productToSave = {
        ...removeUndefined(product),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      batch.set(newProductRef, productToSave);
    });

    await batch.commit();
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error, 'batchCreateProducts') };
  }
};

export const batchUpdateProducts = async (updates: { id: string; data: Partial<ProductData> }[]) => {
  try {
    const batch = writeBatch(db);
    const timestamp = serverTimestamp();

    updates.forEach(update => {
      const productRef = doc(db, 'products', update.id);
      const productToUpdate = {
        ...removeUndefined(update.data),
        updatedAt: timestamp,
      };
      batch.update(productRef, productToUpdate);
    });

    await batch.commit();
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error, 'batchUpdateProducts') };
  }
};

export const getPaginatedResults = async <T>(
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

    const data = snapshot.docs.map(doc => {
      const docData = doc.data() as DocumentData; 
      const { createdAt, updatedAt, lastLogin, id, ...restData } = docData; // Destructure to safely omit 'id'
      return {
        id: doc.id, // Ensure doc.id is always used as the primary ID
        ...restData,
        ...(createdAt && { createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : createdAt }),
        ...(updatedAt && { updatedAt: updatedAt instanceof Timestamp ? updatedAt.toDate() : updatedAt }),
        ...(lastLogin && { lastLogin: lastLogin instanceof Timestamp ? lastLogin.toDate() : lastLogin }),
      } as T;
    });

    return {
      data,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      total: totalSnapshot.data().count
    };
  } catch (error: unknown) {
    throw handleError(error, 'getPaginatedResults');
  }
};

export const createUser = async (uid: string, userData: Partial<UserData>) => {
  try {
    const userRef = doc(db, 'users', uid);
    const timestamp = Timestamp.now();
    
    // Create a new object with explicit properties to avoid redundancy from spread `userData`
    const newUser: UserData = {
      uid: uid,
      displayName: userData.displayName || '', // Ensure displayName is always set
      email: userData.email || '',
      role: userData.role || 'customer',
      ...(userData.photoURL && { photoURL: userData.photoURL }),
      ...(userData.phoneNumber && { phoneNumber: userData.phoneNumber }),
      ...(userData.addresses && { addresses: userData.addresses }),
      ...(userData.bio && { bio: userData.bio }),
      ...(userData.companyName && { companyName: userData.companyName }),
      ...(userData.isVerified && { isVerified: userData.isVerified }),
      ...(userData.lastLogin && { lastLogin: userData.lastLogin }),
      createdAt: timestamp,
      updatedAt: timestamp,
      // Ensure preferences are included if provided, otherwise default structure
      preferences: userData.preferences || {
        notifications: true,
        emailUpdates: true,
        theme: 'light',
      },
    };

    validateData(userSchema, newUser);
    await setDoc(userRef, newUser);
    
    // Return the created user data directly
    const returnedUser: UserData = {
      ...newUser,
      // Convert Timestamp to Date if they are Timestamps for consistency in return type
      createdAt: newUser.createdAt instanceof Timestamp ? newUser.createdAt.toDate() : newUser.createdAt,
      updatedAt: newUser.updatedAt instanceof Timestamp ? newUser.updatedAt.toDate() : newUser.updatedAt,
    };

    return { success: true, userData: returnedUser, error: null };
  } catch (error: unknown) {
    return { success: false, userData: null, error: handleError(error, 'createUser') };
  }
};

export const getUserById = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data() as UserData;

      const user: UserData = {
        uid: userSnap.id,
        displayName: data.displayName,
        email: data.email,
        ...(data.photoURL && { photoURL: data.photoURL }),
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
        ...(data.role && { role: data.role }),
        ...(data.addresses && { addresses: data.addresses }),
        ...(data.bio && { bio: data.bio }),
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.isVerified && { isVerified: data.isVerified }),
        ...(data.lastLogin && { lastLogin: data.lastLogin instanceof Timestamp ? data.lastLogin.toDate() : data.lastLogin }),
        ...(data.preferences && { preferences: data.preferences }),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      };
      validateData(userSchema, user);
      return { user: user, error: null };
    }
    
    return { user: null, error: handleError(new Error('User not found'), 'getUserById') };
  } catch (error: unknown) {
    return { user: null, error: handleError(error, 'getUserById') };
  }
};

export const updateProductInventory = async (
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

export const getProducts = async (
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
    const result = await getPaginatedResults<ProductData>(q, lastDoc, pageSize); 
    console.log('Got paginated results:', result.data.length, 'products');
    
    const products = result.data.map(docData => {
      const data = docData as ProductData;
      return {
        id: data.id || '',
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        images: data.images,
        category: data.category,
        artisanId: data.artisanId,
        inventory: data.inventory,
        ...(data.discountedPrice && { discountedPrice: data.discountedPrice }),
        ...(data.subcategory && { subcategory: data.subcategory }),
        ...(data.createdAt && { createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt }),
        ...(data.updatedAt && { updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt }),
        ...(data.attributes && { attributes: data.attributes }),
        ...(data.tags && { tags: data.tags }),
        ...(data.isCustomizable && { isCustomizable: data.isCustomizable }),
        ...(data.averageRating && { averageRating: data.averageRating }),
        ...(data.totalReviews && { totalReviews: data.totalReviews }),
        ...(data.occasion && { occasion: data.occasion }),
        ...(data.materials && { materials: data.materials }),
        ...(data.status && { status: data.status }),
        ...(data.shippingInfo && { shippingInfo: data.shippingInfo }),
        ...(data.customizationOptions && { customizationOptions: data.customizationOptions }),
      } as ProductData; 
    });
    
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

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const newOrderRef = doc(collection(db, 'orders'));
    await setDoc(newOrderRef, {
      ...removeUndefined(orderData),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: newOrderRef.id };
  } catch (error: unknown) {
    throw handleError(error, 'createOrder');
  }
};

export const getOrderById = async (orderId: string) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
      const data = orderSnap.data() as Order;

      const cleanedOrderData: Order = {
        id: orderSnap.id,
        userId: data.userId,
        items: data.items.map(item => {
          return {
            ...item,
            ...(item.createdAt && { createdAt: item.createdAt instanceof Timestamp ? item.createdAt.toDate() : item.createdAt }),
            ...(item.updatedAt && { updatedAt: item.updatedAt instanceof Timestamp ? item.updatedAt.toDate() : item.updatedAt }),
          };
        }),
        total: data.total,
        status: data.status,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        shippingMethod: data.shippingMethod,
        shippingCost: data.shippingCost,
        ...(data.discount && { discount: data.discount }),
        ...(data.tax && { tax: data.tax }),
        ...(data.trackingNumber && { trackingNumber: data.trackingNumber }),
        ...(data.notes && { notes: data.notes }),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      };

      return { order: cleanedOrderData, error: null };
    }

    return { order: null, error: handleError(new Error('Order not found'), 'getOrderById') };
  } catch (error: unknown) {
    return { order: null, error: handleError(error, 'getOrderById') };
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
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

export const getUserOrders = async (userId: string) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const orders: Order[] = querySnapshot.docs.map(doc => {
      const data = doc.data() as Order;
      return {
        id: doc.id,
        userId: data.userId,
        items: data.items,
        total: data.total,
        status: data.status,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        shippingMethod: data.shippingMethod,
        shippingCost: data.shippingCost,
        ...(data.discount && { discount: data.discount }),
        ...(data.tax && { tax: data.tax }),
        ...(data.trackingNumber && { trackingNumber: data.trackingNumber }),
        ...(data.notes && { notes: data.notes }),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      };
    });

    return { orders, error: null };
  } catch (error: unknown) {
    return { orders: [], error: handleError(error, 'getUserOrders') };
  }
};

export const getArtisanOrders = async (artisanId: string) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('items', 'array-contains', { artisanId }),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);

    const orders: Order[] = querySnapshot.docs.map(doc => {
      const data = doc.data() as Order;
      return {
        id: doc.id,
        userId: data.userId,
        items: data.items,
        total: data.total,
        status: data.status,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        shippingMethod: data.shippingMethod,
        shippingCost: data.shippingCost,
        ...(data.discount && { discount: data.discount }),
        ...(data.tax && { tax: data.tax }),
        ...(data.trackingNumber && { trackingNumber: data.trackingNumber }),
        ...(data.notes && { notes: data.notes }),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      };
    });

    const filteredOrders = orders.filter(order => 
      order.items.some(item => item.artisanId === artisanId)
    );

    return { orders: filteredOrders, error: null };
  } catch (error: unknown) {
    return { orders: [], error: handleError(error, 'getArtisanOrders') };
  }
};

export const createReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => {
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

export const getProductReviews = async (productId: string) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('productId', '==', productId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const reviews: Review[] = querySnapshot.docs.map(doc => {
      const data = doc.data() as Review;
      return {
        id: doc.id,
        productId: data.productId,
        userId: data.userId,
        userName: data.userName,
        rating: data.rating,
        comment: data.comment,
        ...(data.createdAt && { createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt }),
        ...(data.updatedAt && { updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt }),
        ...(data.images && { images: data.images }),
        ...(data.artisanResponse && { artisanResponse: data.artisanResponse }),
      };
    });

    return { reviews, error: null };
  } catch (error: unknown) {
    return { reviews: [], error: handleError(error, 'getProductReviews') };
  }
};

export const addArtisanResponseToReview = async (reviewId: string, response: string) => {
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

export const updateProductRating = async (productId: string) => {
  try {
    const { reviews, error: reviewError } = await getProductReviews(productId);
    if (reviewError) {
      throw reviewError;
    }

    if (reviews.length === 0) {
      await updateDoc(doc(db, 'products', productId), {
        averageRating: 0,
        totalReviews: 0,
        updatedAt: serverTimestamp(),
      });
      return { success: true, error: null };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await updateDoc(doc(db, 'products', productId), {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
      updatedAt: serverTimestamp(),
    });

    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error, 'updateProductRating') };
  }
};

export const createProduct = async (productData: ProductData) => {
  try {
    const productsRef = collection(db, 'products');
    const newProductRef = doc(productsRef);
    const timestamp = serverTimestamp();
    const productToSave = {
      ...removeUndefined(productData),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await setDoc(newProductRef, productToSave);
    return { id: newProductRef.id, error: null };
  } catch (error: unknown) {
    return { id: null, error: handleError(error, 'createProduct') };
  }
};

export const updateProduct = async (productId: string, productData: Partial<ProductData>) => {
  try {
    const productRef = doc(db, 'products', productId);
    const productToUpdate = {
      ...removeUndefined(productData),
      updatedAt: serverTimestamp(),
    };
    await updateDoc(productRef, productToUpdate);
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error, 'updateProduct') };
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    await deleteDoc(doc(db, 'products', productId));
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error, 'deleteProduct') };
  }
};

export const getProductById = async (productId: string) => {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const data = productSnap.data() as ProductData;
      const product: ProductData = {
        id: productSnap.id,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        images: data.images,
        category: data.category,
        artisanId: data.artisanId,
        inventory: data.inventory,
        ...(data.discountedPrice && { discountedPrice: data.discountedPrice }),
        ...(data.subcategory && { subcategory: data.subcategory }),
        ...(data.createdAt && { createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt }),
        ...(data.updatedAt && { updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt }),
        ...(data.attributes && { attributes: data.attributes }),
        ...(data.tags && { tags: data.tags }),
        ...(data.isCustomizable && { isCustomizable: data.isCustomizable }),
        ...(data.averageRating && { averageRating: data.averageRating }),
        ...(data.totalReviews && { totalReviews: data.totalReviews }),
        ...(data.occasion && { occasion: data.occasion }),
        ...(data.materials && { materials: data.materials }),
        ...(data.status && { status: data.status }),
        ...(data.shippingInfo && { shippingInfo: data.shippingInfo }),
        ...(data.customizationOptions && { customizationOptions: data.customizationOptions }),
      };
      return { product: product, error: null };
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

    const products: ProductData[] = querySnapshot.docs.map(doc => {
      const data = doc.data() as ProductData;
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        images: data.images,
        category: data.category,
        artisanId: data.artisanId,
        inventory: data.inventory,
        ...(data.discountedPrice && { discountedPrice: data.discountedPrice }),
        ...(data.subcategory && { subcategory: data.subcategory }),
        ...(data.createdAt && { createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt }),
        ...(data.updatedAt && { updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt }),
        ...(data.attributes && { attributes: data.attributes }),
        ...(data.tags && { tags: data.tags }),
        ...(data.isCustomizable && { isCustomizable: data.isCustomizable }),
        ...(data.averageRating && { averageRating: data.averageRating }),
        ...(data.totalReviews && { totalReviews: data.totalReviews }),
        ...(data.occasion && { occasion: data.occasion }),
        ...(data.materials && { materials: data.materials }),
        ...(data.status && { status: data.status }),
        ...(data.shippingInfo && { shippingInfo: data.shippingInfo }),
        ...(data.customizationOptions && { customizationOptions: data.customizationOptions }),
      };
    });

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
      const data = userSnap.data() as UserData;
      const user: UserData = {
        uid: userSnap.id,
        displayName: data.displayName,
        email: data.email,
        ...(data.photoURL && { photoURL: data.photoURL }),
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
        ...(data.role && { role: data.role }),
        ...(data.addresses && { addresses: data.addresses }),
        ...(data.bio && { bio: data.bio }),
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.isVerified && { isVerified: data.isVerified }),
        ...(data.lastLogin && { lastLogin: data.lastLogin instanceof Timestamp ? data.lastLogin.toDate() : data.lastLogin }),
        ...(data.preferences && { preferences: data.preferences }),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      };
      return { userData: user, error: null };
    } else {
      return { userData: null, error: handleError(new Error('User not found'), 'getUserData') };
    }
  } catch (error: unknown) {
    return { userData: null, error: handleError(error, 'getUserData') };
  }
};

export const updateUserProfile = async (userId: string, userData: Partial<UserData>) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userToUpdate = {
      ...removeUndefined(userData),
      updatedAt: serverTimestamp(),
    };
    await updateDoc(userRef, userToUpdate);
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error, 'updateUserProfile') };
  }
};

export const placeOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'updatedAt'>) => {
  try {
    const newOrderRef = doc(collection(db, 'orders'));
    await setDoc(newOrderRef, {
      ...removeUndefined(orderData),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: newOrderRef.id };
  } catch (error: unknown) {
    throw handleError(error, 'placeOrder');
  }
};

export const getWishlist = async (userId: string) => {
  try {
    const wishlistRef = collection(db, 'wishlists');
    const q = query(wishlistRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const wishlistDoc = querySnapshot.docs[0];
      const wishlist = {
        id: wishlistDoc.id,
        ...wishlistDoc.data(),
      } as Wishlist;
      return { wishlist, error: null };
    } else {
      return { wishlist: null, error: null };
    }
  } catch (error: unknown) {
    return { wishlist: null, error: handleError(error, 'getWishlist') };
  }
};

export const addOrUpdateWishlist = async (userId: string, productId: string, action: 'add' | 'remove') => {
  try {
    const wishlistRef = collection(db, 'wishlists');
    const q = query(wishlistRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    let wishlistDocRef;
    let currentItems: string[] = [];

    if (!querySnapshot.empty) {
      wishlistDocRef = doc(db, 'wishlists', querySnapshot.docs[0].id);
      currentItems = querySnapshot.docs[0].data().items || [];
    } else {
      wishlistDocRef = doc(wishlistRef);
    }

    let updatedItems: string[];
    if (action === 'add') {
      const tempSet = new Set(currentItems);
      tempSet.add(productId);
      updatedItems = Array.from(tempSet);
    } else {
      updatedItems = currentItems.filter(id => id !== productId);
    }

    await setDoc(wishlistDocRef, {
      userId,
      items: updatedItems,
      updatedAt: serverTimestamp(),
      createdAt: querySnapshot.empty ? serverTimestamp() : wishlistDocRef.id,
    }, { merge: true });

    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error, 'addOrUpdateWishlist') };
  }
};

export const processOrder = async (
  orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  cartItems: OrderItem[]
) => {
  try {
    const orderId = await runTransaction(db, async (transaction) => {
      // 1. Create the new order document reference
      const newOrderRef = doc(collection(db, 'orders'));

      // 2. Prepare order data with server timestamps
      const orderToCreate = {
        ...removeUndefined(orderData),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // First, perform all reads and validations
      const productSnapshots = new Map<string, any>();
      for (const item of cartItems) {
        const productRef = doc(db, 'products', item.productId);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new FirestoreError('Product not found.', 'product-not-found');
        }

        const currentInventory = productSnap.data()?.inventory as number;
        const quantityToOrder = item.quantity;

        if (currentInventory < quantityToOrder) {
          throw new FirestoreError(`Not enough inventory for product ${item.productName}. Available: ${currentInventory}, Requested: ${quantityToOrder}`, 'insufficient-inventory');
        }
        productSnapshots.set(item.productId, { snap: productSnap, currentInventory, quantityToOrder });
      }

      // Now, perform all writes
      for (const item of cartItems) {
        const { snap: productSnap, currentInventory, quantityToOrder } = productSnapshots.get(item.productId);
        const productRef = doc(db, 'products', item.productId);

        // Decrement inventory
        transaction.update(productRef, {
          inventory: currentInventory - quantityToOrder,
          updatedAt: serverTimestamp(),
        });
      }

      // Set the new order document
      transaction.set(newOrderRef, orderToCreate);

      return newOrderRef.id;
    });

    return { id: orderId, error: null };
  } catch (error: unknown) {
    if (error instanceof FirestoreError) {
      throw error; // Re-throw custom FirestoreError
    }
    throw handleError(error, 'processOrder'); // Use existing handleError for other errors
  }
};