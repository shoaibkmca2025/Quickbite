import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Switch } from 'react-native';
import { tw } from '../theme';
import { 
  ArrowLeft, 
  Settings, 
  ReceiptText, 
  MapPin, 
  CreditCard, 
  Bell, 
  Languages, 
  Moon, 
  Sun, 
  Compass, 
  Info,
  LogOut,
  ChevronRight,
  Home as HomeIcon, 
  Search as SearchIcon, 
  User,
  History
} from 'lucide-react';
import { ScreenName, TransitionType } from '../types';

interface ProfileProps {
  onNavigate: (destination: ScreenName, transition: TransitionType) => void;
  cartCount: number;
  currentUser: { name: string; email: string; avatar?: string } | null;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate, cartCount, currentUser, onLogout }) => {
  const [notifications, setNotifications] = useState(true);
  const [language] = useState('English');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const isDark = theme === 'dark';

  return (
    <View style={tw`flex-1 ${isDark ? 'bg-[#151515]' : 'bg-background'}`}>
      {/* Target heading topbar */}
      <View style={tw`w-full border-b flex-row justify-between items-center px-6 py-3 ${
        isDark ? 'bg-[#151515] border-neutral-800' : 'bg-surface border-surface-container shadow-sm'
      }`}>
        <View style={tw`flex-row items-center gap-3`}>
          <TouchableOpacity 
            onPress={() => onNavigate('QuickBite - Home', 'push_back')}
            style={tw`p-1`}
          >
            <ArrowLeft style={tw`text-primary`} size={18} />
          </TouchableOpacity>
          <Text style={tw`text-base font-bold text-primary`}>My Profile</Text>
        </View>
        
        <TouchableOpacity style={tw`p-1`}>
          <Settings style={tw`text-primary`} size={18} />
        </TouchableOpacity>
      </View>

      {/* Main Scrollable Container */}
      <ScrollView 
        contentContainerStyle={tw`pb-32 px-6 pt-6`}
        showsVerticalScrollIndicator={false}
      >
        
        {/* User Identity Panel */}
        <View style={tw`p-4 rounded-2xl flex-row items-center justify-between border ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-orange-100 shadow-sm'
        }`}>
          {currentUser ? (
            <View style={tw`flex-row items-center gap-4 flex-1`}>
              <View style={tw`w-16 h-16 rounded-full overflow-hidden border-2 border-primary-container`}>
                <Image 
                  style={tw`w-full h-full`} 
                  source={{ uri: currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" }} 
                />
              </View>
              
              <View style={tw`flex-1`}>
                <Text style={tw`text-lg font-black leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{currentUser.name}</Text>
                <Text style={tw`text-xs text-secondary font-medium`}>{currentUser.email}</Text>
              </View>
            </View>
          ) : (
            <View style={tw`flex-row items-center gap-4 flex-1`}>
              <View style={tw`w-16 h-16 rounded-full bg-orange-100 items-center justify-center border-2 border-orange-200`}>
                <User style={tw`text-primary`} size={24} />
              </View>
              
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-black leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Guest Account</Text>
                <Text style={tw`text-xs text-secondary font-medium`}>Sign in to save address & orders</Text>
              </View>
            </View>
          )}

          {currentUser ? (
            <TouchableOpacity style={tw`px-3.5 py-1.5 bg-neutral-100 rounded-full border border-neutral-200`}>
              <Text style={tw`text-slate-700 font-bold text-xs`}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => onNavigate('QuickBite - Authentication', 'push')}
              style={tw`px-4 py-2 bg-primary rounded-full shadow-sm`}
            >
              <Text style={tw`text-white font-black text-xs`}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Section: Account settings */}
        <View style={tw`mt-6`}>
          <Text style={tw`text-[10px] font-black text-secondary uppercase tracking-widest mb-2 px-1`}>Account</Text>
          
          <View style={tw`rounded-xl border overflow-hidden ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-orange-100 shadow-sm'
          }`}>
            {/* My Orders */}
            <TouchableOpacity 
              onPress={() => onNavigate('QuickBite - Order Detail', 'push')}
              style={tw`flex-row items-center justify-between p-4 border-b border-orange-50/60`}
            >
              <View style={tw`flex-row items-center gap-3`}>
                <View style={tw`w-9 h-9 rounded-lg bg-primary/10 items-center justify-center`}>
                  <ReceiptText style={tw`text-primary`} size={18} />
                </View>
                <Text style={tw`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Active Order</Text>
              </View>
              
              <View style={tw`flex-row items-center gap-2`}>
                <View style={tw`bg-emerald-100 px-2 py-0.5 rounded-full`}>
                  <Text style={tw`text-emerald-800 text-[10px] font-black`}>1 Active</Text>
                </View>
                <ChevronRight style={tw`text-secondary`} size={16} />
              </View>
            </TouchableOpacity>

            {/* Order History */}
            <TouchableOpacity 
              onPress={() => onNavigate('QuickBite - Order History', 'push')}
              style={tw`flex-row items-center justify-between p-4 border-b border-orange-50/60`}
            >
              <View style={tw`flex-row items-center gap-3`}>
                <View style={tw`w-9 h-9 rounded-lg bg-primary/10 items-center justify-center`}>
                  <History style={tw`text-primary`} size={18} />
                </View>
                <Text style={tw`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Order History</Text>
              </View>
              
              <View style={tw`flex-row items-center gap-2`}>
                <ChevronRight style={tw`text-secondary`} size={16} />
              </View>
            </TouchableOpacity>

            {/* Manage Addresses */}
            <TouchableOpacity style={tw`flex-row items-center justify-between p-4 border-b border-orange-50/60`}>
              <View style={tw`flex-row items-center gap-3`}>
                <View style={tw`w-9 h-9 rounded-lg bg-primary/10 items-center justify-center`}>
                  <MapPin style={tw`text-primary`} size={18} />
                </View>
                <Text style={tw`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Manage Addresses</Text>
              </View>
              <ChevronRight style={tw`text-secondary`} size={16} />
            </TouchableOpacity>

            {/* Payment Methods */}
            <TouchableOpacity style={tw`flex-row items-center justify-between p-4`}>
              <View style={tw`flex-row items-center gap-3`}>
                <View style={tw`w-9 h-9 rounded-lg bg-primary/10 items-center justify-center`}>
                  <CreditCard style={tw`text-primary`} size={18} />
                </View>
                <Text style={tw`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Payment Methods</Text>
              </View>
              <ChevronRight style={tw`text-secondary`} size={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Preferences settings */}
        <View style={tw`mt-6`}>
          <Text style={tw`text-[10px] font-black text-secondary uppercase tracking-widest mb-2 px-1`}>Preferences</Text>
          
          <View style={tw`rounded-xl border overflow-hidden ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-orange-100 shadow-sm'
          }`}>
            {/* Notifications Toggle */}
            <View style={tw`flex-row items-center justify-between p-4 border-b border-orange-50/60`}>
              <View style={tw`flex-row items-center gap-3`}>
                <View style={tw`w-9 h-9 rounded-lg bg-primary/10 items-center justify-center`}>
                  <Bell style={tw`text-primary`} size={18} />
                </View>
                <Text style={tw`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Notifications</Text>
              </View>
              
              <Switch 
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#cbd5e1', true: '#ffedd5' }}
                thumbColor={notifications ? '#f97316' : '#f1f5f9'}
              />
            </View>

            {/* Language Selection */}
            <TouchableOpacity style={tw`flex-row items-center justify-between p-4 border-b border-orange-50/60`}>
              <View style={tw`flex-row items-center gap-3`}>
                <View style={tw`w-9 h-9 rounded-lg bg-primary/10 items-center justify-center`}>
                  <Languages style={tw`text-primary`} size={18} />
                </View>
                <Text style={tw`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Language</Text>
              </View>
              
              <View style={tw`flex-row items-center gap-2`}>
                <Text style={tw`text-xs font-bold text-secondary`}>{language}</Text>
                <ChevronRight style={tw`text-secondary`} size={16} />
              </View>
            </TouchableOpacity>

            {/* Theme Toggle System (Light / Dark) */}
            <View style={tw`flex-row items-center justify-between p-4`}>
              <View style={tw`flex-row items-center gap-3`}>
                <View style={tw`w-9 h-9 rounded-lg bg-primary/10 items-center justify-center`}>
                  <Moon style={tw`text-primary`} size={18} />
                </View>
                <Text style={tw`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Theme Mode</Text>
              </View>
              
              <View style={tw`flex-row bg-neutral-200 p-1 rounded-lg gap-1 border border-neutral-300`}>
                <TouchableOpacity 
                  onPress={() => setTheme('light')}
                  style={tw`w-7 h-7 items-center justify-center rounded-md ${!isDark ? 'bg-white shadow-sm' : ''}`}
                >
                  <Sun style={!isDark ? tw`text-primary` : tw`text-secondary`} size={14} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setTheme('dark')}
                  style={tw`w-7 h-7 items-center justify-center rounded-md ${isDark ? 'bg-neutral-700 shadow-sm' : ''}`}
                >
                  <Moon style={isDark ? tw`text-white` : tw`text-secondary`} size={14} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Section: Support */}
        <View style={tw`mt-6`}>
          <Text style={tw`text-[10px] font-black text-secondary uppercase tracking-widest mb-2 px-1`}>Support</Text>
          
          <View style={tw`rounded-xl border overflow-hidden ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-orange-100 shadow-sm'
          }`}>
            <TouchableOpacity style={tw`flex-row items-center justify-between p-4 border-b border-orange-50/60`}>
              <View style={tw`flex-row items-center gap-3`}>
                <View style={tw`w-9 h-9 rounded-lg bg-primary/10 items-center justify-center`}>
                  <Compass style={tw`text-primary`} size={18} />
                </View>
                <Text style={tw`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Help Center</Text>
              </View>
              <ChevronRight style={tw`text-secondary`} size={16} />
            </TouchableOpacity>

            <TouchableOpacity style={tw`flex-row items-center justify-between p-4 border-b border-orange-50/60`}>
              <View style={tw`flex-row items-center gap-3`}>
                <View style={tw`w-9 h-9 rounded-lg bg-primary/10 items-center justify-center`}>
                  <Info style={tw`text-primary`} size={18} />
                </View>
                <Text style={tw`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>About QuickBite</Text>
              </View>
              <ChevronRight style={tw`text-secondary`} size={16} />
            </TouchableOpacity>

            {currentUser ? (
              <TouchableOpacity 
                onPress={() => {
                  onLogout();
                  onNavigate('QuickBite - Home', 'push_back');
                }}
                style={tw`flex-row items-center justify-between p-4 bg-rose-50/65`}
              >
                <View style={tw`flex-row items-center gap-3`}>
                  <View style={tw`w-9 h-9 rounded-lg bg-rose-100 items-center justify-center`}>
                    <LogOut style={tw`text-rose-700`} size={18} />
                  </View>
                  <Text style={tw`text-sm font-black text-rose-700`}>Logout</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={() => onNavigate('QuickBite - Authentication', 'push')}
                style={tw`flex-row items-center justify-between p-4 bg-emerald-50/65`}
              >
                <View style={tw`flex-row items-center gap-3`}>
                  <View style={tw`w-9 h-9 rounded-lg bg-emerald-100 items-center justify-center`}>
                    <User style={tw`text-emerald-700`} size={18} />
                  </View>
                  <Text style={tw`text-sm font-black text-emerald-700`}>Login or Register</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Footer version brand */}
        <Text style={tw`text-center text-[10px] text-secondary font-medium tracking-wide opacity-50 italic select-none mt-6`}>
          QuickBite v2.4.1 • Platform Client
        </Text>
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

        {/* Orders */}
        <TouchableOpacity 
          onPress={() => onNavigate('QuickBite - Order Detail', 'none')}
          style={tw`items-center justify-center`}
        >
          <ReceiptText style={tw`text-secondary`} size={20} />
          <Text style={tw`text-[10px] mt-0.5 text-secondary`}>Orders</Text>
        </TouchableOpacity>

        {/* Profile Active */}
        <TouchableOpacity style={tw`items-center justify-center`}>
          <User style={tw`text-primary`} size={20} fill="#f97316" />
          <Text style={tw`text-[10px] mt-0.5 text-primary font-bold`}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
