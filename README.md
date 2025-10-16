# ArtiFlare

A modern e-commerce platform connecting artisans with customers seeking handcrafted, personalized gifts. Built with React, TypeScript, Firebase, and Express.

<p align="center">
  <img src="src/assets/images/logo.png" alt="ArtiFlare" width="300">
</p>

## ✨ Overview

ArtiFlare is a comprehensive e-commerce solution that enables artisans to showcase and sell their handcrafted products while providing customers with a seamless shopping experience for unique, personalized gifts. The platform features occasion-based browsing, SOS delivery for last-minute shoppers, and real-time order tracking.

## 🌟 Key Features

- **Multi-platform Support**: Responsive design for web and mobile devices
- **User Role Management**:
  - **Customers**: Browse products, place orders, track deliveries
  - **Artisans**: Manage shop, list products, fulfill orders
  - **Administrators**: Oversee platform operations, manage users
- **Smart Cart System**:
  - Dynamic quantity management
  - Real-time cart updates
  - Persistent cart state across sessions
  - Automatic item removal when quantity reaches zero
- **Product Customization**: Personalize gifts with custom text, colors, and materials
- **SOS Delivery**: Expedited delivery options for urgent gift needs
- **Location Tracking**: Real-time map-based order tracking
- **Occasion-based Shopping**: Browse gifts by events (birthdays, anniversaries, holidays)
- **Featured Artisans**: Showcase talented craftspeople and their stories
- **Secure Payment Processing**: Integrated with Stripe for safe transactions
- **Email Notifications**: Order confirmation and artisan notifications via Brevo (Sendinblue)

## 🛠️ Technology Stack

- **Frontend**: React.js with TypeScript
- **UI/Styling**: 
  - Tailwind CSS with custom color palette
  - Framer Motion for animations
  - Headless UI for accessible components
- **Routing**: React Router v6
- **State Management**: React Context API
- **Backend/API**: Express.js (Node.js)
- **Database & Auth**: Firebase (Authentication, Firestore, Storage)
- **Payment Processing**: Razorpay (primary) and Stripe (legacy)
- **Form Handling**: React Hook Form with Zod validation
- **Testing**: React Testing Library, Jest
- **Email**: Brevo (Sendinblue) transactional emails
- **Local Storage**: For persistent cart state

## 🎨 Design System

Custom branded color palette:
- **Primary** (Terracotta Red): For CTAs and primary actions
- **Secondary** (Sage Green): For accents and secondary elements
- **Neutral** (Beige): For backgrounds and neutral containers
- **Dark** (Dark Brown): For text and dark UI elements

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v7.0.0 or higher) or yarn (v1.22.0 or higher)
- Firebase account with a project set up
- Brevo (Sendinblue) account for email notifications

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HardeepIjardar/artiflare.git
   cd artiflare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Set up Firebase:**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication, Firestore Database, and Storage
   - Set up Firestore security rules (see `firestore.rules` in the project)
   - Download your service account key as `serviceAccountKey.json` and place it in the project root
   - Get your Firebase configuration from Project Settings

