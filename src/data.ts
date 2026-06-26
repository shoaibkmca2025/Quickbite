import { Restaurant, MenuItem, RiderState } from './types';

export const POPULAR_RESTAURANTS: Restaurant[] = [
  {
    id: 'artisan-kitchen',
    name: 'The Artisan Kitchen',
    cuisine: 'Continental • Bakery • Cafe',
    rating: 4.8,
    time: '25-30 min',
    priceForTwo: 200,
    distance: '2.4 km',
    isFreeDelivery: true,
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'royal-spice',
    name: 'Royal Spice',
    cuisine: 'North Indian • Mughlai • Kebab',
    rating: 4.5,
    time: '35-40 min',
    priceForTwo: 450,
    distance: '3.7 km',
    image: 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'green-zen',
    name: 'Green Zen Bowls',
    cuisine: 'Healthy • Japanese • Salads',
    rating: 4.9,
    time: '20-25 min',
    priceForTwo: 300,
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop'
  }
];

export const PIZZA_RESTAURANTS: Restaurant[] = [
  {
    id: 'the-oven-story',
    name: 'The Oven Story',
    cuisine: 'Italian, Fast Food, Desserts',
    rating: 4.2,
    time: '25-30 min',
    priceForTwo: 400,
    distance: '2.4 km',
    isFreeDelivery: true,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'pizzeria-roma',
    name: 'Pizzeria Roma',
    cuisine: 'Authentic Italian, Beverages',
    rating: 4.5,
    time: '35-40 min',
    priceForTwo: 600,
    distance: '4.1 km',
    isBestSeller: true,
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'slice-of-heaven',
    name: 'Slice of Heaven',
    cuisine: 'Quick Bites, Pizza, Shakes',
    rating: 3.9,
    time: '20-25 min',
    priceForTwo: 350,
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'gourmet-crust',
    name: 'Gourmet Crust',
    cuisine: 'Premium Pizza, Wine Bar',
    rating: 4.8,
    time: '45-50 min',
    priceForTwo: 800,
    distance: '5.5 km',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=600&auto=format&fit=crop'
  }
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-truffle-pizza',
    name: 'Truffle Mushroom Pizza',
    price: 18.90,
    description: 'Wild truffles, shiitake mushrooms, mozzarella, and a drizzle of balsamic reduction on hand-tossed dough.',
    isVeg: true,
    category: 'bestsellers',
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'menu-peri-wings',
    name: 'Peri-Peri Chicken Wings',
    price: 12.50,
    description: 'Succulent flame-grilled wings tossed in our signature spicy African Peri-Peri glaze. Served with ranch.',
    isVeg: false,
    category: 'bestsellers',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'menu-garlic-bread',
    name: 'Cheesy Garlic Bread',
    price: 6.00,
    description: 'Toasted baguette with high-grade herb butter and melted premium mozzarella.',
    isVeg: true,
    category: 'starters',
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'menu-calamari',
    name: 'Crispy Calamari Rings',
    price: 9.50,
    description: 'Deep-fried hand-cut squid rings served with classic lemon aioli and a wedge of lemon.',
    isVeg: false,
    category: 'starters',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'menu-lemonade',
    name: 'Classic Lemonade',
    price: 4.50,
    description: 'A refreshing tall glass of chilled hand-squeezed lemonade with mint leaves and fresh ice cubes.',
    isVeg: true,
    category: 'beverages',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop'
  }
];

export const INITIAL_RIDER: RiderState = {
  id: 'RD-9928',
  name: 'Alex Rider',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  status: 'Online',
  rating: 4.92,
  completion: 98.5,
  avgTime: 22,
  totalTrips: 1240,
  area: 'Midtown Chicago',
  vehicle: 'Scooter (Z-Speed EV 500)',
  license: 'DL-992834-IL'
};
