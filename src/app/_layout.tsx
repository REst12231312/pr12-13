import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { variant } from '../lib/variant.ts';

export default function Layout() {
  return <SafeAreaProvider>
    <Stack screenOptions={{ title: variant ? `Бюро находок: ${variant.place}` : 'Бюро находок', contentStyle: { backgroundColor: '#f6f7fb' } }} />
  </SafeAreaProvider>;
}
