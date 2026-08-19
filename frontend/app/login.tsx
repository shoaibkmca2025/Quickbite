import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/store/auth';
import { Button } from '../src/components/ui';
import { colors, radius } from '../src/theme';
import type { Role } from '../src/types';

type Mode = 'password' | 'otp';

export default function Login() {
  const { login, requestOtp, verifyOtp } = useAuth();
  const [mode, setMode] = useState<Mode>('password');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [role, setRole] = useState<Role>('customer');
  const [email, setEmail] = useState('user@quickbite.test');
  const [password, setPassword] = useState('user123');
  const [phone, setPhone] = useState('9000000001');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  // Switching the role chips swaps the prefilled demo account too, so sign-in works on a
  // fresh install without typing anything.
  const pickRole = (r: Role) => {
    setRole(r);
    if (r === 'rider') {
      setEmail('rider@quickbite.test');
      setPassword('rider123');
      setPhone('9000000003');
    } else {
      setEmail('user@quickbite.test');
      setPassword('user123');
      setPhone('9000000001');
    }
  };

  const signIn = async () => {
    if (!email.includes('@') || password.length < 6) {
      Alert.alert('Check your details', 'Enter a valid email and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      await login(email, password);
      // Root layout redirects based on role.
    } catch (e) {
      Alert.alert('Sign in failed', e instanceof Error ? e.message : 'Try again');
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = async () => {
    if (phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Invalid number', 'Enter a valid 10-digit phone number.');
      return;
    }
    setBusy(true);
    try {
      const res = await requestOtp(phone);
      setDevCode(res.devCode);
      if (res.devCode) setCode(res.devCode); // auto-fill in dev
      setStep('otp');
    } catch (e) {
      Alert.alert('Could not send OTP', e instanceof Error ? e.message : 'Try again');
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      await verifyOtp(phone, code, name || undefined, role);
      // Root layout redirects based on role.
    } catch (e) {
      Alert.alert('Verification failed', e instanceof Error ? e.message : 'Try again');
    } finally {
      setBusy(false);
    }
  };

  const subtitle =
    mode === 'otp' && step === 'otp' ? `Enter the code sent to ${phone}` : 'Order food, fast.';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.logo}>
            <Text style={{ fontSize: 34 }}>🍴</Text>
          </View>
          <Text style={styles.title}>QuickBite</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.roleRow}>
            {(['customer', 'rider'] as Role[]).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => pickRole(r)}
                style={[styles.roleChip, role === r && styles.roleChipActive]}
              >
                <Text style={[styles.roleText, role === r && { color: '#fff' }]}>
                  {r === 'customer' ? 'I am hungry' : 'I am a rider'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tabRow}>
            {(['password', 'otp'] as Mode[]).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => {
                  setMode(m);
                  setStep('phone');
                }}
                style={[styles.tab, mode === m && styles.tabActive]}
              >
                <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                  {m === 'password' ? 'Email & password' : 'Phone OTP'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode === 'password' ? (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="you@example.com"
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                placeholder="Your password"
              />
              <Button title="Sign in" onPress={signIn} loading={busy} style={{ marginTop: 18 }} />
            </>
          ) : step === 'phone' ? (
            <>
              <Text style={styles.label}>Phone number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="10-digit mobile number"
                maxLength={15}
              />
              <Text style={styles.label}>Name (optional, for new accounts)</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" />

              <Button title="Send OTP" onPress={sendOtp} loading={busy} style={{ marginTop: 18 }} />
            </>
          ) : (
            <>
              <Text style={styles.label}>6-digit OTP</Text>
              <TextInput
                style={[styles.input, { fontSize: 24, letterSpacing: 8, textAlign: 'center' }]}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="······"
              />
              {devCode && <Text style={styles.devHint}>Dev mode — your OTP is {devCode}</Text>}
              <Button title="Verify & Continue" onPress={confirm} loading={busy} style={{ marginTop: 18 }} />
              <TouchableOpacity onPress={() => setStep('phone')} style={{ marginTop: 14, alignItems: 'center' }}>
                <Text style={{ color: colors.muted }}>Change number</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.hint}>
            {mode === 'password'
              ? 'Demo — customer: user@quickbite.test / user123 · rider: rider@quickbite.test / rider123'
              : 'Demo numbers — customer: 9000000001 · rider: 9000000003'}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 30, fontWeight: '800', color: colors.primaryDark, textAlign: 'center' },
  subtitle: { color: colors.muted, textAlign: 'center', marginTop: 6, marginBottom: 26 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  roleChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  roleChipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  roleText: { fontWeight: '700', color: colors.text },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: radius.sm, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primaryContainer },
  tabText: { fontWeight: '600', color: colors.muted, fontSize: 13 },
  tabTextActive: { color: colors.onPrimaryContainer },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  devHint: { color: colors.onPrimaryContainer, textAlign: 'center', marginTop: 10, fontWeight: '600' },
  hint: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 28 },
});
