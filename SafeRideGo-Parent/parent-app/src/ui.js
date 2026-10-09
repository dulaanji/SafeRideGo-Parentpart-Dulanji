import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export const C = {
  bg: '#F7F7F5', page: '#E9E9E7', navy: '#141C2F', navy2: '#1B2640', amber: '#F5A800', amberSoft: '#FEF3D6',
  green: '#1E9E54', greenSoft: '#E6F5EC', red: '#D64545', muted: '#6B7280', line: '#E5E7EB', card: '#FFFFFF',
};

export const Screen = ({ children, style }) => (
  <SafeAreaView edges={['top']} style={[{ flex: 1, backgroundColor: C.bg }, style]}>{children}</SafeAreaView>
);
export const Eyebrow = ({ children, style }) => <Text style={[s.eyebrow, style]}>{children}</Text>;
export const Title = ({ children, style }) => <Text style={[s.title, style]}>{children}</Text>;
export const Muted = ({ children, style }) => <Text style={[{ color: C.muted, fontSize: 13 }, style]}>{children}</Text>;
export const Card = ({ children, style }) => <View style={[s.card, style]}>{children}</View>;
export const Input = (p) => <TextInput placeholderTextColor="#9CA3AF" {...p} style={[s.input, p.style]} />;
export const Label = ({ children }) => <Text style={s.label}>{children}</Text>;

// Brand mark: amber rounded square + bus icon (same as the Figma Make design)
export const Logo = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <View style={s.mark}><Ionicons name="bus" size={20} color={C.navy} /></View>
    <View style={{ marginLeft: 10 }}>
      <Text style={{ fontSize: 17, fontWeight: '700', color: C.navy }}>SafeRideGo</Text>
      <Text style={{ fontSize: 11, color: C.muted }}>Transport app</Text>
    </View>
  </View>
);

export const SecurityNote = () => (
  <View style={s.note}>
    <Ionicons name="lock-closed-outline" size={15} color={C.muted} />
    <Text style={{ flex: 1, marginLeft: 8, fontSize: 11, color: C.muted }}>
      Only verified parents linked by the school can view location and journey details.
    </Text>
  </View>
);

export const IconTile = ({ name, color = C.navy, bg = C.amberSoft, size = 38 }) => (
  <View style={{ width: size, height: size, borderRadius: 10, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
    <Ionicons name={name} size={size * 0.5} color={color} />
  </View>
);

export const Btn = ({ title, onPress, kind = 'primary', loading, style, icon }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.85}
    style={[s.btn, kind === 'primary' && { backgroundColor: C.navy }, kind === 'amber' && { backgroundColor: C.amber },
      kind === 'danger' && { backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0B7B7' },
      kind === 'ghost' && { backgroundColor: '#fff', borderWidth: 1, borderColor: C.line },
      kind === 'dashed' && { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#C9CCD2', borderStyle: 'dashed' }, style]}
  >
    {loading ? <ActivityIndicator color={kind === 'primary' ? '#fff' : C.navy} /> : (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon ? <Ionicons name={icon} size={16} color={kind === 'primary' ? '#fff' : kind === 'danger' ? C.red : C.navy} style={{ marginRight: 8 }} /> : null}
        <Text style={[s.btnText, kind === 'amber' && { color: C.navy }, kind === 'danger' && { color: C.red }, (kind === 'ghost' || kind === 'dashed') && { color: C.navy }]}>{title}</Text>
      </View>
    )}
  </TouchableOpacity>
);

export const Stars = ({ value = 0, onChange, size = 26 }) => (
  <View style={{ flexDirection: 'row' }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <TouchableOpacity key={n} onPress={() => onChange && onChange(n)} disabled={!onChange}>
        <Ionicons name={n <= value ? 'star' : 'star-outline'} size={size} color={n <= value ? C.amber : '#9CA3AF'} style={{ marginRight: 6 }} />
      </TouchableOpacity>
    ))}
  </View>
);

export const s = StyleSheet.create({
  eyebrow: { fontSize: 11, letterSpacing: 1.2, color: C.muted, textTransform: 'uppercase', fontWeight: '600' },
  title: { fontSize: 28, color: C.navy, fontWeight: '500', marginTop: 4, letterSpacing: -0.5 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.line, marginBottom: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: C.navy, marginTop: 6, marginBottom: 14 },
  btn: { borderRadius: 12, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  label: { fontSize: 12, color: C.muted, fontWeight: '600' },
  mark: { width: 38, height: 38, borderRadius: 11, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center' },
  note: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFEFEC', borderRadius: 12, padding: 12, margin: 18 },
});
