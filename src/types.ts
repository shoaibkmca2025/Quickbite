export type ScreenName =
  | 'QuickBite - Home'
  | 'QuickBite - Authentication'
  | 'QuickBite - Rider Registration'
  | 'QuickBite - Search Results'
  | 'QuickBite Rider - Dashboard'
  | 'QuickBite - Profile'
  | 'QuickBite Rider - Profile'
  | 'QuickBite Rider - Active Order'
  | 'QuickBite - Order Detail'
  | 'QuickBite - Order History'
  | 'QuickBite - Live Tracking'
  | 'QuickBite Rider - Earnings'
  | 'Ops Console - Management'
  | 'QuickBite - Restaurant Menu';

export type TransitionType = 'push' | 'push_back' | 'slide_up' | 'none';

export interface Order {
  id: string;
  restaurantName: string;
  restaurantImage?: string;
  date: string;
  status: 'Delivered' | 'In Progress' | 'Cancelled';
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  time: string;
  priceForTwo: number;
  distance: string;
  isFreeDelivery?: boolean;
  isBestSeller?: boolean;
  image: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  isVeg: boolean;
  image: string;
  category: 'bestsellers' | 'starters' | 'main-course' | 'beverages';
}

export interface RiderState {
  id: string;
  name: string;
  avatar: string;
  status: 'Online' | 'Offline' | 'Busy' | 'Idle';
  rating: number;
  completion: number;
  avgTime: number;
  totalTrips: number;
  area: string;
  vehicle: string;
  license: string;
}
