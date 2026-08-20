import { useState } from 'react';
import { providers, reviews, type ProviderReviews, type Review } from '../data/reviews';

const sentimentLabel = (s: number) => s > 0.3 ? 'Positivo' : s < -0.3 ? 'Negativo' : 'Neutro';
const sentimentColor = (s: number) => s > 0.3 ? 'text-green-400' : s < -0.3 ? 'text-red-400' : 'text-yellow-400';
const sentimentBg = (s: number) => s > 0.3 ? 'bg-green-500/10' : s < -0.3 ? 'bg-red-500/10' : 'bg-yellow-500/10';
const sentimentBorder = (s: number) => s > 0.3 ? 'border-green-500/20' : s < -0.3 ? 'border-red-500/20' : 'border-yellow-500/20';

const colorMap: Record<string, { border: string; text: string; bg: string; bar: string }> = {
  pink: { border: 'border-pink-500/30', text: 'text-pink-400', bg: 'bg-pink-500/10', bar: 'bg-pink-500' },
  cyan: { border: 'border-cyan-500/30', text: 'text-cyan-400', bg: 'bg-cyan-500/10', bar: 'bg-cyan-500' },
  green: { border: 'border-green-500/30', text: 'text-green-400', bg: 'bg-green-500/10', bar: 'bg-green-500' },
  red: { border: 'border-red-500/30', text: 'text-red-400', bg: 'bg-red-500/10', bar: 'bg-red-500' },
  blue: { border: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500/10', bar: 'bg-blue-500' },
  purple: { border: 'border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500/10', bar: 'bg-purple-500' },
};

const sourceColors: Record<string, string> = {
  'Reddit': 'bg-orange-500/20 text-orange-300',
  'Twitter/X': 'bg-sky-500/20 text-sky-300',
  'Trustpilot': 'bg-green-500/20 text-green-300',
  'Google Reviews': 'bg-blue-500/20 text-blue-300',
  'LinkedIn': 'bg-blue-600/20 text-blue-300',
  'TuQuejaSuma': 'bg-red-500/20 text-red-300',
  'InfoZona': 'bg-purple-500/20 text-purple-300',
  'Selectra': 'bg-yellow-500/20 text-yellow-300',
  'PissedConsumer': 'bg-red-600/20 text-red-300',
  'Facebook': 'bg-indigo-500/20 text-indigo-300',
};

const categoryLabels: Record<string, string> = {
  speed: 'Velocidad',
  support: 'Soporte',
  price: 'Precio',
  stability: 'Estabilidad',
  coverage: 'Cobertura',
};

function ScoreBar({ score, max = 5, color }: { score: number; max?: number; color: string }) {
  const pct = (score / max) * 100;
  return (
    <div className="w-full bg-gray-700/50 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function SentimentDot({ value }: { value: number }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${
      value > 0.3 ? 'bg-green-400' : value < -0.3 ? 'bg-red-400' : 'bg-yellow-400'
    }`} />
  );
}

function ProviderCard({
  provider,
  isSelected,
  onClick,
}: {
  provider: ProviderReviews;
  isSelected: boolean;
  onClick: () => void;
}) {
  const c = colorMap[provider.color];
  const total = provider.sentimentBreakdown.positive + provider.sentimentBreakdown.neutral + provider.sentimentBreakdown.negative;
  const posPct = (provider.sentimentBreakdown.positive / total) * 100;
  const negPct = (provider.sentimentBreakdown.negative / total) * 100;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-gray-800/80 rounded-xl border backdrop-blur-sm p-4 transition-all flex flex-col ${
        isSelected ? `${c.border} ring-1 ring-offset-0 ${c.border}` : 'border-gray-700/50 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className={`font-semibold text-lg ${c.text}`}>{provider.name}</h3>
        <div className="text-right flex-shrink-0">
          <div className={`font-bold text-xl ${c.text}`}>{provider.overallScore}</div>
          <div className="text-gray-500 text-xs">{provider.totalReviews} opiniones</div>
        </div>
      </div>

      <div className="w-full bg-gray-700/50 rounded-full h-2 mb-3">
        <div className={`h-2 rounded-full ${c.bar}`} style={{ width: `${(provider.overallScore / 5) * 100}%` }} />
      </div>

      {/* Sentiment bar */}
      <div className="flex h-1.5 rounded-full overflow-hidden mb-3">
        <div className="bg-green-500" style={{ width: `${posPct}%` }} />
        <div className="bg-gray-600" style={{ width: `${100 - posPct - negPct}%` }} />
        <div className="bg-red-500" style={{ width: `${negPct}%` }} />
      </div>

      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span className="text-green-400">+{provider.sentimentBreakdown.positive}</span>
        <span>{provider.sentimentBreakdown.neutral} neutros</span>
        <span className="text-red-400">-{provider.sentimentBreakdown.negative}</span>
      </div>

      {/* Category scores */}
      <div className="grid grid-cols-5 gap-2 text-center text-xs">
        {Object.entries(provider.categoryScores).map(([cat, score]) => (
          <div key={cat}>
            <div className="text-gray-500 mb-1">{categoryLabels[cat]?.slice(0, 4)}</div>
            <div className={`font-medium ${score >= 4 ? 'text-green-400' : score >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
              {score}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-3 min-h-[1.25rem]">
        {provider.recentIncidents.length > 0 ? (
          <div className="text-xs text-orange-400/80">
            {provider.recentIncidents.length} incidente{provider.recentIncidents.length > 1 ? 's' : ''} reciente{provider.recentIncidents.length > 1 ? 's' : ''}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function ReviewItem({ review }: { review: Review }) {
  return (
    <div className={`p-3 rounded-lg border ${sentimentBorder(review.sentiment)} ${sentimentBg(review.sentiment)}`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <SentimentDot value={review.sentiment} />
          <span className="font-medium text-sm text-gray-200">{review.author}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${sourceColors[review.source] || 'bg-gray-700 text-gray-400'}`}>
            {review.source}
          </span>
        </div>
        <span className="text-xs text-gray-500 flex-shrink-0">{review.date}</span>
      </div>
      <p className="text-sm text-gray-300 mt-1">{review.text}</p>
      {review.url && (
        <a
          href={review.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-300 mt-1 inline-block"
        >
          Ver fuente original →
        </a>
      )}
      {Object.keys(review.categories).length > 0 && (
        <div className="flex gap-3 mt-2 text-xs text-gray-500">
          {Object.entries(review.categories).map(([cat, score]) => (
            <span key={cat}>
              {categoryLabels[cat]}: <span className={score && score >= 4 ? 'text-green-400' : score && score >= 3 ? 'text-yellow-400' : 'text-red-400'}>{score}/5</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReviewSystem() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterSentiment, setFilterSentiment] = useState<string>('all');
  const [showIncidents, setShowIncidents] = useState(false);

  const filteredReviews = reviews.filter(r => {
    if (selectedProvider && r.provider !== selectedProvider) return false;
    if (filterSource !== 'all' && r.source !== filterSource) return false;
    if (filterSentiment === 'positive' && r.sentiment <= 0.3) return false;
    if (filterSentiment === 'negative' && r.sentiment >= -0.3) return false;
    if (filterSentiment === 'neutral' && (r.sentiment > 0.3 || r.sentiment < -0.3)) return false;
    return true;
  });

  const allSources = [...new Set(reviews.map(r => r.source))].sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Opiniones reales</h1>
        <p className="text-gray-400 max-w-2xl text-sm">
          Opiniones compiladas de {allSources.length} fuentes independientes.
          Cada opinión tiene ubicación verificada y sentimiento analizado.
          Actualizado agosto 2026.
        </p>
      </div>

      {/* Provider cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {providers.map(p => (
          <ProviderCard
            key={p.name}
            provider={p}
            isSelected={selectedProvider === p.name}
            onClick={() => setSelectedProvider(selectedProvider === p.name ? null : p.name)}
          />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm text-gray-500">Filtrar:</span>
        <select
          value={filterSource}
          onChange={e => setFilterSource(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300"
        >
          <option value="all">Todas las fuentes</option>
          {allSources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterSentiment}
          onChange={e => setFilterSentiment(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300"
        >
          <option value="all">Todos los sentimientos</option>
          <option value="positive">Positivos</option>
          <option value="neutral">Neutros</option>
          <option value="negative">Negativos</option>
        </select>
        <button
          onClick={() => setShowIncidents(!showIncidents)}
          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
            showIncidents
              ? 'bg-orange-500/20 border-orange-500/30 text-orange-300'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-300'
          }`}
        >
          Incidentes ({providers.reduce((a, p) => a + p.recentIncidents.length, 0)})
        </button>
        {selectedProvider && (
          <button
            onClick={() => setSelectedProvider(null)}
            className="text-sm text-gray-500 hover:text-gray-300"
          >
            Limpiar selección
          </button>
        )}
      </div>

      {/* Incidents panel */}
      {showIncidents && (
        <div className="bg-gray-800/60 rounded-xl border border-orange-500/20 p-4">
          <h3 className="font-semibold text-orange-300 mb-3">Incidentes recientes</h3>
          <div className="space-y-2">
            {providers.filter(p => p.recentIncidents.length > 0).map(p => (
              <div key={p.name}>
                <div className={`font-medium text-sm ${colorMap[p.color].text} mb-1`}>{p.name}</div>
                <ul className="space-y-1">
                  {p.recentIncidents.map((inc, i) => (
                    <li key={i} className="text-sm text-gray-400 pl-3 border-l border-gray-700">
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-200">
            {selectedProvider ? `Opiniones de ${selectedProvider}` : 'Todas las opiniones'}
            <span className="text-gray-500 font-normal ml-2">({filteredReviews.length})</span>
          </h2>
        </div>
        {filteredReviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay opiniones que coincidan con los filtros.</p>
        ) : (
          filteredReviews.map(r => <ReviewItem key={r.id} review={r} />)
        )}
      </div>

      {/* Source legend */}
      <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4">
        <h3 className="font-medium text-gray-300 mb-2 text-sm">Fuentes consultadas</h3>
        <div className="flex flex-wrap gap-2">
          {allSources.map(s => (
            <span key={s} className={`text-xs px-2 py-1 rounded ${sourceColors[s] || 'bg-gray-700 text-gray-400'}`}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Opiniones reales compiladas de foros, redes sociales y comparadores. No son mediciones oficiales.
      </div>
    </div>
  );
}
