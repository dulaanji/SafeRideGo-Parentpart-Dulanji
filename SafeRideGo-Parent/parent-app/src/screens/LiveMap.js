import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Btn, C } from '../ui';
import { api } from '../api';
import { notify } from '../dialog';
import VanMap from '../VanMap';

export default function LiveMap({ navigation }) {
  const [j, setJ] = useState(null);
  const [van, setVan] = useState(null);
  const [before, setBefore] = useState(5);

  // READ: journey + alert threshold (every 5s) and the real van GPS position (every 3s)
  useFocusEffect(useCallback(() => {
    const load = () => Promise.all([api.get('/journey/current'), api.get('/profile')])
      .then(([jr, pr]) => { setJ(jr); setBefore(pr.notifyBeforeMin); }).catch((e) => notify('Error', e.message));
    const loadVan = () => api.get('/van/location').then(setVan).catch(() => {});
    load();
    loadVan();
    const t1 = setInterval(load, 5000);
    const t2 = setInterval(loadVan, 3000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []));

  // UPDATE: choose how many minutes before arrival to be alerted
  const setThreshold = async (m) => {
    try { await api.put('/profile', { notifyBeforeMin: m }); setBefore(m); } catch (e) { notify('Error', e.message); }
  };

  const live = !!(van && van.live);
  const next = j ? (j.stops.find((s) => s.status === 'current') || j.stops[4]).name.replace('Approaching ', '') : '';
  return (
    <Screen style={{ backgroundColor: C.navy }}>
      <View style={{ flex: 1, backgroundColor: C.navy2 }}>
        <View style={{ position: 'absolute', zIndex: 2, top: 10, left: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(20,28,47,0.9)', borderRadius: 14, padding: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#2A3550', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="chevron-back" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: live ? '#86EFAC' : '#FCD34D', fontSize: 11 }}>{live ? '● Live location' : '● Waiting for van GPS'}</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 10 }}>{live ? 'Updated ' + van.ageSec + 's ago' : 'The driver has not started sharing yet'}</Text>
          </View>
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#2A3550', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="locate-outline" size={18} color="#fff" />
          </View>
        </View>
        <VanMap lat={van && van.lat != null ? van.lat : null} lng={van && van.lng != null ? van.lng : null} live={live} />
      </View>
      <View style={{ backgroundColor: C.navy, padding: 18, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
        <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#374151', marginBottom: 12 }} />
        <Text style={{ color: '#9CA3AF', fontSize: 11 }}>Next stop</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '500', flex: 1 }}>{next}</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: C.amber, fontSize: 26, fontWeight: '700' }}>{j ? j.etaMinutes : ''}<Text style={{ fontSize: 13 }}> min</Text></Text>
            <Text style={{ color: '#9CA3AF', fontSize: 10 }}>ETA</Text>
          </View>
        </View>
        <View style={{ height: 5, backgroundColor: '#374151', borderRadius: 3, marginVertical: 12 }}>
          <View style={{ height: 5, width: (j ? j.progress : 0) + '%', backgroundColor: C.amber, borderRadius: 3 }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.navy2, borderRadius: 14, padding: 10, marginBottom: 12 }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.navy }}>{j ? j.driverName.split(' ').map((w) => w[0]).join('') : ''}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>{j ? j.driverName : ''}</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 11 }}>Driver · {j ? j.vanNo : ''}</Text>
          </View>
          <TouchableOpacity onPress={() => j && Linking.openURL('tel:' + j.driverPhone)}>
            <Ionicons name="call-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <Text style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 6 }}>Alert me when the van is within</Text>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          {[3, 5, 10].map((m) => (
            <TouchableOpacity key={m} onPress={() => setThreshold(m)} style={{ paddingVertical: 7, paddingHorizontal: 16, borderRadius: 18, marginRight: 8, backgroundColor: before === m ? C.amber : 'transparent', borderWidth: 1, borderColor: before === m ? C.amber : '#374151' }}>
              <Text style={{ color: before === m ? C.navy : '#fff', fontSize: 12, fontWeight: '600' }}>{m} min</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Btn kind="ghost" icon="call-outline" title="Call driver" style={{ flex: 1, marginRight: 10, backgroundColor: 'transparent', borderColor: '#374151' }} onPress={() => j && Linking.openURL('tel:' + j.driverPhone)} />
          <Btn kind="amber" title="Journey details ›" style={{ flex: 1 }} onPress={() => navigation.navigate('JourneyDetails')} />
        </View>
      </View>
    </Screen>
  );
}