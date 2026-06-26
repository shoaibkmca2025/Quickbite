import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/api';
import { useAuth } from '../src/store/auth';
import { useCart } from '../src/store/cart';
import { colors, radius } from '../src/theme';
import { Button } from '../src/components/ui';
import { inr } from '../src/format';
import type { Address, Bill, Order } from '../src/types';

interface Offer {
  _id: string;
  code: string;
  description?: string;
  type: 'flat' | 'percent';
  value: number;
  maxDiscount?: number;
  minOrderValue?: number;
}

const PAYMENT_METHODS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'upi', label: 'UPI', icon: 'phone-portrait-outline' },
  { key: 'card', label: 'Card', icon: 'card-outline' },
  { key: 'cod', label: 'Cash on Delivery', icon: 'cash-outline' },
];

export default function Checkout() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const cart = useCart();

  const [addresses, setAddresses] = useState<Address[]>(user?.addresses ?? []);
  const [selectedAddr, setSelectedAddr] = useState<Address | null>(
    user?.addresses?.find((a) => a.isDefault) ?? user?.addresses?.[0] ?? null
  );
  const [instructions, setInstructions] = useState('');
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [method, setMethod] = useState('upi');
  const [bill, setBill] = useState<Bill | null>(null);
  const [placing, setPlacing] = useState(false);
  // Remember an already-created order so a payment retry pays the SAME order
  // instead of creating a duplicate (PRD NFR-REL-01).
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const items = useMemo(
    () =>
      cart.lines.map((l) => ({
        menuItemId: l.menuItemId,
        quantity: l.quantity,
        options: l.options.map((o) => ({ groupName: o.groupName, label: o.label })),
      })),
    [cart.lines]
  );

  const fetchQuote = useCallback(
    async (couponCode?: string) => {
      if (!cart.restaurantId || items.length === 0) return;
      try {
        const res = await api.post<{ bill: Bill; coupon?: { code: string } }>('/orders/quote', {
          restaurantId: cart.restaurantId,
          items,
          couponCode,
        });
        setBill(res.data.bill);
        setAppliedCoupon(res.data.coupon?.code);
      } catch (e) {
        setAppliedCoupon(undefined);
        if (couponCode) Alert.alert('Coupon', e instanceof Error ? e.message : 'Invalid coupon');
        // still try without coupon
        if (couponCode) fetchQuote();
      }
    },
    [cart.restaurantId, items]
  );

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // If the order inputs change, any half-created order is stale — create a fresh one next time.
  useEffect(() => {
    setPendingOrderId(null);
  }, [items, method, selectedAddr, instructions, appliedCoupon]);

  // Show available offers so they're visible & one-tap applicable (PRD FR-OFF-01).
  useEffect(() => {
    if (!cart.restaurantId) return;
    api
      .get<Offer[]>(`/coupons?restaurantId=${cart.restaurantId}`, { auth: false })
      .then((res) => setOffers(res.data))
      .catch(() => setOffers([]));
  }, [cart.restaurantId]);

  const applyOffer = (code: string) => {
    setCoupon(code);
    fetchQuote(code);
  };

  const offerLabel = (o: Offer) =>
    o.type === 'flat' ? `₹${o.value} OFF` : `${o.value}% OFF${o.maxDiscount ? ` up to ₹${o.maxDiscount}` : ''}`;

  // Add a quick demo address if the user has none.
  const addQuickAddress = async () => {
    try {
      const res = await api.post<Address[]>('/users/me/addresses', {
        label: 'Home',
        line: '244 Oakwood Ave',
        city: 'Bengaluru',
        pincode: '560001',
        lat: 12.9716,
        lng: 77.5946,
        isDefault: true,
      });
      setAddresses(res.data);
      setSelectedAddr(res.data.find((a) => a.isDefault) ?? res.data[0]);
    } catch {
      Alert.alert('Could not add address');
    }
  };

  const placeOrder = async () => {
    if (!selectedAddr) {
      Alert.alert('Add a delivery address first');
      return;
    }
    setPlacing(true);
    try {
      // Reuse an order from a previous failed attempt so we never create a duplicate.
      let orderId = pendingOrderId;
      if (!orderId) {
        const createRes = await api.post<Order>('/orders', {
          restaurantId: cart.restaurantId,
          items,
          couponCode: appliedCoupon,
          paymentMethod: method,
          address: { ...selectedAddr, instructions },
        });
        orderId = createRes.data._id;
        setPendingOrderId(orderId);
      }

      if (method !== 'cod') {
        // Mock payment (PRD FR-PAY-01/03). Stable idempotency key => a retry of the same
        // order pays once, never twice (NFR-REL-01).
        await api.post(`/orders/${orderId}/pay`, {
          idempotencyKey: `${orderId}-${method}`,
        });
      }

      cart.clear();
      router.replace(`/order/${orderId}`);
    } catch (e) {
      Alert.alert('Order failed', e instanceof Error ? e.message : 'Try again');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Address */}
        <Text style={styles.section}>Delivery address</Text>
        {addresses.length === 0 ? (
          <TouchableOpacity style={styles.addCard} onPress={addQuickAddress}>
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            <Text style={{ marginLeft: 8, color: colors.primaryDark, fontWeight: '600' }}>Add a delivery address</Text>
          </TouchableOpacity>
        ) : (
          addresses.map((a) => (
            <TouchableOpacity
              key={a._id ?? a.line}
              style={[styles.addrCard, selectedAddr?._id === a._id && styles.addrActive]}
              onPress={() => setSelectedAddr(a)}
            >
              <Ionicons
                name={selectedAddr?._id === a._id ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={colors.primary}
              />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={{ fontWeight: '700' }}>{a.label ?? 'Address'}</Text>
                <Text style={{ color: colors.muted, fontSize: 13 }}>
                  {a.line}, {a.city} {a.pincode}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <TextInput
          style={styles.input}
          placeholder="Instructions for rider (optional)"
          value={instructions}
          onChangeText={setInstructions}
        />

        {/* Coupon */}
        <Text style={styles.section}>Offers</Text>
        {offers.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 10 }}>
            {offers.map((o) => {
              const active = appliedCoupon === o.code;
              return (
                <TouchableOpacity key={o._id} style={[styles.offerCard, active && styles.offerActive]} onPress={() => applyOffer(o.code)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Ionicons name="pricetag" size={14} color={active ? '#fff' : colors.primary} />
                    <Text style={[styles.offerAmount, active && { color: '#fff' }]}>{offerLabel(o)}</Text>
                  </View>
                  <Text style={[styles.offerCode, active && { color: '#fff' }]}>{o.code}</Text>
                  {o.minOrderValue ? (
                    <Text style={[styles.offerMin, active && { color: '#ffe' }]}>Min ₹{o.minOrderValue}</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Coupon code (try WELCOME50)"
            autoCapitalize="characters"
            value={coupon}
            onChangeText={setCoupon}
          />
          <Button title={appliedCoupon ? 'Applied' : 'Apply'} variant="accent" onPress={() => fetchQuote(coupon)} />
        </View>

        {/* Payment */}
        <Text style={styles.section}>Payment method</Text>
        {PAYMENT_METHODS.map((m) => (
          <TouchableOpacity key={m.key} style={styles.payRow} onPress={() => setMethod(m.key)}>
            <Ionicons name={m.icon} size={20} color={colors.primaryDark} />
            <Text style={{ flex: 1, marginLeft: 12, fontWeight: '600' }}>{m.label}</Text>
            <Ionicons name={method === m.key ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} />
          </TouchableOpacity>
        ))}

        {/* Bill */}
        <Text style={styles.section}>Bill details</Text>
        <View style={styles.bill}>
          <BillRow label="Item total" value={inr(bill?.itemTotal)} />
          <BillRow label="Packaging" value={inr(bill?.packagingFee)} />
          <BillRow label="Delivery fee" value={inr(bill?.deliveryFee)} />
          <BillRow label="Taxes" value={inr(bill?.tax)} />
          {bill && bill.discount > 0 && <BillRow label={`Discount (${appliedCoupon})`} value={`- ${inr(bill.discount)}`} discount />}
          <View style={styles.totalRow}>
            <Text style={{ fontWeight: '800', fontSize: 16 }}>To pay</Text>
            <Text style={{ fontWeight: '800', fontSize: 16 }}>{inr(bill?.grandTotal)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Total</Text>
          <Text style={{ fontSize: 20, fontWeight: '800' }}>{inr(bill?.grandTotal)}</Text>
        </View>
        <Button
          title={method === 'cod' ? 'Place Order' : 'Pay & Place Order'}
          onPress={placeOrder}
          loading={placing}
          style={{ flex: 1, marginLeft: 16 }}
        />
      </View>
    </View>
  );
}

function BillRow({ label, value, discount }: { label: string; value: string; discount?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ color: colors.muted }}>{label}</Text>
      <Text style={{ color: discount ? colors.success : colors.text }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 15, fontWeight: '800', marginTop: 20, marginBottom: 10 },
  addCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  addrCard: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  addrActive: { borderColor: colors.primary, backgroundColor: colors.primaryContainer },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 13, marginTop: 12 },
  payRow: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  bill: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border },
  offerCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed', paddingVertical: 10, paddingHorizontal: 14, minWidth: 130 },
  offerActive: { backgroundColor: colors.primary, borderColor: colors.primary, borderStyle: 'solid' },
  offerAmount: { fontWeight: '800', color: colors.primaryDark, fontSize: 13 },
  offerCode: { fontWeight: '700', color: colors.text, marginTop: 4, letterSpacing: 0.5 },
  offerMin: { color: colors.muted, fontSize: 11, marginTop: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 10 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
});
