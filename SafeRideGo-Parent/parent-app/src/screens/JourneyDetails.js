import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Card, Input, Btn, Muted, IconTile, C } from '../ui';
import { api } from '../api';
import { notify, confirmBox } from '../dialog';

export default function JourneyDetails({ navigation }) {
  const [j, setJ] = useState(null);
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [editId, setEditId] = useState(null);

  // READ: journey timeline + pickup notes
  const load = useCallback(async () => {
    try {
      const [journey, n] = await Promise.all([api.get('/journey/current'), api.get('/notes')]);
      setJ(journey); setNotes(n);
    } catch (e) { notify('Error', e.message); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // CREATE or UPDATE a pickup note for the driver
  const save = async () => {
    try {
      if (editId) await api.put('/notes/' + editId, { text });
      else await api.post('/notes', { text });
      setText(''); setEditId(null); load();
    } catch (e) { notify('Error', e.message); }
  };
  // DELETE a note
  const remove = (id) => confirmBox('Delete this note?', '', async () => {
    try { await api.del('/notes/' + id); load(); } catch (e) { notify('Error', e.message); }
  }, 'Delete');

  const color = (st) => (st === 'done' ? C.green : st === 'current' ? C.amber : '#E5E7EB');
  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="chevron-back" size={18} color={C.navy} />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: '500', color: C.navy, marginLeft: 12 }}>Journey details</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {j && (
          <Card>
            <Text style={{ color: C.green, fontSize: 10, letterSpacing: 1, fontWeight: '600' }}>● {j.status === 'live' ? 'LIVE JOURNEY' : 'COMPLETED JOURNEY'}</Text>
            <Text style={{ fontSize: 20, fontWeight: '600', color: C.navy, marginTop: 4 }}>{j.vanNo}</Text>
            <Muted style={{ fontSize: 12 }}>Morning route · {j.childName}</Muted>
          </Card>
        )}
        {j && (
          <View style={{ paddingHorizontal: 6, paddingVertical: 8 }}>
            {j.stops.map((st, i) => (
              <View key={i} style={{ flexDirection: 'row', opacity: st.status === 'pending' ? 0.55 : 1 }}>
                <View style={{ alignItems: 'center', width: 26 }}>
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color(st.status), alignItems: 'center', justifyContent: 'center' }}>
                    {st.status === 'done' ? <Ionicons name="checkmark" size={14} color="#fff" /> : <Text style={{ fontSize: 11, color: st.status === 'current' ? '#fff' : C.muted }}>{i + 1}</Text>}
                  </View>
                  {i < j.stops.length - 1 && <View style={{ width: 2, flex: 1, minHeight: 26, backgroundColor: i < j.step ? C.green : '#E5E7EB' }} />}
                </View>
                <View style={{ marginLeft: 12, paddingBottom: 18 }}>
                  <Text style={{ color: C.navy, fontWeight: '600', fontSize: 14 }}>{st.name}</Text>
                  <Muted style={{ fontSize: 12 }}>{st.time}</Muted>
                </View>
              </View>
            ))}
          </View>
        )}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <IconTile name="create-outline" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontWeight: '600', color: C.navy }}>Need to tell the driver?</Text>
              <Muted style={{ fontSize: 12 }}>Add a pickup note from your profile before the van arrives.</Muted>
            </View>
          </View>
          <Input placeholder="e.g. Waiting at the gate, blue house" value={text} onChangeText={setText} />
          <Btn title={editId ? 'Update note' : 'Add note'} kind="amber" onPress={save} />
          {editId && <Btn title="Cancel edit" kind="ghost" style={{ marginTop: 8 }} onPress={() => { setEditId(null); setText(''); }} />}
          {notes.map((n) => (
            <View key={n._id} style={{ borderTopWidth: 1, borderTopColor: C.line, marginTop: 12, paddingTop: 10 }}>
              <Text style={{ color: C.navy }}>{n.text}</Text>
              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                <TouchableOpacity onPress={() => { setEditId(n._id); setText(n.text); }}><Text style={{ color: C.navy, fontWeight: '600', marginRight: 18 }}>Edit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => remove(n._id)}><Text style={{ color: C.red, fontWeight: '600' }}>Delete</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </Card>
        <Btn title="Track van live" onPress={() => navigation.navigate('LiveMap')} />
      </ScrollView>
    </Screen>
  );
}
