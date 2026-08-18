import { useState } from 'react';

const servicios = [
  { id: 1, proveedor: 'Claro', plan: 'Fibra 300', velocidad: '300 Mbps', velocidadSub: '300 Mbps', velocidadBaj: '300 Mbps', tecnologia: 'FTTH', ip: 'Dinámica', instalacion: '$0', precioLista: '$5.999', precioDesc: '$4.499', atencionCl: '104', descripcion: 'Fibra óptica' },
  { id: 2, proveedor: 'Claro', plan: 'Fibra 600', velocidad: '600 Mbps', velocidadSub: '600 Mbps', velocidadBaj: '600 Mbps', tecnologia: 'FTTH', ip: 'Dinámica', instalacion: '$0', precioLista: '$7.999', precioDesc: '$5.999', atencionCl: '104', descripcion: 'Fibra óptica' },
  { id: 3, proveedor: 'Personal', plan: 'Fibra 300', velocidad: '300 Mbps', velocidadSub: '100 Mbps', velocidadBaj: '300 Mbps', tecnologia: 'FTTH', ip: 'Dinámica', instalacion: '$0', precioLista: '$6.299', precioDesc: '$4.999', atencionCl: '111', descripcion: 'Fibra óptica' },
  { id: 4, proveedor: 'Iplan', plan: 'Fibra 300', velocidad: '300 Mbps', velocidadSub: '300 Mbps', velocidadBaj: '300 Mbps', tecnologia: 'FTTH', ip: 'Fija', instalacion: '$0', precioLista: '$5.499', precioDesc: '$4.299', atencionCl: '0800', descripcion: 'Fibra óptica' },
];

const campos = [
  ['Velocidad', 'velocidad'],
  ['Subida', 'velocidadSub'],
  ['Bajada', 'velocidadBaj'],
  ['Tecnología', 'tecnologia'],
  ['IP', 'ip'],
  ['Instalación', 'instalacion'],
  ['Precio lista', 'precioLista'],
  ['Precio c/descuento', 'precioDesc'],
  ['Atención al cliente', 'atencionCl'],
  ['Descripción', 'descripcion'],
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
  const s1 = servicios.find(s => s.id === Number(id1));
  const s2 = servicios.find(s => s.id === Number(id2));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={id1} onChange={setId1}>
          <option value="">Elegí un servicio</option>
          {servicios.map(s => <option key={s.id} value={s.id}>{s.proveedor} - {s.plan}</option>)}
        </Select>
        <Select value={id2} onChange={setId2}>
          <option value="">Elegí otro servicio</option>
          {servicios.map(s => <option key={s.id} value={s.id}>{s.proveedor} - {s.plan}</option>)}
        </Select>
      </div>

      {s1 && s2 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-3 dark:text-gray-400 font-medium">Característica</th>
                <th className="text-left py-2 px-3 font-medium">{s1.proveedor} {s1.plan}</th>
                <th className="text-left py-2 px-3 font-medium">{s2.proveedor} {s2.plan}</th>
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
      )}

      {s1 && s2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:hidden">
          {[s1, s2].map((s, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">{s.proveedor} {s.plan}</h3>
              {campos.map(([label, key]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{label}</span>
                  <span>{s[key]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
