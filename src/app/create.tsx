import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { ItemForm } from '../forms/ItemForm.tsx';
import { variant } from '../lib/variant.ts';
export default function CreateScreen() {
  if (!variant) return <View style={{ padding: 24 }}><Text>Сначала выберите свой вариант через npm run variant и перезапустите сервер.</Text></View>;
  return <><Stack.Screen options={{ title: 'Сообщить о находке' }} /><ItemForm config={variant} /></>;
}
