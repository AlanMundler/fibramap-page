import { useState, useMemo } from 'react';

const servicios = [
  // ── Personal Fibra ──────────────────────────────────
  { id: 'personal-300', proveedor: 'Personal Fibra', plan: '300 Mbps', download: 300, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 26000, precioLista: 86610, instalacion: 0, descuento: '74% OFF x6 meses', detalle: 'WiFi Backup y Video Pass incluidos.', cobertura: 'Amplia' },
  { id: 'personal-300-flow', proveedor: 'Personal Fibra', plan: '300 + Flow', download: 300, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 36000, precioLista: 125480, instalacion: 0, descuento: '76% OFF x6 meses', detalle: 'Incluye Flow Full (150+ canales).', cobertura: 'Amplia' },
  { id: 'personal-600', proveedor: 'Personal Fibra', plan: '600 Mbps', download: 600, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 31000, precioLista: 101540, instalacion: 0, descuento: '70% OFF x6 meses', detalle: 'Internet Backup incluido.', cobertura: 'Amplia' },

  // ── Claro ────────────────────────────────────────────
  { id: 'claro-200', proveedor: 'Claro', plan: 'Fibra 200', download: 200, upload: '200 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 18999, precioLista: 0, instalacion: 0, descuento: '70% OFF x5 meses + 1 gratis', detalle: '64+ barrios. Simétrico.', cobertura: '64+ barrios' },
  { id: 'claro-500', proveedor: 'Claro', plan: 'Fibra 500', download: 500, upload: '500 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 21999, precioLista: 0, instalacion: 0, descuento: '70% OFF x5 meses + 1 gratis', detalle: '64+ barrios. Simétrico.', cobertura: '64+ barrios' },
  { id: 'claro-800', proveedor: 'Claro', plan: 'Fibra 800', download: 800, upload: '800 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 26999, precioLista: 0, instalacion: 0, descuento: '70% OFF x5 meses + 1 gratis', detalle: '64+ barrios. Simétrico.', cobertura: '64+ barrios' },

  // ── Internet Córdoba ────────────────────────────────
  { id: 'icba-200', proveedor: 'Internet Córdoba', plan: '200 Megas', download: 200, upload: 'No informada', tecnologia: 'FTTH', simetrico: false, precioDesc: 18999, precioLista: 0, instalacion: 0, descuento: 'Primer mes gratis', detalle: '67 barrios. WiFi incluido.', cobertura: '67 barrios' },
  { id: 'icba-100', proveedor: 'Internet Córdoba', plan: '100 Megas', download: 100, upload: '30 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 24100, precioLista: 24100, instalacion: 0, descuento: 'Precio fijo', detalle: '67 barrios. WiFi incluido.', cobertura: '67 barrios' },
  { id: 'icba-300', proveedor: 'Internet Córdoba', plan: '300 Megas', download: 300, upload: '60 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 0, precioLista: 0, instalacion: 0, descuento: 'Precio a confirmar', detalle: '67 barrios. WiFi incluido.', cobertura: '67 barrios' },

  // ── Batcom ───────────────────────────────────────────
  { id: 'batcom-100', proveedor: 'Batcom', plan: '100 Mbps', download: 100, upload: '50 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 36400, precioLista: 45500, instalacion: 0, descuento: '20% OFF x12 meses', detalle: 'WiFi de cortesía. Equipos comodato.', cobertura: 'Norte/Noroeste' },
  { id: 'batcom-300', proveedor: 'Batcom', plan: '300 Mbps', download: 300, upload: '150 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 40640, precioLista: 50800, instalacion: 0, descuento: '20% OFF x12 meses', detalle: 'WiFi de cortesía. Equipos comodato.', cobertura: 'Norte/Noroeste' },
  { id: 'batcom-500', proveedor: 'Batcom', plan: '500 Mbps', download: 500, upload: '250 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 45280, precioLista: 58300, instalacion: 0, descuento: '20% OFF x12 meses', detalle: 'WiFi de cortesía. Equipos comodato.', cobertura: 'Norte/Noroeste' },

  // ── Guabi ────────────────────────────────────────────
  { id: 'guabi-100', proveedor: 'Guabi', plan: '100 Mbps', download: 100, upload: '50 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 23940, precioLista: 36830, instalacion: 0, descuento: '35% OFF x6 meses', detalle: 'Zona Sur exclusivamente.', cobertura: 'Zona Sur' },
  { id: 'guabi-300', proveedor: 'Guabi', plan: '300 Mbps', download: 300, upload: '100 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 31707, precioLista: 48780, instalacion: 0, descuento: '35% OFF x6 meses', detalle: 'Zona Sur exclusivamente.', cobertura: 'Zona Sur' },
  { id: 'guabi-600', proveedor: 'Guabi', plan: '600 Mbps', download: 600, upload: '200 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 35750, precioLista: 55000, instalacion: 0, descuento: '35% OFF x6 meses', detalle: 'Zona Sur exclusivamente.', cobertura: 'Zona Sur' },

  // ── Telecentro ──────────────────────────────────────
  { id: 'tele-150', proveedor: 'Telecentro', plan: '150 MB + Fijo', download: 150, upload: '15 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 17999, precioLista: 0, instalacion: 0, descuento: 'Primer mes gratis', detalle: 'Incluye telefonía fija. Solo Centro.', cobertura: 'Centro/Nueva Córdoba' },
  { id: 'tele-300', proveedor: 'Telecentro', plan: '300 MB + Fijo', download: 300, upload: '20 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 13999, precioLista: 0, instalacion: 0, descuento: 'Primer mes gratis', detalle: 'Incluye telefonía fija. Solo Centro.', cobertura: 'Centro/Nueva Córdoba' },
  { id: 'tele-1000', proveedor: 'Telecentro', plan: '1000 MB + Fijo', download: 1000, upload: '30 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 26999, precioLista: 0, instalacion: 0, descuento: 'Primer mes gratis', detalle: 'Incluye telefonía fija. Solo Centro.', cobertura: 'Centro/Nueva Córdoba' },

  // ── IPLAN (sin precio confirmado) ───────────────────
  { id: 'iplan-500', proveedor: 'IPLAN', plan: '500 Megas', download: 500, upload: '500 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 0, precioLista: 0, instalacion: 0, descuento: '44% OFF x12 meses', detalle: 'SIMÉTRICO. Solo Centro. Precio: consultar.', cobertura: 'Centro/Nueva Córdoba' },
  { id: 'iplan-800', proveedor: 'IPLAN', plan: '800 Megas', download: 800, upload: '800 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 0, precioLista: 0, instalacion: 0, descuento: '44% OFF x12 meses', detalle: 'SIMÉTRICO. Solo Centro. Precio: consultar.', cobertura: 'Centro/Nueva Córdoba' },
  { id: 'iplan-1000', proveedor: 'IPLAN', plan: '1000 Megas', download: 1000, upload: '1 Gbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 0, precioLista: 0, instalacion: 0, descuento: '44% OFF x12 meses', detalle: 'SIMÉTRICO. Solo Centro. Precio: consultar.', cobertura: 'Centro/Nueva Córdoba' },

  // ── Krillcom ────────────────────────────────────────
  { id: 'krill-50', proveedor: 'Krillcom', plan: '50 Mbps', download: 50, upload: '4 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 29900, precioLista: 36200, instalacion: 70000, descuento: 'Con IVA', detalle: 'Router no incluido.', cobertura: 'Periférico' },
  { id: 'krill-100', proveedor: 'Krillcom', plan: '100 Mbps', download: 100, upload: '50 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 36200, precioLista: 56700, instalacion: 70000, descuento: 'Con IVA', detalle: 'Router Wi-Fi: $75.000 aparte.', cobertura: 'Periférico' },

  // ── Trimotion ───────────────────────────────────────
  { id: 'trimo-100', proveedor: 'Trimotion', plan: '100 Mbps', download: 100, upload: 'No informada', tecnologia: 'FTTH', simetrico: false, precioDesc: 28900, precioLista: 28900, instalacion: 70000, descuento: 'Precios julio 2026', detalle: 'Precio agosto NO confirmado.', cobertura: 'Variable' },
  { id: 'trimo-200', proveedor: 'Trimotion', plan: '200 Mbps', download: 200, upload: 'No informada', tecnologia: 'FTTH', simetrico: false, precioDesc: 31900, precioLista: 31900, instalacion: 70000, descuento: 'Precios julio 2026', detalle: 'Precio agosto NO confirmado.', cobertura: 'Variable' },
  { id: 'trimo-300', proveedor: 'Trimotion', plan: '300 Mbps', download: 300, upload: 'No informada', tecnologia: 'FTTH', simetrico: false, precioDesc: 34900, precioLista: 34900, instalacion: 70000, descuento: 'Precios julio 2026', detalle: 'Precio agosto NO confirmado.', cobertura: 'Variable' },
];

const fmt = (n) => n ? `$${n.toLocaleString('es-AR')}` : 'Consultar';
const precio100 = (s) => s.precioDesc && s.download ? (s.precioDesc / (s.download / 100)).toFixed(0) : null;

const proveedores = [...new Set(servicios.map(s => s.proveedor))];

function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
      {children}
    </select>
  );
}

export default function CompareIsland() {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('download');
  const [id1, setId1] = useState('');
  const [id2, setId2] = useState('');
  const [id3, setId3] = useState('');

  const filtered = filter === 'all' ? servicios : servicios.filter(s => s.proveedor === filter);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === 'precio') arr.sort((a, b) => (a.precioDesc || 999999) - (b.precioDesc || 999999));
    else if (sortBy === 'download') arr.sort((a, b) => b.download - a.download);
    else if (sortBy === 'precio100') arr.sort((a, b) => (parseFloat(precio100(a)) || 999999) - (parseFloat(precio100(b)) || 999999));
    return arr;
  }, [filtered, sortBy]);

  const s1 = servicios.find(s => s.id === id1);
  const s2 = servicios.find(s => s.id === id2);
  const s3 = servicios.find(s => s.id === id3);
  const selected = [s1, s2, s3].filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={filter} onChange={setFilter}>
          <option value="all">Todos los proveedores</option>
          {proveedores.map(p => <option key={p} value={p}>{p}</option>)}
        </Select>
        <Select value={sortBy} onChange={setSortBy}>
          <option value="download">Ordenar por velocidad ↓</option>
          <option value="precio">Ordenar por precio ↑</option>
          <option value="precio100">Ordenar por precio/100 Mbps ↑</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {sorted.map(s => {
          const isSelected = selected.some(x => x?.id === s.id);
          const selIdx = selected.findIndex(x => x?.id === s.id);
          return (
            <button
              key={s.id}
              onClick={() => {
                if (isSelected) {
                  if (selIdx === 0) setId1(id2 || id3 || '');
                  else if (selIdx === 1) setId2(id3 || '');
                  else setId3('');
                } else if (!id1) setId1(s.id);
                else if (!id2) setId2(s.id);
                else if (!id3) setId3(s.id);
              }}
              className={`text-left p-3 rounded-lg border text-xs transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{s.proveedor}</span>
                {s.simetrico && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-600/20 text-green-400 font-medium">SIM</span>}
              </div>
              <div className="text-gray-400 mb-1">{s.plan}</div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-sm">{s.precioDesc ? fmt(s.precioDesc) : 'Consultar'}</span>
                {s.precioLista > 0 && <span className="line-through text-gray-500 text-[10px]">{fmt(s.precioLista)}</span>}
              </div>
              <div className="text-gray-500 text-[10px] mt-0.5">{s.download}↓ / {s.upload}↑</div>
            </button>
          );
        })}
      </div>

      {selected.length >= 2 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-2 text-gray-400 font-medium">Característica</th>
                {selected.map((s, i) => (
                  <th key={i} className="text-left py-2 px-2 font-semibold">{s.proveedor} — {s.plan}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Velocidad ↓', s => `${s.download} Mbps`],
                ['Velocidad ↑', s => s.upload],
                ['Simétrico', s => s.simetrico ? '✓ Sí' : '✗ No'],
                ['Tecnología', s => s.tecnologia],
                ['Precio promo', s => fmt(s.precioDesc)],
                ['Precio lista', s => s.precioLista > 0 ? fmt(s.precioLista) : '—'],
                ['Instalación', s => s.instalacion > 0 ? fmt(s.instalacion) : 'Gratis'],
                ['Descuento', s => s.descuento],
                ['Cobertura', s => s.cobertura],
                ['Detalles', s => s.detalle],
              ].map(([label, fn]) => (
                <tr key={label} className="border-b border-gray-800">
                  <td className="py-2 px-2 text-gray-400">{label}</td>
                  {selected.map((s, i) => (
                    <td key={i} className="py-2 px-2">{fn(s)}</td>
                  ))}
                </tr>
              ))}
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <td className="py-2 px-2 text-gray-400 font-medium">Precio/100 Mbps</td>
                {selected.map((s, i) => (
                  <td key={i} className="py-2 px-2 font-bold">{precio100(s) ? `$${precio100(s)}` : '—'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
