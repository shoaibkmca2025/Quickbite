import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { tw } from '../theme';
import { 
  Menu, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Star, 
  Phone, 
  Navigation,
  CheckCircle,
  Truck,
  TrendingUp,
  Inbox,
  Award,
  User
} from 'lucide-react';
import { ScreenName, TransitionType } from '../types';

interface RiderDashboardProps {
  onNavigate: (destination: ScreenName, transition: TransitionType) => void;
}

export const RiderDashboard: React.FC<RiderDashboardProps> = ({ onNavigate }) => {
  const [online, setOnline] = useState(true);
  const [assignments, setAssignments] = useState([
    { id: '1', name: 'Szechuan Palace', distance: '1.2 km away', time: '15 min est.', price: 8.50, type: 'FastFood' },
    { id: '2', name: "Mama's Italian", distance: '0.5 km away', time: '8 min est.', price: 6.20, type: 'Pizza' }
  ]);

  const handleDecline = (id: string) => {
    setAssignments(assignments.filter(item => item.id !== id));
  };

  const handleAccept = (item: any) => {
    onNavigate('QuickBite Rider - Active Order', 'push');
  };

  return (
    <View style={tw`flex-1 bg-surface`}>
      {/* Top Header */}
      <View style={tw`w-full bg-white border-b border-surface-container py-3 px-6 flex-row justify-between items-center shadow-sm`}>
        <View style={tw`flex-row items-center gap-3`}>
          <TouchableOpacity style={tw`p-1`}>
            <Menu style={tw`text-primary`} size={20} />
          </TouchableOpacity>
          <Text style={tw`text-base font-extrabold text-primary`}>QuickBite Rider</Text>
        </View>

        {/* Online/Offline status switch toggler */}
        <TouchableOpacity 
          onPress={() => setOnline(!online)}
          style={tw`flex-row items-center bg-neutral-100 rounded-full p-1 border border-neutral-200`}
        >
          <Text style={tw`px-2.5 text-xs font-bold ${online ? 'text-emerald-700' : 'text-neutral-500'}`}>
            {online ? 'Online' : 'Offline'}
          </Text>
          <View style={tw`w-6 h-6 rounded-full items-center justify-center ${
            online ? 'bg-emerald-500' : 'bg-neutral-400'
          }`}>
            <View style={tw`w-2 h-2 bg-white rounded-full`} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Scrollable Area */}
      <ScrollView 
        contentContainerStyle={tw`pb-32 px-6 pt-6`}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Active task */}
        <View style={tw`gap-3 mb-6`}>
          <View style={tw`flex-row justify-between items-end`}>
            <Text style={tw`text-base font-extrabold text-on-surface`}>Active Task</Text>
            <View style={tw`bg-primary px-2 py-0.5 rounded`}>
              <Text style={tw`text-white text-[10px] font-bold uppercase tracking-wide`}>In Progress</Text>
            </View>
          </View>

          <View style={tw`bg-white border border-surface-container rounded-xl overflow-hidden shadow-sm`}>
            {/* Minimal Map Overlay */}
            <View style={tw`h-44 relative bg-neutral-200`}>
              <Image 
                style={tw`w-full h-full opacity-75`}
                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQkD0DM8E563K2zlhe4fwk_ZJoKVQVqpyyUFQCxQ7LcpaDE3GEFGmkRZE1rIZsSn-54Q_UosECknbcLpQ6JGps6VtQ-j8k0MYqkg3sN7Z5p6eK-WlGCJtBoxgpywnMe5QfIN3NHQkHv4httVPPt_JZBgwLywbMptkMzcFDE5uH5fB-pIMt6l_LFLkydLdHNa3PByIihYL3vO2vVonj_IKRdduCBsCBbTSIfgh8XDvHZmt6KdJX5sv1hlJwi2pqqG8r3UoxHo3sBe4Q" }}
              />
              
              {/* Center point marker overlay indicators */}
              <View style={tw`absolute inset-0 flex-row items-center justify-center p-2`}>
                <View style={tw`flex-row items-center gap-3`}>
                  <View style={tw`w-9 h-9 rounded-full bg-primary items-center justify-center border border-white shadow-lg`}>
                    <Truck style={tw`text-white`} size={16} />
                  </View>
                  <View style={tw`w-12 h-px border-t border-dashed border-primary`} />
                  <View style={tw`w-9 h-9 rounded-full bg-emerald-600 items-center justify-center border border-white shadow-lg`}>
                    <CheckCircle style={tw`text-white`} size={16} />
                  </View>
                </View>
              </View>
            </View>

            {/* Task address details */}
            <View style={tw`p-4 gap-4`}>
              {/* Pickup location */}
              <View style={tw`flex-row gap-3`}>
                <View style={tw`items-center`}>
                  <View style={tw`w-6 h-6 rounded-full bg-primary/10 items-center justify-center`}>
                    <Award style={tw`text-primary`} size={12} />
                  </View>
                  <View style={tw`flex-1 w-px bg-neutral-200 my-1`} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-[9px] font-bold text-secondary uppercase leading-none`}>Pickup From</Text>
                  <Text style={tw`text-sm font-extrabold text-on-surface mt-0.5`}>Gourmet Burger Kitchen</Text>
                  <Text style={tw`text-xs text-secondary`}>42nd West Avenue, Midtown</Text>
                </View>
                <Text style={tw`text-xs font-bold text-primary mt-1`}>0.8 km</Text>
              </View>

              {/* Dropoff location */}
              <View style={tw`flex-row gap-3 pb-2`}>
                <View style={tw`w-6 h-6 rounded-full bg-emerald-100 items-center justify-center`}>
                  <MapPin style={tw`text-emerald-600`} size={12} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-[9px] font-bold text-secondary uppercase leading-none`}>Deliver To</Text>
                  <Text style={tw`text-sm font-extrabold text-on-surface mt-0.5`}>Sarah J.</Text>
                  <Text style={tw`text-xs text-secondary`}>Apartment 4B, 128 Riverside Dr.</Text>
                </View>
                <Text style={tw`text-xs font-bold text-emerald-600 mt-1`}>2.4 km</Text>
              </View>

              {/* Navigate Action triggers active order screen */}
              <View style={tw`flex-row gap-2`}>
                <TouchableOpacity 
                  onPress={() => onNavigate('QuickBite Rider - Active Order', 'push')}
                  style={tw`flex-1 bg-primary py-3 rounded-lg flex-row items-center justify-center gap-1.5 shadow-md`}
                >
                  <Navigation style={tw`text-white`} size={14} fill="#ffffff" />
                  <Text style={tw`text-white font-bold text-xs`}>Navigate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={tw`flex-1 border border-neutral-300 py-3 rounded-lg flex-row items-center justify-center gap-1.5`}>
                  <Phone style={tw`text-secondary`} size={14} />
                  <Text style={tw`text-secondary font-bold text-xs`}>Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Section: New Assignments selection lists */}
        <View style={tw`gap-3 mb-6`}>
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`text-base font-extrabold text-on-surface`}>New Assignments</Text>
            <View style={tw`bg-orange-50 px-2 py-0.5 rounded`}>
              <Text style={tw`text-primary font-bold text-[10px]`}>{assignments.length} Available</Text>
            </View>
          </View>

          <View style={tw`gap-3`}>
            {assignments.map(item => (
              <View 
                key={item.id}
                style={tw`bg-white p-4 rounded-xl border border-surface-container shadow-sm flex-row items-center gap-4`}
              >
                <View style={tw`w-12 h-12 rounded-lg bg-neutral-100 items-center justify-center`}>
                  <Truck style={tw`text-primary`} size={20} />
                </View>
                
                <View style={tw`flex-1`}>
                  <View style={tw`flex-row justify-between items-start`}>
                    <Text style={tw`font-bold text-sm text-on-surface flex-1 mr-2`}>{item.name}</Text>
                    <Text style={tw`text-sm font-extrabold text-emerald-600`}>₹{item.price.toFixed(2)}</Text>
                  </View>
                  <Text style={tw`text-[11px] text-secondary mt-0.5`}>{item.distance} • {item.time}</Text>
                  
                  <View style={tw`flex-row gap-2 mt-3`}>
                    <TouchableOpacity 
                      onPress={() => handleAccept(item)}
                      style={tw`bg-orange-100 px-4 py-1.5 rounded-full`}
                    >
                      <Text style={tw`text-primary text-[10px] font-black`}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDecline(item.id)}
                      style={tw`px-4 py-1.5 rounded-full bg-neutral-50`}
                    >
                      <Text style={tw`text-secondary text-[10px] font-bold`}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {assignments.length === 0 && (
              <View style={tw`bg-white p-6 rounded-xl border border-dashed border-neutral-300 items-center py-10`}>
                <Inbox style={tw`text-neutral-400 mb-2`} size={32} />
                <Text style={tw`text-xs font-semibold text-secondary`}>No pending task assignments right now.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bento grid summary stats */}
        <View style={tw`flex-row gap-4`}>
          <View style={tw`flex-1 bg-emerald-50 rounded-xl p-4 border border-emerald-100`}>
            <IndianRupee style={tw`text-emerald-700 mb-2`} size={20} />
            <Text style={tw`text-[10px] text-secondary font-semibold uppercase`}>Today's Earnings</Text>
            <Text style={tw`text-lg font-black text-emerald-700 mt-1`}>₹142.50</Text>
          </View>

          <View style={tw`flex-1 bg-amber-50 rounded-xl p-4 border border-amber-100`}>
            <Star style={tw`text-amber-600 mb-2`} size={20} fill="#d97706" />
            <Text style={tw`text-[10px] text-secondary font-semibold uppercase`}>Partner Rating</Text>
            <Text style={tw`text-lg font-black text-amber-600 mt-1`}>4.96</Text>
          </View>
        </View>
      </ScrollView>

      {/* Rider Bottom Tab Bar Nav */}
      <View style={tw`absolute bottom-0 w-full h-16 bg-white border-t border-surface-container flex-row justify-around items-center`}>
        {/* Tasks Active */}
        <TouchableOpacity style={tw`items-center justify-center`}>
          <Briefcase style={tw`text-primary`} size={20} fill="#f97316" />
          <Text style={tw`text-[10px] mt-0.5 text-primary font-bold`}>Tasks</Text>
        </TouchableOpacity>

        {/* Earnings */}
        <TouchableOpacity 
          onPress={() => onNavigate('QuickBite Rider - Earnings', 'none')}
          style={tw`items-center justify-center`}
        >
          <TrendingUp style={tw`text-secondary`} size={20} />
          <Text style={tw`text-[10px] mt-0.5 text-secondary`}>Earnings</Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity 
          onPress={() => onNavigate('QuickBite Rider - Profile', 'none')}
          style={tw`items-center justify-center`}
        >
          <User style={tw`text-secondary`} size={20} />
          <Text style={tw`text-[10px] mt-0.5 text-secondary`}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
