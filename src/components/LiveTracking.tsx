import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Modal, Alert } from 'react-native';
import { tw } from '../theme';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Phone, 
  MessageSquare, 
  Bike, 
  Navigation, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  Send, 
  Compass, 
  Home as HomeIcon,
  Smile,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ScreenName, TransitionType } from '../types';

interface LiveTrackingProps {
  onNavigate: (destination: ScreenName, transition: TransitionType) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'rider';
  text: string;
  time: string;
}

export const LiveTracking: React.FC<LiveTrackingProps> = ({ onNavigate }) => {
  // Simulating order live state
  const [progress, setProgress] = useState(25); // Starts at 25% (picked up)
  const [eta, setEta] = useState(12); // minutes
  const [distance, setDistance] = useState(1.4); // miles
  const [isPaused, setIsPaused] = useState(false);

  // Chat simulator
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'rider', text: "Hello! I have just picked up your hot food from the kitchen and I'm heading your way now.", time: '12:35 PM' }
  ]);
  const [typedMessage, setTypedMessage] = useState('');

  // Call simulator
  const [callVisible, setCallVisible] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callConnected, setCallConnected] = useState(false);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-increment progress to simulate moving rider on map
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        // Progress step
        const nextProgress = prev + 5;
        
        // Update ETA and Distance dynamically
        setEta((prevEta) => {
          if (prevEta <= 1) return 1;
          return Math.max(1, Math.round(12 * (1 - nextProgress / 100)));
        });

        setDistance((prevDist) => {
          if (prevDist <= 0.1) return 0.05;
          return parseFloat((1.4 * (1 - nextProgress / 100)).toFixed(1));
        });

        return nextProgress;
      });
    }, 4500); // Progress updates every 4.5 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  // Handle calling simulation
  useEffect(() => {
    if (callVisible) {
      // Connect call after 1.5 seconds
      const connectTimeout = setTimeout(() => {
        setCallConnected(true);
        callTimerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }, 1500);

      return () => {
        clearTimeout(connectTimeout);
        if (callTimerRef.current) clearInterval(callTimerRef.current);
      };
    } else {
      setCallConnected(false);
      setCallDuration(0);
    }
  }, [callVisible]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSendMessage = () => {
    if (!typedMessage.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: typedMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setTypedMessage('');

    // Simulated contextual reply
    setTimeout(() => {
      let replyText = "Understood! I will be there as soon as possible.";
      const textLower = userMsg.text.toLowerCase();
      if (textLower.includes('door') || textLower.includes('leave')) {
        replyText = "Sure thing! I will leave it at your doorstep and take a photo as confirmation.";
      } else if (textLower.includes('gate') || textLower.includes('code')) {
        replyText = "Got the instructions. Thanks for providing the entry code!";
      } else if (textLower.includes('sauce') || textLower.includes('napkin')) {
        replyText = "No worries, I already checked with the restaurant and they confirmed extra napkins/sauces are in the bag!";
      }

      const riderMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'rider',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, riderMsg]);
    }, 1200);
  };

  // Helper coordinate calculators for map rendering
  // The route is simulated on a curve path. Let's calculate absolute top/left percentages for the rider.
  // path starts at (Top: 75%, Left: 20%) restaurant and ends at (Top: 20%, Left: 80%) destination.
  const getRiderCoordinates = () => {
    const startY = 72;
    const endY = 22;
    const startX = 18;
    const endX = 78;

    // Linear interpolation
    const currentX = startX + (endX - startX) * (progress / 100);
    const currentY = startY + (endY - startY) * (progress / 100);

    return { top: `${currentY}%`, left: `${currentX}%` };
  };

  const activeRiderCoord = getRiderCoordinates();

  const getStatusText = () => {
    if (progress < 40) return "Rider has left the restaurant with your warm order.";
    if (progress < 70) return "Rider is traveling on the expressway. Smooth traffic.";
    if (progress < 90) return "Rider is close by! Preparing for arrival.";
    if (progress < 100) return "Rider is arriving at your gate now.";
    return "Order has been delivered successfully!";
  };

  const getStatusTitle = () => {
    if (progress < 45) return "Out for Delivery";
    if (progress < 85) return "On the Way";
    if (progress < 100) return "Almost There";
    return "Delivered";
  };

  return (
    <View style={tw`flex-1 bg-background`}>
      {/* Upper header */}
      <View style={tw`w-full bg-white border-b border-surface-container py-3.5 px-6 flex-row justify-between items-center shadow-sm`}>
        <View style={tw`flex-row items-center gap-3`}>
          <TouchableOpacity 
            onPress={() => onNavigate('QuickBite - Order Detail', 'push_back')}
            style={tw`p-1`}
          >
            <ArrowLeft style={tw`text-primary`} size={18} />
          </TouchableOpacity>
          <Text style={tw`text-base font-extrabold text-primary`}>Live Order Tracker</Text>
        </View>

        <TouchableOpacity 
          onPress={() => setIsPaused(!isPaused)}
          style={tw`bg-primary-container px-3 py-1.5 rounded-full`}
        >
          <Text style={tw`text-on-primary-container text-[10px] font-black uppercase tracking-wider`}>
            {isPaused ? 'Resume Simulation' : 'Pause Journey'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={tw`flex-1`}
        contentContainerStyle={tw`pb-32`}
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamic Interactive MAP Canvas */}
        <View style={tw`h-76 w-full bg-slate-100 relative overflow-hidden border-b border-neutral-200`}>
          {/* Faux Grid & Roads */}
          <View style={tw`absolute inset-0 bg-emerald-50/40 opacity-70`}>
            {/* Horizontal Roads */}
            <View style={tw`absolute top-[15%] left-0 right-0 h-8 bg-white border-y border-neutral-200`} />
            <View style={tw`absolute top-[48%] left-0 right-0 h-8 bg-white border-y border-neutral-200`} />
            <View style={tw`absolute top-[78%] left-0 right-0 h-8 bg-white border-y border-neutral-200`} />

            {/* Vertical Roads */}
            <View style={tw`absolute left-[20%] top-0 bottom-0 w-8 bg-white border-x border-neutral-200`} />
            <View style={tw`absolute left-[50%] top-0 bottom-0 w-8 bg-white border-x border-neutral-200`} />
            <View style={tw`absolute left-[80%] top-0 bottom-0 w-8 bg-white border-x border-neutral-200`} />

            {/* Faux Buildings / Parks */}
            <View style={tw`absolute top-4 left-6 w-12 h-10 bg-emerald-100 rounded-lg border border-emerald-200`} />
            <View style={tw`absolute top-28 left-32 w-14 h-12 bg-emerald-100 rounded-lg border border-emerald-200`} />
            <View style={tw`absolute top-40 right-28 w-16 h-10 bg-sky-100 rounded-lg border-sky-200`} />
            <View style={tw`absolute bottom-6 right-8 w-20 h-10 bg-orange-100/50 rounded-lg border border-orange-200/50`} />
          </View>

          {/* Path Polyline Connector */}
          <View style={tw`absolute top-[22%] left-[18%] right-[22%] h-[50%] border-l-2 border-b-2 border-primary border-dashed opacity-45`} />

          {/* Milestone 1: Restaurant Node */}
          <View style={tw`absolute top-[72%] left-[14%] items-center z-10`}>
            <View style={tw`w-10 h-10 rounded-full bg-emerald-600 items-center justify-center border-2 border-white shadow-md`}>
              <Smile style={tw`text-white`} size={16} />
            </View>
            <View style={tw`bg-emerald-900/90 px-2 py-0.5 rounded-md mt-1 shadow-sm`}>
              <Text style={tw`text-white text-[9px] font-black uppercase`}>Kitchen</Text>
            </View>
          </View>

          {/* Milestone 2: Customer Home Node */}
          <View style={tw`absolute top-[17%] left-[78%] items-center z-10`}>
            <View style={tw`w-11 h-11 rounded-full bg-primary items-center justify-center border-2 border-white shadow-lg`}>
              <HomeIcon style={tw`text-white`} size={18} />
            </View>
            <View style={tw`bg-primary px-2 py-0.5 rounded-md mt-1 shadow-sm`}>
              <Text style={tw`text-white text-[9px] font-black uppercase`}>Home</Text>
            </View>
          </View>

          {/* Animated Moving Rider Indicator */}
          {progress < 100 ? (
            <View 
              style={{
                position: 'absolute',
                top: activeRiderCoord.top,
                left: activeRiderCoord.left,
                transform: [{ translateX: -20 }, { translateY: -20 }],
                zIndex: 20
              }}
            >
              <View style={tw`items-center`}>
                <View style={tw`bg-white px-2 py-1 rounded-lg border border-primary flex-row items-center gap-1 shadow-md mb-1`}>
                  <Text style={tw`text-[9px] font-black text-primary`}>{eta}m away</Text>
                </View>
                <View style={tw`w-10 h-10 bg-primary-container rounded-full items-center justify-center border-2 border-primary shadow-lg`}>
                  <Bike style={tw`text-primary animate-bounce`} size={20} />
                </View>
              </View>
            </View>
          ) : (
            <View style={tw`absolute top-[17%] left-[78%] items-center z-20`}>
              <View style={tw`absolute -top-12 bg-emerald-500 px-3 py-1 rounded-lg shadow-lg flex-row items-center gap-1.5 border border-emerald-400`}>
                <CheckCircle style={tw`text-white`} size={12} />
                <Text style={tw`text-white font-black text-[10px] uppercase`}>Arrived!</Text>
              </View>
            </View>
          )}

          {/* Pulse Ripple on Customer Home */}
          <View style={tw`absolute top-[17%] left-[78%] w-11 h-11 bg-primary rounded-full opacity-15 animate-ping`} />
        </View>

        {/* ETA Header Summary Card */}
        <View style={tw`bg-white px-6 py-5 border-b border-neutral-100 flex-row justify-between items-center shadow-sm`}>
          <View style={tw`gap-1`}>
            <Text style={tw`text-[10px] font-black text-secondary uppercase tracking-widest`}>Estimated Delivery</Text>
            <View style={tw`flex-row items-baseline gap-1`}>
              <Text style={tw`text-3xl font-black text-slate-800`}>
                {progress >= 100 ? 'Delivered' : `${eta}`}
              </Text>
              {progress < 100 && <Text style={tw`text-sm font-black text-secondary`}>mins</Text>}
            </View>
            <Text style={tw`text-xs text-secondary font-semibold`}>
              {progress >= 100 ? 'Enjoy your delicious meal!' : `Distance left: ${distance} miles`}
            </Text>
          </View>

          {/* Compass direction badge */}
          <View style={tw`bg-primary-container/40 p-3.5 rounded-2xl items-center justify-center border border-primary-container`}>
            <Compass style={tw`text-primary animate-spin`} size={24} />
          </View>
        </View>

        {/* Dynamic status helper line */}
        <View style={tw`mx-6 mt-6 bg-orange-50/40 p-4 rounded-xl border border-orange-100/60 flex-row gap-3 items-center`}>
          <Navigation style={tw`text-primary`} size={16} />
          <View style={tw`flex-1`}>
            <Text style={tw`text-xs font-black text-slate-800`}>{getStatusTitle()}</Text>
            <Text style={tw`text-[11px] text-secondary mt-0.5`}>{getStatusText()}</Text>
          </View>
        </View>

        {/* Main Progress Bar */}
        <View style={tw`px-6 mt-6`}>
          <View style={tw`bg-neutral-200 h-2.5 rounded-full overflow-hidden`}>
            <View style={[tw`bg-primary h-full`, { width: `${progress}%` }]} />
          </View>
          <View style={tw`flex-row justify-between mt-2`}>
            <Text style={tw`text-[10px] font-black text-slate-400 uppercase`}>Placed</Text>
            <Text style={tw`text-[10px] font-black ${progress >= 30 ? 'text-primary' : 'text-slate-400'} uppercase`}>Prepped</Text>
            <Text style={tw`text-[10px] font-black ${progress >= 60 ? 'text-primary' : 'text-slate-400'} uppercase`}>On Way</Text>
            <Text style={tw`text-[10px] font-black ${progress >= 100 ? 'text-emerald-600' : 'text-slate-400'} uppercase`}>Delivered</Text>
          </View>
        </View>

        {/* Rider Profile and Contact actions */}
        <View style={tw`bg-white mx-6 mt-6 p-4 rounded-2xl border border-surface-container shadow-sm gap-4`}>
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center gap-3.5`}>
              {/* Rider Avatar */}
              <View style={tw`relative`}>
                <View style={tw`w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20`}>
                  <Image 
                    style={tw`w-full h-full`}
                    source={{ uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" }}
                  />
                </View>
                <View style={tw`absolute -bottom-1 -right-1 bg-primary w-5 h-5 rounded-full items-center justify-center border border-white`}>
                  <Bike style={tw`text-white`} size={11} />
                </View>
              </View>

              <View>
                <Text style={tw`text-sm font-black text-slate-800`}>Aarav Sharma</Text>
                <Text style={tw`text-xs text-secondary font-bold`}>Hero Splendor • MH-12-QB-2026</Text>
                <View style={tw`flex-row items-center gap-1 mt-0.5`}>
                  <Star style={tw`text-amber-500 fill-amber-500`} size={11} />
                  <Text style={tw`text-[10px] text-slate-500 font-extrabold`}>4.9 (420 deliveries)</Text>
                </View>
              </View>
            </View>

            <View style={tw`bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100`}>
              <Text style={tw`text-emerald-700 text-[9px] font-black uppercase`}>Vaccinated</Text>
            </View>
          </View>

          {/* Action buttons (Chat & Call) */}
          <View style={tw`flex-row gap-2.5`}>
            <TouchableOpacity 
              onPress={() => setChatVisible(true)}
              style={tw`flex-1 bg-primary-container py-3 rounded-xl flex-row justify-center items-center gap-2`}
            >
              <MessageSquare style={tw`text-on-primary-container`} size={15} />
              <Text style={tw`text-on-primary-container font-black text-xs uppercase tracking-wide`}>Message Rider</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setCallVisible(true)}
              style={tw`bg-emerald-600 px-5 rounded-xl justify-center items-center`}
            >
              <Phone style={tw`text-white`} size={15} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security / Quality Check Banner */}
        <View style={tw`mx-6 mt-4 p-4 bg-slate-50 rounded-2xl border border-neutral-200/55 flex-row gap-3 items-center`}>
          <ShieldCheck style={tw`text-primary`} size={18} />
          <View style={tw`flex-1`}>
            <Text style={tw`text-xs font-black text-slate-800`}>Tamper-Proof Hot Bag Enabled</Text>
            <Text style={tw`text-[10px] text-secondary mt-0.5 leading-relaxed`}>
              Your package is monitored with heat insulation locks, guaranteeing fresh, piping-hot delivery.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* CALL MODAL SIMULATOR */}
      <Modal
        visible={callVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCallVisible(false)}
      >
        <View style={tw`flex-1 bg-slate-950 justify-between py-16 px-8`}>
          {/* Top layout */}
          <View style={tw`items-center mt-12`}>
            <View style={tw`w-24 h-24 rounded-full overflow-hidden border-4 border-slate-800 shadow-2xl mb-4`}>
              <Image 
                style={tw`w-full h-full`}
                source={{ uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop" }}
              />
            </View>
            <Text style={tw`text-xl font-black text-white`}>Aarav Sharma</Text>
            <Text style={tw`text-xs text-slate-400 mt-1 uppercase tracking-widest`}>
              {callConnected ? 'Connected via Secure SIP' : 'Calling...'}
            </Text>
            {callConnected && (
              <Text style={tw`text-base font-black text-primary mt-2`}>
                {formatDuration(callDuration)}
              </Text>
            )}
          </View>

          {/* Action layout */}
          <View style={tw`items-center gap-6`}>
            <Text style={tw`text-[10px] text-slate-500 font-extrabold uppercase text-center tracking-wider px-6`}>
              QuickBite proxies and masks phone numbers to keep personal information secure.
            </Text>

            <TouchableOpacity 
              onPress={() => setCallVisible(false)}
              style={tw`w-16 h-16 rounded-full bg-red-600 justify-center items-center shadow-xl mb-4`}
            >
              <Phone style={tw`text-white rotate-135`} size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CHAT MODAL SIMULATOR */}
      <Modal
        visible={chatVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setChatVisible(false)}
      >
        <View style={tw`flex-1 bg-black bg-opacity-60 justify-end`}>
          <View style={tw`bg-white rounded-t-3xl h-[80%] flex-col`}>
            {/* Grabber bar header */}
            <View style={tw`w-full items-center py-2.5 bg-neutral-50 rounded-t-3xl border-b border-neutral-100`}>
              <View style={tw`w-12 h-1 bg-neutral-300 rounded-full mb-2`} />
              <View style={tw`flex-row items-center gap-2`}>
                <View style={tw`w-2 h-2 rounded-full bg-emerald-500 animate-pulse`} />
                <Text style={tw`text-xs font-black text-slate-800`}>Chat with Aarav (Rider)</Text>
              </View>
            </View>

            {/* Message Thread */}
            <ScrollView 
              style={tw`flex-1 p-4`}
              contentContainerStyle={tw`gap-4 pb-8`}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg) => (
                <View 
                  key={msg.id} 
                  style={tw`flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <View style={tw`max-w-[80%] rounded-2xl p-3.5 ${
                    msg.sender === 'user' 
                      ? 'bg-primary rounded-tr-none' 
                      : 'bg-slate-100 rounded-tl-none'
                  }`}>
                    <Text style={tw`text-xs font-medium ${msg.sender === 'user' ? 'text-white' : 'text-slate-800'}`}>
                      {msg.text}
                    </Text>
                  </View>
                  <Text style={tw`text-[9px] text-slate-400 font-bold mt-1 px-1`}>
                    {msg.time}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Preset shortcuts */}
            <View style={tw`px-4 py-2 bg-neutral-50 border-t border-b border-neutral-100 flex-row gap-2 overflow-x-scroll`}>
              <TouchableOpacity 
                onPress={() => {
                  setTypedMessage("Leave it at the door, thank you.");
                }}
                style={tw`bg-white border border-neutral-200 px-3 py-1.5 rounded-full`}
              >
                <Text style={tw`text-[10px] font-black text-slate-600`}>🚪 Leave at door</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => {
                  setTypedMessage("Call when you arrive please.");
                }}
                style={tw`bg-white border border-neutral-200 px-3 py-1.5 rounded-full`}
              >
                <Text style={tw`text-[10px] font-black text-slate-600`}>📞 Call on arrival</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => {
                  setTypedMessage("Did you get extra napkins?");
                }}
                style={tw`bg-white border border-neutral-200 px-3 py-1.5 rounded-full`}
              >
                <Text style={tw`text-[10px] font-black text-slate-600`}>🧻 Napkins check</Text>
              </TouchableOpacity>
            </View>

            {/* Input keyboard region */}
            <View style={tw`p-4 flex-row items-center gap-3 border-t border-neutral-100 bg-white pb-8`}>
              <TextInput 
                style={tw`flex-1 text-xs px-4 py-3 bg-neutral-100 rounded-full text-on-surface font-semibold border border-transparent`}
                placeholder="Send secure message to rider..."
                placeholderTextColor="#94a3b8"
                value={typedMessage}
                onChangeText={setTypedMessage}
              />
              <TouchableOpacity 
                onPress={handleSendMessage}
                style={tw`w-10 h-10 bg-primary rounded-full items-center justify-center shadow-md`}
              >
                <Send style={tw`text-white`} size={16} />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setChatVisible(false)}
                style={tw`px-3 py-1 bg-slate-100 rounded-lg`}
              >
                <Text style={tw`text-secondary font-black text-[10px] uppercase`}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
