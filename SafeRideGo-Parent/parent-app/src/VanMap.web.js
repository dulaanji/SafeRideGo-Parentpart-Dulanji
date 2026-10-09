import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

const JS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
const CSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (window.__leafletLoading) return window.__leafletLoading;
  window.__leafletLoading = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = CSS;
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = JS;
    s.onload = () => resolve(window.L);
    s.onerror = reject;
    document.body.appendChild(s);
  });
  return window.__leafletLoading;
}

// Real OpenStreetMap with a green dot for the van (web / Chrome)
export default function VanMap({ lat, lng }) {
  const box = useRef(null);
  const map = useRef(null);
  const dot = useRef(null);
  const latest = useRef({ lat, lng });
  latest.current = { lat, lng };

  const update = () => {
    const { lat: la, lng: ln } = latest.current;
    if (!map.current || la == null || ln == null) return;
    const pos = [la, ln];
    if (!dot.current) {
      dot.current = window.L.circleMarker(pos, { radius: 10, color: '#fff', weight: 3, fillColor: '#22C55E', fillOpacity: 1 }).addTo(map.current);
      map.current.setView(pos, 15);
    } else {
      dot.current.setLatLng(pos);
      map.current.panTo(pos);
    }
  };

  useEffect(() => {
    let dead = false;
    loadLeaflet().then((L) => {
      if (dead || !box.current || map.current) return;
      map.current = L.map(box.current).setView([6.9147, 79.9729], 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map.current);
      update();
    }).catch(() => {});
    return () => { dead = true; if (map.current) { map.current.remove(); map.current = null; dot.current = null; } };
  }, []);

  useEffect(update, [lat, lng]);

  return (
    <View style={{ flex: 1 }}>
      <div ref={box} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }} />
    </View>
  );
}