import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IMMERSION_PLACES } from '../../data/immersion';
import './immersion.css';

const pinIcon = L.divIcon({
  className: 'immersion-pin',
  html: '<span class="immersion-pin__dot"></span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  tooltipAnchor: [0, -20],
});

/** Mapa con un punto por lugar; al hacer clic abre el recorrido 360°. */
export default function ImmersionMap({ basePath }) {
  const navigate = useNavigate();
  const bounds = useMemo(() => L.latLngBounds(IMMERSION_PLACES.map((p) => [p.lat, p.lng])), []);

  return (
    <div className="immersion-map">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [60, 60] }}
        scrollWheelZoom={false}
        className="immersion-map__canvas"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {IMMERSION_PLACES.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={pinIcon}
            title={place.name}
            eventHandlers={{ click: () => navigate(`${basePath}/inmersion/${place.id}`) }}
          >
            <Tooltip direction="top" permanent className="immersion-tip">
              {place.name}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
