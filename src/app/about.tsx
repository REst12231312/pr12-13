import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getHealth, messageOf } from '../api/client.ts';
import { colors } from '../components/theme.ts';
import { variant } from '../lib/variant.ts';

export default function AboutScreen() {
  const [server, setServer] = useState('проверяем…');

  useEffect(() => {
    getHealth()
      .then((health) => setServer(`хранилище: ${health.store === 'mongodb' ? 'MongoDB' : 'память сервера'}, находок: ${health.items}`))
      .catch((error) => setServer(messageOf(error)));
  }, []);

  return <View style={styles.box}>
    <Stack.Screen options={{ title: 'О проекте' }} />
    <Text style={styles.line}>Вариант: {variant ? `${variant.number}, ${variant.place}` : 'не выбран (npm run variant)'}</Text>
    <Text style={styles.line}>Категории: {variant?.categories.map((category) => category.label).join(', ') ?? 'нет'}</Text>
    <Text style={styles.line}>Сервер: {server}</Text>
  </View>;
}

const styles = StyleSheet.create({
  box: { margin: 12, padding: 16, gap: 10, backgroundColor: '#fff', borderRadius: 10, borderColor: colors.line, borderWidth: 1 },
  line: { color: colors.ink, fontSize: 16 },
});
