import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { tw } from '../theme';
import { 
  ArrowLeft, 
  MapPin, 
  Compass, 
  MessageSquare, 
  Phone,
  CheckCircle,
  Clock,
  Home as HomeIcon, 
  Search as SearchIcon, 
  ReceiptText, 
  User,
  HelpCircle,
  CreditCard,
  Check,
  Tag,
  Trash2
} from 'lucide-react';
import { ScreenName, TransitionType, CartItem } from '../types';

interface OrderDetailProps {
  onNavigate: (destination: ScreenName, transition: TransitionType) => void;
  cartItems: CartItem[];
  cartTotal: number;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({ 
  onNavigate, 
  cartItems, 
  cartTotal 
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [flatDiscount, setFlatDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const displayItems = cartItems.length > 0 ? cartItems : [
    { id: '1', name: 'Truffle Mushroom Pizza', price: 24.50, quantity: 1 },
    { id: '2', name: 'Classic Lemonade', price: 4.50, quantity: 1 }
  ];

  const subtotal = cartItems.length > 0 ? cartTotal : 29.00;
  const deliveryFee = 1.99;
  const serviceTax = 2.50;

  // Compute promo discounts dynamically
  let currentDiscount = 0;
  if (discountPercent > 0) {
    currentDiscount = subtotal * (discountPercent / 100);
  } else if (flatDiscount > 0) {
    currentDiscount = Math.min(flatDiscount, subtotal);
  }

  const grandTotal = Math.max(0, subtotal - currentDiscount + deliveryFee + serviceTax);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError('Please enter a promo code');
      setPromoSuccess(null);
      return;
    }

    if (code === 'QUICK30') {
      setDiscountPercent(30);
      setFlatDiscount(0);
      setAppliedCode('QUICK30');
      setPromoSuccess('Promo QUICK30 applied: 30% discount on food!');
      setPromoError(null);
    } else if (code === 'BITE10') {
      setDiscountPercent(0);
      setFlatDiscount(10);
      setAppliedCode('BITE10');
      setPromoSuccess('Promo BITE10 applied: ₹10.00 off!');
      setPromoError(null);
    } else if (code === 'FREEFEED') {
      setDiscountPercent(100);
      setFlatDiscount(0);
      setAppliedCode('FREEFEED');
      setPromoSuccess('Promo FREEFEED applied: 100% off meal!');
      setPromoError(null);
    } else if (code === '50OFF') {
      setDiscountPercent(50);
      setFlatDiscount(0);
      setAppliedCode('50OFF');
      setPromoSuccess('Promo 50OFF applied: 50% discount on food!');
      setPromoError(null);
    } else {
      setPromoError('Invalid code. Try: QUICK30, BITE10 or 50OFF');
      setPromoSuccess(null);
    }
  };

  const handleRemovePromo = () => {
    setAppliedCode(null);
    setDiscountPercent(0);
    setFlatDiscount(0);
    setPromoCode('');
    setPromoSuccess(null);
    setPromoError(null);
  };

  return (
    <View style={tw`flex-1 bg-background relative`}>
      {/* Top Header */}
      <View style={tw`w-full bg-surface border-b border-surface-container py-3 px-6 flex-row justify-between items-center shadow-sm`}>
        <View style={tw`flex-row items-center gap-3`}>
          <TouchableOpacity 
            onPress={() => onNavigate('QuickBite - Home', 'push_back')}
            style={tw`p-1`}
          >
            <ArrowLeft style={tw`text-primary`} size={18} />
          </TouchableOpacity>
          <Text style={tw`text-lg font-extrabold text-primary`}>QuickBite Delivery</Text>
        </View>
        
        <View style={tw`flex-row items-center gap-1.5`}>
          <MapPin style={tw`text-primary`} size={14} />
          <Text style={tw`text-xs font-bold text-on-surface`}>Home Delivery</Text>
        </View>
      </View>

      {/* Main content scroll view */}
      <ScrollView 
        contentContainerStyle={tw`pb-32 px-6 pt-4`}
        showsVerticalScrollIndicator={false}
      >
        {/* Out for Delivery banner */}
        <TouchableOpacity 
          onPress={() => onNavigate('QuickBite - Live Tracking', 'push')}
          style={tw`flex-row justify-between items-end bg-surface border border-primary p-4 rounded-xl shadow-sm bg-orange-50/20`}
        >
          <View>
            <Text style={tw`text-xl font-black text-on-surface`}>Out for delivery</Text>
            <Text style={tw`text-xs text-secondary mt-1`}>Arriving in <Text style={tw`text-primary font-bold`}>12 mins</Text></Text>
            <Text style={tw`text-[10px] text-primary font-black uppercase mt-1`}>➔ Tap to Track Live</Text>
          </View>

          <View style={tw`bg-tertiary-container/15 px-3 py-1 rounded-full flex-row items-center gap-1.5`}>
            <View style={tw`w-1.5 h-1.5 rounded-full bg-tertiary`} />
            <Text style={tw`text-xs uppercase tracking-wider text-tertiary font-bold`}>On the way</Text>
          </View>
        </TouchableOpacity>

        {/* Live Map Display with routing details */}
        <TouchableOpacity 
          onPress={() => onNavigate('QuickBite - Live Tracking', 'push')}
          style={tw`relative h-60 w-full rounded-2xl overflow-hidden shadow-sm border border-surface-container mt-6`}
        >
          <Image 
            style={tw`w-full h-full opacity-90`} 
            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5UDXbZfmyDy8zsAzThtYnezNo0wtydiriHs3s8u3VZ_QP77p2yxN3m8hI1GEkgzxjMDVibx77wrqwYDpYpdyef-KDOhSEO5-m32Ykb_wmsNK2cUOYOQnfpGVZPSggkeVader6xMogEcuxAoc0tblLne1O-4GAj16t5KJ-IXNxJhXn125Q8dAS7VwA5D8ZIXIiqYhWXHelMS009I1ZNSmH7K7eyfBPCdceavDAghcONX59Kb4IfMSh4YjBuWqyUGDe_wobT39l5MRd" }}
          />
          
          {/* Float Map Card Overlay */}
          <View style={tw`absolute bottom-4 left-4 right-4 flex-row justify-center`}>
            <View style={tw`bg-primary px-4 py-2.5 rounded-xl shadow-lg flex-row items-center gap-3 border border-white`}>
              <View style={tw`w-8 h-8 rounded-full bg-white items-center justify-center`}>
                <Compass style={tw`text-primary`} size={16} />
              </View>
              <Text style={tw`text-xs font-black text-white`}>View Live Delivery Route</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Order Status Timeline progress tracker */}
        <View style={tw`bg-surface border border-surface-container p-5 rounded-2xl shadow-sm mt-6`}>
          <Text style={tw`text-xs font-bold text-secondary uppercase tracking-widest mb-4`}>Order Status</Text>
          <View style={tw`relative gap-5`}>
            {/* Thread line connecting check indicators */}
            <View style={tw`absolute left-[11px] top-2 bottom-2 w-0.5 bg-neutral-200`} />
            
            {/* Step 1 */}
            <View style={tw`flex-row items-center gap-4 relative`}>
              <View style={tw`w-6 h-6 rounded-full bg-tertiary items-center justify-center`}>
                <Check style={tw`text-white`} size={12} />
              </View>
              <View>
                <Text style={tw`text-xs font-extrabold text-on-surface`}>Order Placed</Text>
                <Text style={tw`text-[10px] text-secondary mt-0.5`}>12:30 PM</Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={tw`flex-row items-center gap-4 relative`}>
              <View style={tw`w-6 h-6 rounded-full bg-tertiary items-center justify-center`}>
                <Check style={tw`text-white`} size={12} />
              </View>
              <View>
                <Text style={tw`text-xs font-extrabold text-on-surface`}>Accepted</Text>
                <Text style={tw`text-[10px] text-secondary mt-0.5`}>12:32 PM</Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={tw`flex-row items-center gap-4 relative`}>
              <View style={tw`w-6 h-6 rounded-full bg-tertiary items-center justify-center`}>
                <Check style={tw`text-white`} size={12} />
              </View>
              <View>
                <Text style={tw`text-xs font-extrabold text-on-surface`}>Preparing</Text>
                <Text style={tw`text-[10px] text-secondary mt-0.5`}>12:45 PM</Text>
              </View>
            </View>

            {/* Step 4 Active */}
            <View style={tw`flex-row items-center gap-4 relative`}>
              <View style={tw`w-6 h-6 rounded-full bg-primary-container items-center justify-center border border-white shadow-sm`}>
                <Clock style={tw`text-primary`} size={12} />
              </View>
              <View>
                <Text style={tw`text-xs font-extrabold text-primary`}>Out for Delivery</Text>
                <Text style={tw`text-[10px] text-secondary mt-0.5 font-bold`}>Just now</Text>
              </View>
            </View>

            {/* Step 5 */}
            <View style={tw`flex-row items-center gap-4 relative`}>
              <View style={tw`w-6 h-6 rounded-full bg-slate-200 items-center justify-center`}>
                <CheckCircle style={tw`text-slate-400`} size={12} />
              </View>
              <View>
                <Text style={tw`text-xs font-semibold text-secondary`}>Delivered</Text>
                <Text style={tw`text-[10px] text-secondary mt-0.5`}>Estimated 1:15 PM</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rider Information details */}
        <View style={tw`bg-surface border border-surface-container p-4 rounded-xl shadow-sm flex-row items-center justify-between mt-6`}>
          <View style={tw`flex-row items-center gap-3`}>
            <View style={tw`relative`}>
              <View style={tw`w-12 h-12 rounded-full overflow-hidden bg-surface-container border border-primary-container/25`}>
                <Image 
                  style={tw`w-full h-full`} 
                  source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHjoS-gfpWaoGDE8qrW_Ne8ijgXiKjYr3wFi9JC4QtY-2roCg5tkED67mFklKrN0XqzBcCtXYBgCFyUs-lrCAFRakeJMFrjem3nXSxOeFaZ1hWaujeE0ey9XghradrTEw_Pym7QIRSFFxrqL9mhw6p9aadfpScoMgNR535pn4sH2cXCwcCD-nuRjCUINQ5ezjR616Q63WbWKturSRenyNX8Mo77SNEYzrYKKUqjhe9lESJI7TIvsGwmerK-OZJ8Av0XAD-vQrzqMQT" }} 
                />
              </View>
              <View style={tw`absolute -bottom-1 -right-1 bg-tertiary-container w-5 h-5 rounded-full items-center justify-center border border-white`}>
                <Text style={tw`text-[9px] font-black text-on-tertiary-container`}>★</Text>
              </View>
            </View>
            
