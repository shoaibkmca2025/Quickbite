import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { tw } from '../theme';
import { 
  ArrowLeft, 
  Search, 
  Share2, 
  Star, 
  Clock, 
  MapPin, 
  ShoppingBag,
  Sparkles,
  Award
} from 'lucide-react';
import { ScreenName, TransitionType, MenuItem } from '../types';
import { MENU_ITEMS } from '../data';

interface MenuProps {
  onNavigate: (destination: ScreenName, transition: TransitionType) => void;
  onAddToCart: (item: MenuItem) => void;
  cartCount: number;
  cartTotal: number;
}

export const Menu: React.FC<MenuProps> = ({ 
  onNavigate, 
  onAddToCart, 
  cartCount, 
  cartTotal 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bestsellers' | 'starters' | 'beverages'>('all');

  const filteredItems = selectedCategory === 'all' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(it => it.category === selectedCategory);

  return (
    <View style={tw`flex-1 bg-background relative`}>
      {/* Scrollable Area */}
      <ScrollView 
        contentContainerStyle={tw`pb-28`}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Jumbotron Banner */}
        <View style={tw`relative w-full h-56 sm:h-72`}>
          <Image 
            style={tw`absolute inset-0 w-full h-full`} 
            source={{ uri: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop" }}
          />
          <View style={tw`absolute inset-0 bg-black/45`} />
          
          {/* Overlaid Actions */}
          <View style={tw`absolute top-4 left-6 right-6 flex-row justify-between items-center`}>
            <TouchableOpacity 
              onPress={() => onNavigate('QuickBite - Home', 'push_back')}
              style={tw`w-10 h-10 rounded-full bg-black/40 items-center justify-center`}
            >
              <ArrowLeft style={tw`text-white`} size={18} />
            </TouchableOpacity>
            
            <View style={tw`flex-row gap-2`}>
              <TouchableOpacity style={tw`w-10 h-10 rounded-full bg-black/40 items-center justify-center`}>
                <Search style={tw`text-white`} size={18} />
              </TouchableOpacity>
              <TouchableOpacity style={tw`w-10 h-10 rounded-full bg-black/40 items-center justify-center`}>
                <Share2 style={tw`text-white`} size={18} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Floating Restaurant identity metadata inside the header banner */}
          <View style={tw`absolute bottom-4 left-6 right-6`}>
            <View style={tw`bg-primary px-2 py-0.5 rounded self-start mb-1`}>
              <Text style={tw`text-white text-[9px] font-bold uppercase tracking-wider`}>Trending Partner</Text>
            </View>
            <Text style={tw`text-2xl font-black text-white`}>The Artisanal Crust</Text>
            <Text style={tw`text-xs text-neutral-300 font-medium`}>Italian • Gourmet Pizza • Pasta</Text>
          </View>
        </View>

        {/* Embedded Details Panel */}
        <View style={tw`px-6 -mt-4 relative z-20 mb-6`}>
          <View style={tw`bg-surface p-4 rounded-xl shadow-md border border-surface-container flex-col gap-3`}>
            <View style={tw`flex-row justify-between items-center`}>
              <View style={tw`flex-row items-center gap-1 bg-tertiary-container px-2.5 py-1 rounded-lg`}>
                <Text style={tw`text-on-tertiary-container font-bold text-sm`}>4.8</Text>
                <Star style={tw`text-tertiary`} size={12} fill="#14b8a6" />
              </View>
              <Text style={tw`text-xs font-semibold text-secondary`}>1k+ Verified Ratings</Text>
            </View>

            <View style={tw`h-px bg-orange-100/60`} />

            <View style={tw`flex-row items-center gap-6`}>
              <View style={tw`flex-row items-center gap-2`}>
                <Clock style={tw`text-primary`} size={16} />
                <View>
                  <Text style={tw`text-[10px] text-secondary font-medium`}>Delivering time</Text>
                  <Text style={tw`text-xs font-bold text-on-surface`}>25-30 mins</Text>
                </View>
              </View>
              
              <View style={tw`flex-row items-center gap-2`}>
                <MapPin style={tw`text-primary`} size={16} />
                <View>
                  <Text style={tw`text-[10px] text-secondary font-medium`}>Distance</Text>
                  <Text style={tw`text-xs font-bold text-on-surface`}>2.4 km away</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Navigation Categories Switcher */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`px-6 gap-2 mb-4`}
        >
          <TouchableOpacity 
            onPress={() => setSelectedCategory('all')}
            style={tw`px-4 py-2 rounded-full ${selectedCategory === 'all' ? 'bg-primary' : 'bg-surface-container'}`}
          >
            <Text style={tw`text-xs font-bold ${selectedCategory === 'all' ? 'text-white' : 'text-secondary'}`}>Full Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setSelectedCategory('bestsellers')}
            style={tw`px-4 py-2 rounded-full flex-row items-center gap-1 ${selectedCategory === 'bestsellers' ? 'bg-primary' : 'bg-surface-container'}`}
          >
            <Award style={selectedCategory === 'bestsellers' ? tw`text-white` : tw`text-secondary`} size={12} />
            <Text style={tw`text-xs font-bold ${selectedCategory === 'bestsellers' ? 'text-white' : 'text-secondary'}`}>Bestsellers</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setSelectedCategory('starters')}
            style={tw`px-4 py-2 rounded-full ${selectedCategory === 'starters' ? 'bg-primary' : 'bg-surface-container'}`}
          >
            <Text style={tw`text-xs font-bold ${selectedCategory === 'starters' ? 'text-white' : 'text-secondary'}`}>Starters</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setSelectedCategory('beverages')}
            style={tw`px-4 py-2 rounded-full ${selectedCategory === 'beverages' ? 'bg-primary' : 'bg-surface-container'}`}
          >
            <Text style={tw`text-xs font-bold ${selectedCategory === 'beverages' ? 'text-white' : 'text-secondary'}`}>Beverages</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Menu item lists */}
        <View style={tw`px-6`}>
          <View style={tw`flex-row items-center gap-1.5 mb-4`}>
            <Sparkles style={tw`text-primary`} size={18} fill="#f97316" />
            <Text style={tw`text-lg font-bold text-on-surface`}>Selected Dishes</Text>
          </View>

          <View style={tw`gap-4`}>
            {filteredItems.map((item) => (
              <View 
                key={item.id}
                style={tw`bg-surface border border-surface-container rounded-xl p-4 flex-row gap-4 items-center`}
              >
                <View style={tw`flex-1`}>
                  <View style={tw`flex-row items-center gap-2 mb-1`}>
                    <View style={tw`w-3.5 h-3.5 border-2 rounded-sm items-center justify-center p-0.5 ${item.isVeg ? 'border-emerald-600' : 'border-rose-700'}`}>
                      <View style={tw`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-700'}`} />
                    </View>
                    {item.category === 'bestsellers' && (
                      <View style={tw`bg-amber-100 px-1.5 py-0.5 rounded`}>
                        <Text style={tw`text-[9px] font-bold text-amber-700`}>Bestseller</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={tw`font-bold text-base text-on-surface leading-tight`}>{item.name}</Text>
                  <Text style={tw`text-primary font-black text-sm mt-1`}>₹{item.price.toFixed(2)}</Text>
                  <Text style={tw`text-xs text-secondary mt-1.5 leading-relaxed`}>{item.description}</Text>
                </View>

                {/* Add to cart block */}
                <View style={tw`relative w-24 h-24 shrink-0`}>
                  <Image 
                    style={tw`w-full h-full rounded-lg`} 
                    source={{ uri: item.image }}
                  />
                  <TouchableOpacity 
                    onPress={() => onAddToCart(item)}
                    style={tw`absolute -bottom-2 left-3 bg-white border border-primary-container font-black px-4 py-1.5 rounded-lg shadow-md`}
                  >
                    <Text style={tw`text-primary text-xs font-black text-center`}>ADD</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {filteredItems.length === 0 && (
              <View style={tw`text-center py-12`}>
                <Text style={tw`text-sm font-semibold text-secondary text-center`}>No items match this filter classification.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action bottom checkout block (Cart Bar) */}
      {cartCount > 0 && (
        <View style={tw`absolute bottom-6 left-6 right-6`}>
          <TouchableOpacity 
            onPress={() => onNavigate('QuickBite - Order Detail', 'slide_up')}
            style={tw`w-full h-14 bg-primary rounded-xl flex-row items-center justify-between px-6 shadow-xl`}
          >
            <View style={tw`flex-row items-center gap-3`}>
              <View style={tw`bg-white/25 px-2.5 py-0.5 rounded`}>
                <Text style={tw`text-white font-black text-xs`}>{cartCount} ITEM{cartCount > 1 ? 'S' : ''}</Text>
              </View>
              <View style={tw`h-4 w-px bg-white/20`} />
              <Text style={tw`font-bold text-sm text-neutral-100`}>₹{cartTotal.toFixed(2)}</Text>
            </View>
            
            <View style={tw`flex-row items-center gap-2`}>
              <Text style={tw`text-white font-bold text-xs tracking-wider`}>VIEW CART</Text>
              <ShoppingBag style={tw`text-white`} size={16} />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
