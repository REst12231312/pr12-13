import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme.ts';

// Метка невыполненного этапа.
export function TodoNote({ code, children }: { code: string; children?: React.ReactNode }) {
  return <View style={styles.box}>
    <Text style={styles.title}>Этап {code} не выполнен</Text>
    {children}
  </View>;
}

const styles = StyleSheet.create({
  box: { borderColor: colors.todo, borderWidth: 1, borderRadius: 8, padding: 12, margin: 12, gap: 6, backgroundColor: '#fff8e6' },
  title: { color: colors.todo, fontWeight: '700', fontSize: 16 },
});
