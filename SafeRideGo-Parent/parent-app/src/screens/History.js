import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Eyebrow, Title, Card, Input, Btn, Stars, Muted, C } from '../ui';
import { api } from '../api';
import { notify } from '../dialog';

function TripCard({ trip, reload }) {
  const fb = trip.feedback;
  const [rating, setRating] = useState(fb ? fb.rating : 0);
  const [comment, setComment] = useState(fb ? fb.comment : '');
  const d = new Date(trip.date);

  // CREATE (first time) or UPDATE (after that) feedback
  const save = async () => {
    if (!rating) return notify('Please pick a star rating');
    try {
      if (fb) await api.put('/feedback/' + fb._id, { rating, comment });
      else await api.post(`/trips/${trip._id}/feedback`, { rating, comment });
      reload();
    } catch (e) { notify('Error', e.message); }
  };
  // DELETE feedback
  const remove = async () => {
    try { await api.del('/feedback/' + fb._id); reload(); } catch (e) { notify('Error', e.message); }
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <View style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{String(d.getDate()).padStart(2, '0')}</Text>
          <Text style={{ color: C.amber, fontSize: 8, fontWeight: '700' }}>{d.toLocaleString('en-US', { month: 'short' }).toUpperCase()}</Text>
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontWeight: '600', color: C.navy }}>{trip.title}</Text>
          <Muted style={{ fontSize: 12 }}>{trip.durationMin} min · Arrived {trip.arrivedAt}</Muted>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.navy} />
      </Card>
      <Card>
        <Text style={{ fontWeight: '600', color: C.navy }}>How was this journey?</Text>
        <Muted style={{ fontSize: 12, marginBottom: 10 }}>Your feedback helps keep every ride safe.</Muted>
        <Stars value={rating} onChange={setRating} />
        <Input placeholder="Optional comment" value={comment} onChangeText={setComment} style={{ marginTop: 12 }} />
        <View style={{ flexDirection: 'row' }}>
          <Btn title={fb ? 'Update feedback' : 'Submit feedback'} kind="amber" style={{ flex: 1 }} onPress={save} />
          {fb && <Btn title="Delete" kind="danger" style={{ width: 90, marginLeft: 10 }} onPress={remove} />}
        </View>
      </Card>
    </View>
  );
}

export default function History() {
  const [trips, setTrips] = useState([]);
  // READ: all trips with their feedback
  const load = useCallback(async () => {
    try { setTrips(await api.get('/trips')); } catch (e) { notify('Error', e.message); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const latest = trips[0];
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 18 }} keyboardShouldPersistTaps="handled">
        <Eyebrow>Past journeys</Eyebrow>
        <Title style={{ marginBottom: 14 }}>Trip history</Title>
        {latest && (
          <View style={{ backgroundColor: C.greenSoft, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 18, borderWidth: 1, borderColor: '#CDEBD8' }}>
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="checkmark" size={26} color="#fff" />
            </View>
            <Text style={{ color: C.green, fontSize: 10, marginTop: 10, letterSpacing: 1, fontWeight: '700' }}>ARRIVED SAFELY</Text>
            <Text style={{ fontSize: 20, color: C.navy, marginTop: 2 }}>Reached school</Text>
            <Muted style={{ fontSize: 12 }}>{new Date(latest.date).toDateString()} · {latest.arrivedAt}</Muted>
          </View>
        )}
        <Eyebrow style={{ marginBottom: 10 }}>Recent trips</Eyebrow>
        {trips.map((t) => <TripCard key={t._id + (t.feedback ? t.feedback._id : '')} trip={t} reload={load} />)}
        {!trips.length && <Muted>No trips yet.</Muted>}
      </ScrollView>
    </Screen>
  );
}
