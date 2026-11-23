import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ListState } from '../hooks/useItems.ts';
import { ItemCard } from './ItemCard.tsx';
import { TodoNote } from './TodoNote.tsx';
import { common } from './theme.ts';

type Props = { state: ListState; filtered: boolean; onRetry: () => void; onOpen: (id: string) => void };

// P03-STATES: загрузка, ошибка с повтором, пустой список, список.
export function ItemsView({ state, filtered, onRetry, onOpen }: Props) {
  if (state.status === 'loading') {
    return <View style={common.center}>
      <ActivityIndicator size="large" />
      <Text style={common.hint}>Загружаем находки…</Text>
    </View>;
  }
  if (state.status === 'error') {
    return <View style={common.center}>
      {state.todo && <TodoNote code={state.todo} />}
      <Text style={common.error} accessibilityRole="alert">{state.message}</Text>
      <Pressable style={common.button} onPress={onRetry} accessibilityRole="button">
        <Text style={common.buttonText}>Повторить</Text>
      </Pressable>
    </View>;
  }
  if (state.items.length === 0) {
    return <View style={common.center}>
      <Text style={common.hint}>{filtered ? `Ничего не найдено${state.q ? ` по запросу «${state.q}»` : ''}. Измените запрос или категорию.` : 'Находок пока нет.'}</Text>
    </View>;
  }
  return <FlatList data={state.items} keyExtractor={(item) => item._id} contentContainerStyle={styles.list}
    ListHeaderComponent={state.q ? <Text style={common.hint}>По запросу «{state.q}»: {state.items.length}</Text> : undefined}
    renderItem={({ item }) => <ItemCard item={item} onPress={() => onOpen(item._id)} />} />;
}

const styles = StyleSheet.create({
  list: { padding: 12, gap: 10 },
});
