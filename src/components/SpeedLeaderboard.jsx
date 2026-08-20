import { useState, useMemo } from 'react';
import {
  nationalOokla,
  cordobaTests,
  ftthData,
  cordobaCity,
  localProviders,
  sources as dataSources,
} from '../data/leaderboard-data';

const PROVIDER_COLORS = {
  'IPLAN': '#ec4899',
  'Personal': '#3b82f6',
  'Personal Fibra': '#3b82f6',
  'Claro': '#dc2626',
  'Claro FTTH': '#dc2626',
  'Movistar': '#2563eb',
  'Telecentro': '#f97316',

  'Starlink': '#eab308',
  'Internet Córdoba': '#f59e0b',
  'Guabi': '#06b6d4',
  'Batcom': '#8b5cf6',
};

function SortIcon({ active, dir }) {
  return (
    <span className="inline-block ml-1 text-[10px] opacity-60">
      {active ? (dir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  );
}

function SourceBadge({ sourceId }) {
  const s = dataSources.find(x => x.id === sourceId);
  if (!s) return <span className="text-xs text-gray-500">{sourceId}</span>;
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors"
      title={`${s.name} — ${s.period}`}
    >
      {s.name}
    </a>
  );
}

export default function SpeedLeaderboard() {
  const [tab, setTab] = useState('cordoba');
  const [sortKey, setSortKey] = useState('download');
  const [sortDir, setSortDir] = useState('desc');
  const [activeProvider, setActiveProvider] = useState(null);
  const [showSources, setShowSources] = useState(false);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'provider' ? 'asc' : 'desc');
    }
  };

  const cordobaData = useMemo(() => {
    let data = cordobaTests;
    if (activeProvider) data = data.filter(r => r.provider === activeProvider);
    return [...data].sort((a, b) => {
      const va = a[sortKey] ?? 0;
      const vb = b[sortKey] ?? 0;
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [activeProvider, sortKey, sortDir]);

  const nacionalData = useMemo(() => {
    let data = nationalOokla;
    if (activeProvider) data = data.filter(r => r.name === activeProvider);
    return [...data].sort((a, b) => {
      const va = a[sortKey] ?? 0;
      const vb = b[sortKey] ?? 0;
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [activeProvider, sortKey, sortDir]);

  const ftthSorted = useMemo(() => {
    return [...ftthData].sort((a, b) => b.download - a.download);
  }, []);

  const allProviders = [...new Set(cordobaTests.map(r => r.provider))];
  const allNacional = [...new Set(nationalOokla.map(r => r.name))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Leaderboard de Velocidad</h1>
        <p className="text-gray-400 max-w-2xl text-sm">
          Datos reales de tests de velocidad por proveedor en Argentina y Córdoba.
          Cada cifra tiene fuente verificable. Sin datos inventados.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => { setTab('cordoba'); setActiveProvider(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'cordoba' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'
          }`}
        >
          Córdoba Capital
        </button>
        <button
          onClick={() => { setTab('nacional'); setActiveProvider(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'nacional' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'
          }`}
        >
          Nacional
        </button>
        <button
          onClick={() => { setTab('ftth'); setActiveProvider(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'ftth' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'
          }`}
        >
          Solo FTTH
        </button>
      </div>

      {/* Córdoba city summary */}
      {tab === 'cordoba' && (
        <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4">
          <h3 className="font-medium text-gray-300 mb-2 text-sm">
            Velocidad mediana de Córdoba — Speedtest Global Index (junio 2026)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-400">{cordobaCity.fixed.download}</div>
              <div className="text-xs text-gray-500">↓ Fija (Mbps)</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-400">{cordobaCity.fixed.upload}</div>
              <div className="text-xs text-gray-500">↑ Fija (Mbps)</div>
            </div>
            <div>
              <div className="text-lg font-bold text-amber-400">{cordobaCity.fixed.latency}</div>
              <div className="text-xs text-gray-500">Latencia (ms)</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-300">#{cordobaCity.fixed.rank}</div>
              <div className="text-xs text-gray-500">Ranking global</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Solo se listan ISPs con fibra verificada en Córdoba Capital y con tests locales. Movistar, Telecentro y Starlink no tienen fibra en la ciudad. Claro tiene cobertura pero los datos SpeedGeo son nacionales (no separados por ciudad). Gigared no opera en Córdoba (solo Litoral).
          </p>
        </div>
      )}

      {/* National summary */}
      {tab === 'nacional' && (
        <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4">
          <h3 className="font-medium text-gray-300 mb-2 text-sm">
            Ranking nacional — Velocidad media de descarga
          </h3>
          <div className="space-y-2">
            {nationalOokla.map(p => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-sm text-gray-300 w-32">{p.name}</span>
                <div className="flex-1 bg-gray-700/50 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ backgroundColor: p.color, width: `${(p.download / 220) * 100}%` }} />
                </div>
                <span className="text-sm font-mono text-blue-400 w-20 text-right">{p.download} Mbps</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Fuente: Ookla H2 2025 / SpeedGeo Q2 2026 / Speedtest.net.ar
          </p>
        </div>
      )}

      {/* FTTH comparison */}
      {tab === 'ftth' && (
        <div className="space-y-3">
          {ftthSorted.map(p => (
            <div key={p.name} className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="font-semibold text-gray-200">{p.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center mb-2">
                <div>
                  <div className="text-xl font-bold text-blue-400">{p.download}</div>
                  <div className="text-xs text-gray-500">↓ Mbps</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-emerald-400">{p.upload}</div>
                  <div className="text-xs text-gray-500">↑ Mbps</div>
                </div>
              </div>
              {p.notes && <p className="text-xs text-gray-400">{p.notes}</p>}
              <div className="flex gap-1 mt-2">
                {p.sources.map(s => <SourceBadge key={s} sourceId={s} />)}
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-500">
            FTTH = Fiber To The Home. Solo incluye conexiones de fibra óptica directa al hogar, no coaxial.
          </p>
        </div>
      )}

      {/* Filters */}
      {tab !== 'ftth' && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveProvider(null)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              !activeProvider ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-300'
            }`}
          >
            Todos
          </button>
          {(tab === 'cordoba' ? allProviders : allNacional).map(p => (
            <button
              key={p}
              onClick={() => setActiveProvider(activeProvider === p ? null : p)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                activeProvider === p ? 'border-gray-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-300'
              }`}
              style={activeProvider === p ? { backgroundColor: (PROVIDER_COLORS[p] || '#666') + '20', borderColor: (PROVIDER_COLORS[p] || '#666') + '80' } : {}}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Table — Córdoba */}
      {tab === 'cordoba' && (
        <div className="overflow-x-auto rounded-xl border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                {[
                  { key: 'provider', label: 'Proveedor' },
                  { key: 'download', label: '↓ Descarga (Mbps)' },
                  { key: 'upload', label: '↑ Subida (Mbps)' },
                  { key: 'latency', label: 'Latencia (ms)' },
                  { key: 'tests', label: '# Tests' },
                  { key: 'source', label: 'Fuente' },
                ].map(col => (
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
              {cordobaData.map((r, i) => (
                <tr
                  key={`${r.provider}-${i}`}
                  className="border-b border-gray-700/30 last:border-0 hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PROVIDER_COLORS[r.provider] || '#666' }} />
                      <span className="text-white">{r.provider}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-blue-400">{r.download}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-emerald-400">{r.upload}</td>
                  <td className="px-4 py-3 font-mono text-amber-400">{r.latency}</td>
                  <td className="px-4 py-3 text-gray-500 text-center">{r.tests || '—'}</td>
                  <td className="px-4 py-3">
                    <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-300 hover:text-blue-200">
                      {r.source}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cordobaData.length === 0 && (
            <p className="text-center text-gray-500 py-8">Sin resultados para este filtro.</p>
          )}
        </div>
      )}

      {/* Table — Nacional */}
      {tab === 'nacional' && (
        <div className="overflow-x-auto rounded-xl border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                {[
                  { key: 'name', label: 'ISP' },
                  { key: 'download', label: '↓ Descarga (Mbps)' },
                  { key: 'upload', label: '↑ Subida (Mbps)' },
                  { key: 'latency', label: 'Latencia (ms)' },
                ].map(col => (
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
              {nacionalData.map((r, i) => (
                <tr
                  key={`${r.name}-${i}`}
                  className="border-b border-gray-700/30 last:border-0 hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="text-white">{r.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-blue-400">{r.download}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-emerald-400">{r.upload}</td>
                  <td className="px-4 py-3 font-mono text-amber-400">{r.latency || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Local providers — sin datos verificables */}
      <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4">
        <h3 className="font-medium text-gray-300 mb-3 text-sm">Proveedores locales sin datos de velocidad públicos</h3>
        <p className="text-xs text-gray-500 mb-3">
          Estos ISPs operan en Córdoba pero no aparecen en rankings nacionales (Ookla, nPerf, SpeedGeo, Speedtest.net.ar)
          por volumen insuficiente de tests o por no medir contra nodos independientes.
        </p>
        <div className="space-y-2">
          {localProviders.map(p => (
            <div key={p.name} className="flex items-start gap-3 p-3 rounded-lg bg-gray-700/30">
              <span className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: p.color }} />
              <div>
                <div className="font-medium text-sm text-gray-200">{p.name}</div>
                <div className="text-xs text-gray-400">{p.note}</div>
                <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-300 hover:text-blue-200">
                  {p.website} →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div>
        <button
          onClick={() => setShowSources(!showSources)}
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          {showSources ? '▼' : '▶'} Fuentes y metodología ({dataSources.length} fuentes verificadas)
        </button>
        {showSources && (
          <div className="mt-3 space-y-3">
            {dataSources.map(s => (
              <div key={s.id} className="p-3 rounded-lg bg-gray-800/60 border border-gray-700/50">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-gray-200">{s.name}</span>
                  <span className="text-xs text-gray-500">{s.period}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{s.description}</p>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-300 hover:text-blue-200 mt-1 inline-block">
                  {s.url} →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Todos los datos son verificables en las fuentes indicadas. Ninguna cifra es inventada.
        Los valores pueden variar según plan, horario y condiciones de la red.
      </p>
    </div>
  );
}
