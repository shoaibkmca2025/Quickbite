export type OrderStatus =
  | 'pending_payment'
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  options?: { groupName: string; label: string; priceDelta: number }[];
  isVeg?: boolean;
}

export interface Order {
  _id: string;
  code: string;
  status: OrderStatus;
  items: OrderItem[];
  itemTotal: number;
  deliveryFee: number;
  packagingFee: number;
  tax: number;
  discount: number;
  grandTotal: number;
  commission: number;
  restaurantEarning: number;
  paymentMethod: string;
  paymentStatus: string;
  prepTimeMins?: number;
  etaAt?: string;
  placedAt?: string;
  createdAt: string;
  customer?: { _id: string; name: string; phone?: string; avatar?: string };
  rider?: { _id: string; name: string; phone?: string };
  deliveryAddress?: { line: string; city: string; pincode: string; instructions?: string };
}

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isVeg: boolean;
  available: boolean;
}

export interface Restaurant {
  _id: string;
  name: string;
  partnerId: string;
  isOpen: boolean;
  isApproved: boolean;
  rating: number;
  image?: string;
  city: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email?: string;
  role: string;
  avatar?: string;
  restaurant?: Restaurant | string;
}
