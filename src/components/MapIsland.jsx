import { useState } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';

const CENTER = [-31.405, -64.175];
const base = '/fibramap-page';

const barrios = [
  // ── Claro (verificados: distribuidor oficial + phontel) ──────
  { name: 'Centro', pos: [-31.4182, -64.1871], providers: ['Claro', 'Personal Fibra'] },
  { name: 'General Paz', pos: [-31.4124, -64.1671], providers: ['Claro', 'Personal Fibra'] },
  { name: 'Cerro de las Rosas', pos: [-31.3767, -64.2341], providers: ['Claro', 'Personal Fibra'] },
  { name: 'Cofico', pos: [-31.4029, -64.1849], providers: ['Claro'] },
  { name: 'General Bustos', pos: [-31.4055, -64.1815], providers: ['Claro'] },
  { name: 'Cerro Norte', pos: [-31.3720, -64.2280], providers: ['Claro'] },
  { name: 'Barrio Providencia', pos: [-31.3960, -64.2050], providers: ['Claro'] },
  { name: 'Müller', pos: [-31.4010, -64.1960], providers: ['Claro'] },
  { name: 'Colón', pos: [-31.4030, -64.1750], providers: ['Claro'] },
  { name: 'Empalme', pos: [-31.4323, -64.1242], providers: ['Claro'] },
  { name: 'Barrio Parque', pos: [-31.4160, -64.2030], providers: ['Claro'] },
  { name: 'Tablada', pos: [-31.3877, -64.2318], providers: ['Claro'] },
  { name: 'Comercial', pos: [-31.4165, -64.1830], providers: ['Claro'] },
  { name: 'Nueva Córdoba', pos: [-31.4255, -64.1865], providers: ['Claro', 'Personal Fibra', 'IPLAN'] },
  { name: 'Alta Córdoba', pos: [-31.3982, -64.1803], providers: ['Claro'] },
  { name: 'Güemes', pos: [-31.4243, -64.1913], providers: ['Claro'] },
  { name: 'San Vicente', pos: [-31.4235, -64.1510], providers: ['Claro'] },
  { name: 'Jardín', pos: [-31.4471, -64.1817], providers: ['Claro'] },
  { name: 'San Carlos', pos: [-31.4010, -64.1820], providers: ['Claro'] },
  { name: 'Oña', pos: [-31.4495, -64.1662], providers: ['Claro'] },
  { name: 'Ayacucho', pos: [-31.4080, -64.1920], providers: ['Claro'] },
  { name: 'Independencia', pos: [-31.4015, -64.1890], providers: ['Claro'] },
  { name: 'Alberdi', pos: [-31.4140, -64.1980], providers: ['Claro'] },

  // ── Internet Córdoba (verificados: selectra, phontel) ───────
  { name: 'Maipú', pos: [-31.4360, -64.1594], providers: ['Internet Córdoba'] },
  { name: 'Sarmiento', pos: [-31.4080, -64.1720], providers: ['Internet Córdoba'] },
  { name: 'Deán Funes', pos: [-31.4447, -64.1195], providers: ['Internet Córdoba'] },
  { name: 'General Pueyrredón', pos: [-31.4100, -64.1714], providers: ['Internet Córdoba'] },
  { name: 'Bajo General Paz', pos: [-31.4280, -64.1650], providers: ['Internet Córdoba'] },
  { name: 'Emaús', pos: [-31.4375, -64.1435], providers: ['Internet Córdoba'] },
  { name: 'Renacimiento', pos: [-31.4156, -64.1227], providers: ['Internet Córdoba'] },
  { name: 'Rivadavia', pos: [-31.4480, -64.1650], providers: ['Internet Córdoba'] },
  { name: 'Yapeyú', pos: [-31.4124, -64.1498], providers: ['Internet Córdoba'] },
  { name: 'Las Lilas', pos: [-31.4456, -64.1348], providers: ['Internet Córdoba'] },
  { name: 'Los Ceibos', pos: [-31.4400, -64.1980], providers: ['Internet Córdoba'] },
  { name: 'Villa Argentina', pos: [-31.4510, -64.1950], providers: ['Internet Córdoba'] },
  { name: '1° de Mayo', pos: [-31.4320, -64.1680], providers: ['Internet Córdoba'] },
  { name: 'Los Artesanos', pos: [-31.4360, -64.1760], providers: ['Internet Córdoba'] },
  { name: 'Los Josefinos', pos: [-31.4380, -64.1740], providers: ['Internet Córdoba'] },
  { name: 'Crisol Norte', pos: [-31.4350, -64.1730], providers: ['Internet Córdoba'] },
  { name: 'Crisol Sud', pos: [-31.4400, -64.1700], providers: ['Internet Córdoba'] },
  { name: 'Miralta', pos: [-31.4430, -64.1750], providers: ['Internet Córdoba'] },
  { name: 'Mirador', pos: [-31.4420, -64.1780], providers: ['Internet Córdoba'] },
  { name: 'La Tablita', pos: [-31.4340, -64.1700], providers: ['Internet Córdoba'] },
  { name: 'San Cayetano', pos: [-31.4357, -64.1424], providers: ['Internet Córdoba'] },
  { name: 'Altamira', pos: [-31.4277, -64.1300], providers: ['Internet Córdoba'] },
  { name: 'Urquiza', pos: [-31.4394, -64.1478], providers: ['Internet Córdoba'] },
  { name: 'San Javier', pos: [-31.4568, -64.1028], providers: ['Internet Córdoba'] },
  { name: 'Nicolás Avellaneda', pos: [-31.4380, -64.1750], providers: ['Internet Córdoba'] },
  { name: 'Ferroviario Mitre', pos: [-31.4341, -64.1377], providers: ['Internet Córdoba'] },

  // ── Personal Fibra (verificados: phontel, selectra) ─────────
  // (ya incluidos en Centro, General Paz, Cerro de las Rosas, Nueva Córdoba arriba)



  // ── IPLAN (verificados: iplan.com.ar, selectra) ────────────
  // Solo "Córdoba Centro" confirmado → ya incluido en Centro y Nueva Córdoba

  // ── Batcom (verificados: batcom.com.ar, 50+ barrios) ───────
  { name: 'Los Boulevares', pos: [-31.3449, -64.2322], providers: ['Batcom'] },
  { name: 'Valle Escondido', pos: [-31.3672, -64.2746], providers: ['Batcom'] },
  { name: 'Chacra del Norte', pos: [-31.3521, -64.2208], providers: ['Batcom'] },
  { name: 'Malvinas Argentinas', pos: [-31.3500, -64.2200], providers: ['Batcom'] },
  { name: 'Juárez Celman', pos: [-31.3580, -64.2150], providers: ['Batcom'] },
  { name: 'Lilí Benítez', pos: [-31.3490, -64.2180], providers: ['Batcom'] },
  { name: 'Torres SUMMUM', pos: [-31.3540, -64.2250], providers: ['Batcom'] },
  { name: 'Universitario de Horizonte', pos: [-31.3350, -64.2100], providers: ['Batcom'] },
  { name: 'San Ignacio Horizonte', pos: [-31.3380, -64.2120], providers: ['Batcom'] },
  { name: 'Cinco Lomas', pos: [-31.3470, -64.2280], providers: ['Batcom'] },

  // ── Guabi (verificados: guabi.com.ar, Instagram, Reddit) ────
  // ZONA SUR exclusivamente — "Llegamos al sur de Córdoba"
  { name: 'Valle Cercano', pos: [-31.4520, -64.2100], providers: ['Guabi'] },
  { name: 'Parque Futura', pos: [-31.4580, -64.2050], providers: ['Guabi'] },
  { name: 'La Esperanza', pos: [-31.4620, -64.1980], providers: ['Guabi'] },
  { name: 'Villa El Libertador', pos: [-31.4550, -64.2020], providers: ['Guabi'] },
  { name: 'San Ignacio (Sur)', pos: [-31.4600, -64.1950], providers: ['Guabi'] },
  { name: 'Procrear Liceo', pos: [-31.3530, -64.2210], providers: ['Batcom', 'Guabi'] },
];

const providers = [
  { name: 'Claro', color: '#dc2626' },
  { name: 'Personal Fibra', color: '#3b82f6' },

  { name: 'IPLAN', color: '#ec4899' },
  { name: 'Internet Córdoba', color: '#f59e0b' },
  { name: 'Batcom', color: '#8b5cf6' },
  { name: 'Guabi', color: '#06b6d4' },
];

const colorMap = Object.fromEntries(providers.map(p => [p.name, p.color]));
const voyager = (x, y, z) => `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}{r}.png`;

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
          provider={voyager}
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
                <div className="absolute left-1.5 top-0 -translate-y-full mb-0.5 whitespace-nowrap pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/90 shadow-sm border border-gray-200 text-gray-800">
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
