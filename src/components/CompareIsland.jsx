import { useState } from 'react';

const servicios = [
  { id: 'claro-500', proveedor: 'Claro', plan: 'Fibra 500 MB', velocidad: '500 Mbps', velocidadSub: '500 Mbps', velocidadBaj: '500 Mbps', tecnologia: 'FTTH', ip: 'Dinámica', instalacion: '$0', precioLista: '$65.289', precioDesc: '$21.999', atencionCl: '0800-123-5555', descripcion: 'Internet + teléfono fijo' },
  { id: 'personal-600', proveedor: 'Personal', plan: 'Internet 600 MB', velocidad: '600 Mbps', velocidadSub: '600 Mbps', velocidadBaj: '600 Mbps', tecnologia: 'FTTH', ip: 'Dinámica', instalacion: '$0', precioLista: '$103.360', precioDesc: '$30.000', atencionCl: '0800-444-0800', descripcion: 'Internet + Backup celular' },
  { id: 'iplan-800', proveedor: 'Iplan', plan: '800 Megas', velocidad: '800 Mbps', velocidadSub: '800 Mbps', velocidadBaj: '800 Mbps', tecnologia: 'FTTH', ip: 'Dinámica (CG-NAT)', instalacion: '$0', precioLista: '+$45.000', precioDesc: '$37.533', atencionCl: '0800-345-1111', descripcion: 'Fibra soterrada WiFi 6' },
  { id: 'movistar-600', proveedor: 'Movistar', plan: 'Fibra 600', velocidad: '600 Mbps', velocidadSub: '600 Mbps', velocidadBaj: '600 Mbps', tecnologia: 'FTTH', ip: 'Dinámica (CGNAT)', instalacion: '$0', precioLista: '$25.500', precioDesc: '$21.500', atencionCl: '0800-MOVISTAR', descripcion: 'Internet simétrico' },
  { id: 'icba-300', proveedor: 'Internet Córdoba', plan: 'Plan 300 Megas', velocidad: '300 Mbps', velocidadSub: '60 Mbps', velocidadBaj: '300 Mbps', tecnologia: 'FTTH', ip: 'Dinámica', instalacion: '$0', precioLista: '$26.800', precioDesc: '$26.800', atencionCl: '0800-345-5858', descripcion: 'ISP local, precio fijo' },
];

const campos = [
  ['Velocidad', 'velocidad'],
  ['Subida', 'velocidadSub'],
  ['Bajada', 'velocidadBaj'],
  ['Tecnología', 'tecnologia'],
  ['IP', 'ip'],
  ['Instalación', 'instalacion'],
  ['Precio lista', 'precioLista'],
  ['Precio promo', 'precioDesc'],
  ['Atención', 'atencionCl'],
  ['Incluye', 'descripcion'],
];

function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
      {children}
    </select>
  );
}

export default function CompareIsland() {
  const [id1, setId1] = useState("");
  const [id2, setId2] = useState("");
  const s1 = servicios.find(s => s.id === id1);
  const s2 = servicios.find(s => s.id === id2);

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
          {/* Table — desktop */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Característica</th>
                  <th className="text-left py-2 px-3 font-semibold">{s1.proveedor}</th>
                  <th className="text-left py-2 px-3 font-semibold">{s2.proveedor}</th>
                </tr>
              </thead>
              <tbody>
                {campos.map(([label, key]) => (
                  <tr key={key} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-3 text-gray-500 dark:text-gray-400">{label}</td>
                    <td className="py-2 px-3">{s1[key]}</td>
                    <td className="py-2 px-3">{s2[key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards — mobile */}
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {[s1, s2].map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-sm">{s.proveedor} — {s.plan}</h3>
                {campos.map(([label, key]) => (
                  <div key={key} className="flex justify-between text-xs gap-2">
                    <span className="text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
                    <span className="text-right">{s[key]}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
