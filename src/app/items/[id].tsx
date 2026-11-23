import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ItemDetails } from '../../components/ItemDetails.tsx';
import { useItem } from '../../hooks/useItem.ts';

export default function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, retry } = useItem(id);
  return <>
    <Stack.Screen options={{ title: id }} />
    <ItemDetails state={state} onRetry={retry} onBack={() => router.back()} />
  </>;
}
