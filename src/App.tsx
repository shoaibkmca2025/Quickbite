import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native';
import { tw } from './theme';
import { ScreenName, TransitionType, CartItem } from './types';
import { NavigationWrapper } from './components/NavigationWrapper';
import { Home } from './components/Home';
import { SearchResults } from './components/SearchResults';
import { Menu } from './components/Menu';
import { OrderDetail } from './components/OrderDetail';
import { Profile } from './components/Profile';
import { Authentication } from './components/Authentication';
import { OrderHistory } from './components/OrderHistory';
import { LiveTracking } from './components/LiveTracking';
import { RiderRegistration } from './components/RiderRegistration';
import { RiderDashboard } from './components/RiderDashboard';
import { RiderActiveOrder } from './components/RiderActiveOrder';
import { RiderEarnings } from './components/RiderEarnings';
import { RiderProfile } from './components/RiderProfile';
import { OpsConsole } from './components/OpsConsole';
import { 
  ChevronLeft,
  LayoutGrid, 
  Check, 
  X,
  Wifi,
  Signal,
  Battery
} from 'lucide-react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenName>('QuickBite - Home');
  const [transitionType, setTransitionType] = useState<TransitionType>('none');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hudExpanded, setHudExpanded] = useState(false);

  // Dynamic User authentication state with persistent simulated memory
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; avatar?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('qb_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (user: { name: string; email: string; avatar?: string }) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('qb_user', JSON.stringify(user));
    } catch {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('qb_user');
    } catch {}
  };

  // Embedded status & style configurations
  const [navStyle, setNavStyle] = useState<'gesture' | 'buttons'>('gesture');
  const [signalType, setSignalType] = useState<'5G' | 'LTE' | 'Wi-Fi'>('5G');
  const [batteryPercent, setBatteryPercent] = useState(98);
  const [navHistory, setNavHistory] = useState<ScreenName[]>(['QuickBite - Home']);
  const [currentTime, setCurrentTime] = useState('09:41');

  // Real clock synchronization inside status bar
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      hours = hours % 12 || 12; // 12h format
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cart operations
  const handleAddToCart = (item: any) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const handleNavigate = (destination: ScreenName, transition: TransitionType) => {
    setTransitionType(transition);
    setActiveScreen(destination);
    setNavHistory(prev => {
      if (prev[prev.length - 1] === destination) return prev;
      return [...prev, destination];
    });
  };

  const handleAndroidBack = () => {
    if (navHistory.length > 1) {
      const newHistory = [...navHistory];
      newHistory.pop(); // remove current
      const previousScreen = newHistory[newHistory.length - 1];
      setNavHistory(newHistory);
      setTransitionType('push_back');
      setActiveScreen(previousScreen);
    } else {
      setTransitionType('push_back');
      setActiveScreen('QuickBite - Home');
    }
  };

  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const cartTotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  // Component router
  const renderScreen = () => {
    switch (activeScreen) {
      case 'QuickBite - Search Results':
        return <SearchResults onNavigate={handleNavigate} cartCount={cartCount} />;
      case 'QuickBite - Restaurant Menu':
        return (
          <Menu 
            onNavigate={handleNavigate} 
            onAddToCart={handleAddToCart}
            cartCount={cartCount}
            cartTotal={cartTotal}
          />
        );
      case 'QuickBite - Order Detail':
        return (
          <OrderDetail 
            onNavigate={handleNavigate} 
            cartItems={cartItems}
            cartTotal={cartTotal}
          />
        );
      case 'QuickBite - Order History':
        return (
          <OrderHistory 
            onNavigate={handleNavigate} 
            onSetCartItems={setCartItems} 
            cartItems={cartItems}
          />
        );
      case 'QuickBite - Live Tracking':
        return <LiveTracking onNavigate={handleNavigate} />;
      case 'QuickBite - Authentication':
        return <Authentication onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
      case 'QuickBite - Profile':
        return (
          <Profile 
            onNavigate={handleNavigate} 
            cartCount={cartCount} 
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        );
      case 'QuickBite - Rider Registration':
        return <RiderRegistration onNavigate={handleNavigate} />;
      case 'QuickBite Rider - Dashboard':
        return <RiderDashboard onNavigate={handleNavigate} />;
      case 'QuickBite Rider - Active Order':
        return <RiderActiveOrder onNavigate={handleNavigate} />;
      case 'QuickBite Rider - Earnings':
        return <RiderEarnings onNavigate={handleNavigate} />;
      case 'QuickBite Rider - Profile':
        return <RiderProfile onNavigate={handleNavigate} />;
      case 'Ops Console - Management':
        return <OpsConsole onNavigate={handleNavigate} />;
      case 'QuickBite - Home':
      default:
        return <Home onNavigate={handleNavigate} cartCount={cartCount} />;
    }
  };

  const screens: { label: string; name: ScreenName; category: 'Customer' | 'Rider' | 'Ops' }[] = [
    { label: 'Home Feed', name: 'QuickBite - Home', category: 'Customer' },
    { label: 'Login & Register', name: 'QuickBite - Authentication', category: 'Customer' },
    { label: 'Search & Results', name: 'QuickBite - Search Results', category: 'Customer' },
    { label: 'Restaurant Menu', name: 'QuickBite - Restaurant Menu', category: 'Customer' },
    { label: 'Order Tracking & Checkout', name: 'QuickBite - Order Detail', category: 'Customer' },
    { label: 'Live Order Tracking', name: 'QuickBite - Live Tracking', category: 'Customer' },
    { label: 'Order History', name: 'QuickBite - Order History', category: 'Customer' },
    { label: 'Customer Profile', name: 'QuickBite - Profile', category: 'Customer' },
    { label: 'Rider Registration', name: 'QuickBite - Rider Registration', category: 'Rider' },
    { label: 'Rider Dashboard', name: 'QuickBite Rider - Dashboard', category: 'Rider' },
    { label: 'Active Delivery Order', name: 'QuickBite Rider - Active Order', category: 'Rider' },
    { label: 'Rider Earnings History', name: 'QuickBite Rider - Earnings', category: 'Rider' },
    { label: 'Rider Profile Settings', name: 'QuickBite Rider - Profile', category: 'Rider' },
    { label: 'Operations Admin Console', name: 'Ops Console - Management', category: 'Ops' },
  ];

  // Dynamic light/dark status bar text based on context screen theme colors
  const isDarkStatus = [
    'QuickBite Rider - Dashboard',
    'QuickBite Rider - Active Order',
    'QuickBite Rider - Earnings',
    'QuickBite Rider - Profile',
    'Ops Console - Management'
  ].includes(activeScreen);

  // Widescreen consoles scale fully on desktop instead of locking to portrait
  const isWidescreenConsole = activeScreen === 'Ops Console - Management';

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      {/* Main app layout wrapper */}
      <View style={tw`flex-1 items-center justify-center`}>
        
        {isWidescreenConsole ? (
          /* Operations Console widescreen mode */
          <View style={tw`w-full flex-1 bg-surface relative`}>
            <NavigationWrapper activeKey={activeScreen} transitionType={transitionType}>
              {renderScreen()}
            </NavigationWrapper>
          </View>
        ) : (
          /* Portrait Mobile App view */
          <View style={tw`w-full sm:max-w-[412px] h-full sm:h-[840px] bg-white sm:rounded-[44px] sm:shadow-2xl border-none sm:border sm:border-slate-150 flex flex-col relative overflow-hidden`}>
            
            {/* Dynamic Status Bar */}
            <View style={tw`w-full h-[38px] px-6 pt-2 flex-row justify-between items-center text-xs font-bold ${
              isDarkStatus ? 'bg-slate-950 text-white' : 'bg-orange-50 text-slate-900 border-b border-orange-100'
            }`}>
              <View style={tw`flex-row items-center gap-1`}>
                <Text style={tw`font-extrabold text-[11px] ${isDarkStatus ? 'text-white' : 'text-slate-900'}`}>{currentTime}</Text>
              </View>
              
              {/* Camera Notch Punch Hole */}
              <View style={tw`w-4.5 h-4.5 bg-black rounded-full items-center justify-center`}>
                <View style={tw`w-1.5 h-1.5 bg-slate-900 rounded-full`} />
              </View>

              <View style={tw`flex-row items-center gap-1.5`}>
                <Text style={tw`text-[9px] font-extrabold ${isDarkStatus ? 'text-white' : 'text-slate-900'}`}>{signalType === 'Wi-Fi' ? '' : signalType}</Text>
                {signalType === 'Wi-Fi' ? (
                  <Wifi style={isDarkStatus ? tw`text-white` : tw`text-slate-900`} size={12} />
                ) : (
                  <Signal style={isDarkStatus ? tw`text-white` : tw`text-slate-900`} size={12} />
                )}
                <Text style={tw`text-[10px] font-extrabold ${isDarkStatus ? 'text-white' : 'text-slate-900'}`}>{batteryPercent}%</Text>
                <Battery style={isDarkStatus ? tw`text-white` : tw`text-slate-900`} size={12} />
              </View>
            </View>

            {/* Active app display page */}
            <View style={tw`flex-1 w-full overflow-hidden relative bg-background`}>
              <NavigationWrapper activeKey={activeScreen} transitionType={transitionType}>
                {renderScreen()}
              </NavigationWrapper>
            </View>

            {/* Standard Bottom System Navigation Bar */}
            <View style={tw`w-full py-2.5 px-1 flex-row justify-center items-center border-t ${
              isDarkStatus ? 'bg-slate-950 text-white border-slate-900' : 'bg-orange-50 text-slate-800 border-orange-100'
            }`}>
              {navStyle === 'gesture' ? (
                <TouchableOpacity 
                  onPress={handleAndroidBack}
                  style={tw`w-28 h-1 rounded-full ${isDarkStatus ? 'bg-white' : 'bg-slate-800'} opacity-40`}
                />
              ) : (
                <View style={tw`flex-row gap-16 justify-center items-center w-full`}>
                  {/* Triangle Back */}
                  <TouchableOpacity 
                    onPress={handleAndroidBack} 
                    style={tw`p-1 rounded-full`}
                  >
                    <ChevronLeft style={isDarkStatus ? tw`text-white` : tw`text-slate-800`} size={16} />
                  </TouchableOpacity>
                  
                  {/* Home Circle */}
                  <TouchableOpacity 
                    onPress={() => handleNavigate('QuickBite - Home', 'none')} 
                    style={tw`p-1 px-3 rounded-full`}
                  >
                    <View style={tw`w-3 h-3 rounded-full border-2 ${isDarkStatus ? 'border-white' : 'border-slate-800'}`} />
                  </TouchableOpacity>
                  
                  {/* App Drawer Square */}
                  <TouchableOpacity 
                    onPress={() => setHudExpanded(true)} 
                    style={tw`p-1 rounded-full`}
                  >
                    <View style={tw`w-3 h-3 border-2 ${isDarkStatus ? 'border-white' : 'border-slate-800'} rounded-sm`} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

          </View>
        )}

      </View>

      {/* Developer Prototype Floating Controller (Compact, elegant action button) */}
      <View style={tw`absolute bottom-6 right-6 z-50`}>
        <TouchableOpacity 
          onPress={() => setHudExpanded(true)}
          style={tw`bg-slate-900 px-4 py-2.5 rounded-full shadow-2xl flex-row items-center gap-2 border border-slate-800`}
        >
          <LayoutGrid style={tw`text-orange-400`} size={16} />
          <Text style={tw`text-white text-xs font-bold`}>Screens ({screens.length})</Text>
        </TouchableOpacity>
      </View>

      {/* High-fidelity Navigation Bottom Drawer Overlay */}
      <Modal
        visible={hudExpanded}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setHudExpanded(false)}
      >
        <View style={tw`flex-1 bg-black bg-opacity-60 justify-end`}>
          <TouchableOpacity 
            style={tw`absolute inset-0`} 
            onPress={() => setHudExpanded(false)} 
          />
          
          <View style={tw`bg-slate-900 rounded-t-[32px] border-t border-slate-800 p-6 max-h-[85%]`}>
            {/* Drawer Top Handle */}
            <View style={tw`w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4`} />

            {/* Header */}
            <View style={tw`flex-row justify-between items-center border-b border-slate-800 pb-3 mb-4`}>
              <View>
                <Text style={tw`text-sm font-black uppercase text-orange-400 tracking-wider`}>Prototype Navigator</Text>
                <Text style={tw`text-[10px] text-slate-400`}>Jump instantly between screens</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setHudExpanded(false)}
                style={tw`p-1.5`}
              >
                <X style={tw`text-slate-400`} size={18} />
              </TouchableOpacity>
            </View>

            {/* Screens List */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={tw`gap-4 mb-6`}>
                
                {/* Customer App Group */}
                <View style={tw`gap-2`}>
                  <Text style={tw`text-[10px] font-black text-rose-400 uppercase tracking-widest`}>
                    Customer Delivery Flow
                  </Text>
                  <View style={tw`gap-1.5`}>
                    {screens.filter(s => s.category === 'Customer').map(s => (
                      <TouchableOpacity
                        key={s.name}
                        onPress={() => {
                          handleNavigate(s.name, 'none');
                          setHudExpanded(false);
                        }}
                        style={tw`flex-row justify-between items-center p-3 rounded-xl ${
                          activeScreen === s.name 
                            ? 'bg-rose-500 bg-opacity-20 border-l-4 border-rose-500' 
                            : 'bg-slate-800 bg-opacity-50'
                        }`}
                      >
                        <Text style={tw`text-xs font-medium ${activeScreen === s.name ? 'text-rose-300 font-bold' : 'text-slate-300'}`}>
                          {s.label}
                        </Text>
                        {activeScreen === s.name && <Check style={tw`text-rose-400`} size={14} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Rider Logistics Group */}
                <View style={tw`gap-2`}>
                  <Text style={tw`text-[10px] font-black text-teal-400 uppercase tracking-widest`}>
                    Rider Partner Logistics
                  </Text>
                  <View style={tw`gap-1.5`}>
                    {screens.filter(s => s.category === 'Rider').map(s => (
                      <TouchableOpacity
                        key={s.name}
                        onPress={() => {
                          handleNavigate(s.name, 'none');
                          setHudExpanded(false);
                        }}
                        style={tw`flex-row justify-between items-center p-3 rounded-xl ${
                          activeScreen === s.name 
                            ? 'bg-teal-500 bg-opacity-20 border-l-4 border-teal-400' 
                            : 'bg-slate-800 bg-opacity-50'
                        }`}
                      >
                        <Text style={tw`text-xs font-medium ${activeScreen === s.name ? 'text-teal-300 font-bold' : 'text-slate-300'}`}>
                          {s.label}
                        </Text>
                        {activeScreen === s.name && <Check style={tw`text-teal-400`} size={14} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Ops Dashboard Group */}
                <View style={tw`gap-2`}>
                  <Text style={tw`text-[10px] font-black text-sky-400 uppercase tracking-widest`}>
                    Operations & Backoffice
                  </Text>
                  <View style={tw`gap-1.5`}>
                    {screens.filter(s => s.category === 'Ops').map(s => (
                      <TouchableOpacity
                        key={s.name}
                        onPress={() => {
                          handleNavigate(s.name, 'none');
                          setHudExpanded(false);
                        }}
                        style={tw`flex-row justify-between items-center p-3 rounded-xl ${
                          activeScreen === s.name 
                            ? 'bg-sky-500 bg-opacity-20 border-l-4 border-sky-400' 
                            : 'bg-slate-800 bg-opacity-50'
                        }`}
                      >
                        <Text style={tw`text-xs font-medium ${activeScreen === s.name ? 'text-sky-300 font-bold' : 'text-slate-300'}`}>
                          {s.label}
                        </Text>
                        {activeScreen === s.name && <Check style={tw`text-sky-400`} size={14} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

              </View>

              {/* Developer Configuration controls inside drawer */}
              <View style={tw`pt-4 border-t border-slate-800 gap-3`}>
                <Text style={tw`text-[9px] font-black text-slate-500 uppercase tracking-widest block`}>Simulation Settings</Text>
                
                <View style={tw`flex-row gap-2`}>
                  {/* System Navigation Toggle */}
                  <View style={tw`flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800 gap-1.5`}>
                    <Text style={tw`text-[10px] font-bold text-slate-400`}>Navigation Style</Text>
                    <View style={tw`flex-row gap-1`}>
                      <TouchableOpacity 
                        onPress={() => setNavStyle('gesture')}
                        style={tw`flex-1 py-1.5 rounded-lg items-center ${navStyle === 'gesture' ? 'bg-orange-500' : 'bg-slate-800'}`}
                      >
                        <Text style={tw`text-[9px] font-bold text-white uppercase`}>Gesture</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => setNavStyle('buttons')}
                        style={tw`flex-1 py-1.5 rounded-lg items-center ${navStyle === 'buttons' ? 'bg-orange-500' : 'bg-slate-800'}`}
                      >
                        <Text style={tw`text-[9px] font-bold text-white uppercase`}>Buttons</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Network Signal Toggle */}
                  <View style={tw`flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800 gap-1.5`}>
                    <Text style={tw`text-[10px] font-bold text-slate-400`}>Network Signal</Text>
                    <View style={tw`flex-row gap-1`}>
                      {(['5G', 'Wi-Fi'] as const).map(sig => (
                        <TouchableOpacity 
                          key={sig}
                          onPress={() => setSignalType(sig)}
                          style={tw`flex-1 py-1.5 rounded-lg items-center ${signalType === sig ? 'bg-orange-500' : 'bg-slate-800'}`}
                        >
                          <Text style={tw`text-[9px] font-bold text-white uppercase`}>{sig}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
