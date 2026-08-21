import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RoutingMapProps {
  shelterLocation: { lat: number; lng: number };
  donorLocation: { lat: number; lng: number };
  onRouteComputed?: (distanceText: string, durationText: string, traffic: string) => void;
}

// Helper to chunk the coordinates array for traffic segments
const createTrafficSegments = (coordinates: [number, number][]) => {
  const segments: { positions: [number, number][]; color: string }[] = [];
  // Colors: emerald-500 (Clear), yellow-500 (Moderate), red-500 (Heavy)
  const colors = ['#10b981', '#10b981', '#10b981', '#eab308', '#ef4444']; 
  
  // Break route into roughly 5-6 segments
  const chunkSize = Math.max(3, Math.floor(coordinates.length / 5)); 
  
  for (let i = 0; i < coordinates.length - 1; i += chunkSize) {
    const slice = coordinates.slice(i, i + chunkSize + 1); // overlap by 1 to connect the lines smoothly
    const randColor = colors[Math.floor(Math.random() * colors.length)];
    segments.push({ positions: slice, color: randColor });
  }
  
  return segments;
};

export const RoutingMap: React.FC<RoutingMapProps> = ({ shelterLocation, donorLocation, onRouteComputed }) => {
  const [routeSegments, setRouteSegments] = useState<{ positions: [number, number][], color: string }[]>([]);

  useEffect(() => {
    // Fetch from public OSRM API (Keyless)
    fetch(`https://router.project-osrm.org/route/v1/driving/${shelterLocation.lng},${shelterLocation.lat};${donorLocation.lng},${donorLocation.lat}?overview=full&geometries=geojson`)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]); // GeoJSON is [lng, lat], Leaflet wants [lat, lng]
          
          const segments = createTrafficSegments(coords);
          setRouteSegments(segments);
          
          // Determine overall traffic status based on the generated segment colors
          const redCount = segments.filter(s => s.color === '#ef4444').length;
          const yellowCount = segments.filter(s => s.color === '#eab308').length;
          
          let trafficStatus = 'Clear';
          if (redCount > 0) trafficStatus = 'Heavy';
          else if (yellowCount > 1) trafficStatus = 'Moderate';
          
          const distKm = (data.routes[0].distance / 1000).toFixed(1) + ' km';
          const durMin = Math.ceil(data.routes[0].duration / 60) + ' mins';
          
          if (onRouteComputed) {
            onRouteComputed(distKm, durMin, trafficStatus);
          }
        }
      }).catch(err => console.error('OSRM Fetch Error:', err));
  }, [shelterLocation, donorLocation, onRouteComputed]);

  return (
    <MapContainer 
      center={[ (shelterLocation.lat + donorLocation.lat)/2, (shelterLocation.lng + donorLocation.lng)/2 ]} 
      zoom={13} 
      style={{ height: '100%', width: '100%', zIndex: 1 }}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Target/Destination Markers */}
      <Marker position={shelterLocation} icon={L.divIcon({ className: 'custom-pin', html: '<div class="w-4 h-4 bg-emerald-600 rounded-full border-2 border-white shadow-md"></div>' })} />
      <Marker position={donorLocation} icon={L.divIcon({ className: 'custom-pin', html: '<div class="w-4 h-4 bg-rose-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>' })} />
      
      {/* Render segmented colored polylines for simulated traffic */}
      {routeSegments.length > 0 ? (
        routeSegments.map((seg, i) => (
          <Polyline key={i} positions={seg.positions} color={seg.color} weight={5} opacity={0.8} />
        ))
      ) : (
        // Fallback dashed line while loading
        <Polyline positions={[shelterLocation, donorLocation]} color="#10b981" weight={3} dashArray="5, 10" />
      )}
    </MapContainer>
  );
};
