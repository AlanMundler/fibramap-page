import { useState } from 'react';

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
  { id: 'icba-100', proveedor: 'Internet Córdoba', plan: '100 Megas', download: 100, upload: '30 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 24100, precioLista: 24100, instalacion: 0, descuento: 'Precio fijo', detalle: '67 barrios. WiFi incluido.', cobertura: '67 barrios' },
  { id: 'icba-150', proveedor: 'Internet Córdoba', plan: '150 Megas', download: 150, upload: '40 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 25400, precioLista: 25400, instalacion: 0, descuento: 'Precio fijo', detalle: '67 barrios. WiFi incluido.', cobertura: '67 barrios' },
  { id: 'icba-300', proveedor: 'Internet Córdoba', plan: '300 Megas', download: 300, upload: '60 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 26800, precioLista: 26800, instalacion: 0, descuento: 'Precio fijo', detalle: '67 barrios. WiFi incluido.', cobertura: '67 barrios' },

  // ── Batcom ───────────────────────────────────────────
  { id: 'batcom-100', proveedor: 'Batcom', plan: '100 Mbps', download: 100, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 36400, precioLista: 45500, instalacion: 0, descuento: '20% OFF x12 meses', detalle: 'WiFi de cortesía. Equipos comodato.', cobertura: 'Norte/Noroeste' },
  { id: 'batcom-300', proveedor: 'Batcom', plan: '300 Mbps', download: 300, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 40640, precioLista: 50800, instalacion: 0, descuento: '20% OFF x12 meses', detalle: 'WiFi de cortesía. Equipos comodato.', cobertura: 'Norte/Noroeste' },
  { id: 'batcom-500', proveedor: 'Batcom', plan: '500 Mbps', download: 500, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 45280, precioLista: 58300, instalacion: 0, descuento: '20% OFF x12 meses', detalle: 'WiFi de cortesía. Equipos comodato.', cobertura: 'Norte/Noroeste' },

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
  { id: 'krill-50', proveedor: 'Krillcom', plan: '50 Mbps', download: 50, upload: '10 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 29900, precioLista: 36200, instalacion: 70000, descuento: 'Con IVA', detalle: 'Router no incluido.', cobertura: 'Periférico' },
  { id: 'krill-100', proveedor: 'Krillcom', plan: '100/50 + TV', download: 100, upload: '50 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 56700, precioLista: 56700, instalacion: 70000, descuento: 'Con IVA', detalle: 'Incluye TV. Router Wi-Fi: $75.000 aparte.', cobertura: 'Periférico' },

  // ── Trimotion ───────────────────────────────────────
  { id: 'trimo-100', proveedor: 'Trimotion', plan: '100 Mbps', download: 100, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 28900, precioLista: 28900, instalacion: 70000, descuento: 'Precios julio 2026', detalle: 'Precio agosto NO confirmado.', cobertura: 'Variable' },
  { id: 'trimo-200', proveedor: 'Trimotion', plan: '200 Mbps', download: 200, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 31900, precioLista: 31900, instalacion: 70000, descuento: 'Precios julio 2026', detalle: 'Precio agosto NO confirmado.', cobertura: 'Variable' },
  { id: 'trimo-300', proveedor: 'Trimotion', plan: '300 Mbps', download: 300, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 34900, precioLista: 34900, instalacion: 70000, descuento: 'Precios julio 2026', detalle: 'Precio agosto NO confirmado.', cobertura: 'Variable' },
];

const fmt = (n) => n ? `$${n.toLocaleString('es-AR')}` : 'Consultar';
const precio100 = (s) => s.precioDesc && s.download ? (s.precioDesc / (s.download / 100)).toFixed(0) : null;
const proveedores = [...new Set(servicios.map(s => s.proveedor))];

export default function CompareIsland() {
  const [step, setStep] = useState('pick-providers');
  const [sel1, setSel1] = useState('');
  const [sel2, setSel2] = useState('');
  const [id1, setId1] = useState('');
  const [id2, setId2] = useState('');

  const plans1 = sel1 ? servicios.filter(s => s.proveedor === sel1) : [];
  const plans2 = sel2 ? servicios.filter(s => s.proveedor === sel2) : [];

  const s1 = servicios.find(s => s.id === id1);
  const s2 = servicios.find(s => s.id === id2);
  const showTable = s1 && s2;

  const reset = () => { setStep('pick-providers'); setSel1(''); setSel2(''); setId1(''); setId2(''); };

  if (step === 'pick-providers') {
    return (
      <div className="space-y-4">
        <p className="text-gray-400 text-sm">Elegí dos proveedores para comparar:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {proveedores.map(p => {
            const count = servicios.filter(s => s.proveedor === p).length;
            const active = sel1 === p || sel2 === p;
            return (
              <button
                key={p}
                onClick={() => {
                  if (active) {
                    if (sel1 === p) { setSel1(sel2); setSel2(''); setId1(id2); setId2(''); }
                    else { setSel2(''); setId2(''); }
                  } else if (!sel1) setSel1(p);
                  else if (!sel2) setSel2(p);
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  active ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500' : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <div className="font-semibold text-sm">{p}</div>
                <div className="text-gray-500 text-xs">{count} plan{count > 1 ? 'es' : ''}</div>
              </button>
            );
          })}
        </div>
        {sel1 && sel2 && (
          <button onClick={() => setStep('pick-plans')} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors">
            Comparar {sel1} vs {sel2}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={reset} className="text-xs text-gray-400 hover:text-white transition-colors">← Elegir otros proveedores</button>
        <span className="text-xs text-gray-500">|</span>
        <span className="text-xs text-gray-400">{sel1} vs {sel2}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[{ label: sel1, plans: plans1, sel: id1, set: setId1 }, { label: sel2, plans: plans2, sel: id2, set: setId2 }].map(({ label, plans, sel, set }) => (
          <div key={label} className="space-y-2">
            <div className="text-xs text-gray-400 font-medium">{label}</div>
            <div className="space-y-1.5">
              {plans.map(s => (
                <button
                  key={s.id}
                  onClick={() => set(sel === s.id ? '' : s.id)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                    sel === s.id ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500' : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{s.plan}</span>
                    {s.simetrico && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-600/20 text-green-400 font-medium">SIM</span>}
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-bold">{s.precioDesc ? fmt(s.precioDesc) : 'Consultar'}</span>
                    {s.precioLista > 0 && <span className="line-through text-gray-500 text-[10px]">{fmt(s.precioLista)}</span>}
                  </div>
                  <div className="text-gray-500 text-[10px]">{s.download}↓ / {s.upload}↑</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showTable && (
        <div className="overflow-x-auto border-t border-gray-700 pt-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-2 text-gray-400 font-medium"></th>
                <th className="text-left py-2 px-2 font-semibold">{s1.proveedor} — {s1.plan}</th>
                <th className="text-left py-2 px-2 font-semibold">{s2.proveedor} — {s2.plan}</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Velocidad ↓', s => `${s.download} Mbps`],
                ['Velocidad ↑', s => s.upload],
                ['Simétrico', s => s.simetrico ? '✓ Sí' : '✗ No'],
                ['Precio promo', s => fmt(s.precioDesc)],
                ['Precio lista', s => s.precioLista > 0 ? fmt(s.precioLista) : '—'],
                ['Instalación', s => s.instalacion > 0 ? fmt(s.instalacion) : 'Gratis'],
                ['Descuento', s => s.descuento],
                ['Cobertura', s => s.cobertura],
                ['Detalles', s => s.detalle],
              ].map(([label, fn]) => (
                <tr key={label} className="border-b border-gray-800">
                  <td className="py-2 px-2 text-gray-400">{label}</td>
                  <td className="py-2 px-2">{fn(s1)}</td>
                  <td className="py-2 px-2">{fn(s2)}</td>
                </tr>
              ))}
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <td className="py-2 px-2 text-gray-400 font-medium">Precio/100 Mbps</td>
                <td className="py-2 px-2 font-bold">{precio100(s1) ? `$${precio100(s1)}` : '—'}</td>
                <td className="py-2 px-2 font-bold">{precio100(s2) ? `$${precio100(s2)}` : '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
