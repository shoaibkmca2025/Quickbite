import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { tw } from '../theme';
import { 
  ArrowLeft, 
  MapPin, 
  Map, 
  CheckCircle2, 
  Phone, 
  Clock,
  Compass,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import { ScreenName, TransitionType } from '../types';

interface RiderActiveOrderProps {
  onNavigate: (destination: ScreenName, transition: TransitionType) => void;
}

export const RiderActiveOrder: React.FC<RiderActiveOrderProps> = ({ onNavigate }) => {
  const [currentStage, setStage] = useState<0 | 1 | 2 | 3>(0);
  const stages = [
    { text: 'Reached Restaurant', color: 'bg-primary' },
    { text: 'Picked Up Order', color: 'bg-emerald-600' },
    { text: 'Reached Customer', color: 'bg-indigo-600' },
    { text: 'Confirm Delivery', color: 'bg-emerald-700' }
  ];

  const [checklist, setChecklist] = useState([
    { id: '1', name: 'Classic Truffle Burger', checked: false },
    { id: '2', name: 'Large Seasoned Fries', checked: false },
    { id: '3', name: 'Vanilla Bean Milkshake', checked: false }
  ]);

  const toggleCheck = (id: string) => {
    setChecklist(
      checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  const handleStageClick = () => {
    if (currentStage < 3) {
      setStage((currentStage + 1) as any);
    } else {
      Alert.alert(
        'Delivery Complete',
        'Congratulations! Order #QB-9928 has been successfully completed and delivered.',
        [{ text: 'OK', onPress: () => onNavigate('QuickBite Rider - Dashboard', 'push_back') }]
      );
    }
  };

  return (
    <View style={tw`flex-1 bg-surface relative`}>
      
      {/* Top Header */}
      <View style={tw`w-full bg-white border-b border-surface-container py-3 px-6 flex-row justify-between items-center shadow-sm`}>
        <View style={tw`flex-row items-center gap-3`}>
          <TouchableOpacity 
            onPress={() => onNavigate('QuickBite Rider - Dashboard', 'push_back')}
            style={tw`p-1`}
          >
            <ArrowLeft style={tw`text-primary`} size={18} />
          </TouchableOpacity>
          <Text style={tw`text-base font-extrabold text-primary`}>Active Delivery Flight</Text>
        </View>

        <View style={tw`bg-emerald-100 px-2.5 py-1 rounded-full`}>
          <Text style={tw`text-emerald-800 text-[10px] font-black uppercase tracking-wider`}>Live Tracking</Text>
        </View>
      </View>

      {/* Main Map Canvas Overlay Background */}
      <View style={tw`flex-1 relative`}>
        <Image 
          style={tw`absolute inset-0 w-full h-full opacity-80`} 
          source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKD8offo96kt-90QrdOrJPVNq8_22_q55PW_9-CKbgoR6TAM6Um0w3QvvHhhZFt_v3L9SkUWWxLeZgPbQCGQHgtoI692jFah3YLQxwfVsj0IoK3C-bXEvVMzr0-eLtbo-UKzdv7f-g0llQx3-aCtNkVvfoRnowrQT1IK3vPdBWoCQuMKCJ9inj-R4JeT3qL2L5NMujlzfCvDPCUfPU5XnBVyuCMFqzPR6-Xwt64NK-HQ4v4xNDFQR-emtnvF9d0B9a9SIk2xWXeEEM" }} 
        />
        
        {/* Animated Rider indicator dot */}
        <View style={tw`absolute top-[45%] left-12 z-10 items-center`}>
          <View style={tw`w-8 h-8 rounded-full bg-primary border-4 border-white items-center justify-center shadow-lg`}>
            <Compass style={tw`text-white`} size={14} />
          </View>
          <View style={tw`bg-white border border-primary px-1.5 py-0.5 rounded shadow-sm mt-1`}>
            <Text style={tw`text-[9px] text-primary font-black`}>Rider</Text>
          </View>
        </View>

        {/* Restaurant Point indicator marker */}
        <View style={tw`absolute top-[30%] right-[30%] z-10 items-center`}>
          <View style={tw`w-9 h-9 rounded-full bg-emerald-600 border-4 border-white items-center justify-center shadow-lg`}>
            <MapPin style={tw`text-white`} size={16} />
          </View>
          <View style={tw`bg-white border border-emerald-600 px-1.5 py-0.5 rounded shadow-sm mt-1`}>
            <Text style={tw`text-[9px] text-emerald-800 font-black`}>Burger Haven</Text>
          </View>
        </View>

        {/* Floating Controls at Top Left */}
        <View style={tw`absolute top-4 left-6 z-20`}>
          <TouchableOpacity 
            onPress={() => onNavigate('QuickBite Rider - Dashboard', 'push_back')}
            style={tw`w-10 h-10 rounded-full bg-white items-center justify-center shadow-lg border border-neutral-100`}
          >
            <ArrowLeft style={tw`text-primary`} size={18} />
          </TouchableOpacity>
        </View>

        {/* Floating map focus trigger */}
        <View style={tw`absolute top-4 right-6 z-20`}>
          <TouchableOpacity style={tw`bg-white p-2.5 rounded-full shadow-lg border border-neutral-100`}>
            <Map style={tw`text-slate-600`} size={18} />
          </TouchableOpacity>
        </View>

        {/* Active Onboarding Sheet drawer pinned at bottom */}
        <View style={tw`absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-[28px] border-t border-surface-container shadow-2xl p-6`}>
          <ScrollView 
            style={tw`max-h-64`}
            showsVerticalScrollIndicator={false}
          >
            <View style={tw`w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-4`} />

            {/* Core Header item details */}
            <View style={tw`flex-row justify-between items-start mb-4`}>
              <View>
                <View style={tw`flex-row items-center gap-2`}>
                  <Text style={tw`text-base font-extrabold text-on-surface`}>Order #QB-9928</Text>
                  <View style={tw`bg-amber-100 px-2 py-0.5 rounded`}>
                    <Text style={tw`text-amber-800 text-[10px] font-black`}>MOPED RUN</Text>
                  </View>
                </View>
                <Text style={tw`text-secondary text-xs mt-0.5 font-bold`}>Burger Haven • 2.4 km away</Text>
              </View>

              <View style={tw`items-end`}>
                <Text style={tw`text-base font-black text-emerald-600`}>+₹8.50</Text>
                <Text style={tw`text-[10px] text-secondary font-medium`}>Est. Payout</Text>
              </View>
            </View>

            {/* Dynamic Interactive Status Action Button */}
            <TouchableOpacity 
              onPress={handleStageClick}
              style={tw`w-full py-3.5 rounded-xl items-center justify-center gap-2 mb-4 ${stages[currentStage].color}`}
            >
              <Text style={tw`text-white font-extrabold text-xs`}>{stages[currentStage].text}</Text>
            </TouchableOpacity>

            {/* Contact Customer / Chat toggle actions */}
            <View style={tw`flex-row gap-3 pb-4 border-b border-surface-container`}>
              <TouchableOpacity style={tw`flex-1 py-2.5 bg-neutral-100 rounded-xl flex-row items-center justify-center gap-1.5`}>
                <Phone style={tw`text-secondary`} size={14} fill="#64748b" />
                <Text style={tw`text-on-surface font-bold text-xs`}>Call Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={tw`flex-1 py-2.5 bg-neutral-100 rounded-xl flex-row items-center justify-center gap-1.5`}>
                <CheckCircle2 style={tw`text-secondary`} size={14} />
                <Text style={tw`text-on-surface font-bold text-xs`}>Help Desk Support</Text>
              </TouchableOpacity>
            </View>

            {/* Verification Checklist Items */}
            <View style={tw`space-y-3 pt-4`}>
              <Text style={tw`text-xs font-black text-secondary uppercase tracking-widest`}>
                Courier Verification Checklist
              </Text>
              
              <View style={tw`gap-2 mt-2`}>
                {checklist.map(item => (
                  <TouchableOpacity 
                    key={item.id}
                    onPress={() => toggleCheck(item.id)}
                    style={tw`flex-row justify-between items-center p-3 bg-neutral-50 rounded-lg border border-neutral-200/50`}
                  >
                    <Text style={tw`text-xs font-bold text-neutral-800`}>{item.name}</Text>
                    <View>
                      {item.checked ? (
                        <CheckSquare style={tw`text-emerald-600`} size={16} />
                      ) : (
                        <Square style={tw`text-neutral-400`} size={16} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Special instruction text */}
              <View style={tw`p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500 flex-row gap-2 mt-4`}>
                <AlertTriangle style={tw`text-amber-600`} size={16} />
                <Text style={tw`text-[10px] text-amber-700 italic leading-snug flex-1`}>
                  "Ensure extra napkins and do not ring the customer doorbell, baby is currently sleeping."
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};
