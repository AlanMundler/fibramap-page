import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

const PHASES = [
  { key: 'latency', label: 'Latencia', icon: '↔', color: '#f59e0b' },
  { key: 'download', label: 'Descarga', icon: '↓', color: '#3b82f6' },
  { key: 'upload', label: 'Subida', icon: '↑', color: '#10b981' },
];

const ACTIVITIES = [
  { name: 'Streaming 4K', icon: '🎬', minDown: 25, minUp: 0, maxLatency: 50 },
  { name: 'Videollamada HD', icon: '📹', minDown: 5, minUp: 5, maxLatency: 80 },
  { name: 'Gaming online', icon: '🎮', minDown: 10, minUp: 5, maxLatency: 30 },
  { name: 'Work from home', icon: '💻', minDown: 10, minUp: 5, maxLatency: 60 },
  { name: 'Descarga pesada', icon: '📦', minDown: 50, minUp: 0, maxLatency: 200 },
  { name: 'Música HD', icon: '🎵', minDown: 3, minUp: 0, maxLatency: 100 },
  { name: 'Redes sociales', icon: '📱', minDown: 2, minUp: 1, maxLatency: 150 },
  { name: 'Smart Home', icon: '🏠', minDown: 2, minUp: 1, maxLatency: 200 },
];

const HISTORY_KEY = 'fibramap_speedtest_history';

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}
function saveHistory(results) {
  const hist = loadHistory();
  hist.unshift({ ...results, date: new Date().toISOString() });
  if (hist.length > 50) hist.length = 50;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
}

function getQuality(download, upload, latency) {
  if (download >= 100 && latency < 15) return { label: 'Excepcional', color: '#22d3ee', emoji: '🏆', score: 100 };
  if (download >= 50 && latency < 25) return { label: 'Excelente', color: '#10b981', emoji: '⭐', score: 85 };
  if (download >= 25 && latency < 50) return { label: 'Muy buena', color: '#34d399', emoji: '✅', score: 70 };
  if (download >= 10 && latency < 80) return { label: 'Buena', color: '#fbbf24', emoji: '👍', score: 55 };
  if (download >= 5 && latency < 120) return { label: 'Regular', color: '#f97316', emoji: '⚠️', score: 40 };
  if (download >= 1) return { label: 'Lenta', color: '#ef4444', emoji: '🐌', score: 20 };
  return { label: 'Muy lenta', color: '#dc2626', emoji: '❌', score: 5 };
}

