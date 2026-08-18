import { useState } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';

const CENTER = [-31.419797, -64.188566];
const base = '/fibramap-page';

const barrios = [
  { name: 'Jardín', pos: [-31.4101, -64.1820], providers: ['Claro'] },
  { name: 'San Vicente', pos: [-31.4035, -64.1890], providers: ['Claro'] },
  { name: 'Colón', pos: [-31.3960, -64.1870], providers: ['Claro'] },
  { name: 'Sarmiento', pos: [-31.4155, -64.1740], providers: ['Claro'] },
  { name: 'Maipú', pos: [-31.4080, -64.1770], providers: ['Claro'] },
  { name: 'San Carlos', pos: [-31.3995, -64.1780], providers: ['Claro'] },
  { name: 'Oña', pos: [-31.4010, -64.1960], providers: ['Claro'] },
  { name: 'Ayacucho', pos: [-31.4090, -64.1930], providers: ['Claro'] },
  { name: 'Cofico', pos: [-31.4210, -64.2050], providers: ['Claro'] },
  { name: 'Nueva Córdoba', pos: [-31.4244, -64.1868], providers: ['Personal'] },
  { name: 'General Paz', pos: [-31.4138, -64.1672], providers: ['Personal'] },
  { name: 'Alta Córdoba', pos: [-31.4120, -64.1920], providers: ['Personal'] },
  { name: 'Güemes', pos: [-31.4253, -64.1946], providers: ['Personal'] },
  { name: 'Cerro de las Rosas', pos: [-31.3960, -64.2100], providers: ['Personal'] },
  { name: 'Alberdi', pos: [-31.4136, -64.1965], providers: ['Personal'] },
  { name: 'Empalme', pos: [-31.3900, -64.1850], providers: ['Personal'] },
  { name: 'San Martín', pos: [-31.4190, -64.1760], providers: ['Iplan'] },
  { name: 'La Cañada', pos: [-31.4280, -64.2090], providers: ['Iplan'] },
  { name: 'La Feria', pos: [-31.4150, -64.2030], providers: ['Iplan'] },
  { name: 'Villa Allende', pos: [-31.3930, -64.1990], providers: ['Iplan'] },
  { name: 'Villa Urquiza', pos: [-31.4260, -64.1770], providers: ['Movistar'] },
  { name: 'Pacífico', pos: [-31.4310, -64.1940], providers: ['Movistar'] },
  { name: 'Centro', pos: [-31.4169, -64.1838], providers: ['Movistar'] },
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

const cartoDark = (x, y, z) =>
  `https://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}{r}.png`;

export default function MapIsland() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [activePopup, setActivePopup] = useState(null);

  const filtered = activeFilter
    ? barrios.filter(b => b.providers.includes(activeFilter))
    : barrios;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setActiveFilter(null); setActivePopup(null); }}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            !activeFilter ? 'bg-white dark:bg-gray-700 shadow' : 'bg-gray-200 dark:bg-gray-700/50'
          }`}
        >
          Todos
        </button>
        {providers.map(p => (
          <button
            key={p.name}
            onClick={() => setActiveFilter(activeFilter === p.name ? null : p.name)}
            className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
            style={{
              backgroundColor: activeFilter === p.name ? p.color : undefined,
              color: activeFilter === p.name ? '#fff' : p.color,
              border: `1px solid ${p.color}`,
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="w-full h-[55vh] min-h-[350px] rounded-lg overflow-hidden">
        <Map
          height="100%"
          defaultCenter={CENTER}
          defaultZoom={13}
          provider={cartoDark}
          onClick={() => setActivePopup(null)}
        >
          {filtered.map((b, i) => (
            <Marker
              key={`${b.name}-${i}`}
              anchor={b.pos}
              onClick={() => setActivePopup(activePopup === i ? null : i)}
              color={b.providers.length > 1 ? '#ffffff' : colorMap[b.providers[0]]}
            />
          ))}

          {activePopup !== null && (
            <Overlay anchor={filtered[activePopup].pos} offset={[0, -20]}>
              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 text-sm min-w-[160px] border border-gray-200 dark:border-gray-700 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="font-bold mb-1.5">{filtered[activePopup].name}</div>
                <div className="space-y-0.5">
                  {filtered[activePopup].providers.map(p => (
                    <a
                      key={p}
                      href={`${base}/provider`}
                      style={{ color: colorMap[p] }}
                      className="block text-xs font-medium hover:underline"
                    >
                      {p}
                    </a>
                  ))}
                </div>
              </div>
            </Overlay>
          )}
        </Map>
      </div>
    </div>
  );
}
