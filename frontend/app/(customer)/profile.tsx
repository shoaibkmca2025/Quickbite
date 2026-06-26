import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/store/auth';
import { colors, radius } from '../../src/theme';
import { Button } from '../../src/components/ui';

export default function Profile() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  const rows: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { icon: 'location-outline', label: 'Saved addresses' },
    { icon: 'card-outline', label: 'Payment methods' },
    { icon: 'pricetag-outline', label: 'Offers & coupons' },
    { icon: 'notifications-outline', label: 'Notifications' },
    { icon: 'help-circle-outline', label: 'Help & support' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.primaryDark }}>
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={{ color: colors.muted }}>{user?.phone ?? user?.email}</Text>
        </View>

        <View style={styles.card}>
          {rows.map((r, i) => (
            <TouchableOpacity key={r.label} style={[styles.row, i < rows.length - 1 && styles.rowBorder]}>
              <Ionicons name={r.icon} size={20} color={colors.primaryDark} />
              <Text style={{ flex: 1, marginLeft: 14, fontWeight: '500' }}>{r.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Log out" variant="ghost" onPress={logout} style={{ marginTop: 24 }} />
        <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 20, fontSize: 12 }}>QuickBite v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 22, fontWeight: '800', marginTop: 12 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
});
