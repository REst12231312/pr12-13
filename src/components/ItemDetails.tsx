import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { DetailState } from '../hooks/useItem.ts';
import { categoryLabel, variant } from '../lib/variant.ts';
import { TodoNote } from './TodoNote.tsx';
import { colors, common } from './theme.ts';

type Props = { state: DetailState; onRetry: () => void; onBack: () => void };

// P03-STATES: загрузка, «не найдено», ошибка с повтором, карточка.
export function ItemDetails({ state, onRetry, onBack }: Props) {
  if (state.status === 'loading') {
    return <View style={common.center}><ActivityIndicator size="large" /></View>;
  }
  if (state.status === 'not-found') {
    return <View style={common.center}>
      <Text style={styles.title}>Находка не найдена</Text>
      <Text style={common.hint}>Возможно, её уже выдали или номер указан неверно.</Text>
      <Pressable style={common.button} onPress={onBack} accessibilityRole="button">
        <Text style={common.buttonText}>К списку</Text>
      </Pressable>
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
  const { item } = state;
  return <View style={styles.card}>
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.line}>Категория: {categoryLabel(item.category)}</Text>
    <Text style={styles.line}>{variant?.extraLabel ?? 'Место'}: {item.extra}</Text>
    <Text style={styles.line}>Найдено: {item.foundAt}</Text>
    <Text style={styles.line}>{item.description}</Text>
    {item.detail && <Text style={styles.line}>Уточнение: {item.detail}</Text>}
    {item.handedToOffice && <Text style={styles.line}>Документы переданы в деканат</Text>}
    <Text style={[styles.status, item.status === 'returned' && styles.returned]}>
      {item.status === 'returned' ? 'Выдано владельцу' : 'Хранится в бюро'}
    </Text>
  </View>;
}

const styles = StyleSheet.create({
  card: { margin: 12, padding: 16, gap: 8, backgroundColor: '#fff', borderRadius: 10, borderColor: colors.line, borderWidth: 1 },
  title: { color: colors.ink, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  line: { color: colors.ink, fontSize: 16 },
  status: { color: colors.accent, fontSize: 16, fontWeight: '600' },
  returned: { color: colors.muted },
});
