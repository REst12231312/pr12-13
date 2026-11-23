import { StyleSheet } from 'react-native';

export const colors = { ink: '#18233f', muted: '#5a6478', line: '#cfd6e4', accent: '#2457c5', error: '#b42318', todo: '#8a5a00', paper: '#f6f7fb' };

export const common = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  hint: { color: colors.muted, fontSize: 16, textAlign: 'center' },
  error: { color: colors.error, fontSize: 16, textAlign: 'center' },
  button: { backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 20, minHeight: 44, justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
