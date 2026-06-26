import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api';
import { colors, radius } from '../../src/theme';
import { inr, timeAgo } from '../../src/format';

interface Earnings {
  totalTrips: number;
  totalEarning: number;
  todayTrips: number;
  todayEarning: number;
  trips: { code: string; at?: string; restaurant?: string; earning: number }[];
}

export default function RiderEarnings() {
  const [data, setData] = useState<Earnings | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get<Earnings>('/rider/earnings');
      setData(res.data);
    } catch {
      /* ignore */
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Text style={styles.h1}>Earnings</Text>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <View style={styles.hero}>
          <Text style={{ color: '#ffe', opacity: 0.9 }}>TODAY'S EARNINGS</Text>
          <Text style={styles.heroAmount}>{inr(data?.todayEarning)}</Text>
          <Text style={{ color: '#ffe', opacity: 0.9 }}>{data?.todayTrips ?? 0} trips today</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
          <Stat label="Lifetime earnings" value={inr(data?.totalEarning)} icon="wallet-outline" />
          <Stat label="Total trips" value={String(data?.totalTrips ?? 0)} icon="bicycle-outline" />
        </View>

        <Text style={styles.section}>Recent trips</Text>
        {(data?.trips ?? []).length === 0 && <Text style={{ color: colors.muted }}>No completed trips yet.</Text>}
        {(data?.trips ?? []).map((t, i) => (
          <View key={`${t.code}-${i}`} style={styles.tripRow}>
            <View style={styles.tripIcon}>
              <Ionicons name="checkmark-done" size={18} color={colors.success} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '700' }}>#{t.code}</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>{t.restaurant} • {timeAgo(t.at)}</Text>
            </View>
            <Text style={{ fontWeight: '800', color: colors.success }}>+{inr(t.earning)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={{ fontSize: 20, fontWeight: '800', marginTop: 6 }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: '800', paddingHorizontal: 16, paddingTop: 8 },
  hero: { backgroundColor: colors.primaryDark, borderRadius: radius.lg, padding: 20 },
  heroAmount: { color: '#fff', fontSize: 36, fontWeight: '800', marginVertical: 4 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border },
  section: { fontSize: 16, fontWeight: '800', marginTop: 22, marginBottom: 10 },
  tripRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  tripIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center' },
});
