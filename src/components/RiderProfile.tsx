import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Switch } from 'react-native';
import { tw } from '../theme';
import { 
  Menu, 
  Star, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Route, 
  Shield,
  Smartphone,
  Briefcase,
  TrendingUp,
  User,
  Bell,
  Phone
} from 'lucide-react';
import { ScreenName, TransitionType } from '../types';

interface RiderProfileProps {
  onNavigate: (destination: ScreenName, transition: TransitionType) => void;
}

export const RiderProfile: React.FC<RiderProfileProps> = ({ onNavigate }) => {
  const [pushToggled, setPush] = useState(true);
  const [gpsToggled, setGps] = useState(true);

  return (
    <View style={tw`flex-1 bg-surface`}>
      {/* Top Header */}
      <View style={tw`w-full bg-white border-b border-surface-container py-3 px-6 flex-row justify-between items-center shadow-sm`}>
        <View style={tw`flex-row items-center gap-3`}>
          <TouchableOpacity style={tw`p-1`}>
            <Menu style={tw`text-primary`} size={20} />
          </TouchableOpacity>
          <Text style={tw`text-base font-extrabold text-primary`}>Rider Profile</Text>
        </View>

        <View style={tw`flex-row items-center gap-1 bg-emerald-100 px-2.5 py-1 rounded-full shadow-sm`}>
          <View style={tw`w-1.5 h-1.5 rounded-full bg-emerald-500`} />
          <Text style={tw`text-emerald-800 text-[10px] font-black uppercase tracking-wider`}>Online</Text>
        </View>
      </View>

      {/* Main Container */}
      <ScrollView 
        contentContainerStyle={tw`pb-32 px-6 pt-4`}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner with avatar overlay */}
        <View style={tw`relative rounded-2xl overflow-hidden shadow-sm border border-surface-container mb-6`}>
          <View style={tw`h-24 w-full bg-primary`} />
          
          <View style={tw`p-4 bg-white -mt-6 mx-3 rounded-xl shadow-md border border-neutral-100 flex-row justify-between items-center gap-3`}>
            <View style={tw`flex-row items-center gap-3`}>
              <View style={tw`w-14 h-14 rounded-2xl overflow-hidden border-2 border-white bg-slate-200`}>
                <Image 
                  style={tw`w-full h-full`} 
                  source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" }} 
                />
              </View>
              
              <View>
                <Text style={tw`text-lg font-black leading-tight text-slate-800`}>Alex Rider</Text>
                <Text style={tw`text-[10px] text-secondary font-bold`}>Joined QuickBite: April 2022</Text>
              </View>
            </View>

            <TouchableOpacity style={tw`px-3 py-1.5 bg-neutral-200 rounded-lg`}>
              <Text style={tw`text-xs font-bold text-slate-800`}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bento rating blocks statistics grid */}
        <View style={tw`flex-row flex-wrap gap-2 mb-6`}>
          {/* Card 1 */}
          <View style={tw`flex-1 min-w-[70px] bg-white p-3 rounded-xl border border-surface-container shadow-sm items-center justify-center`}>
            <Star style={tw`text-amber-500 mb-1`} size={16} fill="#f59e0b" />
            <Text style={tw`text-base font-black text-on-surface`}>4.92</Text>
            <Text style={tw`text-[10px] text-secondary font-medium`}>Rating</Text>
          </View>

          {/* Card 2 */}
          <View style={tw`flex-1 min-w-[70px] bg-white p-3 rounded-xl border border-surface-container shadow-sm items-center justify-center`}>
            <CheckCircle style={tw`text-emerald-600 mb-1`} size={16} />
            <Text style={tw`text-base font-black text-on-surface`}>98.5%</Text>
            <Text style={tw`text-[10px] text-secondary font-medium`}>Completed</Text>
          </View>

          {/* Card 3 */}
          <View style={tw`flex-1 min-w-[70px] bg-white p-3 rounded-xl border border-surface-container shadow-sm items-center justify-center`}>
            <Clock style={tw`text-rose-600 mb-1`} size={16} />
            <Text style={tw`text-base font-black text-on-surface`}>22m</Text>
            <Text style={tw`text-[10px] text-secondary font-medium`}>Avg Time</Text>
          </View>

          {/* Card 4 */}
          <View style={tw`flex-1 min-w-[70px] bg-white p-3 rounded-xl border border-surface-container shadow-sm items-center justify-center`}>
            <Route style={tw`text-indigo-600 mb-1`} size={16} />
            <Text style={tw`text-base font-black text-on-surface`}>1,240</Text>
            <Text style={tw`text-[10px] text-secondary font-medium`}>Trips</Text>
          </View>
        </View>

        {/* Section: Vehicle details */}
        <View style={tw`gap-3 mb-6`}>
          <Text style={tw`text-sm font-extrabold text-on-surface`}>Vehicle Information</Text>
          
          <View style={tw`bg-white rounded-xl border border-surface-container overflow-hidden shadow-sm flex-row`}>
            <View style={tw`w-28 bg-neutral-100`}>
              <Image 
                style={tw`w-full h-full`} 
                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYsTVOfktRgl2QdmGYnV_owDsLFGxc_-XwnjAaxjZtJZlnpg6lPSgqh_SX71tp9LMhKDyRzV3iXQu_INTWrP4oV075OQo8FGIczgcFVo8pnZmu2PLlbv69mev8063425LfMyk1hpwcTfl1mKsYftvhukcCubVA9ASVypbIXrtYmsabZ5kvBDytotRVDpR5oF0LthqEXWanl3AE-qXZxpo87PDysntfd8AxGs5lGfsyV_YPrsZhgRlK0PZka3jb0NYQHIRuQUdAadqp" }} 
              />
            </View>
            
            <View style={tw`p-4 flex-1`}>
              <View style={tw`bg-emerald-100 px-2 py-0.5 rounded self-start mb-1`}>
                <Text style={tw`text-emerald-800 text-[9px] font-black uppercase tracking-wide`}>Active Vehicle</Text>
              </View>
              <Text style={tw`text-sm font-extrabold text-on-surface`}>Z-Speed EV 500</Text>
              <Text style={tw`text-xs text-secondary mt-0.5`}>Electric Scooter • MH 12 QB 9928</Text>

              <View style={tw`flex-row gap-4 pt-3 mt-3 border-t border-surface-container`}>
                <View style={tw`flex-row items-center gap-1.5`}>
                  <CheckCircle style={tw`text-emerald-600`} size={12} />
                  <Text style={tw`text-[10px] text-on-surface font-semibold`}>Reg Valid: 2026</Text>
                </View>
                <View style={tw`flex-row items-center gap-1.5`}>
                  <Shield style={tw`text-emerald-600`} size={12} />
                  <Text style={tw`text-[10px] text-on-surface font-semibold`}>Fully Insured</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Section: Support options */}
        <View style={tw`gap-3 mb-6`}>
          <Text style={tw`text-sm font-extrabold text-on-surface`}>Support & HELP</Text>
          
          <View style={tw`gap-3`}>
            {/* option 1 */}
            <TouchableOpacity style={tw`bg-white p-4 rounded-xl border border-surface-container shadow-sm flex-row gap-3`}>
              <View style={tw`p-2.5 bg-rose-50 rounded-xl`}>
                <Phone style={tw`text-rose-700`} size={16} />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`font-extrabold text-xs text-on-surface`}>Issue with Current Order</Text>
                <Text style={tw`text-[10px] text-secondary mt-0.5`}>Delay, missing items, or cancellation support.</Text>
              </View>
            </TouchableOpacity>

            {/* option 2 */}
            <TouchableOpacity style={tw`bg-white p-4 rounded-xl border border-surface-container shadow-sm flex-row gap-3`}>
              <View style={tw`p-2.5 bg-neutral-100 rounded-xl`}>
                <Smartphone style={tw`text-neutral-600`} size={16} />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`font-extrabold text-xs text-on-surface`}>Report App Problem</Text>
                <Text style={tw`text-[10px] text-secondary mt-0.5`}>GPS mapping glitch, battery saver locks, or bugs.</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Settings preview board */}
        <View style={tw`p-4 bg-neutral-100 rounded-xl border border-neutral-200 mb-6`}>
          <Text style={tw`text-[10px] font-black text-secondary uppercase tracking-widest mb-3`}>Quick Settings</Text>
          
          <View style={tw`gap-2`}>
            <View style={tw`flex-row justify-between items-center p-3 bg-white rounded-lg border border-neutral-200/50`}>
              <View style={tw`flex-row items-center gap-2`}>
                <Bell style={tw`text-secondary`} size={16} />
                <Text style={tw`text-xs font-bold text-slate-800`}>Push order notification</Text>
              </View>
              <Switch 
                value={pushToggled}
                onValueChange={setPush}
                trackColor={{ false: '#cbd5e1', true: '#ffedd5' }}
                thumbColor={pushToggled ? '#f97316' : '#f1f5f9'}
              />
            </View>

            <View style={tw`flex-row justify-between items-center p-3 bg-white rounded-lg border border-neutral-200/50`}>
              <View style={tw`flex-row items-center gap-2`}>
                <MapPin style={tw`text-secondary`} size={16} />
                <Text style={tw`text-xs font-bold text-slate-800`}>Auto-Location background sync</Text>
              </View>
              <Switch 
                value={gpsToggled}
                onValueChange={setGps}
                trackColor={{ false: '#cbd5e1', true: '#ffedd5' }}
                thumbColor={gpsToggled ? '#f97316' : '#f1f5f9'}
              />
            </View>
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

        {/* Earnings */}
        <TouchableOpacity 
          onPress={() => onNavigate('QuickBite Rider - Earnings', 'none')}
          style={tw`items-center justify-center`}
        >
          <TrendingUp style={tw`text-secondary`} size={20} />
          <Text style={tw`text-[10px] mt-0.5 text-secondary`}>Earnings</Text>
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
