import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/store/auth';
import { colors, radius } from '../../src/theme';
import { Button } from '../../src/components/ui';

export default function RiderProfile() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const rider = user?.rider;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="bicycle" size={30} color={colors.primaryDark} />
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={{ color: colors.muted }}>{user?.phone}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Stat label="Rating" value={`${rider?.rating ?? 5}★`} />
          <Stat label="Trips" value={String(rider?.totalTrips ?? 0)} />
          <Stat label="Vehicle" value={rider?.vehicle ?? '—'} />
        </View>

        <View style={styles.card}>
          <Row icon="document-text-outline" label="Trip history" />
          <Row icon="cash-outline" label="Payout details" />
          <Row icon="help-circle-outline" label="Support" last />
        </View>

        <Button title="Log out" variant="ghost" onPress={logout} style={{ marginTop: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={{ fontSize: 18, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function Row({ icon, label, last }: { icon: keyof typeof Ionicons.glyphMap; label: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Ionicons name={icon} size={20} color={colors.primaryDark} />
      <Text style={{ flex: 1, marginLeft: 14, fontWeight: '500' }}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 22, fontWeight: '800', marginTop: 12 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginTop: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
});
