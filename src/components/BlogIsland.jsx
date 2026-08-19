import { useState, useEffect } from 'react';

const FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=fibra+%C3%B3ptica+argentina+internet+proveedor&hl=es-419&gl=AR&ceid=AR:es-419',
    label: 'Fibra óptica Argentina',
  },
  {
    url: 'https://news.google.com/rss/search?q=ENACOM+internet+banda+ancha&hl=es-419&gl=AR&ceid=AR:es-419',
    label: 'ENACOM internet',
  },
  {
    url: 'https://news.google.com/rss/search?q=Starlink+argentina+internet+fibra&hl=es-419&gl=AR&ceid=AR:es-419',
    label: 'Starlink Argentina',
  },
];

const RELEVANCE_KEYWORDS = [
  'fibra', 'óptica', 'optica', 'internet', 'proveedor', 'proveedores',
  'enacom', 'starlink', 'banda ancha', 'conexión', 'conexion',
  'telecomunicaciones', 'isp', 'wifi', 'router', 'velocidad',
  'cobertura', 'fibertel', 'personal', 'claro', 'iplan',
  'guabi', 'batcom', 'trimotion', 'metro', 'krillcom',
  'descarga', 'subida', 'mbps', 'gigabit',
];

function parseRSSItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
    const linkMatch = block.match(/<link>(.*?)<\/link>/);
    const dateMatch = block.match(/<pubDate>(.*?)<\/pubDate>/);
    const sourceMatch = block.match(/<source.*?>(.*?)<\/source>/);
    const descMatch = block.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s);
    if (!titleMatch || !linkMatch) continue;
    let title = titleMatch[1].trim();
    let source = sourceMatch?.[1]?.trim() || 'Desconocido';
    const dashIdx = title.lastIndexOf(' - ');
    if (dashIdx > 0) {
      const possibleSource = title.slice(dashIdx + 3).trim();
      if (possibleSource.length < 60) {
        source = possibleSource;
        title = title.slice(0, dashIdx).trim();
      }
    }
    let snippet = '';
    if (descMatch) {
      snippet = descMatch[1]
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&nbsp;/gi, ' ')
        .replace(/&#160;/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ')
        .trim().slice(0, 200);
    }
    const titleLower = title.toLowerCase().slice(0, 40);
    if (!snippet || snippet.toLowerCase().startsWith(titleLower) || titleLower.startsWith(snippet.toLowerCase().slice(0, 40))) {
      snippet = '';
    }
    items.push({ title, link: linkMatch[1].trim(), pubDate: dateMatch?.[1] || '', source, snippet });
  }
  return items;
}

function isRelevant(a) {
  const text = `${a.title} ${a.snippet}`.toLowerCase();
  return RELEVANCE_KEYWORDS.some(kw => text.includes(kw));
}

function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const diffMs = Date.now() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function sourceColor(source) {
  const s = source.toLowerCase();
  if (s.includes('enacom') || s.includes('gobierno')) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  if (s.includes('iprofesional') || s.includes('cronista')) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  if (s.includes('clarín') || s.includes('clarin')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
  if (s.includes('infotechnology')) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  if (s.includes('la nación') || s.includes('lanacion')) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
  if (s.includes('ámbito') || s.includes('ambito')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  if (s.includes('starlink') || s.includes('spacex')) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
  return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
}

const FALLBACK = [
  { title: 'ENACOM incrementa resolución de quejas', link: '#', pubDate: '', source: 'ENACOM', snippet: 'El organismo regulador informó que aumentó un 40% la resolución de quejas contra proveedores de internet.' },
  { title: 'IPLAN expande fibra a Villa Allende', link: '#', pubDate: '', source: 'IPLAN', snippet: 'IPLAN completó la expansión de su red de fibra óptica a nuevos barrios de Villa Allende.' },
  { title: 'Comparativa: qué plan conviene según tu barrio', link: '#', pubDate: '', source: 'Guía', snippet: 'Armamos una comparativa de los mejores planes disponibles por zona de Córdoba.' },
];

export default function BlogIsland() {
  const [articles, setArticles] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all = [];
      for (const feed of FEEDS) {
        try {
          const res = await fetch(feed.url, { signal: AbortSignal.timeout(10000) });
          if (!res.ok) continue;
          const xml = await res.text();
          all.push(...parseRSSItems(xml));
        } catch {}
      }
      if (cancelled || all.length === 0) return;
      const seen = new Set();
      const unique = all.filter(a => {
        const key = a.title.toLowerCase().slice(0, 60);
        if (seen.has(key)) return false;
        seen.add(key);
        return isRelevant(a);
      }).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()).slice(0, 24);
      setArticles(unique.length > 0 ? unique : FALLBACK);
      setLastUpdated(new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-3">
      {loading && (
        <p className="text-xs text-gray-500">Cargando noticias...</p>
      )}
      {lastUpdated && (
        <p className="text-xs text-gray-500">Última actualización: {lastUpdated}</p>
      )}
      {articles.map((article, i) => (
        <a
          key={i}
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 bg-gray-800/80 border border-gray-700/50 rounded-xl p-4 hover:border-blue-500/40 hover:bg-gray-800 transition-all duration-200 group"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${sourceColor(article.source)}`}>
                {article.source}
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
      ))}
    </div>
  );
}
