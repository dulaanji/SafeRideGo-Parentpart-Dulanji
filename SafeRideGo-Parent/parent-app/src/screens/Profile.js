import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Eyebrow, Title, Card, Input, Label, Btn, Muted, C } from '../ui';
import { api } from '../api';
import { notify, confirmBox } from '../dialog';
import { useAuth } from '../AuthContext';

export default function Profile() {
  const { signOut } = useAuth();
  const [p, setP] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [children, setChildren] = useState([]);
  const [modal, setModal] = useState(null); // { id?, name, grade }
  const [lastLogin, setLastLogin] = useState('');

  // READ profile + children
  const load = useCallback(async () => {
    try {
      const [prof, kids, sess] = await Promise.all([api.get('/profile'), api.get('/children'), api.get('/sessions')]);
      setLastLogin(sess[0] ? new Date(sess[0].createdAt).toLocaleString() : '');
      setP(prof); setName(prof.name); setPhone(prof.phone); setChildren(kids);
    } catch (e) { notify('Error', e.message); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const run = async (fn, ok) => { try { await fn(); if (ok) notify(ok); load(); } catch (e) { notify('Error', e.message); } };

  // UPDATE profile details
  const saveProfile = () => run(() => api.put('/profile', { name, phone }), 'Profile updated');
  // UPDATE alert channels
  const toggle = (k, v) => run(() => api.put('/profile', { channels: { [k]: v } }));
  // CREATE / UPDATE child
  const saveChild = () => run(async () => {
    if (modal.id) await api.put('/children/' + modal.id, { name: modal.name, grade: modal.grade });
    else await api.post('/children', { name: modal.name, grade: modal.grade });
    setModal(null);
  });
  // DELETE child
  const delChild = () => confirmBox('Remove this child?', modal.name, () => run(async () => { await api.del('/children/' + modal.id); setModal(null); }), 'Remove');
  // DELETE account (and all its data)
  const delAccount = () => confirmBox('Delete account?', 'This removes all your data permanently.', async () => {
    try { await api.del('/profile'); await signOut(); } catch (e) { notify('Error', e.message); }
  }, 'Delete');

  if (!p) return <Screen />;
  const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const Row = ({ label, k }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
      <Text style={{ color: C.navy, fontSize: 13 }}>{label}</Text>
      <Switch value={!!p.channels[k]} onValueChange={(v) => toggle(k, v)} trackColor={{ true: C.green, false: '#D1D5DB' }} thumbColor="#fff" />
    </View>
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 18 }} keyboardShouldPersistTaps="handled">
        <Eyebrow>Your account</Eyebrow>
        <Title style={{ marginBottom: 14 }}>Profile</Title>
        <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontWeight: '700', color: C.navy }}>{p.name[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontWeight: '600', color: C.navy }}>{p.name}</Text>
            <Muted style={{ fontSize: 11 }}>Verified parent{lastLogin ? ' · Last sign-in ' + lastLogin : ''}</Muted>
          </View>
          {p.verified && <View style={{ backgroundColor: C.greenSoft, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}><Text style={{ color: C.green, fontSize: 10 }}>✓ Verified</Text></View>}
        </Card>

        <Card>
          <Eyebrow style={{ marginBottom: 12 }}>Account details</Eyebrow>
          <Label>Display name</Label>
          <Input value={name} onChangeText={setName} />
          <Label>Mobile number</Label>
          <Input value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Btn title="Save changes" onPress={saveProfile} />
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Eyebrow>My child</Eyebrow>
            <TouchableOpacity onPress={() => setModal({ name: '', grade: '' })}><Text style={{ color: C.navy, fontWeight: '700', fontSize: 12 }}>+ Add</Text></TouchableOpacity>
          </View>
          {children.map((c) => (
            <TouchableOpacity key={c._id} onPress={() => setModal({ id: c._id, name: c.name, grade: c.grade })} style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: C.amberSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: '700', color: '#B07A00', fontSize: 12 }}>{initials(c.name)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: C.navy, fontWeight: '600' }}>{c.name}</Text>
                <Muted style={{ fontSize: 11 }}>{c.grade} · {c.vanNo}</Muted>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.navy} />
            </TouchableOpacity>
          ))}
          {!children.length && <Muted style={{ marginTop: 8 }}>No child added yet.</Muted>}
        </Card>

        <Card>
          <Eyebrow style={{ marginBottom: 4 }}>Alert channels</Eyebrow>
          <Row label="App notifications" k="app" />
          <Row label="SMS updates" k="sms" />
          <Row label="WhatsApp" k="whatsapp" />
        </Card>

        {/* CREATE: delay alert */}
        <Btn kind="dashed" icon="time-outline" title="Simulate a 10-minute delay" style={{ marginBottom: 14 }}
          onPress={() => run(() => api.post('/alerts/simulate-delay'), 'Delay alert created')} />
        <Btn kind="danger" title="Sign out" onPress={signOut} />
        <TouchableOpacity onPress={delAccount} style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={{ color: C.red, fontSize: 12 }}>Delete my account</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={!!modal} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 18, borderTopRightRadius: 18, width: '100%', maxWidth: 430 }}>
            <Text style={{ fontSize: 17, fontWeight: '600', color: C.navy, marginBottom: 10 }}>{modal && modal.id ? 'Edit child' : 'Add child'}</Text>
            <Input placeholder="Child name" value={modal ? modal.name : ''} onChangeText={(t) => setModal({ ...modal, name: t })} />
            <Input placeholder="Grade (e.g. Grade 6)" value={modal ? modal.grade : ''} onChangeText={(t) => setModal({ ...modal, grade: t })} />
            <Btn title="Save" onPress={saveChild} />
            {modal && modal.id && <Btn kind="danger" title="Remove child" style={{ marginTop: 8 }} onPress={delChild} />}
            <Btn kind="ghost" title="Cancel" style={{ marginTop: 8 }} onPress={() => setModal(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
