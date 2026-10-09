import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Eyebrow, Title, Card, Muted, IconTile, C } from '../ui';
import { api } from '../api';
import { notify } from '../dialog';

export default function Alerts() {
  const [tab, setTab] = useState('all');
  const [items, setItems] = useState([]);

  // READ alerts (all / unread)
  const load = useCallback(async () => {
    try { setItems(await api.get('/alerts' + (tab === 'unread' ? '?unread=true' : ''))); }
    catch (e) { notify('Error', e.message); }
  }, [tab]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const run = async (fn) => { try { await fn(); load(); } catch (e) { notify('Error', e.message); } };
  const time = (d) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
  const icon = (t) => (t === 'school' ? ['home-outline', C.green, C.greenSoft] : t === 'delay' ? ['time-outline', C.red, '#FDECEC'] : ['bus-outline', C.navy, C.amberSoft]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View><Eyebrow>Stay informed</Eyebrow><Title>Alerts</Title></View>
          {/* UPDATE: mark every alert as read */}
          <TouchableOpacity onPress={() => run(() => api.put('/alerts/read-all'))}>
            <Text style={{ color: C.navy, fontWeight: '600', fontSize: 12 }}>Mark all read</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: '#E8E8E5', borderRadius: 12, padding: 3, marginVertical: 16 }}>
          {['all', 'unread'].map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={{ flex: 1, padding: 9, borderRadius: 10, alignItems: 'center', backgroundColor: tab === t ? '#fff' : 'transparent' }}>
              <Text style={{ fontWeight: '600', color: C.navy, fontSize: 13 }}>{t === 'all' ? 'All' : 'Unread'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {items.map((a) => {
          const [ic, col, bg] = icon(a.type);
          return (
            <Card key={a._id} style={{ flexDirection: 'row', alignItems: 'center', opacity: a.read ? 0.75 : 1 }}>
              <View style={{ width: 8, marginRight: 4 }}>{!a.read && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.amber }} />}</View>
              {/* UPDATE: tap an alert to mark it as read */}
              <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => !a.read && run(() => api.put('/alerts/' + a._id, { read: true }))}>
                <IconTile name={ic} color={col} bg={bg} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontWeight: '600', color: C.navy, fontSize: 13 }}>{a.title}</Text>
                  <Muted style={{ fontSize: 11 }}>{a.body}</Muted>
                </View>
                <Muted style={{ fontSize: 11, marginRight: 10 }}>{time(a.createdAt)}</Muted>
              </TouchableOpacity>
              {/* DELETE alert */}
              <TouchableOpacity onPress={() => run(() => api.del('/alerts/' + a._id))}>
                <Ionicons name="trash-outline" size={18} color={C.red} />
              </TouchableOpacity>
            </Card>
          );
        })}
        {!items.length && (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="notifications-outline" size={26} color={C.muted} />
            <Text style={{ fontWeight: '600', color: C.navy, marginTop: 8 }}>You're all caught up</Text>
            <Muted style={{ fontSize: 12 }}>New journey updates will appear here.</Muted>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
