import { useState, useEffect, useRef, useMemo } from 'react';
import { SITE_BASE as base } from '../data/constants';
import barriosData from '../data/barrios-combined.json';
import ispBarrios from '../data/isp-barrios.json';

const CENTER = [-31.405, -64.175];

const SPEED_TIERS = {
  'Claro': 'Hasta 800 Mbps simétrico',
  'Personal Fibra': 'Hasta 600 Mbps',
  'IPLAN': 'Hasta 1.000 Mbps simétrico',
  'Internet Córdoba': 'Hasta 300 Mbps',
  'Batcom': 'Hasta 500 Mbps',
  'Guabi': 'Hasta 600 Mbps',
  'Telecentro': 'Hasta 1.000 Mbps',
};

const providers = [
  { name: 'Claro', color: '#dc2626' },
  { name: 'Personal Fibra', color: '#3b82f6' },
  { name: 'IPLAN', color: '#ec4899' },
  { name: 'Internet Córdoba', color: '#f59e0b' },
  { name: 'Batcom', color: '#8b5cf6' },
  { name: 'Guabi', color: '#06b6d4' },
  { name: 'Telecentro', color: '#f97316' },
];

const colorMap = Object.fromEntries(providers.map(p => [p.name, p.color]));

// Group GeoJSON features by provider
const featuresByProvider = {};
for (const feature of barriosData.features) {
  const provider = feature.properties.provider;
  if (!featuresByProvider[provider]) featuresByProvider[provider] = [];
  featuresByProvider[provider].push(feature);
}

// Extract barrio names per provider for filter counts
const providerBarrioCount = {};
for (const [provider, features] of Object.entries(featuresByProvider)) {
  providerBarrioCount[provider] = features.length;
}

const voyager = (x, y, z) => `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/{y}{r}.png`;

