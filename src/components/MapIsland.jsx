import { useState, useEffect, useRef } from 'react';
import { SITE_BASE as base } from '../data/constants';

const CENTER = [-31.405, -64.175];

const SPEED_TIERS = {
  'Claro': 'Hasta 800 Mbps simétrico',
  'Personal Fibra': 'Hasta 600 Mbps',
  'IPLAN': 'Hasta 1.000 Mbps simétrico',
  'Internet Córdoba': 'Hasta 300 Mbps',
  'Batcom': 'Hasta 500 Mbps',
  'Guabi': 'Hasta 600 Mbps',
};

const providers = [
  { name: 'Claro', color: '#dc2626' },
  { name: 'Personal Fibra', color: '#3b82f6' },
  { name: 'IPLAN', color: '#ec4899' },
  { name: 'Internet Córdoba', color: '#f59e0b' },
  { name: 'Batcom', color: '#8b5cf6' },
  { name: 'Guabi', color: '#06b6d4' },
];

const colorMap = Object.fromEntries(providers.map(p => [p.name, p.color]));

// ── Polygon boundaries for each provider's coverage zone ──
// Approximate boundaries based on verified coverage areas
const coverageZones = [
  {
    provider: 'Claro',
    // 64+ barrios — covers most of Córdoba Capital
    // From ex-Fibertel + new FTTH deployment
    bounds: [
      [-31.3400, -64.2800], // NW corner
      [-31.3400, -64.1100], // NE corner
      [-31.4700, -64.1100], // SE corner
      [-31.4700, -64.2800], // SW corner
    ],
  },
  {
    provider: 'Personal Fibra',
    // "Amplia" — ex-Fibertel/Cablevisión HFC + new FTTH
    // Central and southern zones
    bounds: [
      [-31.3600, -64.2600], // NW
      [-31.3600, -64.1200], // NE
      [-31.4750, -64.1200], // SE
      [-31.4750, -64.2600], // SW
    ],
  },
  {
    provider: 'IPLAN',
    // Solo Centro/Nueva Córdoba — small zone
    bounds: [
      [-31.3950, -64.2050], // NW
      [-31.3950, -64.1700], // NE
      [-31.4350, -64.1700], // SE
      [-31.4350, -64.2050], // SW
    ],
  },
  {
    provider: 'Internet Córdoba',
    // 67 barrios — south/southeast focus
    bounds: [
      [-31.4000, -64.2100], // NW
      [-31.4000, -64.0900], // NE
      [-31.4750, -64.0900], // SE
      [-31.4750, -64.2100], // SW
    ],
  },
  {
    provider: 'Batcom',
    // 50+ barrios — north/northwest
    bounds: [
      [-31.3200, -64.2900], // NW
      [-31.3200, -64.1900], // NE
      [-31.3700, -64.1900], // SE
      [-31.3700, -64.2900], // SW
    ],
  },
  {
    provider: 'Guabi',
    // Zona Sur exclusivamente
    bounds: [
      [-31.4400, -64.2300], // NW
      [-31.4400, -64.1700], // NE
      [-31.4800, -64.1700], // SE
      [-31.4800, -64.2300], // SW
    ],
  },
];

