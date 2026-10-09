import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Eyebrow, Title, Muted, Input, Btn, C } from '../ui';
import { api } from '../api';
import { notify } from '../dialog';
import { useAuth } from '../AuthContext';

export default function Verify({ route, navigation }) {
  const { phone, demoCode } = route.params;
  const { signIn } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // UPDATE: marks the account as verified
  const submit = async () => {
    setLoading(true);
    try {
      const { token } = await api.post('/auth/verify', { phone, code });
      await signIn(token);
    } catch (e) { notify('Verification failed', e.message); }
    finally { setLoading(false); }
  };

  return (
    <Screen>
      <View style={{ padding: 22, flex: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 24 }}>
          <Ionicons name="chevron-back" size={24} color={C.navy} />
        </TouchableOpacity>
        <Eyebrow>Account security</Eyebrow>
        <Title>Verify it's you</Title>
        <Muted style={{ marginTop: 8, marginBottom: 20 }}>We sent a 6-digit code to {phone}</Muted>
        <Input placeholder="— — — — — —" keyboardType="number-pad" maxLength={6} value={code} onChangeText={setCode}
          style={{ textAlign: 'center', fontSize: 22, letterSpacing: 6, borderColor: C.navy }} />
        <View style={{ backgroundColor: '#FEF6DD', padding: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#8A6100" />
          <Text style={{ color: '#8A6100', fontSize: 12, marginLeft: 8 }}>Demo mode: use verification code {demoCode}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Btn title="Verify and continue" onPress={submit} loading={loading} />
      </View>
    </Screen>
  );
}
