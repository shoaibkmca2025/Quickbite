import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../src/store/auth';
import { colors } from '../src/theme';

function useProtectedRoute() {
  const { user, bootstrapping } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (bootstrapping) return;
    const group = segments[0]; // 'login' | '(customer)' | '(rider)' | undefined
    const inAuth = group === 'login' || group === undefined;

    if (!user) {
      if (group !== 'login') router.replace('/login');
      return;
    }

    // Logged in — route to the correct stack for the role.
    const target = user.role === 'rider' ? '/(rider)/deliveries' : '/(customer)/home';
    if (inAuth) router.replace(target);
    if (user.role === 'rider' && group === '(customer)') router.replace('/(rider)/deliveries');
    if (user.role !== 'rider' && group === '(rider)') router.replace('/(customer)/home');
  }, [user, bootstrapping, segments, router]);
}

export default function RootLayout() {
  const bootstrap = useAuth((s) => s.bootstrap);
  const bootstrapping = useAuth((s) => s.bootstrapping);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useProtectedRoute();

  if (bootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(customer)" />
        <Stack.Screen name="(rider)" />
        <Stack.Screen name="restaurant/[id]" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="cart" options={{ headerShown: true, title: 'Your Cart', presentation: 'modal' }} />
        <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
        <Stack.Screen name="order/[id]" options={{ headerShown: true, title: 'Track Order' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
