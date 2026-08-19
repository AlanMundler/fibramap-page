import { useState, useMemo } from 'react';
import { servicios as rawServicios } from '../data/servicios';

const planes = rawServicios.filter(s => s.precioDesc > 0 || s.precioLista > 0).map(s => ({
  id: s.id,
  proveedor: s.proveedor,
  plan: s.plan,
  download: s.download,
  precioDesc: s.precioDesc,
  precioLista: s.precioLista,
  instalacion: s.instalacion,
  promoMeses: s.promoMeses,
  mesesGratis: s.mesesGratis || 0,
}));

const proveedores = [...new Set(planes.map(p => p.proveedor))];
const fmt = (n) => `$${Math.round(n).toLocaleString('es-AR')}`;

function calc12Meses(plan, inflacionMensual) {
  const meses = [];
  let acumulado = plan.instalacion;
  const factor = 1 + inflacionMensual / 100;
  const gratis = plan.mesesGratis || 0;
  const promoHasta = plan.promoMeses || 0;

  for (let m = 1; m <= 12; m++) {
    let precio;
    const inflacionAcum = Math.pow(factor, m - 1);

    if (m <= gratis) {
      precio = 0;
    } else if (m <= promoHasta) {
      precio = plan.precioDesc * inflacionAcum;
    } else if (plan.precioLista > 0) {
      precio = plan.precioLista * inflacionAcum;
    } else {
      precio = plan.precioDesc * inflacionAcum;
    }

    acumulado += precio;
    meses.push({ mes: m, precio, acumulado });
  }

  return { meses, total: acumulado, costoMes1: meses[0].precio, costoPorMbps: acumulado / plan.download };
}