            <View>
              <Text style={tw`text-sm font-bold text-on-surface`}>Marco Rossi</Text>
              <View style={tw`flex-row items-center gap-2`}>
                <Text style={tw`text-[10px] font-bold text-secondary`}>4.9 rating</Text>
                <Text style={tw`text-secondary text-[8px]`}>•</Text>
                <Text style={tw`text-[10px] font-semibold text-primary`}>QuickBite Pro</Text>
              </View>
            </View>
          </View>

          <View style={tw`flex-row gap-2`}>
            <TouchableOpacity style={tw`w-9 h-9 rounded-full bg-surface-container items-center justify-center`}>
              <MessageSquare style={tw`text-slate-700`} size={16} />
            </TouchableOpacity>
            <TouchableOpacity style={tw`w-9 h-9 rounded-full bg-primary-container items-center justify-center`}>
              <Phone style={tw`text-on-primary-container`} size={16} fill="#ea580c" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Promo Code Card */}
        <View style={tw`mt-6 gap-3`}>
          <Text style={tw`text-base font-bold text-on-surface`}>Offers & Promos</Text>
          <View style={tw`bg-surface border border-surface-container p-4 rounded-xl shadow-sm gap-3`}>
            {!appliedCode ? (
              <View style={tw`gap-2`}>
                <View style={tw`flex-row gap-2`}>
                  <View style={tw`relative flex-1`}>
                    <View style={tw`absolute left-3 top-3.5 z-10`}>
                      <Tag style={tw`text-slate-400`} size={14} />
                    </View>
                    <TextInput
                      style={tw`w-full text-xs pl-9 pr-4 py-2.5 bg-neutral-100 rounded-lg text-on-surface font-semibold border border-transparent focus:border-neutral-200`}
                      placeholder="Enter code (e.g., QUICK30, BITE10)"
                      placeholderTextColor="#94a3b8"
                      value={promoCode}
                      onChangeText={(val) => {
                        setPromoCode(val);
                        if (promoError) setPromoError(null);
                      }}
                      autoCapitalize="characters"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleApplyPromo}
                    style={tw`bg-primary px-4 rounded-lg justify-center items-center shadow-sm`}
                  >
                    <Text style={tw`text-white font-extrabold text-xs uppercase tracking-wider`}>Apply</Text>
                  </TouchableOpacity>
                </View>
                {promoError && (
                  <Text style={tw`text-red-600 text-[10px] font-bold mt-1`}>
                    ⚠ {promoError}
                  </Text>
                )}
                <View style={tw`flex-row items-center gap-1.5 mt-0.5`}>
                  <Text style={tw`text-[10px] text-slate-400 font-semibold`}>Try: </Text>
                  <TouchableOpacity onPress={() => setPromoCode('QUICK30')}>
                    <Text style={tw`text-[10px] text-primary font-bold underline`}>QUICK30 (30% off)</Text>
                  </TouchableOpacity>
                  <Text style={tw`text-[10px] text-slate-400 font-semibold`}>or</Text>
                  <TouchableOpacity onPress={() => setPromoCode('BITE10')}>
                    <Text style={tw`text-[10px] text-primary font-bold underline`}>BITE10 (₹10 off)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={tw`bg-emerald-50/75 p-3 rounded-lg border border-emerald-100 flex-row justify-between items-center`}>
                <View style={tw`flex-row items-center gap-2.5 flex-1`}>
                  <View style={tw`w-7 h-7 rounded-full bg-emerald-500 items-center justify-center`}>
                    <Tag style={tw`text-white`} size={12} />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-xs font-black text-emerald-800`}>Code {appliedCode} Applied!</Text>
                    <Text style={tw`text-[10px] text-emerald-700 font-semibold`}>{promoSuccess}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleRemovePromo}
                  style={tw`p-1.5 bg-white rounded-md border border-red-200/50`}
                >
                  <Trash2 style={tw`text-red-500`} size={14} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Checkout Food Item Summary */}
        <View style={tw`mt-6 gap-3`}>
          <Text style={tw`text-base font-bold text-on-surface`}>Order Summary</Text>
          <View style={tw`bg-surface border border-surface-container rounded-xl overflow-hidden shadow-sm`}>
            <View style={tw`p-4 gap-3 border-b border-orange-50`}>
              {displayItems.map((item) => (
                <View key={item.id} style={tw`flex-row justify-between items-center`}>
                  <View style={tw`flex-row items-center gap-3`}>
                    <Text style={tw`text-primary font-black text-sm`}>{item.quantity}x</Text>
                    <Text style={tw`font-semibold text-sm text-on-surface`}>{item.name}</Text>
                  </View>
                  <Text style={tw`font-bold text-sm text-on-surface`}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
            </View>

            <View style={tw`p-4 gap-2 bg-surface-container-low/30`}>
              <View style={tw`flex-row justify-between`}>
                <Text style={tw`text-xs text-secondary font-medium`}>Subtotal</Text>
                <Text style={tw`text-xs text-secondary font-medium`}>₹{subtotal.toFixed(2)}</Text>
              </View>
              
              {currentDiscount > 0 && (
                <View style={tw`flex-row justify-between items-center bg-emerald-50/50 px-2 py-1 rounded`}>
                  <Text style={tw`text-xs text-emerald-700 font-extrabold`}>Discount ({appliedCode})</Text>
                  <Text style={tw`text-xs text-emerald-700 font-extrabold`}>-₹{currentDiscount.toFixed(2)}</Text>
                </View>
              )}

              <View style={tw`flex-row justify-between`}>
                <Text style={tw`text-xs text-secondary font-medium`}>Delivery Fee</Text>
                <Text style={tw`text-xs text-secondary font-medium`}>₹{deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={tw`flex-row justify-between`}>
                <Text style={tw`text-xs text-secondary font-medium`}>Service Tax</Text>
                <Text style={tw`text-xs text-secondary font-medium`}>₹{serviceTax.toFixed(2)}</Text>
              </View>
              <View style={tw`flex-row justify-between pt-2 border-t border-orange-100/60`}>
                <Text style={tw`text-sm font-extrabold text-on-surface`}>Total</Text>
                <Text style={tw`text-base font-black text-primary`}>₹{grandTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Coordinates & Payment */}
        <View style={tw`mt-6 gap-4`}>
          <View style={tw`bg-surface border border-surface-container p-4 rounded-xl shadow-sm gap-1`}>
            <View style={tw`flex-row items-center gap-1.5`}>
              <MapPin style={tw`text-primary`} size={12} />
              <Text style={tw`text-[10px] font-bold uppercase tracking-wider text-secondary`}>Delivery Address</Text>
            </View>
            <Text style={tw`text-xs font-bold text-on-surface mt-1`}>4521 Oakwood Avenue, Apt 4B</Text>
            <Text style={tw`text-[10px] text-secondary`}>Gate code: 4812. Leave at front door.</Text>
          </View>

          <View style={tw`bg-surface border border-surface-container p-4 rounded-xl shadow-sm gap-1`}>
            <View style={tw`flex-row items-center gap-1.5`}>
              <CreditCard style={tw`text-primary`} size={12} />
              <Text style={tw`text-[10px] font-bold uppercase tracking-wider text-secondary`}>Payment Method</Text>
            </View>
            <View style={tw`flex-row items-center gap-2 mt-1`}>
              <View style={tw`w-8 h-5 bg-slate-900 rounded items-center justify-center`}>
                <Text style={tw`text-white text-[7px] font-black italic`}>VISA</Text>
              </View>
              <Text style={tw`text-xs font-bold text-on-surface`}>Visa •••• 9245</Text>
            </View>
            <Text style={tw`text-[10px] text-secondary`}>Charged at 12:30 PM</Text>
          </View>
        </View>

        {/* Customer Support options */}
        <View style={tw`py-6 items-center`}>
          <Text style={tw`text-xs text-secondary font-medium`}>Something wrong with your order?</Text>
          <TouchableOpacity style={tw`mt-2 flex-row items-center gap-1`}>
            <HelpCircle style={tw`text-primary`} size={14} />
            <Text style={tw`text-primary font-black text-xs`}>Need Help? Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Nav Bar */}
      <View style={tw`absolute bottom-0 w-full h-16 bg-surface border-t border-surface-container flex-row justify-around items-center`}>
        {/* Home */}
        <TouchableOpacity 
          onPress={() => onNavigate('QuickBite - Home', 'none')}
          style={tw`items-center justify-center`}
        >
          <HomeIcon style={tw`text-secondary`} size={20} />
          <Text style={tw`text-[10px] mt-0.5 text-secondary`}>Home</Text>
        </TouchableOpacity>

        {/* Search */}
        <TouchableOpacity 
          onPress={() => onNavigate('QuickBite - Search Results', 'none')}
          style={tw`items-center justify-center`}
        >
          <SearchIcon style={tw`text-secondary`} size={20} />
          <Text style={tw`text-[10px] mt-0.5 text-secondary`}>Search</Text>
        </TouchableOpacity>

        {/* Orders Active */}
        <TouchableOpacity style={tw`items-center justify-center`}>
          <ReceiptText style={tw`text-primary`} size={20} fill="#f97316" />
          <Text style={tw`text-[10px] mt-0.5 text-primary font-bold`}>Orders</Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity 
          onPress={() => onNavigate('QuickBite - Profile', 'none')}
          style={tw`items-center justify-center`}
        >
          <User style={tw`text-secondary`} size={20} />
          <Text style={tw`text-[10px] mt-0.5 text-secondary`}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
