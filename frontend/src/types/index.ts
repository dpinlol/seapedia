export type Role = "ADMIN" | "SELLER" | "BUYER" | "DRIVER";

export interface User {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  activeRole: Role | null;
  store?: Store | null;
  buyerProfile?: BuyerProfile | null;
  driverProfile?: DriverProfile | null;
}

export interface Store {
  id: string;
  name: string;
  sellerId: string;
  products?: Product[];
  seller?: { username: string };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  storeId: string;
  store?: { id: string; name: string };
}

export interface BuyerProfile {
  id: string;
  walletBalance: number;
}

export interface DriverProfile {
  id: string;
}

export interface ApplicationReview {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
