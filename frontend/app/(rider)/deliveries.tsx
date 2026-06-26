import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Alert, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { api } from '../../src/api';
import { connectSocket } from '../../src/socket';
import { useAuth } from '../../src/store/auth';
import { colors, radius } from '../../src/theme';
import { Button, Badge } from '../../src/components/ui';
import { inr, statusLabel } from '../../src/format';
import type { Order } from '../../src/types';

interface Assignments {
  active: Order[];
  available: Order[];
}

export default function Deliveries() {
  const user = useAuth((s) => s.user);
  const refreshUser = useAuth((s) => s.refreshUser);
  const [data, setData] = useState<Assignments>({ active: [], available: [] });
  const [refreshing, setRefreshing] = useState(false);
  const online = user?.rider?.status === 'online';

  const load = useCallback(async () => {
    try {
      const res = await api.get<Assignments>('/rider/assignments');
      setData(res.data);
    } catch {
      /* ignore */
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    let cleanup = () => {};
    connectSocket().then((socket) => {
      const onAssigned = () => load();
      socket.on('rider:assigned', onAssigned);
      socket.on('order:updated', onAssigned);
      cleanup = () => {
        socket.off('rider:assigned', onAssigned);
        socket.off('order:updated', onAssigned);
      };
    });
    return cleanup;
  }, [load]);

  // Stream live GPS to the customer's tracking map while a delivery is on the way (PRD FR-ORD-03).
  const delivering = data.active.find((o) => o.status === 'out_for_delivery' || o.status === 'picked_up');
  const deliveringId = delivering?._id;
  useEffect(() => {
    if (!deliveringId) return;
    let cancelled = false;
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;
      const socket = await connectSocket();
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 20 },
        (pos) => {
          socket.emit('rider:location', {
            orderId: deliveringId,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        }
      );
      if (cancelled) sub?.remove();
    })();
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [deliveringId]);

  const toggleOnline = async () => {
    try {
      await api.post('/rider/status', { status: online ? 'offline' : 'online' });
      await refreshUser();
      load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : '');
    }
  };

  const act = async (order: Order, path: string) => {
    try {
      await api.post(`/rider/orders/${order._id}/${path}`);
      load();
    } catch (e) {
      Alert.alert('Action failed', e instanceof Error ? e.message : '');
    }
  };

  const navigate = (order: Order) => {
    const addr = order.deliveryAddress;
    const q = addr?.lat && addr?.lng ? `${addr.lat},${addr.lng}` : encodeURIComponent(`${addr?.line} ${addr?.city}`);
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${q}`).catch(() => {});
  };

  const nextStep = (o: Order): { label: string; path: string } | null => {
    switch (o.status) {
      case 'assigned':
        return { label: 'Mark Picked Up', path: 'picked-up' };
      case 'picked_up':
        return { label: 'Start Delivery', path: 'out-for-delivery' };
      case 'out_for_delivery':
        return { label: 'Mark Delivered', path: 'delivered' };
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.h1}>Hi, {user?.name?.split(' ')[0]}</Text>
          <Text style={{ color: colors.muted }}>{online ? "You're online" : "You're offline"}</Text>
        </View>
        <TouchableOpacity style={[styles.onlineBtn, { backgroundColor: online ? colors.success : colors.muted }]} onPress={toggleOnline}>
          <View style={styles.onlineDot} />
          <Text style={{ color: '#fff', fontWeight: '700' }}>{online ? 'Online' : 'Go Online'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <Text style={styles.section}>Active deliveries</Text>
        {data.active.length === 0 && <Text style={styles.empty}>No active deliveries right now.</Text>}
        {data.active.map((o) => {
          const step = nextStep(o);
          return (
            <View key={o._id} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '800' }}>#{o.code}</Text>
                <Badge label={statusLabel(o.status)} tone="info" />
              </View>
              <Leg icon="restaurant" title="Pick up" text={o.restaurant?.name ?? ''} sub={(o.restaurant as { address?: string })?.address} />
              <Leg icon="home" title="Drop off" text={o.customer?.name ?? ''} sub={`${o.deliveryAddress?.line}, ${o.deliveryAddress?.city}`} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ color: colors.muted }}>{o.paymentMethod === 'cod' ? `Collect ${inr(o.grandTotal)}` : 'Prepaid'}</Text>
                <Text style={{ fontWeight: '700' }}>Earn {inr(o.deliveryFee + 15)}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Button title="Navigate" variant="ghost" onPress={() => navigate(o)} style={{ flex: 1 }} />
                {step && <Button title={step.label} variant="accent" onPress={() => act(o, step.path)} style={{ flex: 1.4 }} />}
              </View>
            </View>
          );
        })}

        <Text style={styles.section}>Available nearby</Text>
        {!online && <Text style={styles.empty}>Go online to see available orders.</Text>}
        {online && data.available.length === 0 && <Text style={styles.empty}>No orders waiting for pickup.</Text>}
        {online &&
          data.available.map((o) => (
            <View key={o._id} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '800' }}>#{o.code}</Text>
                <Badge label="Ready" tone="warn" />
              </View>
              <Leg icon="restaurant" title="Pick up" text={o.restaurant?.name ?? ''} />
              <Leg icon="home" title="Drop off" text={`${o.deliveryAddress?.line}, ${o.deliveryAddress?.city}`} />
              <Button title={`Accept • Earn ${inr(o.deliveryFee + 15)}`} variant="success" onPress={() => act(o, 'claim')} style={{ marginTop: 10 }} />
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Leg({ icon, title, text, sub }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string; sub?: string }) {
  return (
    <View style={{ flexDirection: 'row', marginTop: 12 }}>
      <View style={styles.legIcon}>
        <Ionicons name={icon} size={16} color={colors.primaryDark} />
      </View>
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', fontWeight: '700' }}>{title}</Text>
        <Text style={{ fontWeight: '700' }}>{text}</Text>
        {!!sub && <Text style={{ color: colors.muted, fontSize: 13 }}>{sub}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  h1: { fontSize: 24, fontWeight: '800' },
  onlineBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  section: { fontSize: 16, fontWeight: '800', marginTop: 8, marginBottom: 10 },
  empty: { color: colors.muted, marginBottom: 12 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  legIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
});
