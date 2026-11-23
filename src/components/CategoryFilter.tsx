import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { Category } from '../lib/types.ts';
import { colors } from './theme.ts';

type Props = { categories: Category[]; value: string; onChange: (id: string) => void };

export function CategoryFilter({ categories, value, onChange }: Props) {
  const options = [{ id: '', label: 'Все' }, ...categories];
  return <ScrollView horizontal style={styles.bar} contentContainerStyle={styles.row} showsHorizontalScrollIndicator={false}>
    {options.map((option) => {
      const selected = option.id === value;
      return <Pressable key={option.id || 'all'} onPress={() => onChange(option.id)} accessibilityRole="button" accessibilityState={{ selected }}
        style={[styles.chip, selected && styles.selected]}>
        <Text style={[styles.text, selected && styles.selectedText]}>{option.label}</Text>
      </Pressable>;
    })}
  </ScrollView>;
}

const styles = StyleSheet.create({
  bar: { flexGrow: 0 },
  row: { gap: 8, paddingHorizontal: 12, alignItems: 'center' },
  chip: { borderColor: colors.line, borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, minHeight: 36, justifyContent: 'center', backgroundColor: '#fff' },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  text: { color: colors.ink, fontSize: 15 },
  selectedText: { color: '#fff' },
});
