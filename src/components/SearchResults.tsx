import React from 'react';
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity } from 'react-native';
import { tw } from '../theme';
import { 
  MapPin, 
  Search, 
  Mic, 
  SlidersHorizontal, 
  ChevronDown, 
  Star, 
  Clock, 
  Navigation,
  Home as HomeIcon, 
  Search as SearchIcon, 
  ReceiptText, 
  User 
} from 'lucide-react';
import { ScreenName, TransitionType } from '../types';
import { PIZZA_RESTAURANTS } from '../data';

interface SearchResultsProps {
  onNavigate: (destination: ScreenName, transition: TransitionType) => void;
  cartCount: number;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ onNavigate, cartCount }) => {
  return (
    <View style={tw`flex-1 bg-background`}>
      {/* Top Header */}
      <View style={tw`w-full bg-surface border-b border-surface-container py-3 px-6 flex-row justify-between items-center shadow-sm`}>
        <View style={tw`flex-row items-center gap-2`}>
          <MapPin style={tw`text-primary`} size={20} />
          <View>
            <Text style={tw`text-[10px] text-secondary font-semibold uppercase`}>Delivering to</Text>
            <Text style={tw`text-xs font-bold text-on-surface`}>Home • Downtown Plaza</Text>
          </View>
        </View>
        <Text style={tw`text-lg font-black text-primary`}>QuickBite</Text>
        <TouchableOpacity 
          onPress={() => onNavigate('QuickBite - Profile', 'none')}
          style={tw`w-10 h-10 rounded-full overflow-hidden border border-orange-100`}
        >
          <Image 
            style={tw`w-full h-full`} 
            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3ZHREbiM53O9oJyYx89G20AQhYTJUAFBDlNw29ONoc1mTCKZeN4PmaTgo_s2QjLwQiPSZl6UOBGGMbBMdqxrktjmgSV35UYu-0f9pxWxJp0aFuDdPMxV4VXTipDzaABJKPswl6c5YiybnTaERnV5cn8DJDYqZESlTPm4lsJnaDhE5MyFa01QM7FhBCvWkOhjdlnpVWTi3X_T6E_j9bjf0MkyAU7V6BaF--VFKSAwVwjVRiUAl_Hsnqt75KIbPiHTy1UZkW92kcB88" }}
          />
        </TouchableOpacity>
      </View>

      {/* Scrollable Main Container */}
      <ScrollView 
        contentContainerStyle={tw`pb-28 px-6 pt-4`}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Input Bar with prefilled value */}
        <View style={tw`relative mb-4`}>
          <View style={tw`absolute left-4 top-3.5 z-10`}>
            <Search style={tw`text-secondary`} size={18} />
          </View>
          <TextInput 
            style={tw`w-full h-12 pl-12 pr-12 bg-surface-container border border-orange-100 rounded-xl text-sm text-slate-800 font-semibold shadow-inner`} 
            defaultValue="Pizza"
            placeholder="Search pizza, pasta, sides"
            placeholderTextColor="#94a3b8"
          />
          <View style={tw`absolute right-4 top-3.5 z-10`}>
            <Mic style={tw`text-secondary`} size={18} />
          </View>
        </View>

        {/* Filter Chips Scrollable */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`gap-2 py-1 mb-6`}
        >
          <TouchableOpacity style={tw`flex-row items-center gap-1.5 px-4 py-2 bg-primary rounded-full shadow-sm`}>
            <SlidersHorizontal style={tw`text-white`} size={12} />
            <Text style={tw`text-white text-xs font-bold`}>Sort</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={tw`flex-row items-center gap-1 px-4 py-2 bg-surface-container-high rounded-full border border-orange-100/60`}>
            <Text style={tw`text-on-surface text-xs font-semibold`}>Rating 4.0+</Text>
          </TouchableOpacity>

          <TouchableOpacity style={tw`flex-row items-center gap-1 px-4 py-2 bg-surface-container-high rounded-full border border-orange-100/60`}>
            <Text style={tw`text-on-surface text-xs font-semibold`}>Cuisine</Text>
            <ChevronDown style={tw`text-slate-600`} size={12} />
          </TouchableOpacity>

          <TouchableOpacity style={tw`flex-row items-center gap-1 px-4 py-2 bg-surface-container-high rounded-full border border-orange-100/60`}>
            <Text style={tw`text-on-surface text-xs font-semibold`}>Veg</Text>
          </TouchableOpacity>

          <TouchableOpacity style={tw`flex-row items-center gap-1 px-4 py-2 bg-surface-container-high rounded-full border border-orange-100/60`}>
            <Text style={tw`text-on-surface text-xs font-semibold`}>Less than 30 mins</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Pizza Search Results */}
        <Text style={tw`text-lg font-bold text-on-surface mb-4`}>Pizza near you</Text>
        
        <View style={tw`gap-6`}>
          {PIZZA_RESTAURANTS.map((res) => (
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
                {res.isBestSeller && (
                  <View style={tw`absolute top-2 left-2 bg-tertiary-container px-2 py-0.5 rounded`}>
                    <Text style={tw`text-on-tertiary-container text-[9px] font-black uppercase tracking-wider`}>Best Seller</Text>
                  </View>
                )}
                {res.isFreeDelivery && (
                  <View style={tw`absolute bottom-2 left-2 bg-primary px-2 py-0.5 rounded`}>
                    <Text style={tw`text-white text-[10px] font-bold`}>Free Delivery</Text>
                  </View>
                )}
              </View>

              <View style={tw`p-4`}>
                <View style={tw`flex-row justify-between items-start gap-1`}>
                  <Text style={tw`font-bold text-base text-on-surface`}>{res.name}</Text>
                  <Text style={tw`text-xs font-bold text-primary`}>₹{res.priceForTwo} for two</Text>
                </View>
                <Text style={tw`text-xs text-secondary mt-1`}>{res.cuisine}</Text>
                
                <View style={tw`flex-row items-center gap-4 pt-3 border-t border-orange-100 mt-3`}>
                  <View style={tw`flex-row items-center gap-1`}>
                    <Clock style={tw`text-secondary`} size={12} />
                    <Text style={tw`text-secondary text-xs`}>{res.time}</Text>
                  </View>
                  <View style={tw`flex-row items-center gap-1`}>
                    <Navigation style={tw`text-secondary`} size={12} />
                    <Text style={tw`text-secondary text-xs`}>{res.distance}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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

        {/* Search Active */}
        <TouchableOpacity style={tw`items-center justify-center`}>
          <SearchIcon style={tw`text-primary`} size={20} fill="#f97316" />
          <Text style={tw`text-[10px] mt-0.5 text-primary font-bold`}>Search</Text>
        </TouchableOpacity>

        {/* Orders */}
        <TouchableOpacity 
          onPress={() => onNavigate('QuickBite - Order Detail', 'none')}
          style={tw`items-center justify-center`}
        >
          <ReceiptText style={tw`text-secondary`} size={20} />
          <Text style={tw`text-[10px] mt-0.5 text-secondary`}>Orders</Text>
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
