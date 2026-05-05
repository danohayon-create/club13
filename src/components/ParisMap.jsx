import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './ParisMap.css';

/**
 * Carte Paris avec 3 points d'intérêt :
 *  - Club 13 Paris (15 Avenue Hoche) — marker doré principal avec halo pulsant
 *  - Arc de Triomphe — marker secondaire
 *  - Tour Eiffel — marker secondaire
 *
 * Adaptation simplifiée du composant Map d'origine (TS + next-themes + portals)
 * → JSX pur, thème dark fixe, MapLibre natif (sans portails React).
 */
const POIS = [
  { id: 'club13', name: 'Club 13 Paris', address: '15 Avenue Hoche', lng: 2.3007, lat: 48.8773, primary: true },
  { id: 'arc',    name: 'Arc de Triomphe', address: 'Place Charles de Gaulle', lng: 2.2950, lat: 48.8738 },
  { id: 'eiffel', name: 'Tour Eiffel', address: 'Champ-de-Mars', lng: 2.2945, lat: 48.8584 },
];

export default function ParisMap() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [2.298, 48.870],
      zoom: 13,
      attributionControl: { compact: true },
      cooperativeGestures: true, // Évite que le scroll wheel zoome la carte par accident
    });
    mapRef.current = map;

    // Contrôles de zoom natifs
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('load', () => {
      // Création des markers custom
      POIS.forEach((poi) => {
        const el = document.createElement('div');
        el.className = `paris-marker ${poi.primary ? 'paris-marker--primary' : ''}`;
        el.innerHTML = `
          <div class="paris-marker-pulse"></div>
          <div class="paris-marker-dot"></div>
          <div class="paris-marker-label">
            <strong>${poi.name}</strong>
            <span>${poi.address}</span>
          </div>
        `;
        new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([poi.lng, poi.lat])
          .addTo(map);
      });

      // Ajuste le zoom pour montrer les 3 markers avec marge
      const bounds = new maplibregl.LngLatBounds();
      POIS.forEach((poi) => bounds.extend([poi.lng, poi.lat]));
      map.fitBounds(bounds, { padding: 100, duration: 1200, maxZoom: 14.5 });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="paris-map-wrap">
      <div ref={containerRef} className="paris-map" />
    </div>
  );
}