function LiveChart({ points, color, maxVal }) {
  const W = 400, H = 100, pad = 4;
  const usable = points.length > 1 ? points.slice(-60) : points;
  const yMax = maxVal || Math.max(10, ...usable.map(p => p.v)) * 1.1;

  const pathD = usable.map((p, i) => {
    const x = pad + (i / Math.max(1, usable.length - 1)) * (W - pad * 2);
    const y = H - pad - (p.v / yMax) * (H - pad * 2);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');

  const areaD = pathD + ` L${pad + ((usable.length - 1) / Math.max(1, usable.length - 1)) * (W - pad * 2)},${H} L${pad},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20 sm:h-24" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {usable.length > 1 && <path d={areaD} fill="url(#areaGrad)" />}
      {usable.length > 1 && <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
      {usable.length > 0 && (() => {
        const last = usable[usable.length - 1];
        const x = pad + ((usable.length - 1) / Math.max(1, usable.length - 1)) * (W - pad * 2);
        const y = H - pad - (last.v / yMax) * (H - pad * 2);
        return <circle cx={x} cy={y} r="4" fill={color} stroke="#1f2937" strokeWidth="2" />;
      })()}
      <text x={W - 2} y={12} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="10">
        {Math.round(yMax)} Mbps
      </text>
    </svg>
  );
}

function Gauge({ value, max, phase, color, running }) {
  const radius = 88;
  const stroke = 10;
  const nR = radius - stroke / 2;
  const C = nR * 2 * Math.PI;
  const pct = Math.min(value / max, 1);
  const offset = C - pct * C;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle stroke="rgba(255,255,255,0.06)" fill="transparent" strokeWidth={stroke} r={nR} cx={radius} cy={radius} />
        <circle
          stroke={color} fill="transparent" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${C} ${C}`}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.3s ease-out' }}
          r={nR} cx={radius} cy={radius}
        />
        {running && (
          <circle
            stroke={color} fill="transparent" strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${C * 0.15} ${C * 0.85}`}
            style={{ strokeDashoffset: 0, opacity: 0.4, animation: 'spin 1.5s linear infinite', transformOrigin: `${radius}px ${radius}px` }}
            r={nR} cx={radius} cy={radius}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl sm:text-5xl font-bold text-white tabular-nums leading-none">{value}</span>
        <span className="text-[11px] text-gray-400 mt-1">Mbps</span>
        <span className="text-[10px] mt-1 px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: color + '20', color }}>
          {phase}
        </span>
      </div>
    </div>
  );
}

function StepIndicator({ currentPhase }) {
  const idx = PHASES.findIndex(p => p.key === currentPhase);
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      {PHASES.map((p, i) => {
        const done = i < idx, active = i === idx;
        return (
          <div key={p.key} className="flex items-center gap-1.5">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-medium border transition-all duration-300 ${
              done ? 'bg-green-500/20 border-green-500/50 text-green-400'
              : active ? '' : 'border-gray-700 text-gray-600'
            }`} style={active ? { backgroundColor: p.color + '20', borderColor: p.color + '80', color: p.color } : {}}>
              {done ? '✓' : p.icon}
            </div>
            {i < PHASES.length - 1 && (
              <div className={`w-5 sm:w-8 h-0.5 rounded ${done ? 'bg-green-500/50' : 'bg-gray-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ResultCard({ label, value, unit, color, icon, detail }) {
  return (
    <div className="p-3 sm:p-4 rounded-xl bg-gray-700/30 border border-gray-600/30 text-center">
      <div className="text-base sm:text-lg mb-1" style={{ color }}>{icon}</div>
      <p className="text-xl sm:text-3xl font-bold text-white tabular-nums leading-none">{value ?? '--'}</p>
      <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">{label} ({unit})</p>
      {detail && <p className="text-[10px] text-gray-500 mt-0.5">{detail}</p>}
    </div>
  );
}

function bpsToMbps(bps) {
  if (!bps || bps <= 0) return 0;
  return Math.round(bps / 1e6);
}

export default function SpeedTest() {
  const [state, setState] = useState('idle');
  const [currentPhase, setCurrentPhase] = useState(null);
  const [liveSpeed, setLiveSpeed] = useState(0);
  const [results, setResults] = useState(null);
  const [chartPoints, setChartPoints] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const engineRef = useRef(null);
  const pollRef = useRef(null);
  const chartRef = useRef([]);

  useEffect(() => { setHistory(loadHistory()); }, []);

  const quality = useMemo(() => {
    if (!results) return null;
    return getQuality(
      results.download ? parseFloat(results.download) : 0,
      results.upload ? parseFloat(results.upload) : 0,
      results.latency ? parseInt(results.latency) : 999
    );
  }, [results]);

  const activities = useMemo(() => {
    if (!results) return [];
    const d = results.download ? parseFloat(results.download) : 0;
    const u = results.upload ? parseFloat(results.upload) : 0;
    const l = results.latency ? parseInt(results.latency) : 999;
    return ACTIVITIES.map(a => ({
      ...a,
      ok: d >= a.minDown && u >= a.minUp && l <= a.maxLatency,
    }));
  }, [results]);

  const run = useCallback(async () => {
    setState('running');
    setResults(null);
    setCurrentPhase('latency');
    setLiveSpeed(0);
    setChartPoints([]);
    chartRef.current = [];

    try {
      const { default: SpeedTest } = await import('@cloudflare/speedtest');

      const engine = new SpeedTest({
        autoStart: false,
        measurements: [
          { type: 'latency', numPackets: 20 },
          { type: 'download', bytes: 1e5, count: 9 },
          { type: 'download', bytes: 1e6, count: 8 },
          { type: 'download', bytes: 1e7, count: 6 },
          { type: 'download', bytes: 2.5e7, count: 4 },
          { type: 'download', bytes: 1e8, count: 3 },
          { type: 'download', bytes: 2.5e8, count: 2 },
          { type: 'upload', bytes: 1e5, count: 8 },
          { type: 'upload', bytes: 1e6, count: 6 },
          { type: 'upload', bytes: 1e7, count: 4 },
          { type: 'upload', bytes: 5e7, count: 3 },
        ],
      });

      let phaseRef = 'latency';

      engine.onResultsChange = ({ type }) => {
        if (type === 'latency' && phaseRef === 'latency') {
          phaseRef = 'download';
          setCurrentPhase('download');
        } else if (type === 'download' && phaseRef !== 'download') {
          phaseRef = 'download';
          setCurrentPhase('download');
        } else if (type === 'upload' && phaseRef !== 'upload') {
          phaseRef = 'upload';
          setCurrentPhase('upload');
        }
      };

      engine.onFinish = (res) => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        const s = res.getSummary();
        const r = {
          download: s.download ? (s.download / 1e6).toFixed(1) : null,
          upload: s.upload ? (s.upload / 1e6).toFixed(1) : null,
          latency: s.latency ? s.latency.toFixed(0) : null,
          jitter: s.jitter ? s.jitter.toFixed(0) : null,
          loadedLatencyDown: s.loadedLatencyDown ? s.loadedLatencyDown.toFixed(0) : null,
          loadedLatencyUp: s.loadedLatencyUp ? s.loadedLatencyUp.toFixed(0) : null,
          scores: typeof s.getScores === 'function' ? s.getScores() : null,
        };
        setResults(r);
        setState('done');
        setCurrentPhase(null);
        saveHistory(r);
        setHistory(loadHistory());
      };

      engineRef.current = engine;
      engine.play();

      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        if (!engine.results) return;
        try {
          const isUpload = phaseRef === 'upload';
          const pts = isUpload ? engine.results.getUploadBandwidthPoints?.() : engine.results.getDownloadBandwidthPoints?.();
          if (pts && pts.length > 0) {
            const last = pts[pts.length - 1];
            if (last.bps > 0) {
              const mbps = bpsToMbps(last.bps);
              setLiveSpeed(mbps);
              chartRef.current = [...chartRef.current, { v: mbps, t: isUpload ? 'upload' : 'download' }];
              if (chartRef.current.length > 200) chartRef.current = chartRef.current.slice(-200);
              setChartPoints([...chartRef.current]);
            }
          }
          const latPts = engine.results.getUnloadedLatencyPoints?.();
          if (latPts && phaseRef === 'latency') {
            const lastLat = latPts[latPts.length - 1];
            if (lastLat > 0) {
              setLiveSpeed(Math.round(lastLat));
            }
          }
        } catch (_) {}
      }, 250);
    } catch (e) {
      setState('error');
      setCurrentPhase(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      engineRef.current?.stop();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    setState('idle');
    setCurrentPhase(null);
    setLiveSpeed(0);
    setChartPoints([]);
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }, []);

  const gaugeColor = currentPhase === 'upload' ? '#10b981' : currentPhase === 'latency' ? '#f59e0b' : '#3b82f6';
  const phaseLabel = PHASES.find(p => p.key === currentPhase)?.label || '';

  const chartColor = currentPhase === 'upload' ? '#10b981' : currentPhase === 'latency' ? '#f59e0b' : '#3b82f6';

  const downloadPoints = chartPoints.filter(p => p.t === 'download');
  const uploadPoints = chartPoints.filter(p => p.t === 'upload');
  const chartMax = Math.max(10, ...chartPoints.map(p => p.v)) * 1.1;

  return (
    <div className="bg-gray-800/80 rounded-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden shadow-xl shadow-gray-900/30">
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>

      <div className="px-4 sm:px-5 pt-5 pb-4">
        {state === 'running' && (
          <div className="space-y-4">
            <StepIndicator currentPhase={currentPhase} />
            <Gauge value={liveSpeed} max={1000} phase={phaseLabel} color={gaugeColor} running />
            {currentPhase !== 'latency' && chartPoints.length > 1 && (
              <div className="bg-gray-700/20 rounded-xl p-2 border border-gray-700/30">
                <div className="flex gap-3 text-[10px] text-gray-500 mb-1">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Descarga</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Subida</span>
                </div>
                <LiveChart points={currentPhase === 'upload' ? uploadPoints : downloadPoints} color={chartColor} maxVal={chartMax} />
              </div>
            )}
            <p className="text-[11px] text-gray-500 text-center">No cierres esta página durante el test</p>
          </div>
        )}

        {state === 'done' && results && (
          <div className="space-y-5">
            {quality && (
              <div className="text-center">
                <div className="text-3xl mb-1">{quality.emoji}</div>
                <p className="text-lg font-bold" style={{ color: quality.color }}>{quality.label}</p>
                <div className="mt-2 h-2 bg-gray-700/50 rounded-full overflow-hidden max-w-[200px] mx-auto">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${quality.score}%`, backgroundColor: quality.color }} />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">{quality.score}/100</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <ResultCard label="Descarga" value={results.download} unit="Mbps" color="#3b82f6" icon="↓" />
              <ResultCard label="Subida" value={results.upload} unit="Mbps" color="#10b981" icon="↑" />
              <ResultCard label="Latencia" value={results.latency} unit="ms" color="#f59e0b" icon="↔" detail={results.latency && parseInt(results.latency) < 20 ? 'Muy baja' : ''} />
              <ResultCard label="Jitter" value={results.jitter} unit="ms" color="#a855f7" icon="∿" detail={results.jitter && parseInt(results.jitter) < 5 ? 'Estable' : ''} />
            </div>

            {results.loadedLatencyDown && (
              <div className="grid grid-cols-2 gap-2.5 text-center text-xs">
                <div className="p-2 rounded-lg bg-gray-700/20 border border-gray-700/30">
                  <p className="text-gray-500">↓ Bajo carga</p>
                  <p className="text-white font-semibold">{results.loadedLatencyDown} ms</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-700/20 border border-gray-700/30">
                  <p className="text-gray-500">↑ Bajo carga</p>
                  <p className="text-white font-semibold">{results.loadedLatencyUp} ms</p>
                </div>
              </div>
            )}

            {downloadPoints.length > 1 && (
              <div className="bg-gray-700/20 rounded-xl p-2 border border-gray-700/30">
                <p className="text-[10px] text-gray-500 mb-1">Mediciones ↓ descarga</p>
                <LiveChart points={downloadPoints} color="#3b82f6" maxVal={chartMax} />
                {uploadPoints.length > 1 && (
                  <>
                    <p className="text-[10px] text-gray-500 mb-1 mt-2">Mediciones ↑ subida</p>
                    <LiveChart points={uploadPoints} color="#10b981" maxVal={chartMax} />
                  </>
                )}
              </div>
            )}

            {activities.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-medium mb-2">¿Qué podés hacer con esta velocidad?</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {activities.map(a => (
                    <div key={a.name} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${a.ok ? 'bg-green-500/10 text-green-300' : 'bg-gray-700/20 text-gray-500'}`}>
                      <span>{a.icon}</span>
                      <span className="truncate">{a.name}</span>
                      <span className="ml-auto text-[10px]">{a.ok ? '✓' : '✗'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.scores && Object.keys(results.scores).length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-medium mb-2">AIM Scores (Cloudflare)</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(results.scores).map(([k, v]) => (
                    <div key={k} className="px-2.5 py-1.5 rounded-lg bg-gray-700/20 border border-gray-700/30 text-xs">
                      <span className="text-gray-400">{k}: </span>
                      <span className="text-white font-semibold">{typeof v === 'number' ? v.toFixed(0) : v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setShowHistory(!showHistory)} className="flex-1 py-2.5 rounded-xl text-xs font-medium border border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-600 transition-all">
                {showHistory ? 'Ocultar' : `Historial (${history.length})`}
              </button>
              <button onClick={() => setShowShare(!showShare)} className="flex-1 py-2.5 rounded-xl text-xs font-medium border border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-600 transition-all">
                {showShare ? 'Cerrar' : 'Compartir'}
              </button>
            </div>

            {showShare && (
              <div className="p-3 rounded-xl bg-gray-700/20 border border-gray-700/30 space-y-2">
                <div id="share-result" className="bg-gray-900 rounded-xl p-4 text-center space-y-2">
                  <p className="text-sm font-bold text-white">FIBRAMAP Speed Test</p>
                  <div className="flex justify-center gap-4">
                    <div><p className="text-xl font-bold text-blue-400">{results.download ?? '--'}</p><p className="text-[10px] text-gray-500">↓ Mbps</p></div>
                    <div><p className="text-xl font-bold text-green-400">{results.upload ?? '--'}</p><p className="text-[10px] text-gray-500">↑ Mbps</p></div>
                    <div><p className="text-xl font-bold text-amber-400">{results.latency ?? '--'}</p><p className="text-[10px] text-gray-500">ms</p></div>
                  </div>
                  {quality && <p className="text-xs" style={{ color: quality.color }}>{quality.emoji} {quality.label}</p>}
                  <p className="text-[9px] text-gray-600">{new Date().toLocaleDateString('es-AR')} • fibramap.com</p>
                </div>
                <button onClick={() => {
                  navigator.clipboard?.writeText(
                    `FIBRAMAP Speed Test\n↓ ${results.download ?? '--'} Mbps | ↑ ${results.upload ?? '--'} Mbps | ${results.latency ?? '--'} ms\n${quality ? quality.emoji + ' ' + quality.label : ''}\nhttps://alanmundler.github.io/fibramap-page/velocidad`
                  );
                }} className="w-full py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all">
                  Copiar resultado
                </button>
              </div>
            )}
          </div>
        )}

        {state === 'idle' && (
          <div className="text-center py-6 space-y-3">
            <div className="text-4xl">⚡</div>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Test completo: descarga, subida, latencia, jitter, latencia bajo carga y calidad de conexión. Servidores Cloudflare.
            </p>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center py-6">
            <p className="text-sm text-red-400">Error al iniciar el test. Intentá de nuevo.</p>
          </div>
        )}
      </div>

      {showHistory && history.length > 0 && (
        <div className="px-4 pb-3 max-h-48 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[11px] text-gray-400 font-medium">Últimas pruebas</p>
            <button onClick={clearHistory} className="text-[10px] text-red-400 hover:text-red-300">Borrar</button>
          </div>
          <div className="space-y-1.5">
            {history.slice(0, 10).map((h, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-700/20 text-[11px]">
                <span className="text-gray-500 shrink-0">{new Date(h.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</span>
                <span className="text-blue-400 font-mono">{h.download ?? '--'}</span>
                <span className="text-gray-600">↓</span>
                <span className="text-green-400 font-mono">{h.upload ?? '--'}</span>
                <span className="text-gray-600">↑</span>
                <span className="text-amber-400 font-mono">{h.latency ?? '--'}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        {state === 'running' ? (
          <button onClick={stop} className="w-full py-3 rounded-xl text-sm font-medium border border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:border-gray-500 hover:text-white active:scale-[0.98] transition-all duration-200">
            Cancelar
          </button>
        ) : (
          <button onClick={run} className="w-full btn-primary">
            {state === 'done' ? 'Medir de nuevo' : 'Iniciar test de velocidad'}
          </button>
        )}
      </div>
    </div>
  );
}
