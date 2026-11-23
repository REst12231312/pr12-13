import { Platform } from 'react-native';
import { createPhoneStore, type SecurePort } from './phoneStore.ts';
const port: SecurePort = {
  async available() {
    if (Platform.OS === 'web') return false;
    const secure = await import('expo-secure-store');
    return secure.isAvailableAsync();
  },
  async get(key) { return (await import('expo-secure-store')).getItemAsync(key); },
  async set(key,value) { await (await import('expo-secure-store')).setItemAsync(key,value); },
  async remove(key) { await (await import('expo-secure-store')).deleteItemAsync(key); },
};
export const phoneStore = createPhoneStore(port);
