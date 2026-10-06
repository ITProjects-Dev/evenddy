import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default marker icon (bundlers break the path by default)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Vizag is the center
const VIZAG_CENTER = [17.6868, 83.2185];

// Locations to pin on the map
const locations = [
  { name: "Visakhapatnam", coords: [17.6868, 83.2185], primary: true },
  { name: "Bheemili",      coords: [17.8900, 83.4500] },
  { name: "Anakapalle",    coords: [17.6913, 82.9986] },
  { name: "Gajuwaka",      coords: [17.6899, 83.1770] },
  { name: "Araku",         coords: [18.3274, 82.8727] },
];

export default function PlannerMap() {
  return (
    <div className="planner-map-real">
      <MapContainer
        center={VIZAG_CENTER}
        zoom={9}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", borderRadius: "16px" }}
      >
        {/* Base tile layer — free OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Optional: Coverage circle around Vizag */}
        <Circle
          center={VIZAG_CENTER}
          radius={50000} /* 50 km */
          pathOptions={{
            color: "#d99a45",
            fillColor: "#d99a45",
            fillOpacity: 0.12,
            weight: 1.5,
          }}
        />

        {/* Location markers */}
        {locations.map((loc) => (
          <Marker key={loc.name} position={loc.coords}>
            <Popup>
              <strong>{loc.name}</strong>
              {loc.primary && (
                <>
                  <br />
                  <small>Primary service area</small>
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}