import { useState, useMemo } from 'react';

const RESULTS = [
  { provider: 'Claro', barrio: 'Nueva Córdoba', download: 785, upload: 780, latency: 4, tests: 31 },
  { provider: 'Claro', barrio: 'Centro', download: 792, upload: 788, latency: 3, tests: 28 },
  { provider: 'Claro', barrio: 'Cerro de las Rosas', download: 510, upload: 495, latency: 6, tests: 19 },
  { provider: 'Claro', barrio: 'Cofico', download: 498, upload: 490, latency: 7, tests: 14 },
  { provider: 'IPLAN', barrio: 'Centro', download: 940, upload: 935, latency: 2, tests: 22 },
  { provider: 'IPLAN', barrio: 'Nueva Córdoba', download: 790, upload: 785, latency: 3, tests: 15 },
  { provider: 'Personal Fibra', barrio: 'Centro', download: 285, upload: 45, latency: 12, tests: 26 },
  { provider: 'Personal Fibra', barrio: 'General Paz', download: 310, upload: 52, latency: 10, tests: 18 },
  { provider: 'Personal Fibra', barrio: 'Nueva Córdoba', download: 275, upload: 38, latency: 11, tests: 12 },
  { provider: 'Internet Córdoba', barrio: 'Maipú', download: 280, upload: 55, latency: 9, tests: 20 },
  { provider: 'Internet Córdoba', barrio: 'Sarmiento', download: 295, upload: 58, latency: 8, tests: 17 },
  { provider: 'Internet Córdoba', barrio: 'Deán Funes', download: 105, upload: 28, latency: 14, tests: 11 },
  { provider: 'Batcom', barrio: 'Los Boulevares', download: 480, upload: 470, latency: 5, tests: 16 },
  { provider: 'Batcom', barrio: 'Valle Escondido', download: 290, upload: 280, latency: 7, tests: 13 },
  { provider: 'Batcom', barrio: 'Malvinas Argentinas', download: 475, upload: 465, latency: 6, tests: 10 },
  { provider: 'Guabi', barrio: 'Valle Cercano', download: 590, upload: 195, latency: 5, tests: 14 },
  { provider: 'Guabi', barrio: 'Parque Futura', download: 295, upload: 98, latency: 8, tests: 9 },
  { provider: 'Guabi', barrio: 'La Esperanza', download: 300, upload: 100, latency: 7, tests: 11 },
];

const PROVIDER_COLORS = {
  'Claro': '#dc2626',
  'IPLAN': '#ec4899',
  'Personal Fibra': '#3b82f6',
  'Internet Córdoba': '#f59e0b',
  'Batcom': '#8b5cf6',
  'Guabi': '#06b6d4',
};

const ALL_PROVIDERS = [...new Set(RESULTS.map(r => r.provider))];

const COLUMNS = [
  { key: 'provider', label: 'Proveedor' },
  { key: 'barrio', label: 'Barrio' },
  { key: 'download', label: '↓ Descarga (Mbps)' },
  { key: 'upload', label: '↑ Subida (Mbps)' },
  { key: 'latency', label: 'Latencia (ms)' },
  { key: 'tests', label: '# Tests' },
];

function SortIcon({ active, dir }) {
  return (
    <span className="inline-block ml-1 text-[10px] opacity-60">
      {active ? (dir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  );
}

export default function SpeedLeaderboard() {
  const [sortKey, setSortKey] = useState('download');
  const [sortDir, setSortDir] = useState('desc');
  const [activeProvider, setActiveProvider] = useState(null);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'provider' || key === 'barrio' ? 'asc' : 'desc');
    }
  };

  const filtered = activeProvider
    ? RESULTS.filter(r => r.provider === activeProvider)
    : RESULTS;

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [filtered, sortKey, sortDir]);

  const providerAverages = useMemo(() => {
    const map = {};
    RESULTS.forEach(r => {
      if (!map[r.provider]) map[r.provider] = { sumD: 0, sumU: 0, sumL: 0, count: 0 };
      map[r.provider].sumD += r.download;
      map[r.provider].sumU += r.upload;
      map[r.provider].sumL += r.latency;
      map[r.provider].count++;
    });
    return Object.entries(map).map(([name, v]) => ({
      name,
      avgDown: Math.round(v.sumD / v.count),
      avgUp: Math.round(v.sumU / v.count),
      avgLat: Math.round(v.sumL / v.count),
      tests: v.count,
    })).sort((a, b) => b.avgDown - a.avgDown);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {providerAverages.map(p => (
          <button
            key={p.name}
            onClick={() => setActiveProvider(activeProvider === p.name ? null : p.name)}
            className={`text-left p-4 rounded-xl border transition-all duration-200 ${
              activeProvider === p.name
                ? 'card-interactive-active'
                : 'card-interactive'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[p.name] }} />
              <span className="text-sm font-semibold text-white">{p.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-blue-400">{p.avgDown}</p>
                <p className="text-[10px] text-gray-500">↓ Prom.</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-400">{p.avgUp}</p>
                <p className="text-[10px] text-gray-500">↑ Prom.</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-400">{p.avgLat}</p>
                <p className="text-[10px] text-gray-500">ms Prom.</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">{p.tests} zonas</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveProvider(null)}
          className={!activeProvider ? 'btn-pill-active' : 'btn-pill'}
        >
          Todos ({RESULTS.length})
        </button>
        {ALL_PROVIDERS.map(p => (
          <button
            key={p}
            onClick={() => setActiveProvider(activeProvider === p ? null : p)}
            className="btn-pill"
            style={{
              backgroundColor: activeProvider === p ? PROVIDER_COLORS[p] + '20' : undefined,
              color: activeProvider === p ? PROVIDER_COLORS[p] : undefined,
              borderColor: activeProvider === p ? PROVIDER_COLORS[p] + '80' : undefined,
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700/50">
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-400 cursor-pointer hover:text-white transition-colors select-none whitespace-nowrap"
                >
                  {col.label}
                  <SortIcon active={sortKey === col.key} dir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr
                key={`${r.provider}-${r.barrio}-${i}`}
                className="border-b border-gray-700/30 last:border-0 hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PROVIDER_COLORS[r.provider] }} />
                    <span className="text-white">{r.provider}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{r.barrio}</td>
                <td className="px-4 py-3 font-mono font-semibold text-blue-400">{r.download}</td>
                <td className="px-4 py-3 font-mono font-semibold text-emerald-400">{r.upload}</td>
                <td className="px-4 py-3 font-mono text-amber-400">{r.latency}</td>
                <td className="px-4 py-3 text-gray-500 text-center">{r.tests}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="text-center text-gray-500 py-8">Sin resultados para este filtro.</p>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Datos de ejemplo basados en resultados crowdsourceados de Córdoba Capital. Los valores reales pueden variar según plan, horario y condiciones de la red.
      </p>
    </div>
  );
}
