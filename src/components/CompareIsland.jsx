import { useState } from 'react';
import { servicios as rawServicios, fmt } from '../data/servicios';

const servicios = rawServicios.map(s => ({
  id: s.id,
  proveedor: s.proveedor,
  plan: s.plan,
  download: s.download,
  upload: s.upload,
  tecnologia: s.tecnologia,
  simetrico: s.simetrico,
  precioDesc: s.precioDesc,
  precioLista: s.precioLista,
  instalacion: s.instalacion,
  descuento: s.descuento,
  detalle: s.detalle,
  cobertura: s.cobertura,
}));

const precio100 = (s) => s.precioDesc && s.download ? (s.precioDesc / (s.download / 100)).toFixed(0) : null;
const proveedores = [...new Set(servicios.map(s => s.proveedor))];

export default function CompareIsland() {
  const [filter, setFilter] = useState('');
  const [sel, setSel] = useState([]);

  const filtered = filter ? servicios.filter(s => s.proveedor === filter) : [];

  const toggle = (id) => {
    setSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  const selected = sel.map(id => servicios.find(s => s.id === id)).filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center">
        {proveedores.map(p => (
          <button key={p} onClick={() => setFilter(filter === p ? '' : p)} className={filter === p ? 'btn-pill-active' : 'btn-pill'}>{p}</button>
        ))}
      </div>

      {!filter && (
        <p className="text-gray-500 text-sm text-center py-8">Elegí un proveedor para ver los planes</p>
      )}

      <div className={`grid gap-2.5 sm:gap-3 mx-auto ${filtered.length <= 3 ? 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 max-w-3xl' : 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
        {filtered.map(s => {
          const active = sel.includes(s.id);
          return (
            <button key={s.id} onClick={() => toggle(s.id)} className={`w-full text-left p-3 sm:p-4 ${active ? 'card-interactive-active' : 'card-interactive'}`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-medium text-[10px] sm:text-[11px] text-gray-400 truncate">{s.proveedor}</span>
                {s.simetrico && <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/20">SIM</span>}
              </div>
              <div className="font-semibold text-sm text-white">{s.plan}</div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="font-bold text-sm text-white">{s.precioDesc ? fmt(s.precioDesc) : 'Consultar'}</span>
                {s.precioLista > 0 && <span className="line-through text-gray-500 text-[10px]">{fmt(s.precioLista)}</span>}
              </div>
              <div className="text-gray-500 text-[10px] mt-0.5">{s.download}↓ / {s.upload}↑</div>
            </button>
          );
        })}
      </div>

      {sel.length >= 2 && (
        <div className="overflow-x-auto border-t border-gray-700/50 pt-5">
          <table className="w-full text-xs min-w-[350px]">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left py-2.5 px-2 text-gray-400"></th>
                {selected.map(s => <th key={s.id} className="text-left py-2.5 px-2 font-semibold text-white">{s.proveedor} — {s.plan}</th>)}
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
                <tr key={label} className="border-b border-gray-800/50">
                  <td className="py-2 px-2 text-gray-400 whitespace-nowrap">{label}</td>
                  {selected.map(s => <td key={s.id} className="py-2 px-2 text-gray-200">{fn(s)}</td>)}
                </tr>
              ))}
              <tr className="border-b border-gray-800/50 bg-gray-800/30">
                <td className="py-2 px-2 text-gray-400 font-medium whitespace-nowrap">Precio/100 Mbps</td>
                {selected.map(s => <td key={s.id} className="py-2 px-2 font-bold text-white">{precio100(s) ? `$${precio100(s)}` : '—'}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {sel.length >= 2 && (
        <div className="flex justify-center">
          <button onClick={() => setSel([])} className="btn-pill text-gray-500 hover:text-white">Limpiar selección</button>
        </div>
      )}
    </div>
  );
}
