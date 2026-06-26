import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { tw } from '../theme';
import { 
  ArrowLeft, 
  HelpCircle,
  Clock,
  User,
  Smartphone,
  Shield,
  CreditCard,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { ScreenName, TransitionType } from '../types';

interface RiderRegistrationProps {
  onNavigate: (destination: ScreenName, transition: TransitionType) => void;
}

export const RiderRegistration: React.FC<RiderRegistrationProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setForm] = useState({
    fullName: '',
    mobile: '',
    vehicle: 'scooter',
    license: ''
  });

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onNavigate('QuickBite Rider - Dashboard', 'push');
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onNavigate('QuickBite - Home', 'push_back');
    }
  };

  return (
    <View style={tw`flex-1 bg-background`}>
      {/* Top Header */}
      <View style={tw`w-full bg-surface border-b border-surface-container py-3 px-6 flex-row justify-between items-center shadow-sm`}>
        <View style={tw`flex-row items-center gap-3`}>
          <TouchableOpacity 
            onPress={handleBack}
            style={tw`p-1`}
          >
            <ArrowLeft style={tw`text-primary`} size={18} />
          </TouchableOpacity>
          <Text style={tw`text-xl font-black text-primary tracking-tight`}>QuickBite Rider</Text>
        </View>

        <View style={tw`flex-row items-center gap-4`}>
          <TouchableOpacity 
            onPress={() => onNavigate('QuickBite Rider - Dashboard', 'push')}
            style={tw`p-1`}
          >
            <Text style={tw`text-xs font-bold text-primary`}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Container */}
      <ScrollView 
        contentContainerStyle={tw`pb-32 px-6 pt-6`}
        showsVerticalScrollIndicator={false}
      >
        <View style={tw`bg-white p-6 rounded-2xl border border-orange-100 shadow-sm mb-6`}>
          
          {/* Steps Progress Indicator */}
          <View style={tw`flex-row items-center justify-between mb-6`}>
            <View style={tw`flex-row items-center gap-1.5`}>
              <View style={tw`w-7 h-7 rounded-full items-center justify-center ${
                step === 1 ? 'bg-primary' : 'bg-tertiary'
              }`}>
                <Text style={tw`text-white text-xs font-bold`}>{step === 1 ? '1' : '✓'}</Text>
              </View>
              <View style={tw`h-1 w-6 rounded-full ${step === 2 ? 'bg-tertiary' : 'bg-neutral-200'}`} />
              <View style={tw`w-7 h-7 rounded-full items-center justify-center ${
                step === 2 ? 'bg-primary' : 'bg-neutral-200'
              }`}>
                <Text style={tw`text-xs font-bold ${step === 2 ? 'text-white' : 'text-secondary'}`}>2</Text>
              </View>
            </View>
            <Text style={tw`text-xs font-bold text-secondary`}>
              {step === 1 ? 'Step 1: Onboarding Basics' : 'Step 2: Document Verification'}
            </Text>
          </View>

          {/* Step 1 Profile Questionnaire */}
          {step === 1 ? (
            <View style={tw`gap-6`}>
              <View>
                <Text style={tw`text-xl font-bold mb-1 text-slate-800`}>Join the delivery fleet</Text>
                <Text style={tw`text-xs text-secondary font-medium`}>Earn highly competitive rates on every single mile you drive.</Text>
              </View>

              <View style={tw`gap-4`}>
                {/* Full Name */}
                <View style={tw`gap-1`}>
                  <Text style={tw`text-xs font-bold text-secondary`}>Full Name</Text>
                  <View style={tw`relative`}>
                    <View style={tw`absolute left-3 top-3.5 z-10`}>
                      <User style={tw`text-secondary`} size={16} />
                    </View>
                    <TextInput 
                      style={tw`w-full text-sm pl-10 pr-3 py-2.5 bg-neutral-100 rounded-lg text-slate-800 font-semibold border border-transparent`}
                      placeholder="Enter your full legal name"
                      placeholderTextColor="#94a3b8"
                      value={formData.fullName}
                      onChangeText={(val) => setForm({ ...formData, fullName: val })}
                    />
                  </View>
                </View>

                {/* Mobile */}
                <View style={tw`gap-1`}>
                  <Text style={tw`text-xs font-bold text-secondary`}>Mobile Number</Text>
                  <View style={tw`relative`}>
                    <View style={tw`absolute left-3 top-3.5 z-10`}>
                      <Smartphone style={tw`text-secondary`} size={16} />
                    </View>
                    <Text style={tw`absolute left-9 top-3 text-sm text-secondary font-medium`}>+1</Text>
                    <TextInput 
                      style={tw`w-full text-sm pl-14 pr-3 py-2.5 bg-neutral-100 rounded-lg text-slate-800 font-semibold`}
                      placeholder="(555) 000-0000"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                      value={formData.mobile}
                      onChangeText={(val) => setForm({ ...formData, mobile: val })}
                    />
                  </View>
                </View>

                {/* Vehicle Selector */}
                <View style={tw`gap-1`}>
                  <Text style={tw`text-xs font-bold text-secondary`}>Vehicle Type</Text>
                  <View style={tw`flex-row gap-3`}>
                    {['scooter', 'bicycle', 'car'].map((v) => (
                      <TouchableOpacity
                        key={v}
                        onPress={() => setForm({ ...formData, vehicle: v })}
                        style={tw`flex-1 py-3 border-2 rounded-xl items-center justify-center gap-1.5 ${
                          formData.vehicle === v 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-neutral-200'
                        }`}
                      >
                        <Text style={tw`capitalize text-xs font-bold ${formData.vehicle === v ? 'text-primary' : 'text-secondary'}`}>{v}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* License Info */}
                <View style={tw`gap-1`}>
                  <Text style={tw`text-xs font-bold text-secondary`}>Driver License ID</Text>
                  <TextInput 
                    style={tw`w-full text-sm px-3 py-2.5 bg-neutral-100 rounded-lg text-slate-800 font-semibold`}
                    placeholder="License plate or ID #"
                    placeholderTextColor="#94a3b8"
                    value={formData.license}
                    onChangeText={(val) => setForm({ ...formData, license: val })}
                  />
                </View>
              </View>

              <View style={tw`pt-3 gap-3`}>
                <TouchableOpacity 
                  onPress={handleNext}
                  disabled={!formData.fullName || !formData.mobile}
                  style={tw`w-full bg-primary py-3 rounded-xl items-center justify-center ${(!formData.fullName || !formData.mobile) ? 'opacity-50' : ''}`}
                >
                  <Text style={tw`text-white font-bold`}>Next: Document Upload</Text>
                </TouchableOpacity>
                <Text style={tw`text-[10px] text-center text-secondary leading-normal`}>
                  By proceeding, you explicitly authorize and agree to QuickBite's Courier Terms of Use.
                </Text>
              </View>
            </View>
          ) : (
            // Step 2 Document Upload
            <View style={tw`gap-6`}>
              <View>
                <Text style={tw`text-xl font-bold mb-1 text-slate-800`}>Document Upload</Text>
                <Text style={tw`text-xs text-secondary font-medium`}>Verify your driver license credentials and background logs.</Text>
              </View>

              <View style={tw`gap-3`}>
                <TouchableOpacity style={tw`p-4 border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 items-center justify-center py-6`}>
                  <Briefcase style={tw`text-secondary mb-2`} size={24} />
                  <Text style={tw`text-xs font-extrabold text-slate-800`}>Upload Driver License PDF or Image</Text>
                  <Text style={tw`text-[10px] text-secondary mt-1`}>Accepts JPG, PNG up to 10MB</Text>
                </TouchableOpacity>

                <TouchableOpacity style={tw`p-4 border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 items-center justify-center py-6`}>
                  <CreditCard style={tw`text-secondary mb-2`} size={24} />
                  <Text style={tw`text-xs font-extrabold text-slate-800`}>Upload Vehicle Insurance Proof</Text>
                  <Text style={tw`text-[10px] text-secondary mt-1`}>Must be active is 2026/2027</Text>
                </TouchableOpacity>
              </View>

              <View style={tw`flex-row gap-3 pt-4`}>
                <TouchableOpacity 
                  onPress={() => setStep(1)}
                  style={tw`flex-1 border-2 border-neutral-200 py-3 rounded-xl items-center justify-center`}
                >
                  <Text style={tw`text-secondary font-bold`}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => onNavigate('QuickBite Rider - Dashboard', 'push')}
                  style={tw`flex-1 bg-primary py-3 rounded-xl items-center justify-center`}
                >
                  <Text style={tw`text-white font-bold`}>Submit Application</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={tw`gap-4`}>
          <View style={tw`bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex-row gap-3`}>
            <HelpCircle style={tw`text-tertiary`} size={24} />
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs font-bold text-tertiary`}>Need Immediate Help?</Text>
              <Text style={tw`text-[10px] text-secondary leading-snug mt-1`}>Onboarding desk lines are open 24/7. Call (555) 123-BITE.</Text>
            </View>
          </View>

          <View style={tw`bg-neutral-100 border border-neutral-200 p-4 rounded-xl flex-row gap-3`}>
            <Clock style={tw`text-secondary`} size={24} />
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs font-bold text-on-surface`}>5-Min Verification</Text>
              <Text style={tw`text-[10px] text-secondary leading-snug mt-1`}>Once uploaded, background scans are completed on-the-spot.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Nav for registration */}
      <View style={tw`absolute bottom-0 w-full h-16 border-t border-surface-container bg-surface flex-row justify-around items-center shadow-lg`}>
        <TouchableOpacity style={tw`items-center justify-center`}>
          <Briefcase style={tw`text-primary`} size={20} fill="#f97316" />
          <Text style={tw`text-[10px] mt-0.5 text-primary font-bold`}>Join</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`items-center justify-center`}>
          <HelpCircle style={tw`text-secondary`} size={20} />
          <Text style={tw`text-[10px] mt-0.5 text-secondary`}>Guide</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
