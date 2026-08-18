import { useEffect, useRef } from 'react';

const CENTER = [-31.419797, -64.188566];
const base = '/fibramap-page';

const barrios = [
  { name: 'Centro', pos: [-31.416895, -64.183833] },
  { name: 'Nueva Cordoba', pos: [-31.424408, -64.186827] },
  { name: 'Guemes', pos: [-31.425284, -64.194569] },
  { name: 'Alberdi', pos: [-31.41364, -64.19647] },
  { name: 'Gral Paz', pos: [-31.413758, -64.167203] },
];

const proveedores = [
  { name: 'Claro', color: '#dc2626' },
  { name: 'Personal', color: '#2563eb' },
  { name: 'Iplan', color: '#ec4899' },
];

export default function MapIsland() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapInstance.current) return;
    import('leaflet').then((L) => {
      const map = L.map(mapRef.current).setView(CENTER, 14);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      }).addTo(map);

      barrios.forEach(b => {
        const links = proveedores.map(p =>
          `<a href="${base}/provider" style="color:${p.color};font-size:14px;font-family:sans-serif">${p.name}</a>`
        ).join('<br/>');
        L.marker(b.pos).addTo(map).bindPopup(`<strong>${b.name}</strong><br/>${links}`);
      });
      mapInstance.current = map;
    });
  }, []);

  return <div ref={mapRef} className="w-full h-[50vh] min-h-[300px] rounded-lg overflow-hidden" />;
}