// Barrio points for click interaction
const barrios = [
  // ── Claro (verificados: distribuidor oficial + phontel) ──────
  { name: 'Centro', pos: [-31.4182, -64.1871], providers: ['Claro', 'Personal Fibra', 'IPLAN'] },
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

  // ── Personal Fibra (verificados: phontel, selectra) ─────────
  // Amplia coverage via ex-Fibertel/Cablevisión HFC + new FTTH
  { name: 'Villa Allende', pos: [-31.2950, -64.2350], providers: ['Personal Fibra'] },
  { name: 'Nueva Italia', pos: [-31.3500, -64.2100], providers: ['Personal Fibra'] },
  { name: 'Villa Corazón de María', pos: [-31.3800, -64.1900], providers: ['Personal Fibra'] },
  { name: 'Los Plátanos', pos: [-31.3900, -64.1700], providers: ['Personal Fibra'] },
  { name: 'Pajas Blancas', pos: [-31.3700, -64.1500], providers: ['Personal Fibra'] },
  { name: 'Villa Belgrano', pos: [-31.3600, -64.1800], providers: ['Personal Fibra'] },
  { name: 'Villa Urquiza', pos: [-31.4100, -64.2100], providers: ['Personal Fibra'] },
  { name: 'San Martín', pos: [-31.4200, -64.2000], providers: ['Personal Fibra'] },
  { name: 'Argüello', pos: [-31.3900, -64.2200], providers: ['Personal Fibra'] },
  { name: 'Residencial del Golf', pos: [-31.3800, -64.2400], providers: ['Personal Fibra'] },
  { name: 'Villa Revol', pos: [-31.4300, -64.1900], providers: ['Personal Fibra'] },
  { name: 'Villa Retiro', pos: [-31.4400, -64.2000], providers: ['Personal Fibra'] },
  { name: 'Villa Belgrano (Sur)', pos: [-31.4500, -64.2100], providers: ['Personal Fibra'] },
  { name: 'San Fernando', pos: [-31.4600, -64.2000], providers: ['Personal Fibra'] },
  { name: 'Villa Esquiú', pos: [-31.4400, -64.1800], providers: ['Personal Fibra'] },
  { name: 'Villa Centenario', pos: [-31.4500, -64.1900], providers: ['Personal Fibra'] },
  { name: 'Villa Hipódromo', pos: [-31.4200, -64.1600], providers: ['Personal Fibra'] },
  { name: 'Villa Sicilia', pos: [-31.4300, -64.1700], providers: ['Personal Fibra'] },
  { name: 'Villa Gabriel', pos: [-31.4100, -64.1500], providers: ['Personal Fibra'] },
  { name: 'Villa Costanza', pos: [-31.4000, -64.1400], providers: ['Personal Fibra'] },

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
  { name: 'Valle Cercano', pos: [-31.4520, -64.2100], providers: ['Guabi'] },
  { name: 'Parque Futura', pos: [-31.4580, -64.2050], providers: ['Guabi'] },
  { name: 'La Esperanza', pos: [-31.4620, -64.1980], providers: ['Guabi'] },
  { name: 'Villa El Libertador', pos: [-31.4550, -64.2020], providers: ['Guabi'] },
  { name: 'San Ignacio (Sur)', pos: [-31.4600, -64.1950], providers: ['Guabi'] },
  { name: 'Procrear Liceo', pos: [-31.3530, -64.2210], providers: ['Batcom', 'Guabi'] },
];

const voyager = (x, y, z) => `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/{y}{r}.png`;

