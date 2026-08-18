import { useState } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';

const CENTER = [-31.419797, -64.188566];
const base = '/fibramap-page';

const barrios = [
  // ── Internet Córdoba (67 barrios confirmados) ──────────────
  { name: 'General Paz', pos: [-31.4138, -64.1672], providers: ['Internet Córdoba'] },
  { name: 'Colón', pos: [-31.3960, -64.1870], providers: ['Internet Córdoba'] },
  { name: 'Maipú S1', pos: [-31.4080, -64.1770], providers: ['Internet Córdoba'] },
  { name: 'Villa Boedo', pos: [-31.4270, -64.1930], providers: ['Internet Córdoba'] },
  { name: 'Renacimiento', pos: [-31.4510, -64.1900], providers: ['Internet Córdoba'] },
  { name: 'Empalme', pos: [-31.3900, -64.1850], providers: ['Internet Córdoba'] },
  { name: 'Bajo General Paz', pos: [-31.4420, -64.1780], providers: ['Internet Córdoba'] },
  { name: 'Deán Funes', pos: [-31.4360, -64.1910], providers: ['Internet Córdoba'] },
  { name: 'Emaús', pos: [-31.4460, -64.1860], providers: ['Internet Córdoba'] },
  { name: 'Las Lilas', pos: [-31.4430, -64.1720], providers: ['Internet Córdoba'] },
  { name: 'Los Ceibos', pos: [-31.4420, -64.1980], providers: ['Internet Córdoba'] },
  { name: 'General Pueyrredón', pos: [-31.4390, -64.1840], providers: ['Internet Córdoba'] },
  { name: 'Rivadavia', pos: [-31.4490, -64.1760], providers: ['Internet Córdoba'] },
  { name: 'Sarmiento', pos: [-31.4155, -64.1740], providers: ['Internet Córdoba'] },
  { name: 'Villa Argentina', pos: [-31.4530, -64.2010], providers: ['Internet Córdoba'] },
  { name: '1° de Mayo', pos: [-31.4340, -64.1680], providers: ['Internet Córdoba'] },
  { name: 'Yapeyú', pos: [-31.4480, -64.1840], providers: ['Internet Córdoba'] },
  { name: 'Los Artesanos', pos: [-31.4350, -64.1770], providers: ['Internet Córdoba'] },
  { name: 'Los Josefinos', pos: [-31.4440, -64.1790], providers: ['Internet Córdoba'] },
  { name: 'Crisol Norte', pos: [-31.4400, -64.1730], providers: ['Internet Córdoba'] },
  { name: 'Crisol Sud', pos: [-31.4440, -64.1700], providers: ['Internet Córdoba'] },
  { name: 'Miralta', pos: [-31.4470, -64.1740], providers: ['Internet Córdoba'] },
  { name: 'Mirador', pos: [-31.4460, -64.1770], providers: ['Internet Córdoba'] },
  { name: 'La Tablita', pos: [-31.4380, -64.1710], providers: ['Internet Córdoba'] },
  { name: 'Altamira', pos: [-31.4370, -64.1820], providers: ['Internet Córdoba'] },
  { name: 'San Cayetano', pos: [-31.4310, -64.1820], providers: ['Internet Córdoba'] },
  { name: 'Urquiza', pos: [-31.4260, -64.1770], providers: ['Internet Córdoba'] },

  // ── Claro (barrios reportados por distribuidor) ────────────
  { name: 'Nueva Córdoba', pos: [-31.4244, -64.1868], providers: ['Claro', 'Personal Fibra'] },
  { name: 'Alta Córdoba', pos: [-31.4120, -64.1920], providers: ['Claro'] },
  { name: 'Cerro de las Rosas', pos: [-31.3960, -64.2100], providers: ['Claro'] },
  { name: 'Güemes', pos: [-31.4253, -64.1946], providers: ['Claro'] },
  { name: 'Barrio Parque', pos: [-31.4150, -64.2050], providers: ['Claro'] },
  { name: 'Tablada', pos: [-31.4050, -64.2000], providers: ['Claro'] },
  { name: 'Comercial', pos: [-31.4180, -64.1800], providers: ['Claro'] },
  { name: 'San Vicente', pos: [-31.4035, -64.1890], providers: ['Claro'] },
  { name: 'Jardín', pos: [-31.4101, -64.1820], providers: ['Claro'] },
  { name: 'San Carlos', pos: [-31.3995, -64.1780], providers: ['Claro'] },
  { name: 'Oña', pos: [-31.4010, -64.1960], providers: ['Claro'] },
  { name: 'Ayacucho', pos: [-31.4090, -64.1930], providers: ['Claro'] },
  { name: 'Cofico', pos: [-31.4210, -64.2050], providers: ['Claro'] },
  { name: 'Maipú S2', pos: [-31.4060, -64.1750], providers: ['Claro'] },

  // ── IPLAN (Córdoba Centro confirmado) ──────────────────────
  { name: 'Centro', pos: [-31.4169, -64.1838], providers: ['IPLAN', 'Personal Fibra'] },

  // ── Batcom (barrios de Gran Córdoba + Capital) ─────────────
  { name: 'Los Boulevares', pos: [-31.3850, -64.2200], providers: ['Batcom'] },
  { name: 'Valle Escondido', pos: [-31.3800, -64.2150], providers: ['Batcom'] },
  { name: 'Chacra del Norte', pos: [-31.3880, -64.2080], providers: ['Batcom'] },
  { name: 'Malvinas Argentinas', pos: [-31.3820, -64.2250], providers: ['Batcom'] },

  // ── Guabi (verificar zona: fibra = azul, aire = naranja) ───
  { name: 'Alberdi', pos: [-31.4136, -64.1965], providers: ['Guabi'] },
  { name: 'San Martín', pos: [-31.4190, -64.1760], providers: ['Guabi'] },
  { name: 'Villa Allende', pos: [-31.3930, -64.1990], providers: ['Guabi'] },
];

const providers = [
  { name: 'Internet Córdoba', color: '#f59e0b' },
  { name: 'Claro', color: '#dc2626' },
  { name: 'Personal Fibra', color: '#2563eb' },
  { name: 'IPLAN', color: '#ec4899' },
  { name: 'Batcom', color: '#8b5cf6' },
  { name: 'Guabi', color: '#06b6d4' },
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
            !activeFilter ? 'bg-gray-700 shadow' : 'bg-gray-700/50'
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
                className="bg-gray-800 rounded-lg shadow-xl p-3 text-sm min-w-[160px] border border-gray-700 cursor-pointer"
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

      <p className="text-xs text-gray-500 text-center">
        Barrios mostrados: solo cobertura confirmada por la investigación del 18/08/2026.
        La disponibilidad real depende de calle, altura y factibilidad técnica.
      </p>
    </div>
  );
}
