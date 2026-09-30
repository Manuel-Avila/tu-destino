import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

// Default to Baja California Sur
const DEFAULT_CENTER = [24.1422, -110.3108]; 
const DEFAULT_ZOOM = 6;

export default function MapPicker({ lat, lng, onChange }) {
  const position = lat && lng ? [lat, lng] : null;

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc', marginBottom: '1rem' }}>
      <MapContainer 
        key={`${(position || DEFAULT_CENTER).join(',')}`}
        center={position || DEFAULT_CENTER} 
        zoom={position ? 12 : DEFAULT_ZOOM} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
          position={position} 
          setPosition={(pos) => onChange(pos[0], pos[1])} 
        />
      </MapContainer>
      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px', textAlign: 'center' }}>
        Haz clic en el mapa para {position ? 'cambiar' : 'seleccionar'} la ubicación.
      </p>
    </div>
  );
}
