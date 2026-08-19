import { useState } from 'react';

const servicios = [
  { id: 'personal-300', proveedor: 'Personal Fibra', plan: '300 Mbps', download: 300, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 26000, precioLista: 86610, instalacion: 0, descuento: '74% OFF x6 meses', detalle: 'WiFi Backup y Video Pass incluidos.', cobertura: 'Amplia' },
  { id: 'personal-300-flow', proveedor: 'Personal Fibra', plan: '300 + Flow', download: 300, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 36000, precioLista: 125480, instalacion: 0, descuento: '76% OFF x6 meses', detalle: 'Incluye Flow Full (150+ canales).', cobertura: 'Amplia' },
  { id: 'personal-600', proveedor: 'Personal Fibra', plan: '600 Mbps', download: 600, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 31000, precioLista: 101540, instalacion: 0, descuento: '70% OFF x6 meses', detalle: 'Internet Backup incluido.', cobertura: 'Amplia' },
  { id: 'claro-200', proveedor: 'Claro', plan: 'Fibra 200', download: 200, upload: '200 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 18999, precioLista: 0, instalacion: 0, descuento: '70% OFF x5 meses + 1 gratis', detalle: '64+ barrios. Simétrico.', cobertura: '64+ barrios' },
  { id: 'claro-500', proveedor: 'Claro', plan: 'Fibra 500', download: 500, upload: '500 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 21999, precioLista: 0, instalacion: 0, descuento: '70% OFF x5 meses + 1 gratis', detalle: '64+ barrios. Simétrico.', cobertura: '64+ barrios' },
  { id: 'claro-800', proveedor: 'Claro', plan: 'Fibra 800', download: 800, upload: '800 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 26999, precioLista: 0, instalacion: 0, descuento: '70% OFF x5 meses + 1 gratis', detalle: '64+ barrios. Simétrico.', cobertura: '64+ barrios' },
  { id: 'icba-100', proveedor: 'Internet Córdoba', plan: '100 Megas', download: 100, upload: '30 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 24100, precioLista: 24100, instalacion: 0, descuento: 'Precio fijo', detalle: '67 barrios. WiFi incluido.', cobertura: '67 barrios' },
  { id: 'icba-150', proveedor: 'Internet Córdoba', plan: '150 Megas', download: 150, upload: '40 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 25400, precioLista: 25400, instalacion: 0, descuento: 'Precio fijo', detalle: '67 barrios. WiFi incluido.', cobertura: '67 barrios' },
  { id: 'icba-300', proveedor: 'Internet Córdoba', plan: '300 Megas', download: 300, upload: '60 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 26800, precioLista: 26800, instalacion: 0, descuento: 'Precio fijo', detalle: '67 barrios. WiFi incluido.', cobertura: '67 barrios' },
  { id: 'batcom-100', proveedor: 'Batcom', plan: '100 Mbps', download: 100, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 36400, precioLista: 45500, instalacion: 0, descuento: '20% OFF x12 meses', detalle: 'WiFi de cortesía. Equipos comodato.', cobertura: 'Norte/Noroeste' },
  { id: 'batcom-300', proveedor: 'Batcom', plan: '300 Mbps', download: 300, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 40640, precioLista: 50800, instalacion: 0, descuento: '20% OFF x12 meses', detalle: 'WiFi de cortesía. Equipos comodato.', cobertura: 'Norte/Noroeste' },
  { id: 'batcom-500', proveedor: 'Batcom', plan: '500 Mbps', download: 500, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 45280, precioLista: 58300, instalacion: 0, descuento: '20% OFF x12 meses', detalle: 'WiFi de cortesía. Equipos comodato.', cobertura: 'Norte/Noroeste' },
  { id: 'guabi-100', proveedor: 'Guabi', plan: '100 Mbps', download: 100, upload: '50 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 23940, precioLista: 36830, instalacion: 0, descuento: '35% OFF x6 meses', detalle: 'Zona Sur exclusivamente.', cobertura: 'Zona Sur' },
  { id: 'guabi-300', proveedor: 'Guabi', plan: '300 Mbps', download: 300, upload: '100 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 31707, precioLista: 48780, instalacion: 0, descuento: '35% OFF x6 meses', detalle: 'Zona Sur exclusivamente.', cobertura: 'Zona Sur' },
  { id: 'guabi-600', proveedor: 'Guabi', plan: '600 Mbps', download: 600, upload: '200 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 35750, precioLista: 55000, instalacion: 0, descuento: '35% OFF x6 meses', detalle: 'Zona Sur exclusivamente.', cobertura: 'Zona Sur' },
  { id: 'tele-150', proveedor: 'Telecentro', plan: '150 MB + Fijo', download: 150, upload: '15 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 17999, precioLista: 0, instalacion: 0, descuento: 'Primer mes gratis', detalle: 'Incluye telefonía fija. Solo Centro.', cobertura: 'Centro/Nueva Córdoba' },
  { id: 'tele-300', proveedor: 'Telecentro', plan: '300 MB + Fijo', download: 300, upload: '20 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 13999, precioLista: 0, instalacion: 0, descuento: 'Primer mes gratis', detalle: 'Incluye telefonía fija. Solo Centro.', cobertura: 'Centro/Nueva Córdoba' },
  { id: 'tele-1000', proveedor: 'Telecentro', plan: '1000 MB + Fijo', download: 1000, upload: '30 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 26999, precioLista: 0, instalacion: 0, descuento: 'Primer mes gratis', detalle: 'Incluye telefonía fija. Solo Centro.', cobertura: 'Centro/Nueva Córdoba' },
  { id: 'iplan-500', proveedor: 'IPLAN', plan: '500 Megas', download: 500, upload: '500 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 0, precioLista: 0, instalacion: 0, descuento: '44% OFF x12 meses', detalle: 'SIMÉTRICO. Solo Centro. Precio: consultar.', cobertura: 'Centro/Nueva Córdoba' },
  { id: 'iplan-800', proveedor: 'IPLAN', plan: '800 Megas', download: 800, upload: '800 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 0, precioLista: 0, instalacion: 0, descuento: '44% OFF x12 meses', detalle: 'SIMÉTRICO. Solo Centro. Precio: consultar.', cobertura: 'Centro/Nueva Córdoba' },
  { id: 'iplan-1000', proveedor: 'IPLAN', plan: '1000 Megas', download: 1000, upload: '1 Gbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 0, precioLista: 0, instalacion: 0, descuento: '44% OFF x12 meses', detalle: 'SIMÉTRICO. Solo Centro. Precio: consultar.', cobertura: 'Centro/Nueva Córdoba' },
  { id: 'krill-50', proveedor: 'Krillcom', plan: '50 Mbps', download: 50, upload: '10 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 29900, precioLista: 36200, instalacion: 70000, descuento: 'Con IVA', detalle: 'Router no incluido.', cobertura: 'Periférico' },
  { id: 'krill-100', proveedor: 'Krillcom', plan: '100/50 + TV', download: 100, upload: '50 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 56700, precioLista: 56700, instalacion: 70000, descuento: 'Con IVA', detalle: 'Incluye TV. Router Wi-Fi: $75.000 aparte.', cobertura: 'Periférico' },
  { id: 'trimo-100', proveedor: 'Trimotion', plan: '100 Mbps', download: 100, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 28900, precioLista: 28900, instalacion: 70000, descuento: 'Precios julio 2026', detalle: 'Precio agosto NO confirmado.', cobertura: 'Variable' },
  { id: 'trimo-200', proveedor: 'Trimotion', plan: '200 Mbps', download: 200, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 31900, precioLista: 31900, instalacion: 70000, descuento: 'Precios julio 2026', detalle: 'Precio agosto NO confirmado.', cobertura: 'Variable' },
  { id: 'trimo-300', proveedor: 'Trimotion', plan: '300 Mbps', download: 300, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 34900, precioLista: 34900, instalacion: 70000, descuento: 'Precios julio 2026', detalle: 'Precio agosto NO confirmado.', cobertura: 'Variable' },
];

const fmt = (n) => n ? `$${n.toLocaleString('es-AR')}` : 'Consultar';
const precio100 = (s) => s.precioDesc && s.download ? (s.precioDesc / (s.download / 100)).toFixed(0) : null;
const proveedores = [...new Set(servicios.map(s => s.proveedor))];

export default function CompareIsland() {
  const [filter, setFilter] = useState('');
  const [sel, setSel] = useState([]);

  const filtered = filter ? servicios.filter(s => s.proveedor === filter) : servicios;

  const toggle = (id) => {
    setSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  const selected = sel.map(id => servicios.find(s => s.id === id)).filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${!filter ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>Todos</button>
        {proveedores.map(p => (
          <button key={p} onClick={() => setFilter(filter === p ? '' : p)} className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${filter === p ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>{p}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {filtered.map(s => {
          const active = sel.includes(s.id);
          return (
            <button key={s.id} onClick={() => toggle(s.id)} className={`text-left p-2.5 rounded-lg border text-xs transition-all ${active ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-medium text-[11px] text-gray-400">{s.proveedor}</span>
                {s.simetrico && <span className="text-[9px] px-1 py-0.5 rounded bg-green-600/20 text-green-400">SIM</span>}
              </div>
              <div className="font-semibold text-sm">{s.plan}</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-bold text-sm">{s.precioDesc ? fmt(s.precioDesc) : 'Consultar'}</span>
                {s.precioLista > 0 && <span className="line-through text-gray-500 text-[10px]">{fmt(s.precioLista)}</span>}
              </div>
              <div className="text-gray-500 text-[10px]">{s.download}↓ / {s.upload}↑</div>
            </button>
          );
        })}
      </div>

      {sel.length >= 2 && (
        <div className="overflow-x-auto border-t border-gray-700 pt-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-2 text-gray-400"></th>
                {selected.map(s => <th key={s.id} className="text-left py-2 px-2 font-semibold">{s.proveedor} — {s.plan}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ['Velocidad ↓', s => `${s.download} Mbps`],
                ['Velocidad ↑', s => s.upload],
                ['Simétrico', s => s.simetrico ? '✓' : '✗'],
                ['Precio promo', s => fmt(s.precioDesc)],
                ['Precio lista', s => s.precioLista > 0 ? fmt(s.precioLista) : '—'],
                ['Instalación', s => s.instalacion > 0 ? fmt(s.instalacion) : 'Gratis'],
                ['Descuento', s => s.descuento],
                ['Cobertura', s => s.cobertura],
              ].map(([label, fn]) => (
                <tr key={label} className="border-b border-gray-800">
                  <td className="py-1.5 px-2 text-gray-400">{label}</td>
                  {selected.map(s => <td key={s.id} className="py-1.5 px-2">{fn(s)}</td>)}
                </tr>
              ))}
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <td className="py-1.5 px-2 text-gray-400 font-medium">Precio/100 Mbps</td>
                {selected.map(s => <td key={s.id} className="py-1.5 px-2 font-bold">{precio100(s) ? `$${precio100(s)}` : '—'}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {sel.length >= 2 && (
        <button onClick={() => setSel([])} className="text-xs text-gray-500 hover:text-white transition-colors">Limpiar selección</button>
      )}
    </div>
  );
}
