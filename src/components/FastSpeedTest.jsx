import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

const WORKER_URL = 'https://quiet-bird-94ce.alan-mundler.workers.dev';
const SITE_BASE = '/fibramap-page';
const FAST_TOKEN = 'YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm';
const URL_COUNT = 5;
const TEST_DURATION_MS = 10000;
const SAMPLE_INTERVAL_MS = 200;
const UPLOAD_SIZE_MB = 10;

const PHASES = [
  { key: 'targets', label: 'Buscando servidores', color: '#a855f7' },
  { key: 'download', label: 'Descarga', color: '#3b82f6' },
  { key: 'upload', label: 'Subida', color: '#10b981' },
];

function LiveChart({ points, color, id }) {
  const W = 500, H = 100;
  const pad = { t: 10, r: 8, b: 14, l: 36 };
  const usable = points.slice(-40);
  if (usable.length < 2) return null;

  const yMax = Math.max(10, ...usable.map(p => p.v)) * 1.15;
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const toX = (i) => pad.l + (i / Math.max(1, usable.length - 1)) * plotW;
  const toY = (v) => pad.t + (1 - v / yMax) * plotH;

  const pathParts = [];
  for (let i = 0; i < usable.length; i++) {
    const x = toX(i).toFixed(1), y = toY(usable[i].v).toFixed(1);
    if (i === 0) { pathParts.push(`M${x},${y}`); }
    else {
      const px = toX(i - 1), py = toY(usable[i - 1].v);
      const cpx = ((px + parseFloat(x)) / 2).toFixed(1);
      pathParts.push(`C${cpx},${py.toFixed(1)} ${cpx},${y} ${x},${y}`);
    }
  }
  const lineD = pathParts.join(' ');
  const lastX = toX(usable.length - 1), lastY = toY(usable[usable.length - 1].v);
  const areaD = lineD + ` L${lastX.toFixed(1)},${(H - pad.b).toFixed(1)} L${toX(0).toFixed(1)},${(H - pad.b).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ height: '85px' }}>
      <defs>
        <linearGradient id={`cg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map(i => {
        const v = (yMax / 3) * i;
        return (
          <g key={i}>
            <line x1={pad.l} y1={toY(v)} x2={W - pad.r} y2={toY(v)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <text x={pad.l - 4} y={toY(v) + 3} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="ui-monospace,monospace">
              {Math.round(v)}
            </text>
          </g>
        );
      })}
      <path d={areaD} fill={`url(#cg-${id})`} />
      <path d={lineD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="3" fill={color} stroke="#111827" strokeWidth="1.5" />
    </svg>
  );
}

