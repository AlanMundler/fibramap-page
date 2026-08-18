import { useState } from 'react';

const servicios = [
  { id: 'claro-800', proveedor: 'Claro', plan: 'Fibra 800', velocidad: '800 Mbps', velocidadSub: '800 Mbps', download: 800, tecnologia: 'FTTH', precioDesc: '$26.999', precioLista: '', instalacion: '$0', observaciones: '70% OFF x5 meses + 1 mes gratis. Simétrico.' },
  { id: 'personal-600', proveedor: 'Personal Fibra', plan: '600 Mbps', velocidad: '600 Mbps', velocidadSub: '600 Mbps', download: 600, tecnologia: 'FTTH', precioDesc: '$31.000', precioLista: '$101.540', instalacion: '$0', observaciones: '70% OFF x6 meses. Internet Backup.' },
  { id: 'personal-300', proveedor: 'Personal Fibra', plan: '300 Mbps', velocidad: '300 Mbps', velocidadSub: '300 Mbps', download: 300, tecnologia: 'FTTH', precioDesc: '$23.000', precioLista: '$86.610', instalacion: '$0', observaciones: '74% OFF x6 meses. WiFi Backup incluido.' },
  { id: 'guabi-600', proveedor: 'Guabi', plan: '600 Mbps', velocidad: '600 Mbps', velocidadSub: '200 Mbps', download: 600, tecnologia: 'FTTH', precioDesc: '$35.750', precioLista: '$55.000', instalacion: '$0', observaciones: '35% OFF x6 meses. Verificar zona fibra.' },
  { id: 'batcom-500', proveedor: 'Batcom', plan: '500 Mbps', velocidad: '500 Mbps', velocidadSub: '250 Mbps', download: 500, tecnologia: 'FTTH', precioDesc: '$45.280', precioLista: '$56.600', instalacion: '$0', observaciones: '20% OFF x12 meses. Router comodato.' },
  { id: 'guabi-300', proveedor: 'Guabi', plan: '300 Mbps', velocidad: '300 Mbps', velocidadSub: '100 Mbps', download: 300, tecnologia: 'FTTH', precioDesc: '$31.707', precioLista: '$48.780', instalacion: '$0', observaciones: '35% OFF x6 meses. Verificar zona fibra.' },
  { id: 'icba-100', proveedor: 'Internet Córdoba', plan: '100 Megas', velocidad: '100 Mbps', velocidadSub: '30 Mbps', download: 100, tecnologia: 'FTTH', precioDesc: '$24.100', precioLista: '$24.100', instalacion: '$0', observaciones: '67 barrios. Precio fijo. WiFi incluido.' },
  { id: 'krill-100', proveedor: 'Krillcom', plan: '100 Mbps', velocidad: '100 Mbps', velocidadSub: '50 Mbps', download: 100, tecnologia: 'FTTH', precioDesc: '$36.200', precioLista: '$56.700', instalacion: '$70.000', observaciones: 'Con IVA. Router: $75.000 aparte.' },
];

const campos = [
  ['Velocidad ↓', 'velocidad'],
  ['Velocidad ↑', 'velocidadSub'],
  ['Tecnología', 'tecnologia'],
  ['Precio promo', 'precioDesc'],
  ['Precio lista', 'precioLista'],
  ['Instalación', 'instalacion'],
  ['Detalles', 'observaciones'],
];

function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
      {children}
    </select>
  );
}

export default function CompareIsland() {
  const [id1, setId1] = useState("");
  const [id2, setId2] = useState("");
  const s1 = servicios.find(s => s.id === id1);
  const s2 = servicios.find(s => s.id === id2);

  const precio = (s) => {
    const n = parseInt(s.precioDesc.replace(/[^0-9]/g, ''));
    return isNaN(n) ? null : n;
  };
  const precio100 = (s) => {
    const p = precio(s);
    if (!p || !s.download) return null;
    return (p / (s.download / 100)).toFixed(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={id1} onChange={setId1}>
          <option value="">Elegí un servicio</option>
          {servicios.map(s => <option key={s.id} value={s.id}>{s.proveedor} — {s.plan}</option>)}
        </Select>
        <Select value={id2} onChange={setId2}>
          <option value="">Elegí otro servicio</option>
          {servicios.map(s => <option key={s.id} value={s.id}>{s.proveedor} — {s.plan}</option>)}
        </Select>
      </div>

      {s1 && s2 && (
        <>
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Característica</th>
                  <th className="text-left py-2 px-3 font-semibold">{s1.proveedor}</th>
                  <th className="text-left py-2 px-3 font-semibold">{s2.proveedor}</th>
                </tr>
              </thead>
              <tbody>
                {campos.map(([label, key]) => (
                  <tr key={key} className="border-b border-gray-800">
                    <td className="py-2 px-3 text-gray-400">{label}</td>
                    <td className="py-2 px-3">{s1[key]}</td>
                    <td className="py-2 px-3">{s2[key]}</td>
                  </tr>
                ))}
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-3 text-gray-400 font-medium">Precio/100 Mbps</td>
                  <td className="py-2 px-3 font-medium">${precio100(s1) ?? '—'}</td>
                  <td className="py-2 px-3 font-medium">${precio100(s2) ?? '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {[s1, s2].map((s, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-sm">{s.proveedor} — {s.plan}</h3>
                {campos.map(([label, key]) => (
                  <div key={key} className="flex justify-between text-xs gap-2">
                    <span className="text-gray-400 shrink-0">{label}</span>
                    <span className="text-right">{s[key]}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs gap-2 border-t border-gray-700 pt-2">
                  <span className="text-gray-400 shrink-0">Precio/100 Mbps</span>
                  <span className="text-right font-medium">${precio100(s) ?? '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
