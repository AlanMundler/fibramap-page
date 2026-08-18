import { useEffect, useRef } from 'react';

const DEFAULT_CENTER = [-31.419797, -64.188566];
const base = '/fibramap-page';

const barrios = [
  { name: 'Centro', pos: [-31.416895, -64.183833] },
  { name: 'Nueva Cordoba', pos: [-31.424408, -64.186827] },
  { name: 'Guemes', pos: [-31.425284, -64.194569] },
  { name: 'Alberdi', pos: [-31.41364, -64.19647] },
  { name: 'Gral Paz', pos: [-31.413758, -64.167203] },
];

const proveedores = ['Claro', 'Personal', 'Iplan'];
const colores = { Claro: 'text-red-600', Personal: 'text-blue-600', Iplan: 'text-pink-600' };

export default function MapIsland() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapInstance.current) return;
    import('leaflet').then((L) => {
      const map = L.map(mapRef.current).setView(DEFAULT_CENTER, 14);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }).addTo(map);

      barrios.forEach(barrio => {
        const popupContent = `
          <h1 class="text-xl font-sans font-bold">${barrio.name}</h1><br/>
          ${proveedores.map(p => `<a href="${base}/provider" class="${colores[p]} text-base font-sans" style="color:${p === 'Claro' ? '#dc2626' : p === 'Personal' ? '#2563eb' : '#ec4899'}">${p}<br/></a>`).join('')}
        `;
        L.marker(barrio.pos).addTo(map).bindPopup(popupContent);
      });
      mapInstance.current = map;
    });
  }, []);

  return (
    <section className="sm:ml-64 sm:mr-36">
      <h1 className="ml-4 mr-4 relative overflow-x-auto text-xl font-semibold dark:text-white h-full px-3 py-4 bg-gray-50 dark:bg-gray-800">Mapa de Proveedores</h1>
      <div className="mt-4 ml-4 mr-4 relative overflow-x-auto px-2 py-2 bg-gray-50 dark:bg-gray-800">
        <div ref={mapRef} style={{ width: '100%', height: '400px' }} />
      </div>
    </section>
  );
}
