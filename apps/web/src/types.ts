export interface ProductColorOption {
  id: string;
  name: string;
  swatches: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  category: string;
  material: string;
  dimensions: string;
  accentColor: string;
  imageUrl?: string;
  galleryImages?: string[];
  colorOptions?: ProductColorOption[];
  featured: boolean;
  description: string;
  tags: string[];
}

export interface Category {
  id: string;
  label: string;
}

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface CheckoutAddress {
  label: string;
  street: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CreateOrderPayload {
  customer: CheckoutCustomer;
  address: CheckoutAddress;
  deliveryMethod: "delivery" | "pickup" | "combine";
  paymentMethod: "pix" | "whatsapp";
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface Order {
  id: string;
  status: "pending_payment" | "paid" | "in_production" | "shipped" | "delivered" | "cancelled";
  deliveryMethod: "delivery" | "pickup" | "combine";
  paymentMethod: "pix" | "whatsapp";
  createdAt: string;
  customer: CheckoutCustomer;
  address: CheckoutAddress;
  items: Array<{
    productId: string;
    name: string;
    priceInCents: number;
    quantity: number;
    subtotalInCents: number;
  }>;
  totalInCents: number;
}

export interface CreateOrderResponse {
  order: Order;
  instructions: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
