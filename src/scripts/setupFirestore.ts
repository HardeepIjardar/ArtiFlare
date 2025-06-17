import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
const serviceAccount = require('../../serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

// Collection schemas
const collections = {
  users: {
    displayName: 'string',
    email: 'string',
    photoURL: 'string',
    phoneNumber: 'string',
    role: 'string',
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
    address: {
      street: 'string',
      city: 'string',
      state: 'string',
      zipCode: 'string',
      country: 'string'
    },
    bio: 'string',
    companyName: 'string',
    isVerified: 'boolean',
    lastLogin: 'timestamp',
    preferences: {
      notifications: 'boolean',
      emailUpdates: 'boolean',
      theme: 'string'
    }
  },
  products: {
    name: 'string',
    description: 'string',
    price: 'number',
    discountedPrice: 'number',
    images: 'array',
    category: 'string',
    subcategory: 'string',
    artisanId: 'string',
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
    inventory: 'number',
    attributes: {
      size: 'array',
      color: 'array',
      material: 'array',
      weight: 'number',
      dimensions: 'string'
    },
    tags: 'array',
    isCustomizable: 'boolean',
    averageRating: 'number',
    totalReviews: 'number',
    occasion: 'string',
    materials: 'array',
    status: 'string',
    shippingInfo: {
      weight: 'number',
      dimensions: 'string',
      freeShipping: 'boolean',
      shippingTime: 'string'
    },
    customizationOptions: {
      text: 'boolean',
      color: 'boolean',
      size: 'boolean',
      material: 'boolean'
    }
  },
  orders: {
    userId: 'string',
    items: 'array',
    total: 'number',
    status: 'string',
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
    shippingAddress: {
      street: 'string',
      city: 'string',
      state: 'string',
      zipCode: 'string',
      country: 'string'
    },
    paymentMethod: 'string',
    paymentStatus: 'string',
    shippingMethod: 'string',
    shippingCost: 'number',
    discount: 'number',
    tax: 'number',
    trackingNumber: 'string',
    notes: 'string',
    estimatedDelivery: 'timestamp',
    actualDelivery: 'timestamp',
    refundStatus: 'string'
  },
  reviews: {
    productId: 'string',
    userId: 'string',
    userName: 'string',
    rating: 'number',
    comment: 'string',
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
    images: 'array',
    artisanResponse: {
      response: 'string',
      createdAt: 'timestamp'
    },
    helpful: 'number',
    verifiedPurchase: 'boolean',
    orderId: 'string'
  },
  categories: {
    name: 'string',
    slug: 'string',
    description: 'string',
    image: 'string',
    parentId: 'string',
    subcategories: 'array',
    isActive: 'boolean',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  carts: {
    userId: 'string',
    items: 'array',
    updatedAt: 'timestamp',
    expiresAt: 'timestamp'
  },
  notifications: {
    userId: 'string',
    type: 'string',
    title: 'string',
    message: 'string',
    isRead: 'boolean',
    createdAt: 'timestamp',
    data: {
      orderId: 'string',
      productId: 'string',
      reviewId: 'string'
    }
  }
};

// Indexes to create
const indexes = [
  {
    collection: 'products',
    fields: [
      { fieldPath: 'category', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'products',
    fields: [
      { fieldPath: 'artisanId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'products',
    fields: [
      { fieldPath: 'price', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'orders',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'orders',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'reviews',
    fields: [
      { fieldPath: 'productId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'reviews',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'categories',
    fields: [
      { fieldPath: 'parentId', order: 'ASCENDING' },
      { fieldPath: 'name', order: 'ASCENDING' }
    ]
  }
];

// Create collections and indexes
async function setupFirestore() {
  try {
    console.log('Starting Firestore setup...');

    // Create collections with sample documents
    for (const [collectionName, schema] of Object.entries(collections)) {
      console.log(`Creating collection: ${collectionName}`);
      
      // Create a sample document to initialize the collection
      const sampleDoc = Object.entries(schema).reduce((acc: Record<string, any>, [key, type]) => {
        switch (type) {
          case 'string':
            acc[key] = '';
            break;
          case 'number':
            acc[key] = 0;
            break;
          case 'boolean':
            acc[key] = false;
            break;
          case 'array':
            acc[key] = [];
            break;
          case 'timestamp':
            acc[key] = new Date();
            break;
          default:
            if (typeof type === 'object') {
              acc[key] = Object.entries(type).reduce((obj: Record<string, any>, [k, v]) => {
                obj[k] = v === 'array' ? [] : v === 'number' ? 0 : '';
                return obj;
              }, {});
            }
        }
        return acc;
      }, {} as Record<string, any>);

      // Add the sample document
      await db.collection(collectionName).doc('_schema').set(sampleDoc);
      console.log(`Created collection: ${collectionName}`);
    }

    // Create indexes
    for (const index of indexes) {
      console.log(`Creating index for ${index.collection}...`);
      // await db.collection(index.collection).createIndex(index.fields); // This is a Firebase CLI/console operation, not client-side
      console.log(`Index creation for ${index.collection} skipped (manual operation required).`);
    }

    console.log('Firestore setup completed successfully!');
  } catch (error) {
    console.error('Error setting up Firestore:', error);
  }
}

// Run the setup
setupFirestore(); 