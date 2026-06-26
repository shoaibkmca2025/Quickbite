import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api';
import { useCart } from '../../src/store/cart';
import { colors, radius } from '../../src/theme';
import { Button, VegDot } from '../../src/components/ui';
import { inr } from '../../src/format';
import type { MenuItem, Restaurant } from '../../src/types';

interface Detail {
  restaurant: Restaurant & { address?: string };
  categories: Record<string, MenuItem[]>;
}

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const cart = useCart();
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [optionItem, setOptionItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    api
      .get<Detail>(`/restaurants/${id}`, { auth: false })
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = (item: MenuItem, options: { groupName: string; label: string; priceDelta: number }[] = []) => {
    if (!data) return;
    cart.add(data.restaurant._id, data.restaurant.name, item, options);
  };

  const onAdd = (item: MenuItem) => {
    if (item.optionGroups && item.optionGroups.length > 0) setOptionItem(item);
    else addToCart(item);
  };

  if (loading) return <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />;
  if (!data) return <Text style={{ padding: 20 }}>Restaurant not found.</Text>;

  const { restaurant, categories } = data;
  const itemCount = cart.itemCount();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ title: restaurant.name }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <Image
          source={{ uri: restaurant.image ?? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900' }}
          style={styles.hero}
        />
        <View style={styles.headerCard}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={{ color: colors.muted, marginTop: 2 }}>{restaurant.cuisines.join(' • ')}</Text>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
            <Stat icon="star" text={`${restaurant.rating} (${restaurant.ratingCount})`} />
            <Stat icon="time-outline" text={`${restaurant.avgPrepTimeMins + 20} min`} />
            {restaurant.minOrderValue > 0 && <Stat icon="cart-outline" text={`Min ${inr(restaurant.minOrderValue)}`} />}
          </View>
        </View>

        {Object.entries(categories).map(([cat, items]) => (
          <View key={cat} style={{ marginTop: 8 }}>
            <Text style={styles.catTitle}>{cat}</Text>
            {items.map((item) => (
              <View key={item._id} style={styles.itemRow}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <VegDot veg={item.isVeg} />
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{inr(item.price)}</Text>
                  {!!item.description && (
                    <Text style={styles.itemDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'center' }}>
                  {item.image && <Image source={{ uri: item.image }} style={styles.itemImg} />}
                  <TouchableOpacity
                    disabled={!item.available}
                    onPress={() => onAdd(item)}
                    style={[styles.addBtn, !item.available && { opacity: 0.4 }]}
                  >
                    <Text style={styles.addText}>{item.available ? 'ADD +' : 'SOLD OUT'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {itemCount > 0 && (
        <TouchableOpacity style={styles.cartBar} onPress={() => router.push('/cart')} activeOpacity={0.9}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>
            {itemCount} item{itemCount > 1 ? 's' : ''} • {inr(cart.subtotal())}
          </Text>
          <Text style={{ color: '#fff', fontWeight: '700' }}>View Cart →</Text>
        </TouchableOpacity>
      )}

      {optionItem && (
        <OptionsModal
          item={optionItem}
          onClose={() => setOptionItem(null)}
          onConfirm={(opts) => {
            addToCart(optionItem, opts);
            setOptionItem(null);
          }}
        />
      )}
    </View>
  );
}

function Stat({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={15} color={colors.primary} />
      <Text style={{ fontSize: 13, fontWeight: '600' }}>{text}</Text>
    </View>
  );
}

function OptionsModal({
  item,
  onClose,
  onConfirm,
}: {
  item: MenuItem;
  onClose: () => void;
  onConfirm: (opts: { groupName: string; label: string; priceDelta: number }[]) => void;
}) {
  // selected[groupName] = Set of labels
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  const toggle = (group: MenuItem['optionGroups'][number], label: string) => {
    setSelected((prev) => {
      const cur = prev[group.name] ?? [];
      if (group.multi) {
        return { ...prev, [group.name]: cur.includes(label) ? cur.filter((l) => l !== label) : [...cur, label] };
      }
      return { ...prev, [group.name]: [label] };
    });
  };

  const flat = item.optionGroups.flatMap((g) =>
    (selected[g.name] ?? []).map((label) => {
      const choice = g.choices.find((c) => c.label === label)!;
      return { groupName: g.name, label, priceDelta: choice.priceDelta };
    })
  );
  const extra = flat.reduce((s, o) => s + o.priceDelta, 0);
  const missingRequired = item.optionGroups.some((g) => g.required && !(selected[g.name]?.length));

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet}>
          <Text style={styles.name}>{item.name}</Text>
          <ScrollView style={{ maxHeight: 360 }}>
            {item.optionGroups.map((g) => (
              <View key={g.name} style={{ marginTop: 16 }}>
                <Text style={{ fontWeight: '700' }}>
                  {g.name} {g.required ? <Text style={{ color: colors.danger }}>*</Text> : null}
                </Text>
                {g.choices.map((c) => {
                  const on = (selected[g.name] ?? []).includes(c.label);
                  return (
                    <TouchableOpacity key={c.label} style={styles.choice} onPress={() => toggle(g, c.label)}>
                      <Ionicons
                        name={on ? (g.multi ? 'checkbox' : 'radio-button-on') : g.multi ? 'square-outline' : 'radio-button-off'}
                        size={20}
                        color={on ? colors.primary : colors.muted}
                      />
                      <Text style={{ flex: 1, marginLeft: 10 }}>{c.label}</Text>
                      {c.priceDelta > 0 && <Text style={{ color: colors.muted }}>+{inr(c.priceDelta)}</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
          <Button
            title={`Add • ${inr(item.price + extra)}`}
            onPress={() => onConfirm(flat)}
            disabled={missingRequired}
            style={{ marginTop: 18 }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 180, backgroundColor: '#eee' },
  headerCard: { backgroundColor: colors.surface, margin: 16, marginTop: -34, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border },
  name: { fontSize: 22, fontWeight: '800', color: colors.text },
  catTitle: { fontSize: 18, fontWeight: '800', paddingHorizontal: 16, marginTop: 16, marginBottom: 4 },
  itemRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  itemName: { fontSize: 16, fontWeight: '700', marginTop: 6, color: colors.text },
  itemPrice: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  itemDesc: { color: colors.muted, fontSize: 13, marginTop: 4 },
  itemImg: { width: 96, height: 80, borderRadius: radius.md, marginBottom: 8, backgroundColor: '#eee' },
  addBtn: { borderWidth: 1, borderColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: 18, paddingVertical: 8, backgroundColor: colors.primaryContainer },
  addText: { color: colors.onPrimaryContainer, fontWeight: '800', fontSize: 13 },
  cartBar: {
    position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: colors.primaryDark,
    borderRadius: radius.md, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20 },
  choice: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
});
