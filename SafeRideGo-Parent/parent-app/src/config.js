import { Platform } from 'react-native';

// Chrome (web)  -> backend runs on the same PC, so localhost works.
// Phone (Expo Go) -> put your PC's IPv4 address here (run `ipconfig` on Windows).
// Android emulator -> http://10.0.2.2:5000/api
const PC_IP = '192.168.1.100';

export const API_URL = Platform.OS === 'web' ? 'http://localhost:5000/api' : `http://${PC_IP}:5000/api`;
