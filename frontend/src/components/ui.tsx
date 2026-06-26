import { ReactNode } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, radius } from '../theme';

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'ghost' | 'success' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const bg: Record<string, string> = {
    primary: colors.primaryDark,
    accent: colors.primary,
    success: colors.success,
    danger: colors.danger,
    ghost: colors.surface,
  };
  const fg = variant === 'ghost' ? colors.text : '#fff';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.btn,
        { backgroundColor: bg[variant], borderWidth: variant === 'ghost' ? 1 : 0, borderColor: colors.border },
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.btnText, { color: fg }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'warn' | 'danger' | 'info' }) {
  const map: Record<string, { bg: string; fg: string }> = {
    neutral: { bg: '#e5e7eb', fg: '#374151' },
    success: { bg: colors.successBg, fg: colors.success },
    warn: { bg: colors.warnBg, fg: colors.warnText },
    danger: { bg: colors.dangerBg, fg: colors.danger },
    info: { bg: '#e0e7ff', fg: '#4338ca' },
  };
  const c = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={{ color: c.fg, fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export function VegDot({ veg }: { veg: boolean }) {
  const color = veg ? colors.veg : colors.nonVeg;
  return (
    <View style={[styles.vegBox, { borderColor: color }]}>
      <View style={[styles.vegDot, { backgroundColor: color }]} />
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>{children}</View>;
}

export function Row({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

export function Muted({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[{ color: colors.muted }, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontWeight: '700', fontSize: 15 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  vegBox: { width: 16, height: 16, borderWidth: 1.5, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  vegDot: { width: 8, height: 8, borderRadius: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