export default function CostCalculator() {
  const [inflacion, setInflacion] = useState(4.5);
  const [proveedorFiltro, setProveedorFiltro] = useState('Todos');
  const [selA, setSelA] = useState(null);
  const [selB, setSelB] = useState(null);

  const filtrados = useMemo(() =>
    proveedorFiltro === 'Todos' ? planes : planes.filter(p => p.proveedor === proveedorFiltro),
    [proveedorFiltro]
  );

  const calcA = useMemo(() => selA ? calc12Meses(selA, inflacion) : null, [selA, inflacion]);
  const calcB = useMemo(() => selB ? calc12Meses(selB, inflacion) : null, [selB, inflacion]);

  const seleccionar = (plan) => {
    if (!selA || (selA && selB)) {
      setSelA(plan);
      setSelB(null);
    } else {
      setSelB(plan);
    }
  };

  const fmtPlan = (p) => p ? `${p.proveedor} ${p.plan}` : '';

  return (
    <div className="space-y-6">
      <div className="card-interactive p-4 space-y-4">
        <h2 className="text-lg font-semibold">Ajuste por inflación</h2>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            value={inflacion}
            onChange={(e) => setInflacion(parseFloat(e.target.value))}
            className="flex-1 accent-sky-500"
          />
          <span className="text-sky-400 font-mono font-bold text-lg w-20 text-right">{inflacion}%</span>
        </div>
        <p className="text-gray-500 text-sm">Inflación mensual estimada</p>
      </div>

      <div className="card-interactive p-4 space-y-3">
        <h2 className="text-lg font-semibold">Filtrar por proveedor</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setProveedorFiltro('Todos')}
            className={`btn-pill ${proveedorFiltro === 'Todos' ? 'btn-pill-active' : ''}`}
          >
            Todos
          </button>
          {proveedores.map(p => (
            <button
              key={p}
              onClick={() => setProveedorFiltro(p)}
              className={`btn-pill ${proveedorFiltro === p ? 'btn-pill-active' : ''}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="card-interactive p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Seleccionar 2 planes para comparar</h2>
          <span className="text-gray-500 text-sm">
            {selA ? (selB ? '2/2' : '1/2') : '0/2'} seleccionados
          </span>
        </div>
        {(selA || selB) && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {selA && (
              <span className="inline-flex items-center gap-1 bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full text-sm">
                A: {fmtPlan(selA)}
                <button onClick={() => { setSelA(null); setSelB(null); }} className="ml-1 hover:text-white">×</button>
              </span>
            )}
            {selB && (
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm">
                B: {fmtPlan(selB)}
                <button onClick={() => setSelB(null)} className="ml-1 hover:text-white">×</button>
              </span>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {filtrados.map(p => {
            const isA = selA?.id === p.id;
            const isB = selB?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => seleccionar(p)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  isA ? 'border-sky-500 bg-sky-500/10' :
                  isB ? 'border-amber-500 bg-amber-500/10' :
                  'border-gray-700 hover:border-gray-500 bg-gray-800/40'
                }`}
              >
                <span className="text-sm font-medium">{p.proveedor}</span>
                <span className="text-gray-400 text-sm ml-1">{p.plan}</span>
                <div className="text-xs text-gray-500 mt-1">{fmt(p.precioDesc)}/mes · {p.download} Mbps</div>
              </button>
            );
          })}
        </div>
      </div>

      {(calcA || calcB) && (
        <div className="card-interactive p-4 space-y-4">
          <h2 className="text-lg font-semibold">Costo real en 12 meses</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left py-2">Mes</th>
                  {calcA && <th className="text-right py-2 text-sky-400">Plan A: {fmtPlan(selA)}</th>}
                  {calcB && <th className="text-right py-2 text-amber-400">Plan B: {fmtPlan(selB)}</th>}
                  {calcA && calcB && <th className="text-right py-2 text-gray-500">Diferencia</th>}
                </tr>
              </thead>
              <tbody>
                {(selA.instalacion > 0 || selB?.instalacion > 0) && (
                <tr className="border-b border-gray-800">
                  <td className="py-2 text-gray-300">Instalación</td>
                  {calcA && (
                    <td className="py-2 text-right text-sky-300">
                      {selA.instalacion > 0 ? fmt(selA.instalacion) : <span className="text-gray-600">-</span>}
                    </td>
                  )}
                  {calcB && (
                    <td className="py-2 text-right text-amber-300">
                      {selB.instalacion > 0 ? fmt(selB.instalacion) : <span className="text-gray-600">-</span>}
                    </td>
                  )}
                </tr>
              )}
              {Array.from({ length: 12 }, (_, i) => {
                const mA = calcA?.meses[i];
                const mB = calcB?.meses[i];
                const diff = mA && mB ? mA.acumulado - mB.acumulado : null;
                return (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-2 text-gray-300">Mes {i + 1}</td>
                    {calcA && (
                      <td className="py-2 text-right">
                        <span className="text-sky-300">{fmt(mA.precio)}</span>
                        <span className="text-gray-500 ml-2">({fmt(mA.acumulado)})</span>
                      </td>
                    )}
                    {calcB && (
                      <td className="py-2 text-right">
                        <span className="text-amber-300">{fmt(mB.precio)}</span>
                        <span className="text-gray-500 ml-2">({fmt(mB.acumulado)})</span>
                      </td>
                    )}
                    {calcA && calcB && (
                      <td className={`py-2 text-right font-mono ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-gray-500'}`}>
                        {diff > 0 ? '+' : ''}{fmt(diff)}
                      </td>
                    )}
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {calcA && (
              <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 space-y-2">
                <div className="text-sky-300 font-semibold text-sm">Plan A: {fmtPlan(selA)}</div>
                <div className="text-2xl font-bold">{fmt(calcA.total)}</div>
                <div className="text-gray-400 text-sm">Costo total 12 meses (con instalación)</div>
                <div className="text-gray-400 text-sm">Costo por Mbps: {fmt(calcA.costoPorMbps)}/Mbps</div>
                <div className="text-gray-400 text-sm">Mes 1: {fmt(calcA.meses[0].precio)} → Mes 12: {fmt(calcA.meses[11].precio)}</div>
              </div>
            )}
            {calcB && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
                <div className="text-amber-300 font-semibold text-sm">Plan B: {fmtPlan(selB)}</div>
                <div className="text-2xl font-bold">{fmt(calcB.total)}</div>
                <div className="text-gray-400 text-sm">Costo total 12 meses (con instalación)</div>
                <div className="text-gray-400 text-sm">Costo por Mbps: {fmt(calcB.costoPorMbps)}/Mbps</div>
                <div className="text-gray-400 text-sm">Mes 1: {fmt(calcB.meses[0].precio)} → Mes 12: {fmt(calcB.meses[11].precio)}</div>
              </div>
            )}
          </div>

          {calcA && calcB && (
            <div className="text-center text-gray-400 text-sm mt-2">
              {calcA.total < calcB.total
                ? `El Plan A es ${fmt(calcB.total - calcA.total)} más barato en 12 meses`
                : calcB.total < calcA.total
                  ? `El Plan B es ${fmt(calcA.total - calcB.total)} más barato en 12 meses`
                  : 'Ambos planes cuestan lo mismo en 12 meses'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
