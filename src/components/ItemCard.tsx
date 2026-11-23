import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Item } from '../lib/types.ts';
import { categoryLabel } from '../lib/variant.ts';
import { colors } from './theme.ts';

export function ItemCard({ item, onPress }: { item: Item; onPress: () => void }) {
  return <Pressable style={styles.card} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${item.title}, ${categoryLabel(item.category)}`}>
    <View style={styles.row}>
      <Text style={styles.title}>{item.title}</Text>
      {item.status === 'returned' && <Text style={styles.badge}>выдано</Text>}
    </View>
    <Text style={styles.meta}>{categoryLabel(item.category)} · {item.foundAt}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderColor: colors.line, borderWidth: 1, borderRadius: 10, padding: 14, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  title: { color: colors.ink, fontSize: 17, fontWeight: '600', flexShrink: 1 },
  badge: { color: colors.muted, fontSize: 14 },
  meta: { color: colors.muted, fontSize: 15 },
});