4. **Create a `.env` file** in the root directory with the following variables:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   # Frontend -> Backend base URL (no trailing slash)
   REACT_APP_API_BASE_URL=https://your-backend-hostname.com

   # Razorpay keys
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

   # (Optional) Stripe legacy key
   REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
   BREVO_API_KEY=your_brevo_api_key
   BREVO_SENDER_EMAIL=your_sender_email
   BREVO_SENDER_NAME=your_sender_name
   ```

5. **Initialize Firestore and collections:**
   ```bash
   npm run setup
   ```
   This runs `src/scripts/setup.ts`, which installs `firebase-admin` and runs `src/scripts/setupFirestore.ts` to create collections, indexes, and mock schemas in Firestore.

6. **Start the development server**
   ```bash
   npm start
   ```
   or
   ```bash
   yarn start
   ```

7. **Start the backend server (payments + emails):**
   ```bash
   npm run server
   ```
   This runs `server.js` on port 5000 by default. Ensure Razorpay env vars are set.

8. **Open [http://localhost:3000](http://localhost:3000)** to view the application in your browser.

## 🔥 Firebase Configuration

### Authentication
- Email/Password authentication
- Google Sign-in
- Phone number authentication

### Firestore Database
Collections:
- `users`: User profiles and authentication data
- `products`: Product listings and details
- `orders`: Customer orders and tracking
- `reviews`: Product reviews and ratings
- `categories`: Product categories and subcategories
- `carts`: Shopping cart data
- `notifications`: User notifications

### Security Rules
- Public read access to products and reviews
- Only artisans and admins can create products
- Users can manage their own data; admins can manage all
- Orders: users can read their own, artisans can read relevant, admins can read all
- Only admins can update/delete orders
- Reviews: users can create/edit/delete their own, admins can manage all

## 🖥️ Backend/API

- **Express server (`server.js`)** provides an API endpoint for sending order confirmation and notification emails via Brevo (Sendinblue).
- Endpoint: `POST /api/send-order-emails` (requires customer, artisan, and order details in the request body)
- Uses environment variables for Brevo API key and sender info

## 🧪 Testing

- Unit and integration tests are located in `src/components/**/__tests__/`
- Uses React Testing Library and Jest
- Run tests with:
  ```bash
  npm test
  ```

## 📜 Scripts

- `npm start` — Start the React development server
- `npm run server` — Start the Express backend server
- `npm run setup` — Initialize Firestore collections and indexes
- `npm run build` — Build the React app for production
- `npm test` — Run tests
- `npm run lint` — Lint source files
- `npm run format` — Format source files

## 📁 Project Structure

```
artiflare/
├── public/                # Static public assets
├── scripts/               # Node.js utility scripts (e.g., testSendOrderEmails.js)
├── server.js              # Express backend server (order email API)
├── firestore.rules        # Firestore security rules
├── package.json           # Project metadata and dependencies
├── tailwind.config.js     # Tailwind CSS config
├── postcss.config.js      # PostCSS config
├── src/
│   ├── assets/
│   │   ├── images/        # Images (logo, favicon, etc.)
│   │   └── icons/         # Icon assets
│   ├── components/
│   │   ├── auth/          # Auth-related components
│   │   ├── artisan/       # Artisan dashboard components
│   │   ├── common/        # Shared/common components
│   │   └── __tests__/     # Component tests
│   ├── contexts/          # React context providers (Auth, Cart, Currency)
│   ├── data/              # Static/mock data (currently empty)
│   ├── layouts/           # Layout components (Admin, Artisan, Main)
│   ├── pages/
│   │   ├── admin/         # Admin dashboard pages
│   │   ├── artisan/       # Artisan dashboard pages
│   │   ├── auth/          # Auth pages (Login, Register, Forgot Password)
│   │   └── customer/      # Customer-facing pages (Home, Products, Cart, etc.)
│   ├── scripts/           # Setup and Firestore initialization scripts
│   ├── services/          # Firebase, Firestore, and storage integrations
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions (e.g., error handling)
│   ├── App.tsx            # Main application component
│   ├── index.tsx          # App entry point
│   └── index.css          # Global styles
```

## 📦 Key Dependencies

- **React**
- **TypeScript**
- **Firebase** (auth, firestore, storage, admin)
- **Express**
- **Stripe** (payments)
- **Tailwind CSS**
- **Framer Motion**
- **Headless UI**
- **React Hook Form** & **Zod**
- **Brevo (Sendinblue)** (email)
- **Jest** & **React Testing Library**

## 🔄 Deployment

The application is deployed at [artiflare.hardeepijardar.com](https://artiflare.hardeepijardar.com).

### Deployment Steps
1. Build the application:
   ```bash
   npm run build
   ```
2. Deploy the `build/` directory to your preferred hosting (e.g., Firebase Hosting, Vercel, Netlify, etc.)
3. Deploy the backend (`server.js`) to a Node.js server (e.g., Render, Heroku, or your own VPS)

---