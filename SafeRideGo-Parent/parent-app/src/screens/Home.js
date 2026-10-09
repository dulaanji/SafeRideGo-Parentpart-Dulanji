import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Muted, Btn, Card, IconTile, C } from '../ui';
import { api } from '../api';
import { notify } from '../dialog';

const clock = (minsAhead) => {
  const d = new Date(Date.now() + minsAhead * 60000);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
};

export default function Home({ navigation }) {
  const [j, setJ] = useState(null);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [unread, setUnread] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // READ: journey, profile, child, unread alerts
  const load = useCallback(async () => {
    try {
      const [journey, profile, kids, unreadAlerts] = await Promise.all([
        api.get('/journey/current'), api.get('/profile'), api.get('/children'), api.get('/alerts?unread=true'),
      ]);
      setJ(journey); setName(profile.name); setGrade(kids[0] ? kids[0].grade : ''); setUnread(unreadAlerts.length);
    } catch (e) { notify('Error', e.message); }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]));

  // UPDATE: demo controls move the van and create alerts
  const act = async (path) => {
    try { await api.post(path); load(); } catch (e) { notify('Error', e.message); }
  };

  const done = j && j.status === 'completed';
  const current = j ? j.stops.find((x) => x.status === 'current') : null;
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: 18 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontWeight: '700', color: C.navy }}>{name ? name[0].toUpperCase() : ''}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Muted style={{ fontSize: 11 }}>{greeting}</Muted>
            <Text style={{ fontSize: 17, color: C.navy, fontWeight: '500' }}>{name.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Alerts')} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="notifications-outline" size={18} color={C.navy} />
            {unread > 0 && <View style={{ position: 'absolute', top: 6, right: 7, width: 9, height: 9, borderRadius: 5, backgroundColor: C.red }} />}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 11, letterSpacing: 1, color: C.muted, fontWeight: '600' }}>{today}</Text>
          <Text style={{ fontSize: 11, color: C.green, fontWeight: '600' }}>● {done ? 'COMPLETED' : 'LIVE'}</Text>
        </View>

        {j && (
          <View style={{ backgroundColor: C.navy, borderRadius: 20, padding: 18, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 11, letterSpacing: 1 }}>MORNING JOURNEY</Text>
              <View style={{ backgroundColor: done ? '#14532D' : '#14532D', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3 }}>
                <Text style={{ color: '#86EFAC', fontSize: 11 }}>{done ? '✓ Arrived' : '✓ On the way'}</Text>
              </View>
            </View>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '500', marginTop: 8 }}>{j.childName}</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{grade ? grade + ' · ' : ''}Van {j.vanNo}</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 16 }}>{done ? 'Reached' : 'Arrives at'} {done ? 'school' : (current ? current.name.replace('Approaching ', '') : '')}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Text style={{ color: '#fff', fontSize: 44, fontWeight: '600' }}>{done ? '✓' : clock(j.etaMinutes)}</Text>
              {!done && <Text style={{ color: C.amber, fontSize: 15, marginBottom: 8 }}><Text style={{ fontWeight: '700', fontSize: 18 }}>{j.etaMinutes}</Text> min away</Text>}
            </View>
            {j.delayMin > 0 && !done && <Text style={{ color: C.amber, fontSize: 12 }}>Includes {j.delayMin} min delay</Text>}
            <View style={{ height: 6, backgroundColor: '#374151', borderRadius: 3, marginTop: 14 }}>
              <View style={{ height: 6, width: j.progress + '%', backgroundColor: C.amber, borderRadius: 3 }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 16 }}>
              {['Depot', 'Pickup', 'School'].map((t) => <Text key={t} style={{ color: '#9CA3AF', fontSize: 10 }}>{t}</Text>)}
            </View>
            <Btn kind="amber" icon="location-outline" title="Track van live" onPress={() => navigation.navigate('LiveMap')} />
          </View>
        )}

        <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconTile name="notifications-outline" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontWeight: '600', color: C.navy }}>{done ? 'Journey complete' : `Next update in about ${Math.max(1, Math.round((j ? j.etaMinutes : 3) / 2))} min`}</Text>
            <Muted style={{ fontSize: 12 }}>{done ? 'See Trip history for details.' : "We'll let you know when the van is close."}</Muted>
          </View>
        </Card>

        <Btn kind="ghost" title="Journey details" onPress={() => navigation.navigate('JourneyDetails')} style={{ marginBottom: 10 }} />
        <Muted style={{ fontSize: 11, marginTop: 6, marginBottom: 6 }}>DEMO CONTROLS</Muted>
        <View style={{ flexDirection: 'row' }}>
          <Btn kind="dashed" title="Next stage" onPress={() => act('/journey/advance')} style={{ flex: 1, marginRight: 8 }} />
          <Btn kind="dashed" title="Restart" onPress={() => act('/journey/reset')} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </Screen>
  );
}
