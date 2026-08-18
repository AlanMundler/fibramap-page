import { useEffect, useRef, useState } from 'react';

const CENTER = [-31.419797, -64.188566];
const base = '/fibramap-page';

const barrios = [
  // ── Claro (confirmed coverage) ──────────────────
  { name: 'Jardín', pos: [-31.4101, -64.1820], providers: ['Claro'] },
  { name: 'San Vicente', pos: [-31.4035, -64.1890], providers: ['Claro'] },
  { name: 'Colón', pos: [-31.3960, -64.1870], providers: ['Claro'] },
  { name: 'Sarmiento', pos: [-31.4155, -64.1740], providers: ['Claro'] },
  { name: 'Maipú', pos: [-31.4080, -64.1770], providers: ['Claro'] },
  { name: 'San Carlos', pos: [-31.3995, -64.1780], providers: ['Claro'] },
  { name: 'Oña', pos: [-31.4010, -64.1960], providers: ['Claro'] },
  { name: 'Ayacucho', pos: [-31.4090, -64.1930], providers: ['Claro'] },
  { name: 'Cofico', pos: [-31.4210, -64.2050], providers: ['Claro'] },

  // ── Personal (confirmed + legacy Fibertel) ──────
  { name: 'Nueva Córdoba', pos: [-31.4244, -64.1868], providers: ['Personal'] },
  { name: 'General Paz', pos: [-31.4138, -64.1672], providers: ['Personal'] },
  { name: 'Alta Córdoba', pos: [-31.4120, -64.1920], providers: ['Personal'] },
  { name: 'Güemes', pos: [-31.4253, -64.1946], providers: ['Personal'] },
  { name: 'Cerro de las Rosas', pos: [-31.3960, -64.2100], providers: ['Personal'] },
  { name: 'Alberdi', pos: [-31.4136, -64.1965], providers: ['Personal'] },
  { name: 'Empalme', pos: [-31.3900, -64.1850], providers: ['Personal'] },

  // ── Iplan (Córdoba Centro zone) ─────────────────
  { name: 'San Martín', pos: [-31.4190, -64.1760], providers: ['Iplan'] },
  { name: 'La Cañada', pos: [-31.4280, -64.2090], providers: ['Iplan'] },
  { name: 'La Feria', pos: [-31.4150, -64.2030], providers: ['Iplan'] },
  { name: 'Villa Allende', pos: [-31.3930, -64.1990], providers: ['Iplan'] },

  // ── Movistar ────────────────────────────────────
  { name: 'Villa Urquiza', pos: [-31.4260, -64.1770], providers: ['Movistar'] },
  { name: 'Pacífico', pos: [-31.4310, -64.1940], providers: ['Movistar'] },
  { name: 'Centro', pos: [-31.4169, -64.1838], providers: ['Movistar'] },

  // ── Internet Córdoba (67+ barrios) ──────────────
  { name: '1° de Mayo', pos: [-31.4340, -64.1680], providers: ['Internet Córdoba'] },
  { name: 'General Pueyrredón', pos: [-31.4390, -64.1840], providers: ['Internet Córdoba'] },
  { name: 'Las Lilas', pos: [-31.4430, -64.1720], providers: ['Internet Córdoba'] },
  { name: 'Los Ceibos', pos: [-31.4420, -64.1980], providers: ['Internet Córdoba'] },
  { name: 'Deán Funes', pos: [-31.4360, -64.1910], providers: ['Internet Córdoba'] },
  { name: 'Emaus', pos: [-31.4460, -64.1860], providers: ['Internet Córdoba'] },
  { name: 'Bajo General Paz', pos: [-31.4420, -64.1780], providers: ['Internet Córdoba'] },
  { name: 'Rivadavia', pos: [-31.4490, -64.1760], providers: ['Internet Córdoba'] },
  { name: 'Renacimiento', pos: [-31.4510, -64.1900], providers: ['Internet Córdoba'] },
  { name: 'Villa Argentina', pos: [-31.4530, -64.2010], providers: ['Internet Córdoba'] },

  // ── Multi-provider (confirmed by 2+ sources) ────
  { name: 'Mitre', pos: [-31.4160, -64.1800], providers: ['Claro', 'Personal'] },
  { name: 'Villa Nueva', pos: [-31.4290, -64.1700], providers: ['Claro', 'Personal'] },
];

const providers = [
  { name: 'Claro', color: '#dc2626' },
  { name: 'Personal', color: '#2563eb' },
  { name: 'Iplan', color: '#ec4899' },
  { name: 'Movistar', color: '#16a34a' },
  { name: 'Internet Córdoba', color: '#f59e0b' },
];

const colorMap = Object.fromEntries(providers.map(p => [p.name, p.color]));

export default function MapIsland() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    if (mapInstance.current) return;
    import('leaflet').then((L) => {
      const map = L.map(mapRef.current).setView(CENTER, 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      }).addTo(map);

      const markers = [];
      barrios.forEach(b => {
        const links = b.providers.map(p =>
          `<a href="${base}/provider" style="color:${colorMap[p]};font-size:13px;font-family:sans-serif;text-decoration:none">${p}</a>`
        ).join('<br/>');
        const marker = L.marker(b.pos).addTo(map).bindPopup(
          `<div style="font-family:sans-serif"><strong>${b.name}</strong><br/>${links}</div>`
        );
        markers.push({ marker, providers: b.providers });
      });

      mapInstance.current = { map, markers };
    });
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.markers.forEach(({ marker, providers: p }) => {
      if (!activeFilter || p.includes(activeFilter)) {
        marker.setOpacity(1);
      } else {
        marker.setOpacity(0.15);
      }
    });
  }, [activeFilter]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveFilter(null)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${!activeFilter ? 'bg-white dark:bg-gray-700 shadow' : 'bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300'}`}>
          Todos
        </button>
        {providers.map(p => (
          <button key={p.name} onClick={() => setActiveFilter(activeFilter === p.name ? null : p.name)}
            className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
            style={{
              backgroundColor: activeFilter === p.name ? p.color : undefined,
              color: activeFilter === p.name ? '#fff' : p.color,
              border: `1px solid ${p.color}`,
            }}>
            {p.name}
          </button>
        ))}
      </div>
      <div ref={mapRef} className="w-full h-[55vh] min-h-[350px] rounded-lg overflow-hidden" />
    </div>
  );
}
