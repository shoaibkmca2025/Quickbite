import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../src/store/cart';
import { colors, radius } from '../src/theme';
import { Button, VegDot } from '../src/components/ui';
import { inr } from '../src/format';

export default function Cart() {
  const router = useRouter();
  const cart = useCart();

  if (cart.lines.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="cart-outline" size={64} color={colors.muted} />
        <Text style={{ color: colors.muted, marginTop: 12, fontSize: 16 }}>Your cart is empty</Text>
        <Button title="Browse restaurants" onPress={() => router.replace('/(customer)/home')} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Text style={styles.restaurant}>{cart.restaurantName}</Text>

        {cart.lines.map((l) => {
          const lineTotal = (l.price + l.options.reduce((a, o) => a + o.priceDelta, 0)) * l.quantity;
          return (
            <View key={l.key} style={styles.line}>
              <VegDot veg={l.isVeg} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: '700' }}>{l.name}</Text>
                {l.options.length > 0 && (
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{l.options.map((o) => o.label).join(', ')}</Text>
                )}
                <Text style={{ marginTop: 2 }}>{inr(lineTotal)}</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity onPress={() => cart.dec(l.key)} style={styles.stepBtn}>
                  <Ionicons name="remove" size={18} color={colors.primaryDark} />
                </TouchableOpacity>
                <Text style={{ fontWeight: '700', minWidth: 22, textAlign: 'center' }}>{l.quantity}</Text>
                <TouchableOpacity onPress={() => cart.inc(l.key)} style={styles.stepBtn}>
                  <Ionicons name="add" size={18} color={colors.primaryDark} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <TouchableOpacity onPress={cart.clear} style={{ marginTop: 16, alignSelf: 'center' }}>
          <Text style={{ color: colors.danger }}>Clear cart</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Subtotal</Text>
          <Text style={{ fontSize: 20, fontWeight: '800' }}>{inr(cart.subtotal())}</Text>
        </View>
        <Button title="Proceed to Checkout" onPress={() => router.push('/checkout')} style={{ flex: 1, marginLeft: 16 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  restaurant: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  line: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: radius.sm, backgroundColor: colors.primaryContainer },
  stepBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
});
