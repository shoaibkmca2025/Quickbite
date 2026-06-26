import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { tw } from '../theme';
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronRight, 
  ShoppingBag, 
  Trash2, 
  RefreshCw,
  HelpCircle,
  Receipt,
  MapPin,
  Sparkles,
  Plus,
  AlertTriangle,
  Check,
  ShoppingCart
} from 'lucide-react';
import { ScreenName, TransitionType, Order, CartItem } from '../types';

interface OrderHistoryProps {
  onNavigate: (destination: ScreenName, transition: TransitionType) => void;
  onSetCartItems: (items: CartItem[]) => void;
  cartItems?: CartItem[];
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ onNavigate, onSetCartItems, cartItems = [] }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Delivered' | 'In Progress' | 'Cancelled'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [reorderOrder, setReorderOrder] = useState<Order | null>(null);
  const [isReorderConfirmVisible, setIsReorderConfirmVisible] = useState(false);

  // Load orders from localStorage, seed if empty
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qb_past_orders');
      if (stored) {
        setOrders(JSON.parse(stored));
      } else {
        // Initialize default realistic history data
        const defaultOrders: Order[] = [
          {
            id: 'ORD-98432',
            restaurantName: 'The Artisan Kitchen',
            restaurantImage: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=600&auto=format&fit=crop',
            date: 'June 21, 2026, 08:32 PM',
            status: 'Delivered',
            totalAmount: 43.80,
            items: [
              { name: 'Truffle Mushroom Pizza', quantity: 2, price: 18.90 },
              { name: 'Classic Lemonade', quantity: 2, price: 3.00 }
            ]
          },
          {
            id: 'ORD-87321',
            restaurantName: 'Royal Spice',
            restaurantImage: 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?q=80&w=600&auto=format&fit=crop',
            date: 'June 18, 2026, 01:15 PM',
            status: 'Delivered',
            totalAmount: 58.00,
            items: [
              { name: 'Butter Chicken', quantity: 2, price: 18.50 },
              { name: 'Garlic Naan', quantity: 3, price: 3.00 },
              { name: 'Mango Lassi', quantity: 2, price: 6.00 }
            ]
          },
          {
            id: 'ORD-72314',
            restaurantName: 'Green Zen Bowls',
            restaurantImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop',
            date: 'June 12, 2026, 12:45 PM',
            status: 'Cancelled',
            totalAmount: 22.50,
            items: [
              { name: 'Avocado Quinoa Salad', quantity: 1, price: 16.50 },
              { name: 'Iced Matcha Latte', quantity: 1, price: 6.00 }
            ]
          }
        ];
        localStorage.setItem('qb_past_orders', JSON.stringify(defaultOrders));
        setOrders(defaultOrders);
      }
    } catch (e) {
      console.error('Failed to load past orders', e);
    }
  }, []);

  // Save changes to localStorage helper
  const saveOrders = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    try {
      localStorage.setItem('qb_past_orders', JSON.stringify(updatedOrders));
    } catch (e) {
      console.error('Failed to save orders', e);
    }
  };

  // Filter and search orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = selectedFilter === 'All' || order.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  // Open the detailed confirmation dialog for reordering
  const handleReorder = (order: Order) => {
    setReorderOrder(order);
    setIsReorderConfirmVisible(true);
  };

  const handleConfirmMerge = () => {
    if (!reorderOrder) return;
    
    // Deep copy current cart items
    const updatedCart = [...cartItems];
    
    reorderOrder.items.forEach((newItem, index) => {
      // Look for existing item with same name
      const existingIndex = updatedCart.findIndex(
        item => item.name.toLowerCase() === newItem.name.toLowerCase()
      );
      
      if (existingIndex > -1) {
        // Merge quantities
        updatedCart[existingIndex].quantity += newItem.quantity;
      } else {
        // Add as new item
        updatedCart.push({
          id: `reorder-${reorderOrder.id}-${index}-${Date.now()}`,
          name: newItem.name,
          price: newItem.price,
          quantity: newItem.quantity
        });
      }
    });

    onSetCartItems(updatedCart);
    setIsReorderConfirmVisible(false);
    setReorderOrder(null);
    
    Alert.alert(
      'Cart Merged',
      `Items from ${reorderOrder.restaurantName} have been added and merged with your current cart.`,
      [
        { 
          text: 'Go to Cart', 
          onPress: () => onNavigate('QuickBite - Order Detail', 'slide_up') 
        },
        { 
          text: 'Keep Shopping', 
          onPress: () => onNavigate('QuickBite - Home', 'push') 
        }
      ]
    );
  };

  const handleConfirmReplace = () => {
    if (!reorderOrder) return;

    const newCartItems: CartItem[] = reorderOrder.items.map((item, index) => ({
      id: `reorder-${reorderOrder.id}-${index}-${Date.now()}`,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    onSetCartItems(newCartItems);
    setIsReorderConfirmVisible(false);
    setReorderOrder(null);

    Alert.alert(
      'Cart Replaced',
      `Your previous cart has been cleared and replaced with items from ${reorderOrder.restaurantName}.`,
      [
        { 
          text: 'Go to Cart', 
          onPress: () => onNavigate('QuickBite - Order Detail', 'slide_up') 
        },
        { 
          text: 'Keep Shopping', 
          onPress: () => onNavigate('QuickBite - Home', 'push') 
        }
      ]
    );
  };

  // Clear single order history
  const handleDeleteOrder = (orderId: string) => {
    Alert.alert(
      'Remove Order',
      'Are you sure you want to delete this order from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updated = orders.filter(o => o.id !== orderId);
            saveOrders(updated);
            if (selectedOrder?.id === orderId) {
              setIsDetailModalVisible(false);
              setSelectedOrder(null);
            }
          }
        }
      ]
    );
  };

  // Reset/reload default orders for user ease of test
  const handleResetHistory = () => {
    Alert.alert(
      'Reset Order History',
      'This will reload the default set of sample orders. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            localStorage.removeItem('qb_past_orders');
            // Force re-trigger of initial seed in useEffect
            window.location.reload();
          }
        }
      ]
    );
  };

  // Status Badge Component
  const renderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return (
          <View style={tw`bg-emerald-50 px-2.5 py-1 rounded-full flex-row items-center gap-1 border border-emerald-100`}>
            <CheckCircle style={tw`text-emerald-600`} size={12} />
            <Text style={tw`text-emerald-700 text-[10px] font-black uppercase tracking-wide`}>Delivered</Text>
          </View>
        );
      case 'Cancelled':
        return (
          <View style={tw`bg-red-50 px-2.5 py-1 rounded-full flex-row items-center gap-1 border border-red-100`}>
            <XCircle style={tw`text-red-500`} size={12} />
            <Text style={tw`text-red-600 text-[10px] font-black uppercase tracking-wide`}>Cancelled</Text>
          </View>
        );
      case 'In Progress':
        return (
          <View style={tw`bg-orange-50 px-2.5 py-1 rounded-full flex-row items-center gap-1 border border-orange-100`}>
            <Clock style={tw`text-orange-500`} size={12} />
            <Text style={tw`text-orange-600 text-[10px] font-black uppercase tracking-wide`}>Active</Text>
          </View>
        );
    }
  };

  return (
    <View style={tw`flex-1 bg-background`}>
      {/* Upper header */}
      <View style={tw`w-full bg-white border-b border-surface-container py-3.5 px-6 flex-row justify-between items-center shadow-sm`}>
        <View style={tw`flex-row items-center gap-3`}>
          <TouchableOpacity 
            onPress={() => onNavigate('QuickBite - Profile', 'push_back')}
            style={tw`p-1`}
          >
            <ArrowLeft style={tw`text-primary`} size={18} />
          </TouchableOpacity>
          <Text style={tw`text-base font-extrabold text-primary`}>Order History</Text>
        </View>

        <TouchableOpacity 
          onPress={handleResetHistory}
          style={tw`p-1 flex-row items-center gap-1`}
          title="Reset"
        >
          <RefreshCw style={tw`text-secondary`} size={14} />
          <Text style={tw`text-[10px] font-black text-secondary uppercase`}>Reset Data</Text>
        </TouchableOpacity>
      </View>

      {/* Main filter + search + list container */}
      <View style={tw`flex-1`}>
        {/* Search header panel */}
        <View style={tw`bg-white px-6 py-4 border-b border-neutral-100 shadow-sm gap-3`}>
          <View style={tw`relative w-full`}>
            <View style={tw`absolute left-3.5 top-3.5 z-10`}>
              <Search style={tw`text-slate-400`} size={16} />
            </View>
            <TextInput 
              style={tw`w-full text-xs pl-11 pr-4 py-3 bg-neutral-100 rounded-xl text-on-surface font-semibold border border-transparent focus:border-neutral-200`}
              placeholder="Search by restaurant name, item, or order ID..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Quick Filters */}
          <View style={tw`flex-row gap-2 mt-1`}>
            {(['All', 'Delivered', 'In Progress', 'Cancelled'] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                style={tw`px-3.5 py-1.5 rounded-full border ${
                  selectedFilter === filter 
                    ? 'bg-primary border-primary' 
                    : 'bg-white border-neutral-200'
                }`}
              >
                <Text style={tw`text-[10px] font-black uppercase tracking-wide ${
                  selectedFilter === filter ? 'text-white' : 'text-secondary'
                }`}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Scroll list */}
        <ScrollView 
          contentContainerStyle={tw`pb-28 pt-4 px-6 gap-4`}
          showsVerticalScrollIndicator={false}
        >
          {filteredOrders.length === 0 ? (
            <View style={tw`items-center justify-center py-20 bg-white rounded-2xl border border-orange-50 p-6`}>
              <ShoppingBag style={tw`text-orange-200 mb-4`} size={48} />
              <Text style={tw`text-base font-black text-slate-800 text-center`}>No Orders Found</Text>
              <Text style={tw`text-xs text-secondary text-center mt-1 px-4 leading-relaxed`}>
                We couldn't find any orders matching "{searchQuery}" under the {selectedFilter} category.
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setSearchQuery('');
                  setSelectedFilter('All');
                }}
                style={tw`mt-4 bg-orange-50 px-4 py-2 rounded-xl`}
              >
                <Text style={tw`text-primary font-black text-xs uppercase tracking-wider`}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => {
                  setSelectedOrder(order);
                  setIsDetailModalVisible(true);
                }}
                style={tw`bg-white rounded-2xl border border-surface-container shadow-sm p-4 flex-row items-center justify-between`}
              >
                <View style={tw`flex-row items-center gap-4.5 flex-1`}>
                  {/* Restaurant Image */}
                  <View style={tw`w-14 h-14 rounded-xl overflow-hidden border border-neutral-100 bg-neutral-100 shadow-sm`}>
                    <Image 
                      style={tw`w-full h-full`}
                      source={{ uri: order.restaurantImage || "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=150&auto=format&fit=crop" }}
                    />
                  </View>

                  {/* Order info */}
                  <View style={tw`flex-1 gap-1`}>
                    <View style={tw`flex-row items-center gap-1.5`}>
                      <Text style={tw`text-sm font-black text-slate-800 tracking-tight`} numberOfLines={1}>
                        {order.restaurantName}
                      </Text>
                    </View>

                    <Text style={tw`text-[10px] font-bold text-slate-400 flex-row items-center gap-1`}>
                      {order.id} • {order.date.split(',')[0]}
                    </Text>

                    <Text style={tw`text-xs font-semibold text-secondary`} numberOfLines={1}>
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </Text>

                    <Text style={tw`text-xs font-black text-primary mt-0.5`}>
                      ₹{order.totalAmount.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Status Badge & Navigate indicator */}
                <View style={tw`items-end gap-2 ml-2`}>
                  {renderStatusBadge(order.status)}
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleReorder(order);
                    }}
                    style={tw`bg-primary px-3 py-1.5 rounded-lg flex-row items-center gap-1 shadow-sm`}
                  >
                    <RefreshCw style={tw`text-white`} size={10} />
                    <Text style={tw`text-white text-[9px] font-black uppercase tracking-wider`}>Reorder</Text>
                  </TouchableOpacity>
                  <ChevronRight style={tw`text-slate-300`} size={16} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Order Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={tw`flex-1 bg-black bg-opacity-65 justify-end`}>
          <View style={tw`bg-white rounded-t-3xl max-h-[85%] pb-10`}>
            {/* Grabber bar */}
            <View style={tw`w-full items-center py-3.5`}>
              <View style={tw`w-12 h-1 bg-neutral-300 rounded-full`} />
            </View>

            {selectedOrder && (
              <ScrollView style={tw`px-6`} showsVerticalScrollIndicator={false}>
                {/* Header detail */}
                <View style={tw`flex-row justify-between items-start border-b border-neutral-100 pb-4`}>
                  <View style={tw`gap-1`}>
                    <Text style={tw`text-[10px] font-black text-secondary uppercase tracking-widest`}>Past Order Details</Text>
                    <Text style={tw`text-xl font-black text-slate-800`}>{selectedOrder.restaurantName}</Text>
                    <Text style={tw`text-xs text-secondary font-semibold`}>Order ID: {selectedOrder.id}</Text>
                  </View>
                  {renderStatusBadge(selectedOrder.status)}
                </View>

                {/* Details Section */}
                <View style={tw`py-4 border-b border-neutral-100 gap-3`}>
                  <View style={tw`flex-row items-center gap-2.5`}>
                    <Calendar style={tw`text-slate-400`} size={15} />
                    <Text style={tw`text-xs text-slate-600 font-bold`}>{selectedOrder.date}</Text>
                  </View>
                  <View style={tw`flex-row items-center gap-2.5`}>
                    <MapPin style={tw`text-slate-400`} size={15} />
                    <Text style={tw`text-xs text-slate-600 font-bold`}>4521 Oakwood Avenue, Apt 4B</Text>
                  </View>
                </View>

                {/* Items Bought list */}
                <View style={tw`py-4 border-b border-neutral-100 gap-3`}>
                  <Text style={tw`text-xs font-black text-secondary uppercase tracking-widest`}>Items Purchased</Text>
                  
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} style={tw`flex-row justify-between items-center`}>
                      <View style={tw`flex-row items-center gap-3`}>
                        <View style={tw`bg-orange-50 px-2 py-0.5 rounded`}>
                          <Text style={tw`text-primary font-black text-xs`}>{item.quantity}x</Text>
                        </View>
                        <Text style={tw`font-bold text-xs text-slate-800`}>{item.name}</Text>
                      </View>
                      <Text style={tw`font-black text-xs text-slate-800`}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Receipt Cost Breakdown */}
                <View style={tw`py-4 border-b border-neutral-100 gap-2`}>
                  <View style={tw`flex-row justify-between`}>
                    <Text style={tw`text-xs text-slate-500 font-semibold`}>Subtotal</Text>
                    <Text style={tw`text-xs text-slate-600 font-bold`}>
                      ₹{(selectedOrder.totalAmount - 4.49).toFixed(2)}
                    </Text>
                  </View>
                  <View style={tw`flex-row justify-between`}>
                    <Text style={tw`text-xs text-slate-500 font-semibold`}>Delivery Fee</Text>
                    <Text style={tw`text-xs text-slate-600 font-bold`}>₹1.99</Text>
                  </View>
                  <View style={tw`flex-row justify-between`}>
                    <Text style={tw`text-xs text-slate-500 font-semibold`}>Service Taxes</Text>
                    <Text style={tw`text-xs text-slate-600 font-bold`}>₹2.50</Text>
                  </View>
                  <View style={tw`flex-row justify-between pt-2 border-t border-neutral-100`}>
                    <Text style={tw`text-sm font-black text-slate-800`}>Grand Total</Text>
                    <Text style={tw`text-sm font-black text-primary`}>₹{selectedOrder.totalAmount.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Help option */}
                <TouchableOpacity style={tw`flex-row items-center justify-center gap-1.5 py-4 border-b border-neutral-100`}>
                  <HelpCircle style={tw`text-primary`} size={14} />
                  <Text style={tw`text-primary font-black text-xs`}>Query about this specific receipt?</Text>
                </TouchableOpacity>

                {/* Action buttons */}
                <View style={tw`flex-row gap-3 pt-6`}>
                  <TouchableOpacity 
                    onPress={() => handleDeleteOrder(selectedOrder.id)}
                    style={tw`p-3.5 bg-red-50 rounded-xl border border-red-100 justify-center items-center`}
                  >
                    <Trash2 style={tw`text-red-600`} size={18} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => {
                      setIsDetailModalVisible(false);
                      handleReorder(selectedOrder);
                    }}
                    style={tw`flex-1 bg-primary py-3.5 rounded-xl flex-row items-center justify-center gap-2 shadow-md`}
                  >
                    <Receipt style={tw`text-white`} size={16} />
                    <Text style={tw`text-white font-extrabold text-xs uppercase tracking-widest`}>
                      Reorder Basket
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setIsDetailModalVisible(false)}
                    style={tw`flex-1 bg-slate-100 py-3.5 rounded-xl items-center justify-center`}
                  >
                    <Text style={tw`text-secondary font-black text-xs uppercase tracking-wider`}>Close</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Reorder Confirmation Dialog Modal */}
      <Modal
        visible={isReorderConfirmVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsReorderConfirmVisible(false);
          setReorderOrder(null);
        }}
      >
        <View style={tw`flex-1 bg-black bg-opacity-65 justify-end`}>
          <View style={tw`bg-white rounded-t-3xl max-h-[85%] pb-10`}>
            {/* Grabber bar */}
            <View style={tw`w-full items-center py-3.5`}>
              <View style={tw`w-12 h-1 bg-neutral-300 rounded-full`} />
            </View>

            {reorderOrder && (
              <ScrollView style={tw`px-6`} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={tw`flex-row items-center gap-3 border-b border-neutral-100 pb-4`}>
                  <View style={tw`w-10 h-10 rounded-full bg-primary/10 items-center justify-center`}>
                    <ShoppingCart style={tw`text-primary`} size={20} />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-[10px] font-black text-secondary uppercase tracking-widest`}>Reorder Confirmation</Text>
                    <Text style={tw`text-lg font-black text-slate-800`}>{reorderOrder.restaurantName}</Text>
                  </View>
                </View>

                {/* Live price check alert banner */}
                <View style={tw`my-4 bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex-row gap-2.5 items-center`}>
                  <Sparkles style={tw`text-emerald-600`} size={15} />
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-[11px] font-black text-emerald-800 uppercase tracking-wide`}>Live Prices Verified</Text>
                    <Text style={tw`text-[10px] text-emerald-700 leading-relaxed font-semibold`}>
                      We checked with the restaurant menu. All items are verified with their active current pricing.
                    </Text>
                  </View>
                </View>

                {/* List of items being reordered */}
                <View style={tw`py-3 gap-3`}>
                  <Text style={tw`text-[10px] font-black text-secondary uppercase tracking-widest`}>Items to be added</Text>
                  
                  <View style={tw`bg-neutral-50 rounded-2xl border border-neutral-200/60 p-4 gap-3.5`}>
                    {reorderOrder.items.map((item, index) => (
                      <View key={index} style={tw`flex-row justify-between items-center`}>
                        <View style={tw`flex-row items-center gap-2.5 flex-1`}>
                          <View style={tw`bg-primary/10 px-2 py-0.5 rounded`}>
                            <Text style={tw`text-primary font-black text-xs`}>{item.quantity}x</Text>
                          </View>
                          <Text style={tw`font-extrabold text-xs text-slate-800`} numberOfLines={1}>
                            {item.name}
                          </Text>
                        </View>
                        
                        <View style={tw`items-end gap-0.5`}>
                          {/* Showing Old vs Updated Prices for visualization */}
                          <View style={tw`flex-row items-center gap-1.5`}>
                            <Text style={tw`text-[9px] text-slate-400 font-bold line-through`}>
                              ₹{(item.price * 0.95).toFixed(2)}
                            </Text>
                            <Text style={tw`font-black text-xs text-slate-800`}>
                              ₹{item.price.toFixed(2)} ea
                            </Text>
                          </View>
                          <Text style={tw`text-[8px] font-black text-emerald-600 uppercase tracking-wider`}>
                            ✓ price verified
                          </Text>
                        </View>
                      </View>
                    ))}

                    <View style={tw`border-t border-neutral-200/60 pt-3 flex-row justify-between items-center`}>
                      <Text style={tw`text-xs font-black text-slate-800`}>Subtotal for this Reorder</Text>
                      <Text style={tw`text-sm font-black text-primary`}>
                        ₹{reorderOrder.items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Cart Status and Merging options info block */}
                <View style={tw`py-3 gap-2.5`}>
                  <Text style={tw`text-[10px] font-black text-secondary uppercase tracking-widest`}>Current Cart Status</Text>
                  
                  {cartItems.length > 0 ? (
                    <View style={tw`bg-amber-50 p-4 rounded-2xl border border-amber-200/60 gap-2`}>
                      <View style={tw`flex-row items-center gap-2`}>
                        <AlertTriangle style={tw`text-amber-600`} size={15} />
                        <Text style={tw`text-xs font-black text-amber-800`}>
                          Your cart already contains {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} item(s).
                        </Text>
                      </View>
                      <Text style={tw`text-[10px] text-amber-700 leading-relaxed font-semibold`}>
                        Choose <Text style={tw`font-black`}>Merge Cart</Text> to combine them together (quantities of identical items will be added), or <Text style={tw`font-black`}>Replace Cart</Text> to clear and replace with this order.
                      </Text>

                      {/* Display what current cart has briefly */}
                      <View style={tw`bg-white/80 rounded-xl p-2.5 mt-1 border border-amber-100 gap-1.5`}>
                        <Text style={tw`text-[8px] font-black text-amber-800 uppercase tracking-wider`}>Existing Items in Cart:</Text>
                        {cartItems.slice(0, 3).map((item, idx) => (
                          <Text key={idx} style={tw`text-[10px] font-bold text-slate-700`}>
                            • {item.quantity}x {item.name} (₹{(item.price * item.quantity).toFixed(2)})
                          </Text>
                        ))}
                        {cartItems.length > 3 && (
                          <Text style={tw`text-[9px] text-slate-500 font-bold italic`}>
                            + {cartItems.length - 3} more item(s)...
                          </Text>
                        )}
                      </View>
                    </View>
                  ) : (
                    <View style={tw`bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/60 flex-row gap-2.5 items-center`}>
                      <Check style={tw`text-emerald-500`} size={15} />
                      <Text style={tw`text-xs font-extrabold text-slate-600`}>
                        Your active cart is empty. These items will be placed cleanly.
                      </Text>
                    </View>
                  )}
                </View>

                {/* Grand summary prediction if merged */}
                {cartItems.length > 0 && (
                  <View style={tw`bg-slate-50 p-3.5 rounded-2xl border border-neutral-200/50 flex-row justify-between items-center mt-1`}>
                    <Text style={tw`text-xs font-bold text-slate-600`}>Estimated Merging Grand Total:</Text>
                    <Text style={tw`text-sm font-black text-slate-800`}>
                      ₹{(
                        reorderOrder.items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0) +
                        cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0)
                      ).toFixed(2)}
                    </Text>
                  </View>
                )}

                {/* Confirmation actions */}
                <View style={tw`pt-6 gap-3`}>
                  {cartItems.length > 0 ? (
                    <View style={tw`flex-col gap-2.5`}>
                      <TouchableOpacity 
                        onPress={handleConfirmMerge}
                        style={tw`w-full bg-primary py-3.5 rounded-xl flex-row items-center justify-center gap-2 shadow-md`}
                      >
                        <Plus style={tw`text-white`} size={16} />
                        <Text style={tw`text-white font-extrabold text-xs uppercase tracking-widest`}>
                          Merge with Current Cart
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        onPress={handleConfirmReplace}
                        style={tw`w-full bg-neutral-800 py-3.5 rounded-xl flex-row items-center justify-center gap-2`}
                      >
                        <RefreshCw style={tw`text-white`} size={14} />
                        <Text style={tw`text-white font-extrabold text-xs uppercase tracking-widest`}>
                          Clear & Replace Cart
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={handleConfirmReplace}
                      style={tw`w-full bg-primary py-3.5 rounded-xl flex-row items-center justify-center gap-2 shadow-md`}
                    >
                      <Plus style={tw`text-white`} size={16} />
                      <Text style={tw`text-white font-extrabold text-xs uppercase tracking-widest`}>
                        Add to Cart
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    onPress={() => {
                      setIsReorderConfirmVisible(false);
                      setReorderOrder(null);
                    }}
                    style={tw`w-full bg-slate-100 py-3.5 rounded-xl items-center justify-center`}
                  >
                    <Text style={tw`text-secondary font-black text-xs uppercase tracking-wider`}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};