function Gauge({ value, max, phase, color, running, id }) {
  const size = 170, cx = 85, cy = 85;
  const r = 68, strokeW = 6;
  const arcStart = 140, arcEnd = 400, arcRange = arcEnd - arcStart;
  const toRad = (d) => (d * Math.PI) / 180;
  const arcPt = (deg) => ({ x: cx + r * Math.cos(toRad(deg)), y: cy + r * Math.sin(toRad(deg)) });

  const start = arcPt(arcStart), end = arcPt(arcEnd);
  const pct = Math.min(value / (max || 1000), 1);
  const cur = arcPt(arcStart + pct * arcRange);

  const bgArc = `M${start.x},${start.y} A${r},${r} 0 1 1 ${end.x},${end.y}`;
  const valArc = pct > 0 ? `M${start.x},${start.y} A${r},${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${cur.x},${cur.y}` : '';

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id={`gg-${id}`}>
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id={`ggr-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <path d={bgArc} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeW} strokeLinecap="round" />
        {pct > 0 && (
          <path d={valArc} fill="none" stroke={`url(#ggr-${id})`} strokeWidth={strokeW} strokeLinecap="round" filter={`url(#gg-${id})`} />
        )}
        {running && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="1" strokeDasharray="8 24" opacity="0.2"
            style={{ animation: 'gSpin 2.5s linear infinite', transformOrigin: `${cx}px ${cy}px` }} />
        )}
        {pct > 0 && <circle cx={cur.x} cy={cur.y} r="3.5" fill={color} opacity="0.8" />}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: '6px' }}>
        <span className="text-[2rem] sm:text-[2.4rem] font-extrabold text-white tabular-nums leading-none"
          style={{ textShadow: `0 0 16px ${color}30` }}>
          {value}
        </span>
        <span className="text-[9px] text-gray-500 mt-0.5 font-semibold tracking-[0.15em] uppercase">{phase === 'targets' ? '' : 'Mbps'}</span>
        {phase && phase !== 'targets' && (
          <span className="mt-1 px-2.5 py-[2px] rounded-full text-[9px] font-bold tracking-wider"
            style={{ backgroundColor: color + '12', color, border: `1px solid ${color}20` }}>
            {PHASES.find(p => p.key === phase)?.label || ''}
          </span>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ currentPhase }) {
  const realPhases = PHASES.filter(p => p.key !== 'targets');
  const idx = realPhases.findIndex(p => p.key === currentPhase);
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      {realPhases.map((p, i) => {
        const done = i < idx, active = i === idx;
        return (
          <div key={p.key} className="flex items-center gap-1.5 sm:gap-2">
            <div className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-500 ${
              done ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
              : active ? 'text-white' : 'border-gray-700/40 bg-gray-800/40 text-gray-600'
            }`} style={active ? { borderColor: p.color + '60', backgroundColor: p.color + '10', color: p.color } : {}}>
              {done ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              ) : p.label[0]}
            </div>
            {i < realPhases.length - 1 && (
              <div className={`w-5 sm:w-8 h-[2px] rounded-full transition-all duration-500 ${done ? 'bg-emerald-500/40' : 'bg-gray-700/20'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ResultCard({ label, value, unit, color, icon }) {
  return (
    <div className="p-3 rounded-xl bg-gray-700/15 border border-gray-600/15 text-center">
      <p className="text-sm mb-0.5" style={{ color }}>{icon}</p>
      <p className="text-xl sm:text-2xl font-extrabold text-white tabular-nums leading-none">{value ?? '—'}</p>
      <p className="text-[9px] text-gray-500 mt-1 font-medium">{label} <span className="text-gray-600">({unit})</span></p>
    </div>
  );
}

const HISTORY_KEY = 'fibramap_fastspeed_history';
let chartIdCounter = 0;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}
function saveHistory(r) {
  const h = loadHistory();
  h.unshift({ ...r, date: new Date().toISOString() });
  if (h.length > 50) h.length = 50;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

async function getTargets() {
  const res = await fetch(`${WORKER_URL}/fastspeed/targets?urlCount=${URL_COUNT}`);
  if (!res.ok) throw new Error('Failed to fetch targets');
  return await res.json();
}

function measureDownload(targets, durationMs, onProgress) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    let totalBytes = 0;
    let aborted = false;
    const controllers = [];

    const sample = () => {
      const elapsed = performance.now() - startTime;
      const speedBps = (totalBytes * 8) / (elapsed / 1000);
      const speedMbps = speedBps / 1000000;
      onProgress(Math.round(speedMbps), elapsed);
    };

    const interval = setInterval(sample, SAMPLE_INTERVAL_MS);

    targets.forEach(async (url) => {
      const controller = new AbortController();
      controllers.push(controller);
      try {
        const res = await fetch(url, { signal: controller.signal });
        const reader = res.body.getReader();
        while (!aborted) {
          const { done, value } = await reader.read();
          if (done) break;
          totalBytes += value.byteLength;
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.warn('Download stream error:', e);
      }
    });

    setTimeout(() => {
      aborted = true;
      controllers.forEach(c => c.abort());
      clearInterval(interval);
      sample();
      const elapsed = performance.now() - startTime;
      const speedMbps = (totalBytes * 8) / (elapsed / 1000) / 1000000;
      resolve(Math.round(speedMbps));
    }, durationMs);
  });
}

function measureUpload(targets, sizeBytes, durationMs, onProgress) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    let totalBytesSent = 0;
    let aborted = false;

    const sample = () => {
      const elapsed = performance.now() - startTime;
      const speedBps = (totalBytesSent * 8) / (elapsed / 1000);
      const speedMbps = speedBps / 1000000;
      onProgress(Math.round(speedMbps), elapsed);
    };

    const interval = setInterval(sample, SAMPLE_INTERVAL_MS);

    const uploadOne = async (url) => {
      const blob = new Blob([crypto.getRandomValues(new Uint8Array(sizeBytes))]);
      let sent = 0;
      while (!aborted) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            body: blob,
            headers: { 'Content-Type': 'application/octet-stream' },
          });
          await res.blob();
          sent += sizeBytes;
          totalBytesSent += sizeBytes;
        } catch (e) {
          if (e.name === 'AbortError') break;
          break;
        }
      }
    };

    const workers = targets.map(t => uploadOne(t));

    setTimeout(() => {
      aborted = true;
      clearInterval(interval);
      sample();
      const elapsed = performance.now() - startTime;
      const speedMbps = (totalBytesSent * 8) / (elapsed / 1000) / 1000000;
      resolve(Math.round(speedMbps));
    }, durationMs);

    Promise.allSettled(workers);
  });
}

