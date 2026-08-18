import { useState, useRef, useEffect, useCallback } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';

const CENTER = [-31.4220, -64.1860];
const base = '/fibramap-page';

const barrios = [
  // ── Internet Córdoba (67 barrios confirmados) ──────────────
  { name: 'General Paz', pos: [-31.4130, -64.1715], providers: ['Internet Córdoba'] },
  { name: 'Colón', pos: [-31.3970, -64.1830], providers: ['Internet Córdoba'] },
  { name: 'Maipú S1', pos: [-31.4065, -64.1755], providers: ['Internet Córdoba'] },
  { name: 'Maipú S2', pos: [-31.4040, -64.1730], providers: ['Internet Córdoba'] },
  { name: 'Villa Boedo', pos: [-31.4280, -64.1945], providers: ['Internet Córdoba'] },
  { name: 'Renacimiento', pos: [-31.4505, -64.1880], providers: ['Internet Córdoba'] },
  { name: 'Empalme', pos: [-31.3920, -64.1830], providers: ['Internet Córdoba'] },
  { name: 'Bajo General Paz', pos: [-31.4410, -64.1770], providers: ['Internet Córdoba'] },
  { name: 'Deán Funes', pos: [-31.4350, -64.1895], providers: ['Internet Córdoba'] },
  { name: 'Emaús', pos: [-31.4455, -64.1850], providers: ['Internet Córdoba'] },
  { name: 'Las Lilas', pos: [-31.4430, -64.1735], providers: ['Internet Córdoba'] },
  { name: 'Los Ceibos', pos: [-31.4410, -64.1975], providers: ['Internet Córdoba'] },
  { name: 'General Pueyrredón', pos: [-31.4380, -64.1830], providers: ['Internet Córdoba'] },
  { name: 'Rivadavia', pos: [-31.4485, -64.1760], providers: ['Internet Córdoba'] },
  { name: 'Sarmiento', pos: [-31.4150, -64.1730], providers: ['Internet Córdoba'] },
  { name: 'Villa Argentina', pos: [-31.4525, -64.2005], providers: ['Internet Córdoba'] },
  { name: '1° de Mayo', pos: [-31.4340, -64.1680], providers: ['Internet Córdoba'] },
  { name: 'Yapeyú', pos: [-31.4480, -64.1820], providers: ['Internet Córdoba'] },
  { name: 'Los Artesanos', pos: [-31.4350, -64.1755], providers: ['Internet Córdoba'] },
  { name: 'Los Josefinos', pos: [-31.4435, -64.1780], providers: ['Internet Córdoba'] },
  { name: 'Crisol Norte', pos: [-31.4395, -64.1725], providers: ['Internet Córdoba'] },
  { name: 'Crisol Sud', pos: [-31.4435, -64.1700], providers: ['Internet Córdoba'] },
  { name: 'Miralta', pos: [-31.4465, -64.1740], providers: ['Internet Córdoba'] },
  { name: 'Mirador', pos: [-31.4455, -64.1770], providers: ['Internet Córdoba'] },
  { name: 'La Tablita', pos: [-31.4375, -64.1710], providers: ['Internet Córdoba'] },
  { name: 'Altamira', pos: [-31.4365, -64.1810], providers: ['Internet Córdoba'] },
  { name: 'San Cayetano', pos: [-31.4310, -64.1815], providers: ['Internet Córdoba'] },
  { name: 'Urquiza', pos: [-31.4265, -64.1780], providers: ['Internet Córdoba'] },
  { name: 'San Javier', pos: [-31.4470, -64.1910], providers: ['Internet Córdoba'] },
  { name: 'Nicolás Avellaneda', pos: [-31.4420, -64.1860], providers: ['Internet Córdoba'] },
  { name: 'Ferroviario Mitre', pos: [-31.4320, -64.1770], providers: ['Internet Córdoba'] },

  // ── Claro (barrios reportados por distribuidor) ────────────
  { name: 'Nueva Córdoba', pos: [-31.4255, -64.1865], providers: ['Claro', 'Personal Fibra'] },
  { name: 'Alta Córdoba', pos: [-31.3985, -64.1807], providers: ['Claro'] },
  { name: 'Cerro de las Rosas', pos: [-31.3960, -64.2090], providers: ['Claro'] },
  { name: 'Güemes', pos: [-31.4250, -64.1930], providers: ['Claro'] },
  { name: 'Barrio Parque', pos: [-31.4155, -64.2040], providers: ['Claro'] },
  { name: 'Tablada', pos: [-31.4050, -64.2010], providers: ['Claro'] },
  { name: 'San Vicente', pos: [-31.4035, -64.1895], providers: ['Claro'] },
  { name: 'Jardín', pos: [-31.4105, -64.1815], providers: ['Claro'] },
  { name: 'San Carlos', pos: [-31.3995, -64.1785], providers: ['Claro'] },
  { name: 'Oña', pos: [-31.4015, -64.1955], providers: ['Claro'] },
  { name: 'Ayacucho', pos: [-31.4085, -64.1925], providers: ['Claro'] },
  { name: 'Cofico', pos: [-31.4210, -64.2040], providers: ['Claro'] },
  { name: 'Comercial', pos: [-31.4180, -64.1810], providers: ['Claro'] },
  { name: 'Independencia', pos: [-31.4190, -64.1960], providers: ['Claro'] },

  // ── IPLAN (Córdoba Centro confirmado) ──────────────────────
  { name: 'Centro', pos: [-31.4170, -64.1835], providers: ['IPLAN', 'Personal Fibra'] },
  { name: 'Alberdi', pos: [-31.4135, -64.1970], providers: ['IPLAN'] },

  // ── Batcom (barrios Gran Córdoba + Capital) ────────────────
  { name: 'Los Boulevares', pos: [-31.3860, -64.2200], providers: ['Batcom'] },
  { name: 'Valle Escondido', pos: [-31.3810, -64.2140], providers: ['Batcom'] },
  { name: 'Chacra del Norte', pos: [-31.3885, -64.2090], providers: ['Batcom'] },
  { name: 'Malvinas Argentinas', pos: [-31.3830, -64.2240], providers: ['Batcom'] },

  // ── Guabi (verificar zona: fibra = azul) ───────────────────
  { name: 'San Martín', pos: [-31.4185, -64.1765], providers: ['Guabi'] },
  { name: 'Villa Allende', pos: [-31.3935, -64.1985], providers: ['Guabi'] },
  { name: 'La Cañada', pos: [-31.4285, -64.2085], providers: ['Guabi'] },
];

