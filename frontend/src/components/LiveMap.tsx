import { useEffect, useMemo, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { radius } from '../theme';

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Lightweight live map (PRD FR-ORD-03) using Leaflet + OpenStreetMap inside a WebView.
 * No native map module and no API key required — works in Expo Go. The rider marker is
 * moved in place via injectJavaScript on each new location so the map never reloads.
 */
export function LiveMap({
  rider,
  destination,
  height = 220,
}: {
  rider?: LatLng | null;
  destination?: LatLng | null;
  height?: number;
}) {
  const ref = useRef<WebView>(null);
  const center = rider ?? destination ?? { lat: 12.9716, lng: 77.5946 };

  // Build the page once; subsequent rider moves are injected, not re-rendered.
  const html = useMemo(() => {
    const d = destination ? `[${destination.lat}, ${destination.lng}]` : 'null';
    const r = rider ? `[${rider.lat}, ${rider.lng}]` : 'null';
    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html,body,#map{height:100%;margin:0;background:#eee}</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false })
      .setView([${center.lat}, ${center.lng}], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    var riderIcon = L.divIcon({ className: '', html: '<div style="font-size:26px">\\u{1F6F5}</div>', iconSize: [30,30], iconAnchor: [15,15] });
    var homeIcon  = L.divIcon({ className: '', html: '<div style="font-size:24px">\\u{1F3E0}</div>', iconSize: [26,26], iconAnchor: [13,13] });

    var dest = ${d};
    var destMarker = dest ? L.marker(dest, { icon: homeIcon }).addTo(map) : null;
    var line = null;
    var riderMarker = null;

    window.updateRider = function (lat, lng) {
      var pos = [lat, lng];
      if (!riderMarker) riderMarker = L.marker(pos, { icon: riderIcon }).addTo(map);
      else riderMarker.setLatLng(pos);
      if (dest) {
        if (line) map.removeLayer(line);
        line = L.polyline([pos, dest], { color: '#f97316', weight: 4, opacity: 0.8 }).addTo(map);
        map.fitBounds(L.latLngBounds([pos, dest]).pad(0.35));
      } else {
        map.setView(pos, 15);
      }
    };

    var initRider = ${r};
    if (initRider) window.updateRider(initRider[0], initRider[1]);
    else if (dest) map.setView(dest, 14);
  </script>
</body>
</html>`;
    // center/destination are intentionally fixed for the page lifetime; rider updates are injected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination?.lat, destination?.lng]);

  useEffect(() => {
    if (rider && ref.current) {
      ref.current.injectJavaScript(`window.updateRider && window.updateRider(${rider.lat}, ${rider.lng}); true;`);
    }
  }, [rider?.lat, rider?.lng]);

  return (
    <WebView
      ref={ref}
      originWhitelist={['*']}
      source={{ html }}
      style={{ height, borderRadius: radius.md, overflow: 'hidden' }}
      scrollEnabled={false}
      javaScriptEnabled
      domStorageEnabled
    />
  );
}
