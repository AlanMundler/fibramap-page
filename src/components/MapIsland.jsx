import { useState } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';

const CENTER = [-31.4200, -64.1900];
const base = '/fibramap-page';

const barrios = [
  // ── Internet Córdoba ─────────────────────────────────────
  { name: 'General Paz', pos: [-31.4144, -64.1706], providers: ['Internet Córdoba'] },
  { name: 'Colón', pos: [-31.3998, -64.1830], providers: ['Internet Córdoba'] },
  { name: 'Empalme', pos: [-31.3935, -64.1810], providers: ['Internet Córdoba'] },
  { name: 'Maipú', pos: [-31.4065, -64.1755], providers: ['Internet Córdoba'] },
  { name: 'Sarmiento', pos: [-31.4090, -64.1750], providers: ['Internet Córdoba'] },
  { name: 'Deán Funes', pos: [-31.4350, -64.1890], providers: ['Internet Córdoba'] },
  { name: 'General Pueyrredón', pos: [-31.4330, -64.1860], providers: ['Internet Córdoba'] },
  { name: 'Bajo General Paz', pos: [-31.4410, -64.1800], providers: ['Internet Córdoba'] },
  { name: 'Emaús', pos: [-31.4430, -64.1820], providers: ['Internet Córdoba'] },
  { name: 'Renacimiento', pos: [-31.4470, -64.1830], providers: ['Internet Córdoba'] },
  { name: 'Rivadavia', pos: [-31.4480, -64.1790], providers: ['Internet Córdoba'] },
  { name: 'Yapeyú', pos: [-31.4460, -64.1800], providers: ['Internet Córdoba'] },
  { name: 'Las Lilas', pos: [-31.4430, -64.1730], providers: ['Internet Córdoba'] },
  { name: 'Los Ceibos', pos: [-31.4400, -64.1980], providers: ['Internet Córdoba'] },
  { name: 'Villa Argentina', pos: [-31.4510, -64.1950], providers: ['Internet Córdoba'] },
  { name: '1° de Mayo', pos: [-31.4320, -64.1700], providers: ['Internet Córdoba'] },
  { name: 'Los Artesanos', pos: [-31.4370, -64.1770], providers: ['Internet Córdoba'] },
  { name: 'Los Josefinos', pos: [-31.4390, -64.1750], providers: ['Internet Córdoba'] },
  { name: 'Crisol Norte', pos: [-31.4360, -64.1740], providers: ['Internet Córdoba'] },
  { name: 'Crisol Sud', pos: [-31.4400, -64.1710], providers: ['Internet Córdoba'] },
  { name: 'Miralta', pos: [-31.4440, -64.1760], providers: ['Internet Córdoba'] },
  { name: 'Mirador', pos: [-31.4430, -64.1790], providers: ['Internet Córdoba'] },
  { name: 'La Tablita', pos: [-31.4350, -64.1710], providers: ['Internet Córdoba'] },
  { name: 'San Cayetano', pos: [-31.4300, -64.1820], providers: ['Internet Córdoba'] },
  { name: 'Altamira', pos: [-31.4340, -64.1820], providers: ['Internet Córdoba'] },
  { name: 'Urquiza', pos: [-31.4290, -64.1840], providers: ['Internet Córdoba'] },
  { name: 'San Javier', pos: [-31.4450, -64.1900], providers: ['Internet Córdoba'] },
  { name: 'Nicolás Avellaneda', pos: [-31.4390, -64.1810], providers: ['Internet Córdoba'] },
  { name: 'Ferroviario Mitre', pos: [-31.4310, -64.1780], providers: ['Internet Córdoba'] },

  // ── Claro ────────────────────────────────────────────────
  { name: 'Nueva Córdoba', pos: [-31.4255, -64.1865], providers: ['Claro', 'Personal Fibra'] },
  { name: 'Alta Córdoba', pos: [-31.3985, -64.1807], providers: ['Claro'] },
  { name: 'Cerro de las Rosas', pos: [-31.3721, -64.2326], providers: ['Claro'] },
  { name: 'Güemes', pos: [-31.4215, -64.1935], providers: ['Claro'] },
  { name: 'Barrio Parque', pos: [-31.4175, -64.2030], providers: ['Claro'] },
  { name: 'Tablada', pos: [-31.4080, -64.2000], providers: ['Claro'] },
  { name: 'San Vicente', pos: [-31.4050, -64.1860], providers: ['Claro'] },
  { name: 'Jardín', pos: [-31.4471, -64.1817], providers: ['Claro'] },
  { name: 'San Carlos', pos: [-31.4010, -64.1820], providers: ['Claro'] },
  { name: 'Oña', pos: [-31.4050, -64.1960], providers: ['Claro'] },
  { name: 'Ayacucho', pos: [-31.4080, -64.1920], providers: ['Claro'] },
  { name: 'Cofico', pos: [-31.4230, -64.2070], providers: ['Claro'] },
  { name: 'Comercial', pos: [-31.4165, -64.1830], providers: ['Claro'] },
  { name: 'Independencia', pos: [-31.4180, -64.1930], providers: ['Claro'] },

  // ── IPLAN ────────────────────────────────────────────────
  { name: 'Centro', pos: [-31.4172, -64.1848], providers: ['IPLAN', 'Personal Fibra'] },
  { name: 'Alberdi', pos: [-31.4135, -64.1960], providers: ['IPLAN'] },

  // ── Batcom ───────────────────────────────────────────────
  { name: 'Los Boulevares', pos: [-31.3490, -64.2270], providers: ['Batcom'] },
  { name: 'Valle Escondido', pos: [-31.3650, -64.2250], providers: ['Batcom'] },
  { name: 'Chacra del Norte', pos: [-31.3570, -64.2240], providers: ['Batcom'] },
  { name: 'Malvinas Argentinas', pos: [-31.3500, -64.2300], providers: ['Batcom'] },

  // ── Guabi ────────────────────────────────────────────────
  { name: 'San Martín', pos: [-31.4155, -64.1780], providers: ['Guabi'] },
  { name: 'Villa Allende', pos: [-31.3860, -64.2070], providers: ['Guabi'] },
  { name: 'La Cañada', pos: [-31.4250, -64.2100], providers: ['Guabi'] },
];

