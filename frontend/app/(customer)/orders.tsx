import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api';
import { useCart } from '../../src/store/cart';
import { colors, radius } from '../../src/theme';
import { Badge } from '../../src/components/ui';
import { inr, statusLabel, timeAgo } from '../../src/format';
import type { Order } from '../../src/types';

interface ReorderResult {
  restaurantId: string;
  restaurantName: string;
  isOpen: boolean;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    isVeg: boolean;
    quantity: number;
    options: { groupName: string; label: string; priceDelta: number }[];
  }[];
  unavailable: string[];
}

const TONE: Record<string, 'success' | 'warn' | 'danger' | 'info' | 'neutral'> = {
  delivered: 'success',
  cancelled: 'danger',
  rejected: 'danger',
  out_for_delivery: 'info',
  preparing: 'warn',
  placed: 'warn',
};

export default function Orders() {
  const router = useRouter();
  const loadReorder = useCart((s) => s.loadReorder);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get<Order[]>('/orders/mine?limit=50');
      setOrders(res.data);
    } catch {
      /* ignore */
    } finally {
      setRefreshing(false);
    }
  }, []);

  const reorder = useCallback(
    async (orderId: string) => {
      setReordering(orderId);
      try {
        const res = await api.post<ReorderResult>(`/orders/${orderId}/reorder`);
        const r = res.data;
        if (r.items.length === 0) {
          Alert.alert('Nothing to reorder', 'None of these items are available right now.');
          return;
        }
        loadReorder(r.restaurantId, r.restaurantName, r.items);
        const proceed = () => router.push('/cart');
        if (r.unavailable.length > 0) {
          Alert.alert(
            'Some items unavailable',
            `These are no longer available and were skipped:\n• ${r.unavailable.join('\n• ')}`,
            [{ text: 'Continue', onPress: proceed }]
          );
        } else {
          proceed();
        }
      } catch (e) {
        Alert.alert('Could not reorder', e instanceof Error ? e.message : 'Try again');
      } finally {
        setReordering(null);
      }
    },
    [loadReorder, router]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Text style={styles.h1}>Your Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(o) => o._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.muted, marginTop: 40 }}>No orders yet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/order/${item._id}`)} activeOpacity={0.9}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '800' }}>{item.restaurant?.name ?? 'Restaurant'}</Text>
              <Badge label={statusLabel(item.status)} tone={TONE[item.status] ?? 'neutral'} />
            </View>
            <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }} numberOfLines={1}>
              {item.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ color: colors.muted, fontSize: 12 }}>#{item.code} • {timeAgo(item.createdAt)}</Text>
              <Text style={{ fontWeight: '700' }}>{inr(item.grandTotal)}</Text>
            </View>
            <View style={styles.cardFooter}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: colors.primaryDark, fontWeight: '600', fontSize: 13 }}>Track / Details</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primaryDark} />
              </View>
              {(item.status === 'delivered' || item.status === 'cancelled' || item.status === 'rejected') && (
                <TouchableOpacity
                  style={styles.reorderBtn}
                  disabled={reordering === item._id}
                  onPress={() => reorder(item._id)}
                >
                  <Ionicons name="refresh" size={14} color="#fff" />
                  <Text style={styles.reorderText}>{reordering === item._id ? 'Adding…' : 'Reorder'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: '800', paddingHorizontal: 16, paddingTop: 8 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  reorderBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  reorderText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
