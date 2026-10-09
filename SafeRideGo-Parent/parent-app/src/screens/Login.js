import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Screen, Logo, Eyebrow, Title, Muted, Label, Input, Btn, SecurityNote, C } from '../ui';
import { api } from '../api';
import { notify } from '../dialog';
import { useAuth } from '../AuthContext';

export default function Login({ navigation }) {
  const { signIn } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // READ: sign in with an existing account
  const submit = async () => {
    setLoading(true);
    try {
      const { token } = await api.post('/auth/login', { phone: phone.trim(), password });
      await signIn(token);
    } catch (e) {
      if (e.data && e.data.needsVerify) navigation.navigate('Verify', { phone: phone.trim(), demoCode: '482615' });
      else notify('Sign in failed', e.message);
    } finally { setLoading(false); }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 22, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <Logo />
        <View style={{ height: 30 }} />
        <Eyebrow>Safe school journeys</Eyebrow>
        <Title>Know they arrived safely.</Title>
        <Muted style={{ marginTop: 8, marginBottom: 26 }}>Live updates from pickup to school, made for peace of mind.</Muted>
        <Label>Mobile number</Label>
        <Input placeholder="077 123 4567" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <Label>Password</Label>
        <Input placeholder="At least 6 characters" secureTextEntry value={password} onChangeText={setPassword} onSubmitEditing={submit} />
        <Btn title="Sign in securely" onPress={submit} loading={loading} />
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 18, alignItems: 'center' }}>
          <Text style={{ color: C.navy, fontWeight: '600' }}>New here? Create an account</Text>
        </TouchableOpacity>
      </ScrollView>
      <SecurityNote />
    </Screen>
  );
}