const providers = [
  { name: 'Internet Córdoba', color: '#f59e0b' },
  { name: 'Claro', color: '#dc2626' },
  { name: 'Personal Fibra', color: '#3b82f6' },
  { name: 'IPLAN', color: '#ec4899' },
  { name: 'Batcom', color: '#8b5cf6' },
  { name: 'Guabi', color: '#06b6d4' },
];

const colorMap = Object.fromEntries(providers.map(p => [p.name, p.color]));
const cartoPositron = (x, y, z) => `https://a.basemaps.cartocdn.com/light_all/${z}/${x}/${y}{r}.png`;

export default function MapIsland() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [activePopup, setActivePopup] = useState(null);

  const filtered = activeFilter
    ? barrios.filter(b => b.providers.includes(activeFilter))
    : barrios;

  const providerCounts = {};
  barrios.forEach(b => b.providers.forEach(p => {
    providerCounts[p] = (providerCounts[p] || 0) + 1;
  }));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setActiveFilter(null); setActivePopup(null); }}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            !activeFilter ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-500 border border-gray-300'
          }`}
        >
          Todos ({barrios.length})
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
            {p.name} ({providerCounts[p.name] || 0})
          </button>
        ))}
      </div>

      <div className="w-full h-[55vh] min-h-[350px] rounded-lg overflow-hidden border border-gray-200">
        <Map
          height="100%"
          defaultCenter={CENTER}
          defaultZoom={12}
          provider={cartoPositron}
          onClick={() => setActivePopup(null)}
        >
          {filtered.map((b, i) => (
            <Overlay key={`${b.name}-${i}`} anchor={b.pos} offset={[0, 0]}>
              <div
                className="cursor-pointer group"
                onClick={(e) => { e.stopPropagation(); setActivePopup(activePopup === i ? null : i); }}
              >
                <div
                  className="w-3 h-3 rounded-full border-2 border-white shadow-md -translate-x-1.5 -translate-y-1.5"
                  style={{ backgroundColor: b.providers.length > 1 ? '#374151' : colorMap[b.providers[0]] }}
                />
                <div className="absolute left-1.5 top-0 -translate-y-full mb-0.5 whitespace-nowrap pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/90 shadow-sm border border-gray-200" style={{ color: '#1f2937' }}>
                    {b.name}
                  </span>
                </div>
              </div>
            </Overlay>
          ))}

          {activePopup !== null && (
            <Overlay anchor={filtered[activePopup].pos} offset={[6, 6]}>
              <div
                className="bg-white rounded-lg shadow-xl p-3 text-sm min-w-[160px] border border-gray-200 cursor-pointer z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="font-bold text-gray-900 mb-1.5">{filtered[activePopup].name}</div>
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

      <p className="text-xs text-gray-500 text-center">
        Barrios con cobertura confirmada de fibra óptica en Córdoba Capital (18/08/2026).
        La disponibilidad real depende de calle, altura y factibilidad técnica.
      </p>
    </div>
  );
}