export default function MapIsland() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [activePopup, setActivePopup] = useState(null);
  const [L, setL] = useState(null);

  useEffect(() => {
    (async () => {
      const leaflet = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      setL(leaflet.default || leaflet);
    })();
  }, []);

  const filtered = activeFilter
    ? barrios.filter(b => b.providers.includes(activeFilter))
    : barrios;

  const providerCounts = {};
  barrios.forEach(b => b.providers.forEach(p => {
    providerCounts[p] = (providerCounts[p] || 0) + 1;
  }));

  if (!L) {
    return (
      <div className="w-full h-[50vh] sm:h-[55vh] min-h-[300px] sm:min-h-[350px] rounded-xl overflow-hidden border border-gray-700/50 bg-gray-800 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Cargando mapa...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setActiveFilter(null); setActivePopup(null); }}
          className={!activeFilter ? 'btn-pill-active' : 'btn-pill'}
        >
          Todos ({barrios.length})
        </button>
        {providers.map(p => (
          <button
            key={p.name}
            onClick={() => setActiveFilter(activeFilter === p.name ? null : p.name)}
            className="btn-pill"
            style={{
              backgroundColor: activeFilter === p.name ? p.color + '20' : undefined,
              color: activeFilter === p.name ? p.color : undefined,
              borderColor: activeFilter === p.name ? p.color + '80' : undefined,
              boxShadow: activeFilter === p.name ? `0 4px 14px ${p.color}30` : undefined,
            }}
          >
            {p.name} ({providerCounts[p.name] || 0})
          </button>
        ))}
      </div>

      <div className="w-full h-[50vh] sm:h-[55vh] min-h-[300px] sm:min-h-[350px] rounded-xl overflow-hidden border border-gray-700/50 shadow-lg shadow-gray-900/30">
        <LeafletMap
          L={L}
          center={CENTER}
          zoom={12}
          activeFilter={activeFilter}
          filtered={filtered}
          activePopup={activePopup}
          setActivePopup={setActivePopup}
          coverageZones={coverageZones}
          colorMap={colorMap}
        />
      </div>

      <p className="text-xs text-gray-500 text-center">
        Zonas con cobertura confirmada de fibra óptica en Córdoba Capital (19/08/2026).
        La disponibilidad real depende de calle, altura y factibilidad técnica.
      </p>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-gray-500">
        {providers.map(p => (
          <span key={p.name} className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function LeafletMap({ L, center, zoom, activeFilter, filtered, activePopup, setActivePopup, coverageZones, colorMap }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polygonsRef = useRef([]);
  const popupRef = useRef(null);
  const filteredRef = useRef(filtered);
  const activePopupRef = useRef(activePopup);
  const colorMapRef = useRef(colorMap);

  filteredRef.current = filtered;
  activePopupRef.current = activePopup;
  colorMapRef.current = colorMap;

  useEffect(() => {
    if (!L || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

    L.tileLayer(voyager('{x}', '{y}', '{z}'), {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', () => setActivePopup(null));
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [L]);

  // Update polygons when filter changes
  useEffect(() => {
    if (!L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing polygons
    polygonsRef.current.forEach(p => map.removeLayer(p));
    polygonsRef.current = [];

    // Draw coverage zones
    coverageZones.forEach(zone => {
      if (activeFilter && zone.provider !== activeFilter) return;

      const color = colorMap[zone.provider];
      const polygon = L.polygon(zone.bounds, {
        color: color,
        weight: 2,
        opacity: 0.7,
        fillColor: color,
        fillOpacity: 0.08,
        dashArray: '6 4',
      }).addTo(map);

      polygon.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
      });

      polygonsRef.current.push(polygon);
    });
  }, [L, activeFilter, coverageZones, colorMap]);

  // Update markers when filter changes
  useEffect(() => {
    if (!L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    filtered.forEach((b, i) => {
      const color = b.providers.length > 1 ? '#6b7280' : colorMap[b.providers[0]];
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      const marker = L.marker(b.pos, { icon }).addTo(map);
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setActivePopup(activePopup === i ? null : i);
      });

      markersRef.current.push(marker);
    });
  }, [L, filtered, activePopup, setActivePopup, colorMap]);

  // Handle popup
  useEffect(() => {
    if (!L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing popup
    if (popupRef.current) {
      map.removeLayer(popupRef.current);
      popupRef.current = null;
    }

    if (activePopup !== null && filtered[activePopup]) {
      const b = filtered[activePopup];
      const popupContent = `
        <div style="background:#1f2937;border-radius:8px;padding:12px;color:white;font-family:system-ui;min-width:200px;max-width:260px;border:1px solid #374151;">
          <div style="font-weight:bold;margin-bottom:8px;font-size:13px;">${b.name}</div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${b.providers.map(p => `
              <a href="${base}/provider" style="display:flex;align-items:center;gap:8px;text-decoration:none;font-size:12px;font-weight:500;">
                <span style="width:8px;height:8px;border-radius:50%;background:${colorMap[p]};flex-shrink:0;"></span>
                <span style="color:#d1d5db;">${p}</span>
                <span style="margin-left:auto;font-size:10px;color:#6b7280;">${SPEED_TIERS[p] || ''}</span>
              </a>
            `).join('')}
          </div>
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid #374151;">
            <a href="${base}/provider" style="font-size:10px;color:#60a5fa;text-decoration:none;">Ver planes y precios →</a>
          </div>
        </div>
      `;

      popupRef.current = L.popup({
        closeButton: false,
        autoPan: false,
        className: 'custom-popup',
      })
        .setLatLng(b.pos)
        .setContent(popupContent)
        .openOn(map);
    }
  }, [L, activePopup, filtered, colorMap]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}
