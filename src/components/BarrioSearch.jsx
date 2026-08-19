import { useState, useMemo } from 'react';
import { SITE_BASE as base } from '../data/constants';
import ispBarrios from '../data/isp-barrios.json';

const providers = [
  { name: 'Claro', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30' },
  { name: 'Personal Fibra', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  { name: 'IPLAN', color: 'text-pink-400', bg: 'bg-pink-500/15', border: 'border-pink-500/30' },
  { name: 'Internet Córdoba', color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30' },
  { name: 'Batcom', color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
  { name: 'Guabi', color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30' },
];

const providerColor = Object.fromEntries(providers.map(p => [p.name, p]));

const allBarrios = [...new Set(Object.values(ispBarrios).flat())].sort();

export default function BarrioSearch() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return allBarrios.filter(b => b.toLowerCase().includes(q)).slice(0, 15);
  }, [query]);

  const providersForBarrio = useMemo(() => {
    if (!selected) return [];
    return Object.entries(ispBarrios)
      .filter(([_, barrios]) => barrios.includes(selected))
      .map(([name]) => name);
  }, [selected]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <label htmlFor="barrio-search" className="sr-only">Buscar barrio</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="barrio-search"
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); }}
            placeholder="Escribí el nombre de tu barrio..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>

        {matches.length > 0 && !selected && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl shadow-gray-900/50 py-1.5 z-50 max-h-60 overflow-y-auto">
            {matches.map(b => (
              <button
                key={b}
                onClick={() => { setSelected(b); setQuery(b); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="bg-gray-800/80 rounded-xl border border-gray-700/50 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">{selected}</h3>
            <button onClick={() => { setSelected(null); setQuery(''); }} className="text-xs text-gray-500 hover:text-white transition-colors">✕ Limpiar</button>
          </div>

          {providersForBarrio.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">{providersForBarrio.length} proveedor{providersForBarrio.length > 1 ? 's' : ''} con cobertura confirmada:</p>
              <div className="flex flex-wrap gap-2">
                {providersForBarrio.map(name => {
                  const c = providerColor[name];
                  return (
                    <span key={name} className={`text-xs font-medium px-2.5 py-1 rounded-full border ${c.bg} ${c.color} ${c.border}`}>
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No se encontró cobertura confirmada para este barrio. Verificá en la página de cada proveedor.</p>
          )}
        </div>
      )}

      {!selected && query && matches.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No encontramos "{query}". Probá con otro nombre.</p>
      )}
    </div>
  );
}
