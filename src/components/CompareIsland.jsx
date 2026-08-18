import { useState } from 'react';

const serviciosData = [
  { id: 1, proveedor: 'Claro', plan: 'Fibra 300', velocidad: '300 Mbps', velocidadSub: '300 Mbps', velocidadBaj: '300 Mbps', tecnologia: 'FTTH', ip: 'Dinámica', instalacion: '$0', precioLista: '$5.999', precioDesc: '$4.499', atencionCl: '104', descripcion: 'Fibra óptica' },
  { id: 2, proveedor: 'Claro', plan: 'Fibra 600', velocidad: '600 Mbps', velocidadSub: '600 Mbps', velocidadBaj: '600 Mbps', tecnologia: 'FTTH', ip: 'Dinámica', instalacion: '$0', precioLista: '$7.999', precioDesc: '$5.999', atencionCl: '104', descripcion: 'Fibra óptica' },
  { id: 3, proveedor: 'Personal', plan: 'Fibra 300', velocidad: '300 Mbps', velocidadSub: '100 Mbps', velocidadBaj: '300 Mbps', tecnologia: 'FTTH', ip: 'Dinámica', instalacion: '$0', precioLista: '$6.299', precioDesc: '$4.999', atencionCl: '111', descripcion: 'Fibra óptica' },
  { id: 4, proveedor: 'Iplan', plan: 'Fibra 300', velocidad: '300 Mbps', velocidadSub: '300 Mbps', velocidadBaj: '300 Mbps', tecnologia: 'FTTH', ip: 'Fija', instalacion: '$0', precioLista: '$5.499', precioDesc: '$4.299', atencionCl: '0800', descripcion: 'Fibra óptica' },
];

export default function CompareIsland() {
  const [servicio1, setServicio1] = useState(null);
  const [servicio2, setServicio2] = useState(null);

  const s1 = serviciosData.find(s => s.id === Number(servicio1));
  const s2 = serviciosData.find(s => s.id === Number(servicio2));

  return (
    <div className="overflow-x-auto sm:ml-64 sm:mr-36">
      <h2 className="ml-4 mr-4 text-xl font-semibold dark:text-white bg-gray-50 dark:bg-gray-800 p-4 mb-4">Comparador de Servicios</h2>
      <div className="flex flex-col sm:flex-row mb-4">
        <select className="dark:text-white dark:bg-gray-600 ml-4 mr-4" onChange={e => setServicio1(e.target.value)}>
          <option value="">Seleccione un servicio</option>
          {serviciosData.map(s => <option key={s.id} value={s.id}>{s.proveedor} - {s.plan}</option>)}
        </select>
        <select className="dark:text-white dark:bg-gray-600 ml-4 mr-4" onChange={e => setServicio2(e.target.value)}>
          <option value="">Seleccione otro servicio</option>
          {serviciosData.map(s => <option key={s.id} value={s.id}>{s.proveedor} - {s.plan}</option>)}
        </select>
      </div>
      {s1 && s2 && (
        <div className="overflow-x-auto">
          <table className="bg-gray-50 dark:bg-gray-800 lg:w-11/12 ml-4 mr-4">
            <thead>
              <tr>
                <th className="font-semibold dark:text-white bg-gray-50 dark:bg-gray-800 p-4">Características</th>
                <th className="font-semibold dark:text-white bg-gray-50 dark:bg-gray-800 p-4">{s1.proveedor} - {s1.plan}</th>
                <th className="font-semibold dark:text-white bg-gray-50 dark:bg-gray-800 p-4">{s2.proveedor} - {s2.plan}</th>
              </tr>
            </thead>
            <tbody>
              {[['Velocidad', 'velocidad'], ['Velocidad Subida', 'velocidadSub'], ['Velocidad Bajada', 'velocidadBaj'], ['Tecnología', 'tecnologia'], ['IP', 'ip'], ['Instalación', 'instalacion'], ['Precio Lista', 'precioLista'], ['Precio Descuento', 'precioDesc'], ['Atención al Cliente', 'atencionCl'], ['Descripción', 'descripcion']].map(([label, key]) => (
                <tr key={key}>
                  <td className="dark:text-white p-4 border dark:border-black">{label}</td>
                  <td className="dark:text-white p-4 border dark:border-black">{s1[key]}</td>
                  <td className="dark:text-white p-4 border dark:border-black">{s2[key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
