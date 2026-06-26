import { Redirect } from 'expo-router';
import { useAuth } from '../src/store/auth';

export default function Index() {
  const user = useAuth((s) => s.user);
  if (!user) return <Redirect href="/login" />;
  return <Redirect href={user.role === 'rider' ? '/(rider)/deliveries' : '/(customer)/home'} />;
}
