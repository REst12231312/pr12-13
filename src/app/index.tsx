import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { CategoryFilter } from '../components/CategoryFilter.tsx';
import { ItemsView } from '../components/ItemsView.tsx';
import { TodoNote } from '../components/TodoNote.tsx';
import { colors } from '../components/theme.ts';
import { useItems } from '../hooks/useItems.ts';
import { variant } from '../lib/variant.ts';

export default function ListScreen() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const { state, retry, todo } = useItems({ q: q.trim(), category });

  useFocusEffect(useCallback(() => { retry(); }, [retry]));

  return <View style={styles.screen}>
    <Link href="/create" style={styles.create} accessibilityRole="link">Сообщить о находке</Link>
    <TextInput style={styles.search} value={q} onChangeText={setQ} placeholder="Поиск по названию и описанию"
      accessibilityLabel="Поиск" autoCorrect={false} />
    <CategoryFilter categories={variant?.categories ?? []} value={category} onChange={setCategory} />
    {todo && <TodoNote code={todo} />}
    <ItemsView state={state} filtered={Boolean(q.trim() || category)} onRetry={retry}
      onOpen={(id) => router.push({ pathname: '/items/[id]', params: { id } })} />
    <Link href="/about" style={styles.link}>О проекте и сервере</Link>
  </View>;
}

const styles = StyleSheet.create({
  create: { marginHorizontal: 12, padding: 14, backgroundColor: '#30448c', color: '#fff', textAlign: 'center', borderRadius: 8, fontSize: 17, fontWeight: '600' },
  screen: { flex: 1, paddingTop: 12, gap: 10 },
  search: { marginHorizontal: 12, borderColor: colors.line, borderWidth: 1, borderRadius: 8, minHeight: 44, paddingHorizontal: 12, fontSize: 16, backgroundColor: '#fff', color: colors.ink },
  link: { color: colors.accent, fontSize: 16, textAlign: 'center', padding: 12 },
});
