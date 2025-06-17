import { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  currency: string;
  images: string[];
  image?: string;
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
