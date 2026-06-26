import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { api } from '../../src/api';
import { useAuth } from '../../src/store/auth';
import { useCart } from '../../src/store/cart';
import { colors, radius } from '../../src/theme';
import { Badge, VegDot } from '../../src/components/ui';
import type { Restaurant } from '../../src/types';

function FilterChip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon ? <Ionicons name={icon} size={13} color={active ? '#fff' : colors.muted} /> : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function Home() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const itemCount = useCart((s) => s.itemCount());
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locLabel, setLocLabel] = useState('Bengaluru');

  // Discovery filters & sort (PRD FR-DISC-04)
  type Sort = 'relevance' | 'rating' | 'deliveryTime' | 'cost';
  const [sort, setSort] = useState<Sort>('relevance');
  const [pureVeg, setPureVeg] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [cuisineOptions, setCuisineOptions] = useState<string[]>([]);
  const toggleSort = (value: Sort) => setSort((prev) => (prev === value ? 'relevance' : value));

  const defaultAddr = user?.addresses?.find((a) => a.isDefault) ?? user?.addresses?.[0];

  const resolveLocation = useCallback(async () => {
    if (defaultAddr?.lat && defaultAddr?.lng) {
      setCoords({ lat: defaultAddr.lat, lng: defaultAddr.lng });
      setLocLabel(defaultAddr.label ?? defaultAddr.city);
      return;
    }
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLabel('Current location');
      }
    } catch {
      /* fall back to city listing */
    }
  }, [defaultAddr]);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (coords) {
        params.set('lat', String(coords.lat));
        params.set('lng', String(coords.lng));
      } else {
        params.set('city', 'Bengaluru');
      }
      if (query) params.set('q', query);
      if (cuisine) params.set('cuisine', cuisine);
      if (pureVeg) params.set('veg', 'true');
      if (topRated) params.set('minRating', '4');
      if (sort !== 'relevance') params.set('sort', sort);
      const res = await api.get<Restaurant[]>(`/restaurants?${params.toString()}`, { auth: false });
      setRestaurants(res.data);
      // Keep cuisine chips stable: only refresh the option list from an unfiltered-by-cuisine result.
      if (!cuisine) {
        const seen = new Set<string>();
        res.data.forEach((r) => r.cuisines.forEach((c) => seen.add(c)));
        setCuisineOptions(Array.from(seen).slice(0, 12));
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [coords, query, cuisine, pureVeg, topRated, sort]);

  useEffect(() => {
    resolveLocation();
  }, [resolveLocation]);

  useEffect(() => {
    const t = setTimeout(load, query ? 300 : 0); // debounce search
    return () => clearTimeout(t);
  }, [load, query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.delivLabel}>DELIVER TO</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={styles.location}>{locLabel}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.text} />
          </View>
        </View>
        <View style={styles.avatar}>
          <Text style={{ fontWeight: '700', color: colors.primaryDark }}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants or dishes"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters & sort (PRD FR-DISC-04) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
      >
        <FilterChip label="Top rated" icon="star" active={sort === 'rating'} onPress={() => toggleSort('rating')} />
        <FilterChip label="Fastest" icon="time" active={sort === 'deliveryTime'} onPress={() => toggleSort('deliveryTime')} />
        <FilterChip label="Cost: low" icon="cash" active={sort === 'cost'} onPress={() => toggleSort('cost')} />
        <FilterChip label="Pure veg" active={pureVeg} onPress={() => setPureVeg((v) => !v)} />
        <FilterChip label="4.0+" active={topRated} onPress={() => setTopRated((v) => !v)} />
        {cuisineOptions.map((c) => (
          <FilterChip key={c} label={c} active={cuisine === c} onPress={() => setCuisine((cur) => (cur === c ? null : c))} />
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(r) => r._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 40 }}>
              No restaurants found here. Try seeding the backend or changing your search.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => router.push(`/restaurant/${item._id}`)}
            >
              <Image
                source={{ uri: item.image ?? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' }}
                style={styles.cardImg}
              />
              <View style={{ padding: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={styles.rating}>
                    <Ionicons name="star" size={12} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}> {item.rating}</Text>
                  </View>
                </View>
                <Text style={{ color: colors.muted, fontSize: 13 }} numberOfLines={1}>
                  {item.cuisines.join(' • ')}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <Badge label={`${item.avgPrepTimeMins + 20} min`} tone="info" />
                  {item.priceForTwo ? <Badge label={`₹${item.priceForTwo} for two`} /> : null}
                  {!item.isOpen ? <Badge label="Closed" tone="danger" /> : null}
                </View>
                {item.matchedDishes && item.matchedDishes.length > 0 ? (
                  <View style={styles.dishMatch}>
                    <Ionicons name="restaurant" size={12} color={colors.primary} />
                    <Text style={styles.dishMatchText} numberOfLines={1}>
                      {item.matchedDishes.join(', ')}
                    </Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating cart bar */}
      {itemCount > 0 && (
        <TouchableOpacity style={styles.cartBar} onPress={() => router.push('/cart')} activeOpacity={0.9}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <VegDot veg />
            <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 8 }}>
              {itemCount} item{itemCount > 1 ? 's' : ''} in cart
            </Text>
          </View>
          <Text style={{ color: '#fff', fontWeight: '700' }}>View Cart →</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 },
  delivLabel: { fontSize: 11, color: colors.primary, fontWeight: '700', letterSpacing: 0.5 },
  location: { fontSize: 18, fontWeight: '800', color: colors.text, marginLeft: 2, marginRight: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 12, marginLeft: 8, fontSize: 15 },
  filterBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 2, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  chipTextActive: { color: '#fff' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  cardImg: { width: '100%', height: 150, backgroundColor: '#eee' },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.text, flex: 1 },
  dishMatch: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, backgroundColor: colors.primaryContainer, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  dishMatchText: { color: colors.primaryDark, fontSize: 12, fontWeight: '600', flexShrink: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.success, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  cartBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
