import React, { useState } from 'react';
import { Text, ScrollView, TouchableOpacity, View } from 'react-native';
import { Screen, Logo, Eyebrow, Title, Muted, Label, Input, Btn, SecurityNote, C } from '../ui';
import { api } from '../api';
import { notify } from '../dialog';

export default function Register({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // CREATE: new parent account
  const submit = async () => {
    setLoading(true);
    try {
      const r = await api.post('/auth/register', { name: name.trim(), phone: phone.trim(), password });
      navigation.navigate('Verify', { phone: r.phone, demoCode: r.demoCode });
    } catch (e) { notify('Could not create account', e.message); }
    finally { setLoading(false); }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 22, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <Logo />
        <View style={{ height: 30 }} />
        <Eyebrow>Safe school journeys</Eyebrow>
        <Title>Create your parent account</Title>
        <Muted style={{ marginTop: 8, marginBottom: 26 }}>Set up your account to follow school journeys.</Muted>
        <Label>Full name</Label>
        <Input placeholder="Amara Perera" value={name} onChangeText={setName} />
        <Label>Mobile number</Label>
        <Input placeholder="077 123 4567" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <Label>Password</Label>
        <Input placeholder="At least 6 characters" secureTextEntry value={password} onChangeText={setPassword} />
        <Btn title="Create account" onPress={submit} loading={loading} />
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 18, alignItems: 'center' }}>
          <Text style={{ color: C.navy, fontWeight: '600' }}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
      <SecurityNote />
    </Screen>
  );
}