export default function MapIsland() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [L, setL] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSelected, setSearchSelected] = useState(null);

  const allBarrios = useMemo(() => [...new Set(Object.values(ispBarrios).flat())].sort(), []);
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return allBarrios.filter(b => b.toLowerCase().includes(q)).slice(0, 10);
  }, [searchQuery, allBarrios]);
  const providersForBarrio = useMemo(() => {
    if (!searchSelected) return [];
    return Object.entries(ispBarrios).filter(([_, barrios]) => barrios.includes(searchSelected)).map(([name]) => name);
  }, [searchSelected]);

  useEffect(() => {
    (async () => {
      const leaflet = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      setL(leaflet.default || leaflet);
    })();
  }, []);

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
          onClick={() => setActiveFilter(null)}
          className={!activeFilter ? 'btn-pill-active' : 'btn-pill'}
        >
          Todos
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
            {p.name} ({providerBarrioCount[p.name] || 0})
          </button>
        ))}
      </div>

      <div className="relative w-full h-[50vh] sm:h-[55vh] min-h-[300px] sm:min-h-[350px] rounded-xl overflow-hidden border border-gray-700/50 shadow-lg shadow-gray-900/30">
        <LeafletMap
          L={L}
          center={CENTER}
          zoom={12}
          activeFilter={activeFilter}
          colorMap={colorMap}
          featuresByProvider={featuresByProvider}
        />

        <div className="absolute top-3 left-3 right-3 z-[9999]">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchSelected(null); }}
              placeholder="Buscá tu barrio..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-800/90 border border-gray-600/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm shadow-lg"
            />
            {searchMatches.length > 0 && !searchSelected && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl py-1.5 max-h-48 overflow-y-auto">
                {searchMatches.map(b => (
                  <button
                    key={b}
                    onClick={() => { setSearchSelected(b); setSearchQuery(b); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>
          {searchSelected && (
            <div className="mt-1.5 bg-gray-800/95 backdrop-blur-sm rounded-xl border border-gray-700 p-3 shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white text-sm">{searchSelected}</span>
                <button onClick={() => { setSearchSelected(null); setSearchQuery(''); }} className="text-xs text-gray-500 hover:text-white">✕</button>
              </div>
              {providersForBarrio.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {providersForBarrio.map(name => (
                    <span key={name} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">{name}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">Sin cobertura confirmada. Verificá con cada proveedor.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        ⚠️ Los polígonos indican <strong className="text-gray-400">presencia general del proveedor en el barrio</strong>, no garantizan servicio exacto en tu cuadra o dirección. La disponibilidad real depende de calle, altura y factibilidad técnica. Verificá disponibilidad directamente con cada proveedor.
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

function LeafletMap({ L, center, zoom, activeFilter, colorMap, featuresByProvider }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef([]);
  const popupRef = useRef(null);
  const activeFilterRef = useRef(activeFilter);
  const colorMapRef = useRef(colorMap);

  activeFilterRef.current = activeFilter;
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

    map.on('click', () => {
      if (popupRef.current) {
        map.removeLayer(popupRef.current);
        popupRef.current = null;
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [L]);

  // Draw barrio polygons when filter changes
  useEffect(() => {
    if (!L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing layers
    layersRef.current.forEach(l => map.removeLayer(l));
    layersRef.current = [];

    const providersToShow = activeFilter
      ? [activeFilter]
      : Object.keys(featuresByProvider);

    for (const provider of providersToShow) {
      const features = featuresByProvider[provider] || [];
      const color = colorMap[provider];

      for (const feature of features) {
        const geo = feature.geometry;
        if (!geo) continue;

        let latlngs;
        if (geo.type === 'MultiPolygon') {
          latlngs = geo.coordinates.map(polygon =>
            polygon.map(ring => ring.map(([lng, lat]) => [lat, lng]))
          );
        } else if (geo.type === 'Polygon') {
          latlngs = [geo.coordinates.map(ring => ring.map(([lng, lat]) => [lat, lng]))];
        } else {
          continue;
        }

        const polygon = L.polygon(latlngs, {
          color: color,
          weight: 1.5,
          opacity: 0.6,
          fillColor: color,
          fillOpacity: 0.1,
          dashArray: '4 3',
        }).addTo(map);

        const barrioName = feature.properties.Nombre || 'Sin nombre';
        polygon.on('click', (e) => {
          L.DomEvent.stopPropagation(e);

          if (popupRef.current) {
            map.removeLayer(popupRef.current);
            popupRef.current = null;
          }

          // Calculate centroid for popup
          let lat = 0, lng = 0, count = 0;
          for (const ring of latlngs[0]) {
            for (const [la, lo] of ring) { lat += la; lng += lo; count++; }
          }
          const centerLat = lat / count;
          const centerLng = lng / count;

          const providersInBarrio = [];
          for (const [p, feats] of Object.entries(featuresByProvider)) {
            if (feats.some(f => f.properties.Nombre === barrioName)) {
              providersInBarrio.push(p);
            }
          }

          const popupContent = `
            <div style="background:#1f2937;border-radius:8px;padding:12px;color:white;font-family:system-ui;min-width:200px;max-width:260px;border:1px solid #374151;">
              <div style="font-weight:bold;margin-bottom:8px;font-size:13px;">${barrioName}</div>
              <div style="display:flex;flex-direction:column;gap:6px;">
                ${providersInBarrio.map(p => `
                  <a href="${base}/provider" style="display:flex;align-items:center;gap:8px;text-decoration:none;font-size:12px;font-weight:500;">
                    <span style="width:8px;height:8px;border-radius:50%;background:${colorMapRef.current[p]};flex-shrink:0;"></span>
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
            .setLatLng([centerLat, centerLng])
            .setContent(popupContent)
            .openOn(map);
        });

        // Hover effects
        polygon.on('mouseover', function() {
          this.setStyle({ fillOpacity: 0.25, weight: 2.5, opacity: 0.9 });
        });
        polygon.on('mouseout', function() {
          this.setStyle({ fillOpacity: 0.1, weight: 1.5, opacity: 0.6 });
        });

        layersRef.current.push(polygon);
      }
    }
  }, [L, activeFilter, featuresByProvider, colorMap]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}