export default function FastSpeedTest() {
  const [state, setState] = useState('idle');
  const [currentPhase, setCurrentPhase] = useState(null);
  const [liveSpeed, setLiveSpeed] = useState(0);
  const [results, setResults] = useState(null);
  const [chartPoints, setChartPoints] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [serverInfo, setServerInfo] = useState(null);
  const [trace, setTrace] = useState(null);
  const [error, setError] = useState(null);
  const cancelledRef = useRef(false);
  const chartRef = useRef([]);
  const [cid] = useState(() => ++chartIdCounter);

  useEffect(() => {
    setHistory(loadHistory());
    fetch(`${WORKER_URL}/trace`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.ip) setTrace(d); })
      .catch(() => {});
  }, []);

  const gaugeMax = liveSpeed > 0 ? Math.max(liveSpeed * 1.25, 100) : 200;
  const gaugeColor = currentPhase === 'upload' ? '#10b981' : '#3b82f6';

  const dlPoints = useMemo(() => chartPoints.filter(p => p.t === 'download'), [chartPoints]);
  const ulPoints = useMemo(() => chartPoints.filter(p => p.t === 'upload'), [chartPoints]);

  const run = useCallback(async () => {
    setState('running');
    setResults(null);
    setLiveSpeed(0);
    setChartPoints([]);
    setServerInfo(null);
    setError(null);
    chartRef.current = [];
    cancelledRef.current = false;

    try {
      setCurrentPhase('targets');
      const targets = await getTargets();
      setServerInfo(targets.map(u => { try { return new URL(u).hostname; } catch { return u; } }));

      if (cancelledRef.current) return;

      setCurrentPhase('download');
      setLiveSpeed(0);
      chartRef.current = [];
      setChartPoints([]);

      const dlMbps = await measureDownload(targets, TEST_DURATION_MS, (speed) => {
        if (cancelledRef.current) return;
        setLiveSpeed(speed);
        chartRef.current = [...chartRef.current, { v: speed, t: 'download' }];
        if (chartRef.current.length > 200) chartRef.current = chartRef.current.slice(-200);
        setChartPoints([...chartRef.current]);
      });

      if (cancelledRef.current) return;

      setCurrentPhase('upload');
      setLiveSpeed(0);
      chartRef.current = [];

      const uploadBlobSize = UPLOAD_SIZE_MB * 1024 * 1024;
      const ulMbps = await measureUpload(targets, uploadBlobSize, TEST_DURATION_MS, (speed) => {
        if (cancelledRef.current) return;
        setLiveSpeed(speed);
        chartRef.current = [...chartRef.current, { v: speed, t: 'upload' }];
        if (chartRef.current.length > 200) chartRef.current = chartRef.current.slice(-200);
        setChartPoints([...chartRef.current]);
      });

      if (cancelledRef.current) return;

      const r = {
        download: String(dlMbps || 0),
        upload: String(ulMbps || 0),
        servers: targets.length,
      };

      setResults(r);
      setState('done');
      setCurrentPhase(null);
      saveHistory(r);
      setHistory(loadHistory());
    } catch (e) {
      if (!cancelledRef.current) {
        setError(e.message || 'Error desconocido');
        setState('error');
        setCurrentPhase(null);
      }
    }
  }, []);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    setState('idle');
    setCurrentPhase(null);
    setLiveSpeed(0);
    setChartPoints([]);
  }, []);

  const clearHistory = useCallback(() => { localStorage.removeItem(HISTORY_KEY); setHistory([]); }, []);

  return (
    <div className="bg-gray-800/80 rounded-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-gray-900/40">

      {state === 'idle' && (
        <div className="px-4 sm:px-5 pt-4 pb-2">
          {trace && (
            <div className="p-2 rounded-xl bg-gray-700/15 border border-gray-700/15">
              <div className="flex items-center gap-3 text-[9px]">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-gray-600 shrink-0">IP</span>
                  <span className="text-gray-300 font-mono font-semibold truncate">{trace.ip}</span>
                </div>
                <div className="w-px h-2.5 bg-gray-700/40 shrink-0" />
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-gray-600 shrink-0">ISP</span>
                  <span className="text-gray-300 font-semibold truncate">{trace.isp || '—'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center py-3">
        <Gauge
          value={state === 'running' ? liveSpeed : 0}
          max={gaugeMax}
          phase={currentPhase}
          color={state === 'running' ? gaugeColor : '#e11d48'}
          running={state === 'running'}
          id={`fg-${cid}`}
        />
      </div>

      <div className="px-4 sm:px-5 pb-2 min-h-[32px]">
        {state === 'idle' && (
          <p className="text-[10px] text-gray-500 text-center">
            Speedtest con servidores Netflix CDN (fast.com). Medición independiente.
          </p>
        )}

        {state === 'running' && (
          <div className="space-y-2">
            <StepIndicator currentPhase={currentPhase} />
            <div className="flex justify-center">
              {currentPhase === 'download' && dlPoints.length >= 2 && (
                <div className="w-full"><LiveChart points={dlPoints} color="#3b82f6" id={`fdl-${cid}`} /></div>
              )}
              {currentPhase === 'upload' && ulPoints.length >= 2 && (
                <div className="w-full"><LiveChart points={ulPoints} color="#10b981" id={`ful-${cid}`} /></div>
              )}
            </div>
            {currentPhase === 'targets' && (
              <p className="text-[9px] text-purple-400 text-center animate-pulse">Conectando con servidores Netflix...</p>
            )}
            {currentPhase !== 'targets' && (
              <p className="text-[9px] text-gray-600 text-center">No cierres esta página</p>
            )}
          </div>
        )}

        {state === 'error' && (
          <p className="text-sm text-red-400 text-center py-3">Error: {error}</p>
        )}
      </div>

      {state === 'done' && results && (
        <div className="px-4 sm:px-5 pb-2 space-y-3">
          <div className="text-center">
            <p className="text-sm font-extrabold tracking-tight text-cyan-400">Medición completada</p>
          </div>

          {serverInfo && (
            <div className="p-2 rounded-xl bg-gray-700/15 border border-gray-700/15">
              <div className="flex items-center justify-center gap-2 text-[9px]">
                <span className="text-gray-500">Netflix CDN</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-300 font-semibold">{serverInfo.length} servidores</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <ResultCard label="Descarga" value={results.download} unit="Mbps" color="#3b82f6" icon="↓" />
            <ResultCard label="Subida" value={results.upload} unit="Mbps" color="#10b981" icon="↑" />
          </div>

          {dlPoints.length >= 2 && (
            <div>
              <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wider mb-1">Descarga</p>
              <LiveChart points={dlPoints} color="#3b82f6" id={`fdlr-${cid}`} />
            </div>
          )}
          {ulPoints.length >= 2 && (
            <div>
              <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wider mb-1">Subida</p>
              <LiveChart points={ulPoints} color="#10b981" id={`fulr-${cid}`} />
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => { setShowHistory(!showHistory); setShowShare(false); }}
              className={`flex-1 py-2 rounded-xl text-[11px] font-semibold border transition-all ${
                showHistory ? 'border-blue-500/25 bg-blue-500/8 text-blue-300' : 'border-gray-600/30 bg-gray-700/20 text-gray-300 hover:bg-gray-600/25'
              }`}>
              Historial ({history.length})
            </button>
            <button onClick={() => { setShowShare(!showShare); setShowHistory(false); }}
              className={`flex-1 py-2 rounded-xl text-[11px] font-semibold border transition-all ${
                showShare ? 'border-blue-500/25 bg-blue-500/8 text-blue-300' : 'border-gray-600/30 bg-gray-700/20 text-gray-300 hover:bg-gray-600/25'
              }`}>
              Compartir
            </button>
          </div>

          {showShare && (
            <div className="p-3 rounded-2xl bg-gray-700/10 border border-gray-700/15 space-y-2">
              <div className="bg-gray-900/80 rounded-xl p-3 text-center space-y-1.5">
                <p className="text-[10px] font-bold text-white tracking-widest uppercase">FIBRAMAP · fast.com</p>
                <div className="flex justify-center gap-4">
                  <div><p className="text-lg font-extrabold text-blue-400 tabular-nums">{results.download}</p><p className="text-[8px] text-gray-500">↓ Mbps</p></div>
                  <div><p className="text-lg font-extrabold text-green-400 tabular-nums">{results.upload}</p><p className="text-[8px] text-gray-500">↑ Mbps</p></div>
                </div>
              </div>
              <button onClick={() => {
                navigator.clipboard?.writeText(
                  `⚡ FIBRAMAP Speed Test (Netflix CDN)\n↓ ${results.download} Mbps | ↑ ${results.upload} Mbps\nhttps://alanmundler.github.io/fibramap-page/velocidad-fast`
                );
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }} className={`w-full py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-[0.98] ${
                copied ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}>
                {copied ? '✓ Copiado' : 'Copiar resultado'}
              </button>
            </div>
          )}
        </div>
      )}

      {showHistory && history.length > 0 && (
        <div className="px-4 sm:px-5 pb-3 max-h-40 overflow-y-auto border-t border-gray-700/15 pt-3">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Últimas pruebas</p>
            <button onClick={clearHistory} className="text-[9px] text-red-400/60 hover:text-red-400 transition-colors">Borrar</button>
          </div>
          <div className="space-y-1">
            {history.slice(0, 10).map((h, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-700/8 text-[10px]">
                <span className="text-gray-600 shrink-0 font-mono text-[9px]">{new Date(h.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</span>
                <span className="text-blue-400 font-mono font-semibold">{h.download ?? '—'}</span>
                <span className="text-gray-600">↓</span>
                <span className="text-green-400 font-mono font-semibold">{h.upload ?? '—'}</span>
                <span className="text-gray-600">↑</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 sm:px-5 pb-4">
        {state === 'running' ? (
          <button onClick={stop} className="w-full py-2.5 rounded-xl text-xs font-semibold border border-red-500/30 bg-red-500/8 text-red-400 hover:bg-red-500/15 hover:text-red-300 active:scale-[0.98] transition-all">
            Cancelar
          </button>
        ) : (
          <button onClick={run} className="w-full py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white active:scale-[0.98] transition-all shadow-lg shadow-rose-600/20">
            {state === 'done' ? 'Medir de nuevo' : 'Iniciar test (Netflix CDN)'}
          </button>
        )}
      </div>
    </div>
  );
}