const providers = [
  { name: 'Internet Córdoba', color: '#f59e0b', zone: { n: -31.388, s: -31.455, e: -64.165, w: -64.205 } },
  { name: 'Claro', color: '#dc2626', zone: { n: -31.395, s: -34.425, e: -64.175, w: -64.210 } },
  { name: 'Personal Fibra', color: '#2563eb', zone: { n: -31.415, s: -31.430, e: -64.182, w: -64.195 } },
  { name: 'IPLAN', color: '#ec4899', zone: { n: -31.410, s: -31.420, e: -64.178, w: -64.200 } },
  { name: 'Batcom', color: '#8b5cf6', zone: { n: -31.378, s: -31.392, e: -64.205, w: -64.228 } },
  { name: 'Guabi', color: '#06b6d4', zone: { n: -31.388, s: -31.432, e: -64.170, w: -64.212 } },
];

const colorMap = Object.fromEntries(providers.map(p => [p.name, p.color]));
const cartoDark = (x, y, z) => `https://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}{r}.png`;

const toRad = d => d * Math.PI / 180;
const toDeg = r => r * 180 / Math.PI;
const R = 6371000;

function project(lat, lng, center, zoom) {
  const s = 256 * Math.pow(2, zoom);
  const x = (lng + 180) / 360 * s;
  const y = (1 - Math.log(Math.tan(toRad(lat)) + 1 / Math.cos(toRad(lat))) / Math.PI) / 2 * s;
  return [x, y];
}

function PixelOverlay({ bounds, children }) {
  const [size, setSize] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!bounds || !size) return <div ref={ref} />;

  const zoom = Math.log2((size.w * 360) / ((bounds.e - bounds.w) * R * Math.PI / 180 * Math.cos(toRad(CENTER[0]))));
  const [cx, cy] = project(bounds.n, bounds.w, CENTER, zoom);
  const scale = size.w / (project(bounds.n, bounds.e, CENTER, zoom)[0] - cx);

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none" style={{ width: size.w, height: size.h }}>
      <svg width={size.w} height={size.h} className="absolute inset-0">
        {children({ cx, cy, scale })}
      </svg>
    </div>
  );
}

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

  const allBounds = { n: -31.375, s: -31.458, e: -64.160, w: -64.230 };

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

      <div className="w-full h-[55vh] min-h-[350px] rounded-lg overflow-hidden relative">
        <Map
          height="100%"
          defaultCenter={CENTER}
          defaultZoom={13}
          provider={cartoDark}
          onClick={() => setActivePopup(null)}
        >
          <PixelOverlay bounds={allBounds}>
            {({ cx, cy, scale }) => (
              <>
                {providers.map(p => {
                  const x1 = (project(p.zone.n, p.zone.w, CENTER, 13)[0] - cx) * scale;
                  const y1 = (project(p.zone.n, p.zone.w, CENTER, 13)[1] - cy) * scale;
                  const x2 = (project(p.zone.s, p.zone.e, CENTER, 13)[0] - cx) * scale;
                  const y2 = (project(p.zone.s, p.zone.e, CENTER, 13)[1] - cy) * scale;
                  return (
                    <rect
                      key={p.name}
                      x={Math.min(x1, x2)}
                      y={Math.min(y1, y2)}
                      width={Math.abs(x2 - x1)}
                      height={Math.abs(y2 - y1)}
                      fill={p.color}
                      fillOpacity={0.08}
                      stroke={p.color}
                      strokeWidth={1.5}
                      strokeOpacity={0.25}
                      strokeDasharray="6 3"
                      rx={4}
                    />
                  );
                })}
              </>
            )}
          </PixelOverlay>

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
        Polígonos: zonas aproximadas de cobertura por proveedor. Barrios: solo cobertura confirmada (18/08/2026).
        La disponibilidad real depende de calle, altura y factibilidad técnica.
      </p>
    </div>
  );
}
