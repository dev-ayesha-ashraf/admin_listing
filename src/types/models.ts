export interface Category {
  id: string;
  name: string;
  attributes?: Attribute[];
  slug?: string;
  Listing?: Listing[];
  properties?: Record<string, any>;
  subcategories: Array<{ id: string; name: string }>;
}

export interface Attribute {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  images?: string[];
  location: string;
  categoryId: string;
  subcategoryIds: string[];
  sellerId: string;
  attributes?: Record<string, any>;
  properties?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  id: string; 
  _id?: string; 
  name: string;
  email: string;
  phone: string;
  image: string;
  properties?: { key: string; value: string }[];
}

export interface Property {
  id: string;
  key: string;
  value: string;
}
