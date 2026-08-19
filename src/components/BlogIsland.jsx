import { useState, useEffect } from 'react';

const WORKER_URL = 'https://quiet-bird-94ce.alan-mundler.workers.dev/rss';

function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const diffMs = Date.now() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays < 0) return '';
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
}

function sourceFromLink(link) {
  try {
    const host = new URL(link).hostname.replace('www.', '');
    if (host.includes('iprofesional')) return { name: 'iProfesional', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    if (host.includes('infotechnology')) return { name: 'Infotechnology', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    if (host.includes('techcrunch')) return { name: 'TechCrunch', color: 'bg-green-500/20 text-green-300 border-green-500/30' };
    if (host.includes('wired')) return { name: 'WIRED', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
    if (host.includes('engadget')) return { name: 'Engadget', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
    return { name: host, color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
  } catch { return { name: 'Noticia', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' }; }
}

export default function BlogIsland() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(WORKER_URL, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setArticles(data);
          setLoading(false);
        } else if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      } catch {
        if (!cancelled) { setError(true); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-3">
      {loading && (
        <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
          <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
          Cargando noticias...
        </div>
      )}

      {error && (
        <div className="bg-gray-800/80 border border-gray-700/50 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm">No se pudieron cargar las noticias.</p>
          <p className="text-gray-500 text-xs mt-1">Intentá recargar la página.</p>
        </div>
      )}

      {articles.map((article, i) => {
        const src = sourceFromLink(article.link);
        return (
          <a
            key={i}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 bg-gray-800/80 border border-gray-700/50 rounded-xl p-4 hover:border-blue-500/40 hover:bg-gray-800 transition-all duration-200 group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${src.color}`}>
                  {src.name}
                </span>
                {article.pubDate && (
                  <span className="text-xs text-gray-500 whitespace-nowrap">{formatRelativeDate(article.pubDate)}</span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-100 group-hover:text-blue-300 transition-colors leading-snug">
                {article.title}
              </h2>
              {article.snippet && (
                <p className="text-gray-400 text-sm leading-relaxed mt-1.5 line-clamp-2">{article.snippet}</p>
              )}
            </div>
            <span className="shrink-0 mt-1 text-xs text-blue-400 group-hover:text-blue-300 whitespace-nowrap">→</span>
          </a>
        );
      })}
    </div>
  );
}
