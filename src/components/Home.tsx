import React from 'react';
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity } from 'react-native';
import { tw } from '../theme';
import { 
  MapPin, 
  Search, 
  Star, 
  Home as HomeIcon, 
  Search as SearchIcon, 
  ReceiptText, 
  User, 
  ShoppingBag,
  Pizza,
  Utensils,
  Leaf,
  Flame,
  Sparkles
} from 'lucide-react';
import { ScreenName, TransitionType } from '../types';
import { POPULAR_RESTAURANTS } from '../data';

interface HomeProps {
  onNavigate: (destination: ScreenName, transition: TransitionType) => void;
  cartCount: number;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, cartCount }) => {
  return (
    <View style={tw`flex-1 bg-background`}>
      {/* Top Bar Header */}
      <View style={tw`w-full bg-surface border-b border-surface-container py-3 px-6 flex-row justify-between items-center shadow-sm`}>
        {/* Location details */}
        <TouchableOpacity 
          onPress={() => onNavigate('QuickBite - Profile', 'none')}
          style={tw`flex-row items-center gap-2`}
        >
          <MapPin style={tw`text-primary`} size={20} />
          <View>
            <Text style={tw`text-xs font-semibold text-primary`}>Work</Text>
            <Text style={tw`text-sm font-medium text-secondary`}>4th Floor, Tech Park</Text>
          </View>
        </TouchableOpacity>
        
        {/* App Logo & Avatar */}
        <View style={tw`flex-row items-center gap-4`}>
          <Text style={tw`text-xl font-bold tracking-tight text-primary`}>QuickBite</Text>
          <TouchableOpacity 
            onPress={() => onNavigate('QuickBite - Profile', 'none')}
            style={tw`w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container`}
          >
            <Image 
              style={tw`w-full h-full`} 
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsIWsVqwXGMfZFmdtmPTeu8AR4Jidi6A96f0T6oMk9g9PkvM92i15ZpUkVMOoLAxuRx1qpujmKTzhpmhdlPfQEz1AnK6gd-Uh7eBFjxVxm2O2QQhUQSERH61WY8In72x-tf2ifMA9Wr3CUwFd8zWST_CK9xLoD-rofweuNfhSwVwFBvF-aGpsZxohdL-2ALAoYQa6AgbxlR9jeX-QTVjZRkFEqR72yLS5Ngqc_-oUh9oijb8NXWvjZcekVMflRG_kb999yJhRMin61" }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Container */}
      <ScrollView 
        contentContainerStyle={tw`pb-28 pt-4`}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Input Section */}
        <View style={tw`px-6 mb-6`}>
          <TouchableOpacity 
            onPress={() => onNavigate('QuickBite - Search Results', 'none')}
            style={tw`relative`}
          >
            <View style={tw`absolute left-4 top-3.5 z-10`}>
              <Search style={tw`text-secondary`} size={18} />
            </View>
            <TextInput 
              editable={false}
              style={tw`w-full h-12 pl-12 pr-4 bg-surface-container-low border border-orange-100 rounded-xl text-sm text-slate-800 shadow-sm`} 
              placeholder="Search for burgers, pizza, or cafes" 
              placeholderTextColor="#94a3b8"
            />
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View style={tw`mb-6`}>
          <Text style={tw`px-6 text-lg font-bold mb-3 text-on-background`}>Eat what suits you</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`px-6 gap-4`}
          >
            {/* Burger */}
            <TouchableOpacity 
              onPress={() => onNavigate('QuickBite - Search Results', 'push')}
              style={tw`items-center gap-1`}
            >
              <View style={tw`w-16 h-16 rounded-2xl bg-surface-container-highest items-center justify-center`}>
                <Utensils style={tw`text-primary`} size={24} />
              </View>
              <Text style={tw`text-xs font-semibold text-secondary`}>Burger</Text>
            </TouchableOpacity>

            {/* Pizza */}
            <TouchableOpacity 
              onPress={() => onNavigate('QuickBite - Search Results', 'push')}
              style={tw`items-center gap-1`}
            >
              <View style={tw`w-16 h-16 rounded-2xl bg-surface-container-highest items-center justify-center shadow-sm`}>
                <Pizza style={tw`text-primary`} size={24} />
              </View>
              <Text style={tw`text-xs font-bold text-primary`}>Pizza</Text>
            </TouchableOpacity>

            {/* North Indian */}
            <TouchableOpacity 
              onPress={() => onNavigate('QuickBite - Search Results', 'push')}
              style={tw`items-center gap-1`}
            >
              <View style={tw`w-16 h-16 rounded-2xl bg-surface-container-highest items-center justify-center`}>
                <Sparkles style={tw`text-primary`} size={24} />
              </View>
              <Text style={tw`text-xs font-semibold text-secondary`}>North Indian</Text>
            </TouchableOpacity>

            {/* Healthy */}
            <TouchableOpacity 
              onPress={() => onNavigate('QuickBite - Search Results', 'push')}
              style={tw`items-center gap-1`}
            >
              <View style={tw`w-16 h-16 rounded-2xl bg-surface-container-highest items-center justify-center`}>
                <Leaf style={tw`text-primary`} size={24} />
              </View>
              <Text style={tw`text-xs font-semibold text-secondary`}>Healthy</Text>
            </TouchableOpacity>
            
            {/* Bakery */}
            <TouchableOpacity 
              onPress={() => onNavigate('QuickBite - Search Results', 'push')}
              style={tw`items-center gap-1`}
            >
              <View style={tw`w-16 h-16 rounded-2xl bg-surface-container-highest items-center justify-center`}>
                <Flame style={tw`text-primary`} size={24} />
              </View>
              <Text style={tw`text-xs font-semibold text-secondary`}>Bakery</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Offers Carousel */}
        <View style={tw`mb-8`}>
          <View style={tw`flex-row justify-between items-center px-6 mb-3`}>
            <Text style={tw`text-lg font-bold text-on-background`}>Offers for you</Text>
            <TouchableOpacity onPress={() => onNavigate('QuickBite - Search Results', 'push')}>
              <Text style={tw`text-xs font-bold text-primary`}>View all</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`px-6 gap-4`}
          >
            {/* Offer 1 */}
            <TouchableOpacity 
              onPress={() => onNavigate('QuickBite - Search Results', 'push')}
              style={tw`w-70 h-36 rounded-2xl overflow-hidden relative shadow-md`}
            >
              <Image 
                style={tw`absolute inset-0 w-full h-full`} 
                source={{ uri: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop" }}
              />
              <View style={tw`absolute inset-0 bg-black/50 p-4 justify-center`}>
                <Text style={tw`text-xl font-black text-white`}>50% OFF</Text>
                <Text style={tw`text-xs font-medium text-white/90`}>Up to ₹150 | Code: FIRST50</Text>
                <View style={tw`mt-2 bg-primary px-3 py-1 rounded-full w-24 items-center`}>
                  <Text style={tw`text-white text-xs font-bold`}>Order Now</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Offer 2 */}
            <TouchableOpacity 
              onPress={() => onNavigate('QuickBite - Search Results', 'push')}
              style={tw`w-70 h-36 rounded-2xl overflow-hidden relative shadow-md`}
            >
              <Image 
                style={tw`absolute inset-0 w-full h-full`} 
                source={{ uri: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=400&auto=format&fit=crop" }}
              />
              <View style={tw`absolute inset-0 bg-black/50 p-4 justify-center`}>
                <Text style={tw`text-xl font-black text-white`}>20% OFF</Text>
                <Text style={tw`text-xs font-medium text-white/90`}>On all Italian Favorites</Text>
                <View style={tw`mt-2 bg-white px-3 py-1 rounded-full w-24 items-center`}>
                  <Text style={tw`text-primary text-xs font-bold`}>Explore</Text>
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Popular Restaurants Nearby */}
        <View style={tw`px-6 mb-6`}>
          <Text style={tw`text-lg font-bold mb-4 text-on-background`}>Popular Restaurants Nearby</Text>
          
          <View style={tw`gap-4`}>
            {POPULAR_RESTAURANTS.map((res) => (
              <TouchableOpacity 
                key={res.id}
                onPress={() => onNavigate('QuickBite - Restaurant Menu', 'push')}
                style={tw`bg-surface-container-low rounded-2xl overflow-hidden shadow-sm border border-orange-100`}
              >
                <View style={tw`relative h-44 w-full`}>
                  <Image 
                    style={tw`w-full h-full`} 
                    source={{ uri: res.image }}
                  />
                  <View style={tw`absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded-lg flex-row items-center gap-1 shadow-sm`}>
                    <Star style={tw`text-tertiary`} size={12} fill="#14b8a6" />
                    <Text style={tw`text-xs font-extrabold text-on-surface`}>{res.rating}</Text>
                  </View>
                  {res.isFreeDelivery && (
                    <View style={tw`absolute bottom-2 left-2 bg-primary px-2 py-0.5 rounded`}>
                      <Text style={tw`text-white text-[10px] font-bold`}>Free Delivery</Text>
                    </View>
                  )}
                </View>

                <View style={tw`p-4`}>
                  <View style={tw`flex-row justify-between items-start gap-1`}>
                    <Text style={tw`font-bold text-base text-on-surface`}>{res.name}</Text>
                    <Text style={tw`text-[11px] font-medium text-secondary`}>{res.time}</Text>
                  </View>
                  <Text style={tw`text-xs text-secondary mt-1`}>{res.cuisine}</Text>
                  
                  <View style={tw`flex-row items-center gap-2 pt-3 border-t border-orange-100/60 mt-3`}>
                    <Text style={tw`text-xs text-secondary font-semibold`}>Price:</Text>
                    <Text style={tw`text-xs font-bold text-on-secondary-container`}>₹₹ • ₹{res.priceForTwo} for two</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating View Cart FAB when items are added */}
      {cartCount > 0 && (
        <TouchableOpacity 
          onPress={() => onNavigate('QuickBite - Order Detail', 'slide_up')}
          style={tw`absolute bottom-20 right-6 w-14 h-14 bg-primary rounded-full shadow-lg items-center justify-center`}
        >
          <ShoppingBag style={tw`text-white`} size={24} />
          <View style={tw`absolute -top-1 -right-1 bg-on-primary-container w-5 h-5 items-center justify-center rounded-full border-2 border-white`}>
            <Text style={tw`text-white text-[10px] font-bold`}>{cartCount}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Bottom Nav Bar */}
      <View style={tw`absolute bottom-0 w-full h-16 bg-surface border-t border-surface-container flex-row justify-around items-center`}>
        {/* Home Active */}
        <TouchableOpacity style={tw`items-center justify-center`}>
          <HomeIcon style={tw`text-primary`} size={20} fill="#f97316" />
          <Text style={tw`text-[10px] mt-0.5 text-primary font-bold`}>Home</Text>
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
          style={tw`items-center justify-center relative`}
        >
          <ReceiptText style={tw`text-secondary`} size={20} />
          <Text style={tw`text-[10px] mt-0.5 text-secondary`}>Orders</Text>
          {cartCount > 0 && (
            <View style={tw`absolute top-1 right-3 w-2 h-2 bg-primary rounded-full`} />
          )}
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
