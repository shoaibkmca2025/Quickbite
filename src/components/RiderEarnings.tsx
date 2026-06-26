import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { tw } from '../theme';
import { 
  TrendingUp, 
  Menu, 
  Award, 
  Sparkles, 
  ChevronRight, 
  Briefcase, 
  User, 
  Coffee,
  BarChart2,
  Calendar
} from 'lucide-react';
import { ScreenName, TransitionType } from '../types';

interface RiderEarningsProps {
  onNavigate: (destination: ScreenName, transition: TransitionType) => void;
}

export const RiderEarnings: React.FC<RiderEarningsProps> = ({ onNavigate }) => {
  const [view, setView] = useState<'daily' | 'weekly'>('daily');

  const trips = [
    { id: '1', store: 'Spicy Wok & Noodle', trip: '#8821', time: '12:45 PM', price: 12.40, tip: 2.00, tag: 'Tip Added' },
    { id: '2', store: "Mario's Pizzeria", trip: '#8819', time: '11:20 AM', price: 9.80, incentive: 4.50, tag: 'Incentive Trip' },
    { id: '3', store: 'The Coffee Bean', trip: '#8815', time: '9:15 AM', price: 7.20 }
  ];

  return (
    <View style={tw`flex-1 bg-surface`}>
      {/* Top Header */}
      <View style={tw`w-full bg-white border-b border-surface-container py-3 px-6 flex-row justify-between items-center shadow-sm`}>
        <View style={tw`flex-row items-center gap-3`}>
          <TouchableOpacity style={tw`p-1`}>
            <Menu style={tw`text-primary`} size={20} />
          </TouchableOpacity>
          <Text style={tw`text-base font-extrabold text-primary`}>Earnings Command</Text>
        </View>

        <View style={tw`flex-row items-center gap-1`}>
          <View style={tw`w-1.5 h-1.5 rounded-full bg-emerald-500`} />
          <Text style={tw`text-emerald-600 text-xs font-bold`}>Online</Text>
        </View>
      </View>

      {/* Scrollable Container */}
      <ScrollView 
        contentContainerStyle={tw`pb-32 px-6 pt-6`}
        showsVerticalScrollIndicator={false}
      >
        {/* Earnings heading */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-xl font-black text-on-surface`}>Earnings Overview</Text>
          <Text style={tw`text-xs text-secondary font-medium`}>Track your performance payout logs instantly.</Text>
        </View>

        {/* Daily/Weekly switch tabs toggle */}
        <View style={tw`flex-row justify-between items-center mb-6`}>
          <View style={tw`bg-neutral-200 p-1 rounded-full flex-row gap-1 border border-neutral-300`}>
            <TouchableOpacity 
              onPress={() => setView('daily')}
              style={tw`px-6 py-2 rounded-full ${view === 'daily' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text style={tw`text-xs font-bold ${view === 'daily' ? 'text-primary' : 'text-secondary'}`}>Daily</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setView('weekly')}
              style={tw`px-6 py-2 rounded-full ${view === 'weekly' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text style={tw`text-xs font-bold ${view === 'weekly' ? 'text-primary' : 'text-secondary'}`}>Weekly</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`flex-row items-center gap-1 bg-white px-3 py-1.5 border border-surface-container rounded-lg`}>
            <Calendar style={tw`text-primary`} size={14} />
            <Text style={tw`text-xs font-bold text-secondary`}>
              {view === 'daily' ? 'Today, Oct 24' : 'Oct 21 - Oct 27'}
            </Text>
          </View>
        </View>

        {/* Primary Bento balance board */}
        <View style={tw`gap-4 mb-6`}>
          <View style={tw`bg-primary p-5 rounded-2xl shadow-sm`}>
            <Text style={tw`text-[10px] font-black uppercase text-orange-100 tracking-wider`}>Total balance earnings</Text>
            <Text style={tw`text-3xl font-black text-white mt-1`}>
              {view === 'daily' ? '₹142.50' : '₹842.20'}
            </Text>
            
            <View style={tw`mt-4 flex-row items-center gap-1`}>
              <TrendingUp style={tw`text-white`} size={16} />
              <Text style={tw`text-[11px] font-bold text-orange-200`}>+12% vs yesterday</Text>
            </View>
          </View>

          <View style={tw`flex-row gap-4`}>
            {/* incentives card */}
            <View style={tw`flex-1 bg-white p-4 rounded-xl border border-surface-container shadow-sm`}>
              <Award style={tw`text-tertiary mb-2`} size={20} fill="#f0fdf4" />
              <Text style={tw`text-[9px] text-secondary font-bold uppercase`}>Incentives</Text>
              <Text style={tw`text-base font-black text-on-surface mt-1`}>
                {view === 'daily' ? '₹25.00' : '₹112.50'}
              </Text>
            </View>

            {/* tips card */}
            <View style={tw`flex-1 bg-white p-4 rounded-xl border border-surface-container shadow-sm`}>
              <Sparkles style={tw`text-primary mb-2`} size={20} fill="#fef3c7" />
              <Text style={tw`text-[9px] text-secondary font-bold uppercase`}>Tips</Text>
              <Text style={tw`text-base font-black text-on-surface mt-1`}>
                {view === 'daily' ? '₹18.50' : '₹72.20'}
              </Text>
            </View>
          </View>

          {/* Next payment status card details */}
          <View style={tw`bg-neutral-100 p-4 rounded-xl border border-neutral-200 gap-3`}>
            <View style={tw`flex-row justify-between items-start`}>
              <View>
                <Text style={tw`text-[10px] text-secondary font-bold uppercase leading-none`}>Next Payout Status</Text>
                <Text style={tw`text-sm font-extrabold text-on-surface mt-1`}>Monday, Oct 28</Text>
              </View>
              <View style={tw`bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full`}>
                <Text style={tw`text-emerald-800 text-[10px] font-black`}>Processing</Text>
              </View>
            </View>

            <View style={tw`h-2 bg-neutral-200 rounded-full overflow-hidden`}>
              <View style={tw`h-full bg-emerald-600 rounded-full w-[70%]`} />
            </View>

            <View style={tw`flex-row justify-between items-center`}>
              <Text style={tw`text-[10px] text-secondary font-bold`}>Progress limit</Text>
              <Text style={tw`text-[10px] text-secondary font-bold`}>Estimated: ₹842.20</Text>
            </View>
          </View>
        </View>

        {/* Bar chart representations */}
        <View style={tw`bg-white p-4 rounded-xl border border-surface-container shadow-sm mb-6`}>
          <View style={tw`flex-row items-center gap-1 mb-4`}>
            <BarChart2 style={tw`text-primary`} size={16} />
            <Text style={tw`text-xs font-extrabold text-neutral-800 uppercase tracking-widest`}>Earnings Activity</Text>
          </View>
          
          <View style={tw`h-32 flex-row items-end gap-3 justify-between bg-neutral-50 p-4 border border-neutral-100 rounded-xl`}>
            {/* Monday */}
            <View style={tw`flex-1 items-center gap-1`}>
              <View style={tw`w-full bg-neutral-200 rounded-t-sm h-12`} />
              <Text style={tw`text-[9px] text-secondary font-bold`}>M</Text>
            </View>
            {/* Tuesday */}
            <View style={tw`flex-1 items-center gap-1`}>
              <View style={tw`w-full bg-neutral-200 rounded-t-sm h-16`} />
              <Text style={tw`text-[9px] text-secondary font-bold`}>T</Text>
            </View>
            {/* Wednesday */}
            <View style={tw`flex-1 items-center gap-1`}>
              <View style={tw`w-full bg-primary rounded-t-sm h-24`} />
              <Text style={tw`text-[9px] text-primary font-black`}>W</Text>
            </View>
            {/* Thursday */}
            <View style={tw`flex-1 items-center gap-1`}>
              <View style={tw`w-full bg-neutral-200 rounded-t-sm h-14`} />
              <Text style={tw`text-[9px] text-secondary font-bold`}>T</Text>
            </View>
            {/* Friday */}
            <View style={tw`flex-1 items-center gap-1`}>
              <View style={tw`w-full bg-neutral-200 rounded-t-sm h-10`} />
              <Text style={tw`text-[9px] text-secondary font-bold`}>F</Text>
            </View>
          </View>
        </View>

        {/* Section: Completed Trips List */}
        <View style={tw`gap-3`}>
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`font-extrabold text-sm text-on-surface`}>Completed Trips</Text>
            <TouchableOpacity style={tw`flex-row items-center gap-0.5`}>
              <Text style={tw`text-xs text-primary font-black`}>View All</Text>
              <ChevronRight style={tw`text-primary`} size={14} />
            </TouchableOpacity>
          </View>

          <View style={tw`gap-2`}>
            {trips.map(t => (
              <View 
                key={t.id}
                style={tw`bg-white p-3.5 rounded-xl border border-surface-container shadow-sm flex-row items-center gap-3`}
              >
                <View style={tw`w-10 h-10 rounded-lg bg-neutral-100 items-center justify-center`}>
                  <Coffee style={tw`text-primary`} size={18} />
                </View>
                
                <View style={tw`flex-1`}>
                  <View style={tw`flex-row justify-between items-start`}>
                    <Text style={tw`font-bold text-xs text-on-surface flex-1 mr-2`}>{t.store}</Text>
                    <Text style={tw`text-xs font-extrabold text-on-surface`}>₹{t.price.toFixed(2)}</Text>
                  </View>
                  
                  <View style={tw`flex-row justify-between items-center mt-1`}>
                    <Text style={tw`text-[10px] text-secondary`}>Trip {t.trip} • {t.time}</Text>
                    {t.tag && (
                      <View style={tw`bg-emerald-50 px-1.5 py-0.5 rounded-full`}>
                        <Text style={tw`text-emerald-700 font-black text-[9px]`}>{t.tag}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Rider Bottom Tab Bar Nav */}
      <View style={tw`absolute bottom-0 w-full h-16 bg-white border-t border-surface-container flex-row justify-around items-center`}>
        {/* Tasks */}
        <TouchableOpacity 
          onPress={() => onNavigate('QuickBite Rider - Dashboard', 'none')}
          style={tw`items-center justify-center`}
        >
          <Briefcase style={tw`text-secondary`} size={20} />
          <Text style={tw`text-[10px] mt-0.5 text-secondary`}>Tasks</Text>
        </TouchableOpacity>

        {/* Earnings Active */}
        <TouchableOpacity style={tw`items-center justify-center`}>
          <TrendingUp style={tw`text-primary`} size={20} fill="#f97316" />
          <Text style={tw`text-[10px] mt-0.5 text-primary font-bold`}>Earnings</Text>
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
