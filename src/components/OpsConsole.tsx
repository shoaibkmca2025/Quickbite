import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { tw } from '../theme';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  RefreshCw, 
  Compass, 
  Activity, 
  SlidersHorizontal,
  IndianRupee
} from 'lucide-react';
import { ScreenName, TransitionType } from '../types';

interface OpsConsoleProps {
  onNavigate: (destination: ScreenName, transition: TransitionType) => void;
}

export const OpsConsole: React.FC<OpsConsoleProps> = ({ onNavigate }) => {
  const [riders, setRiders] = useState([
    { id: 'R-101', name: 'Marco Rossi', vehicle: 'Scooter', approved: true, lat: 40.7128, lng: -74.0060, deliveries: 12, rating: 4.9 },
    { id: 'R-102', name: 'John Doe', vehicle: 'Bicycle', approved: false, lat: 40.7135, lng: -74.0045, deliveries: 0, rating: 0.0 },
    { id: 'R-103', name: 'Clara Oswald', vehicle: 'Car', approved: true, lat: 40.7112, lng: -74.0090, deliveries: 8, rating: 4.8 },
    { id: 'R-104', name: 'Ken Masters', vehicle: 'Scooter', approved: false, lat: 40.7150, lng: -74.0020, deliveries: 0, rating: 0.0 }
  ]);

  const [search, setSearch] = useState('');

  const toggleApproval = (id: string) => {
    setRiders(
      riders.map(r => r.id === id ? { ...r, approved: !r.approved } : r)
    );
  };

  const filteredRiders = riders.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={tw`flex-1 bg-surface`}>
      {/* Top Header */}
      <View style={tw`w-full bg-[#0f172a] py-3 px-6 flex-row justify-between items-center shadow-md`}>
        <View style={tw`flex-row items-center gap-3`}>
          <TouchableOpacity 
            onPress={() => onNavigate('QuickBite - Home', 'push_back')}
            style={tw`p-1`}
          >
            <ArrowLeft style={tw`text-white`} size={18} />
          </TouchableOpacity>
          
          <View style={tw`flex-row items-center gap-2`}>
            <View style={tw`bg-primary px-2 py-0.5 rounded`}>
              <Text style={tw`text-white text-[10px] font-black`}>SUITE 4.0</Text>
            </View>
            <Text style={tw`text-base font-extrabold text-white`}>Ops Console</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => Alert.alert('Ops Center', 'Refreshing live operational metrics...')}
          style={tw`bg-slate-800 px-3 py-1.5 rounded-lg flex-row items-center gap-1.5`}
        >
          <RefreshCw style={tw`text-primary`} size={14} />
          <Text style={tw`text-white text-xs font-bold`}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Main Container */}
      <ScrollView 
        contentContainerStyle={tw`pb-32 px-6 pt-6`}
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics highlights cards section */}
        <View style={tw`flex-row flex-wrap gap-4 mb-6`}>
          {/* Card 1 */}
          <View style={tw`flex-1 min-w-[130px] bg-[#1e293b] p-4 rounded-xl border border-slate-850 flex-row justify-between items-center`}>
            <View>
              <Text style={tw`text-[10px] text-slate-400 font-bold uppercase`}>Total Riders</Text>
              <Text style={tw`text-2xl font-black text-white mt-1`}>{riders.length}</Text>
            </View>
            <Users style={tw`text-primary`} size={24} />
          </View>

          {/* Card 2 */}
          <View style={tw`flex-1 min-w-[130px] bg-[#1e293b] p-4 rounded-xl border border-slate-850 flex-row justify-between items-center`}>
            <View>
              <Text style={tw`text-[10px] text-slate-400 font-bold uppercase`}>Pending</Text>
              <Text style={tw`text-2xl font-black text-amber-500 mt-1`}>
                {riders.filter(r => !r.approved).length}
              </Text>
            </View>
            <Activity style={tw`text-amber-500`} size={24} />
          </View>

          {/* Card 3 */}
          <View style={tw`flex-1 min-w-[130px] bg-[#1e293b] p-4 rounded-xl border border-slate-850 flex-row justify-between items-center`}>
            <View>
              <Text style={tw`text-[10px] text-slate-400 font-bold uppercase`}>Active Del.</Text>
              <Text style={tw`text-2xl font-black text-emerald-500 mt-1`}>14</Text>
            </View>
            <Compass style={tw`text-emerald-500`} size={24} />
          </View>

          {/* Card 4 */}
          <View style={tw`flex-1 min-w-[130px] bg-[#1e293b] p-4 rounded-xl border border-slate-850 flex-row justify-between items-center`}>
            <View>
              <Text style={tw`text-[10px] text-slate-400 font-bold uppercase`}>Rev (daily)</Text>
              <Text style={tw`text-2xl font-black text-white mt-1`}>₹412.00</Text>
            </View>
            <IndianRupee style={tw`text-primary`} size={24} />
          </View>
        </View>

        {/* Live Active Delivery Logs Timelines overlay */}
        <View style={tw`bg-white p-5 rounded-2xl border border-surface-container shadow-sm gap-4 mb-6`}>
          <View style={tw`flex-row justify-between items-center border-b border-orange-50 pb-4`}>
            <View>
              <Text style={tw`font-extrabold text-base text-on-surface`}>Active Delivery Flights</Text>
              <Text style={tw`text-xs text-secondary mt-1`}>Live tracking and stage completion rates.</Text>
            </View>
            <TouchableOpacity style={tw`flex-row items-center gap-1`}>
              <SlidersHorizontal style={tw`text-primary`} size={14} />
              <Text style={tw`text-xs font-bold text-primary`}>Filters</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`gap-4`}>
            {/* Delivery Item 1 */}
            <View style={tw`p-4 bg-neutral-50 rounded-xl border border-neutral-200 gap-3`}>
              <div style={tw`flex-row justify-between items-center`}>
                <Text style={tw`text-xs font-extrabold text-on-surface`}>Order #QB-9928</Text>
                <View style={tw`bg-emerald-50 px-2 py-0.5 rounded`}>
                  <Text style={tw`text-emerald-700 font-bold text-[10px]`}>Out for Delivery</Text>
                </View>
              </div>
              <View style={tw`h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden`}>
                <View style={tw`h-full bg-emerald-600 rounded-full w-[75%]`} />
              </View>
              <Text style={tw`text-[10px] text-secondary`}>
                Courier: <Text style={tw`font-bold text-on-surface`}>Marco Rossi (R-101)</Text> • Destination: Sarah J.
              </Text>
            </View>

            {/* Delivery Item 2 */}
            <View style={tw`p-4 bg-neutral-50 rounded-xl border border-neutral-200 gap-3`}>
              <div style={tw`flex-row justify-between items-center`}>
                <Text style={tw`text-xs font-extrabold text-on-surface`}>Order #QB-9927</Text>
                <View style={tw`bg-amber-50 px-2 py-0.5 rounded`}>
                  <Text style={tw`text-amber-700 font-bold text-[10px]`}>Preparing Food</Text>
                </View>
              </div>
              <View style={tw`h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden`}>
                <View style={tw`h-full bg-amber-500 rounded-full w-[45%]`} />
              </View>
              <Text style={tw`text-[10px] text-secondary`}>
                Courier: <Text style={tw`font-bold text-on-surface`}>Clara Oswald (R-103)</Text> • Destination: Aarav S.
              </Text>
            </View>
          </View>
        </View>

        {/* Section: Active Riders Fleet Card-based List */}
        <View style={tw`bg-white rounded-2xl border border-surface-container shadow-sm mb-6 overflow-hidden`}>
          <View style={tw`p-5 border-b border-orange-50 gap-3`}>
            <View>
              <Text style={tw`font-extrabold text-base text-on-surface`}>Registered Rider Fleet</Text>
              <Text style={tw`text-xs text-secondary mt-1`}>Manage rider approvals and vehicle classes.</Text>
            </View>

            {/* Search inputs bar */}
            <View style={tw`relative w-full`}>
              <View style={tw`absolute left-3 top-3 z-10`}>
                <Search style={tw`text-secondary`} size={16} />
              </View>
              <TextInput 
                style={tw`w-full text-xs pl-9 pr-3 py-2 bg-neutral-100 rounded-lg text-slate-800 font-semibold`}
                placeholder="Search rider ID or name"
                placeholderTextColor="#94a3b8"
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          <View style={tw`p-4 gap-4`}>
            {filteredRiders.map((r) => (
              <View 
                key={r.id} 
                style={tw`p-4 bg-neutral-50/50 rounded-xl border border-neutral-100 flex-row justify-between items-center`}
              >
                <View style={tw`flex-1`}>
                  <View style={tw`flex-row items-center gap-2`}>
                    <Text style={tw`font-mono font-bold text-primary`}>{r.id}</Text>
                    <Text style={tw`font-bold text-sm text-on-surface`}>{r.name}</Text>
                  </View>
                  <Text style={tw`text-xs text-secondary mt-1`}>
                    {r.vehicle} • {r.deliveries} trips • Rating: ★ {r.rating > 0 ? r.rating.toFixed(1) : 'N/A'}
                  </Text>
                  <Text style={tw`text-[10px] text-slate-400 mt-1 font-mono`}>
                    Loc: {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                  </Text>
                </View>

                <TouchableOpacity 
                  onPress={() => toggleApproval(r.id)}
                  style={tw`px-3 py-1.5 rounded-lg border ${
                    r.approved 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <Text style={tw`text-[10px] font-black uppercase ${
                    r.approved ? 'text-emerald-800' : 'text-amber-800'
                  }`}>
                    {r.approved ? 'Approved ✓' : 'Approve'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating control to jump back to client */}
      <View style={tw`bg-slate-900 py-6 px-6 items-center`}>
        <Text style={tw`text-xs font-semibold text-slate-400`}>Logged in as Operations Administrator</Text>
        <TouchableOpacity 
          onPress={() => onNavigate('QuickBite - Home', 'push_back')}
          style={tw`mt-2`}
        >
          <Text style={tw`text-primary font-bold text-xs`}>Return to Client QuickBite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
