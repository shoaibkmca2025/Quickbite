import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api';
import { connectSocket } from '../../src/socket';
import { colors, radius } from '../../src/theme';
import { Button } from '../../src/components/ui';
import { inr, statusLabel, statusProgress, etaText } from '../../src/format';
import { LiveMap, type LatLng } from '../../src/components/LiveMap';
import type { Order } from '../../src/types';

const STEPS = [
  { key: 'placed', label: 'Order placed', icon: 'receipt-outline' },
  { key: 'accepted', label: 'Accepted', icon: 'checkmark-circle-outline' },
  { key: 'preparing', label: 'Preparing', icon: 'flame-outline' },
  { key: 'ready', label: 'Ready', icon: 'bag-check-outline' },
  { key: 'out_for_delivery', label: 'On the way', icon: 'bicycle-outline' },
  { key: 'delivered', label: 'Delivered', icon: 'home-outline' },
] as const;

const RANK: Record<string, number> = {
  placed: 0, accepted: 1, preparing: 2, ready: 3, assigned: 3, picked_up: 4, out_for_delivery: 4, delivered: 5,
};

export default function OrderTracking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [foodRating, setFoodRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [riderLoc, setRiderLoc] = useState<LatLng | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get<Order>(`/orders/${id}`);
      setOrder(res.data);
      setReviewed(!!(res.data as unknown as { rating?: string }).rating);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Live updates over Socket.IO.
  useEffect(() => {
    let mounted = true;
    let cleanup = () => {};
    connectSocket().then((socket) => {
      socket.emit('join', { orderId: id });
      const onStatus = () => mounted && load();
      const onUpdated = (o: Order) => mounted && o._id === id && setOrder(o);
      const onRiderLoc = (p: { orderId: string; lat: number; lng: number }) =>
        mounted && p.orderId === id && setRiderLoc({ lat: p.lat, lng: p.lng });
      socket.on('order:status', onStatus);
      socket.on('order:updated', onUpdated);
      socket.on('rider:location', onRiderLoc);
      cleanup = () => {
        socket.off('order:status', onStatus);
        socket.off('order:updated', onUpdated);
        socket.off('rider:location', onRiderLoc);
      };
    });
    return () => {
      mounted = false;
      cleanup();
    };
  }, [id, load]);

  const cancel = async () => {
    Alert.alert('Cancel order?', 'You can cancel before the kitchen starts preparing.', [
      { text: 'No' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post(`/orders/${id}/cancel`, { reason: 'Changed my mind' });
            load();
          } catch (e) {
            Alert.alert('Could not cancel', e instanceof Error ? e.message : '');
          }
        },
      },
    ]);
  };

  const submitReview = async () => {
    try {
      await api.post(`/orders/${id}/review`, { foodRating, comment });
      setReviewed(true);
      Alert.alert('Thanks!', 'Your review has been submitted.');
    } catch (e) {
      Alert.alert('Review failed', e instanceof Error ? e.message : '');
    }
  };

  if (loading) return <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />;
  if (!order) return <Text style={{ padding: 20 }}>Order not found.</Text>;

  const rank = RANK[order.status] ?? 0;
  const terminal = order.status === 'cancelled' || order.status === 'rejected';
  const cancellable = order.status === 'placed' || order.status === 'accepted';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Stack.Screen options={{ title: `#${order.code}` }} />

      {/* Status banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerStatus}>{statusLabel(order.status)}</Text>
        {!terminal && order.status !== 'delivered' && (
          <Text style={styles.bannerEta}>Arriving {etaText(order.etaAt)}</Text>
        )}
        {!terminal && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${statusProgress(order.status)}%` }]} />
          </View>
        )}
      </View>

      {/* Timeline */}
      {!terminal ? (
        <View style={styles.card}>
          {STEPS.map((step) => {
            const done = (RANK[step.key] ?? 0) <= rank;
            return (
              <View key={step.key} style={styles.step}>
                <View style={[styles.stepDot, { backgroundColor: done ? colors.success : '#e2e8f0' }]}>
                  <Ionicons name={step.icon as keyof typeof Ionicons.glyphMap} size={16} color={done ? '#fff' : colors.muted} />
                </View>
                <Text style={[styles.stepLabel, { color: done ? colors.text : colors.muted, fontWeight: done ? '700' : '500' }]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={[styles.card, { alignItems: 'center' }]}>
          <Ionicons name="close-circle" size={40} color={colors.danger} />
          <Text style={{ marginTop: 8, fontWeight: '700' }}>This order was {order.status}.</Text>
          {order.paymentStatus === 'refunded' && <Text style={{ color: colors.success, marginTop: 4 }}>Refund initiated</Text>}
        </View>
      )}

      {/* Rider */}
      {order.rider && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your rider</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <View style={styles.riderAvatar}>
              <Ionicons name="bicycle" size={20} color={colors.primaryDark} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontWeight: '700' }}>{order.rider.name}</Text>
              {order.rider.phone && <Text style={{ color: colors.muted }}>{order.rider.phone}</Text>}
            </View>
          </View>

          {/* Live tracking map (PRD FR-ORD-03) — shows once the rider is on the way. */}
          {order.status === 'out_for_delivery' && (
            <View style={{ marginTop: 12 }}>
              {riderLoc ? (
                <LiveMap
                  rider={riderLoc}
                  destination={
                    order.deliveryAddress?.lat && order.deliveryAddress?.lng
                      ? { lat: order.deliveryAddress.lat, lng: order.deliveryAddress.lng }
                      : null
                  }
                />
              ) : (
                <View style={styles.mapWaiting}>
                  <Ionicons name="navigate" size={16} color={colors.primary} />
                  <Text style={{ color: colors.muted, marginLeft: 8 }}>Locating your rider…</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Items + bill */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{order.restaurant?.name}</Text>
        {order.items.map((it, idx) => (
          <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
            <Text>{it.quantity}× {it.name}</Text>
            <Text>{inr(it.lineTotal)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <Row label="Item total" value={inr(order.itemTotal)} />
        <Row label="Delivery + packaging" value={inr(order.deliveryFee + order.packagingFee)} />
        <Row label="Taxes" value={inr(order.tax)} />
        {order.discount > 0 && <Row label="Discount" value={`- ${inr(order.discount)}`} />}
        <View style={styles.divider} />
        <Row label="Total paid" value={inr(order.grandTotal)} bold />
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>
          {order.paymentMethod.toUpperCase()} • {order.paymentStatus}
        </Text>
      </View>

      {/* Actions */}
      {cancellable && <Button title="Cancel order" variant="danger" onPress={cancel} style={{ marginTop: 4 }} />}

      {/* Review */}
      {order.status === 'delivered' && !reviewed && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rate your order</Text>
          <View style={{ flexDirection: 'row', marginVertical: 10 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setFoodRating(n)}>
                <Ionicons name={n <= foodRating ? 'star' : 'star-outline'} size={32} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Tell us more (optional)"
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <Button title="Submit review" onPress={submitReview} style={{ marginTop: 12 }} />
        </View>
      )}
      {reviewed && (
        <View style={[styles.card, { flexDirection: 'row', alignItems: 'center' }]}>
          <Ionicons name="checkmark-circle" size={22} color={colors.success} />
          <Text style={{ marginLeft: 8, fontWeight: '600' }}>Thanks for your review!</Text>
        </View>
      )}
    </ScrollView>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
      <Text style={{ color: bold ? colors.text : colors.muted, fontWeight: bold ? '800' : '400' }}>{label}</Text>
      <Text style={{ fontWeight: bold ? '800' : '400' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.primaryDark, borderRadius: radius.lg, padding: 18, marginBottom: 14 },
  bannerStatus: { color: '#fff', fontSize: 20, fontWeight: '800' },
  bannerEta: { color: '#ffe', opacity: 0.9, marginTop: 4 },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,.3)', borderRadius: 3, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: '#fff', borderRadius: 3 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontWeight: '800', fontSize: 16 },
  step: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  stepDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { marginLeft: 12, fontSize: 15 },
  riderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  mapWaiting: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.border },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  input: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, minHeight: 60, textAlignVertical: 'top' },
});
