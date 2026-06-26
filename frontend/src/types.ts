export type Role = 'customer' | 'rider';

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

export interface Address {
  _id?: string;
  label?: string;
  line: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
  instructions?: string;
  isDefault?: boolean;
}

export interface AuthUser {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  role: Role | 'restaurant' | 'admin';
  avatar?: string;
  addresses: Address[];
  rider?: { status: string; rating: number; totalTrips: number; vehicle?: string };
}

export interface Restaurant {
  _id: string;
  name: string;
  cuisines: string[];
  image?: string;
  rating: number;
  ratingCount: number;
  priceForTwo?: number;
  avgPrepTimeMins: number;
  isOpen: boolean;
  city: string;
  minOrderValue: number;
  matchedDishes?: string[]; // dishes that matched the current search query (PRD FR-DISC-03)
}

export interface OptionChoice {
  _id?: string;
  label: string;
  priceDelta: number;
}
export interface OptionGroup {
  _id?: string;
  name: string;
  required: boolean;
  multi: boolean;
  choices: OptionChoice[];
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
  optionGroups: OptionGroup[];
}

export interface CartLine {
  key: string; // unique per item+options combo
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  options: { groupName: string; label: string; priceDelta: number }[];
}

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  options?: { groupName: string; label: string }[];
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
  paymentMethod: string;
  paymentStatus: string;
  etaAt?: string;
  createdAt: string;
  deliveryAddress?: Address;
  restaurant?: Restaurant & { address?: string };
  customer?: { _id: string; name: string; phone?: string };
  rider?: { _id: string; name: string; phone?: string };
  statusHistory?: { status: OrderStatus; at: string }[];
}

export interface Bill {
  itemTotal: number;
  packagingFee: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  grandTotal: number;
}
