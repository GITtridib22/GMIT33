import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStore } from '../store/useStore';

// Define custom icons using SVG strings and L.divIcon
const createIcon = (color: string) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const icons = {
  donorAvailable: createIcon('#f97316'), // orange-500
  donorExpiring: createIcon('#ef4444'),  // red-500
  shelter: createIcon('#3b82f6'),        // blue-500
};

const MapController = ({ center }: { center: { lat: number, lng: number } }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], 13);
  }, [center, map]);
  return null;
};

export const LiveMap: React.FC = () => {
  const { donations, shelters, currentRole, currentCity } = useStore();
  const center = { lat: currentCity.lat, lng: currentCity.lng };

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <MapController center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Shelters */}
        {shelters.map(shelter => (
          <Marker key={shelter.id} position={shelter.location} icon={icons.shelter}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
              <div className="font-semibold text-gray-900">{shelter.name}</div>
              <div className="text-sm text-gray-600">Capacity: {shelter.currentFulfilled} / {shelter.capacityGoal}</div>
            </Tooltip>
          </Marker>
        ))}

        {/* Render Donations */}
        {donations.filter(d => d.status !== 'DELIVERED').map(donation => {
          const isExpiring = donation.expiryHours <= 1;
          return (
            <Marker 
              key={donation.id} 
              position={donation.location} 
              icon={isExpiring ? icons.donorExpiring : icons.donorAvailable}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="font-semibold text-gray-900">{donation.foodType}</div>
                <div className="text-sm text-gray-600">Plates: {donation.servings}</div>
                <div className={`text-sm font-bold ${isExpiring ? 'text-red-500' : 'text-orange-500'}`}>
                  Expires in {donation.expiryHours}h
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* (Volunteers removed) */}


      </MapContainer>
    </div>
  );
};
