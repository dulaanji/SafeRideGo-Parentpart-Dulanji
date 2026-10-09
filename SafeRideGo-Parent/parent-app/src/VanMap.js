import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

// Phone (Expo Go): simple card with a link to Google Maps
export default function VanMap({ lat, lng }) {
  const has = lat != null && lng != null;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ color: '#fff', fontSize: 16, marginBottom: 8 }}>{has ? 'Van location' : 'Waiting for van GPS...'}</Text>
      {has && <Text style={{ color: '#9CA3AF', marginBottom: 14 }}>{lat.toFixed(5)}, {lng.toFixed(5)}</Text>}
      {has && (
        <TouchableOpacity onPress={() => Linking.openURL('https://www.google.com/maps?q=' + lat + ',' + lng)} style={{ backgroundColor: '#F5A800', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12 }}>
          <Text style={{ fontWeight: '700', color: '#141C2F' }}>Open in Google Maps</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}