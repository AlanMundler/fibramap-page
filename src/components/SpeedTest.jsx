import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

const PHASES = [
  { key: 'latency', label: 'Latencia', color: '#f59e0b' },
  { key: 'download', label: 'Descarga', color: '#3b82f6' },
  { key: 'upload', label: 'Subida', color: '#10b981' },
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
let chartId = 0;

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

function getQuality(d, u, l) {
  if (d >= 100 && l < 15) return { label: 'Excepcional', color: '#22d3ee', emoji: '🏆', score: 100 };
  if (d >= 50 && l < 25) return { label: 'Excelente', color: '#10b981', emoji: '⭐', score: 85 };
  if (d >= 25 && l < 50) return { label: 'Muy buena', color: '#34d399', emoji: '✅', score: 70 };
  if (d >= 10 && l < 80) return { label: 'Buena', color: '#fbbf24', emoji: '👍', score: 55 };
  if (d >= 5 && l < 120) return { label: 'Regular', color: '#f97316', emoji: '⚠️', score: 40 };
  if (d >= 1) return { label: 'Lenta', color: '#ef4444', emoji: '🐌', score: 20 };
  return { label: 'Muy lenta', color: '#dc2626', emoji: '❌', score: 5 };
}

function bpsToMbps(bps) {
  if (!bps || bps <= 0) return 0;
  return Math.round(bps / 1e6);
}

function smoothPath(pts, W, H, pad) {
  if (pts.length < 2) return '';
  const coords = pts.map((p, i) => ({
    x: pad + (i / Math.max(1, pts.length - 1)) * (W - pad * 2),
    y: H - pad - (p.v / (pts._yMax || 10)) * (H - pad * 2),
  }));
  let d = `M${coords[0].x},${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const cur = coords[i];
    const cpx = (prev.x + cur.x) / 2;
    d += ` C${cpx},${prev.y} ${cpx},${cur.y} ${cur.x},${cur.y}`;
  }
  return d;
}

const uid = () => ++chartId;

function LiveChart({ points, color, id }) {
  const W = 500, H = 140, pad = { t: 16, r: 8, b: 20, l: 40 };
  const usable = points.slice(-50);
  if (usable.length < 2) return null;

  const yMax = Math.max(10, ...usable.map(p => p.v)) * 1.15;
  const ySteps = 4;

  const toX = (i) => pad.l + (i / Math.max(1, usable.length - 1)) * (W - pad.l - pad.r);
  const toY = (v) => pad.t + (1 - v / yMax) * (H - pad.t - pad.b);

  const lineD = usable.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p.v).toFixed(1)}`).join(' ');

  const areaD = lineD +
    ` L${toX(usable.length - 1).toFixed(1)},${H - pad.b}` +
    ` L${toX(0).toFixed(1)},${H - pad.b} Z`;

  const lastPt = usable[usable.length - 1];
  const lastX = toX(usable.length - 1);
  const lastY = toY(lastPt.v);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '120px' }}>
      <defs>
        <linearGradient id={`cg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {Array.from({ length: ySteps + 1 }, (_, i) => {
        const val = (yMax / ySteps) * i;
        const y = toY(val);
        return (
          <g key={i}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={pad.l - 6} y={y + 3.5} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace">
              {Math.round(val)}
            </text>
          </g>
        );
      })}

      <path d={areaD} fill={`url(#cg-${id})`} />
      <path d={lineD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter={`url(#glow-${id})`} />

      <circle cx={lastX} cy={lastY} r="5" fill={color} stroke="#111827" strokeWidth="2.5" />
      <circle cx={lastX} cy={lastY} r="10" fill={color} opacity="0.15" />

      <rect x={lastX - 26} y={lastY - 22} width="52" height="16" rx="4" fill="rgba(17,24,39,0.9)" stroke={color} strokeWidth="0.5" />
      <text x={lastX} y={lastY - 11} textAnchor="middle" fill={color} fontSize="10" fontWeight="bold" fontFamily="monospace">
        {lastPt.v}
      </text>
    </svg>
  );
}

function Gauge({ value, max, phase, color, running }) {
  const size = 200;
  const cx = size / 2, cy = size / 2;
  const r = 82;
  const stroke = 8;
  const arcStart = 135;
  const arcEnd = 405;
  const arcRange = arcEnd - arcStart;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcPoint = (deg) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });

  const start = arcPoint(arcStart);
  const end = arcPoint(arcEnd);
  const largeArc = 1;

  const pct = Math.min(value / max, 1);
  const curAngle = arcStart + pct * arcRange;
  const cur = arcPoint(curAngle);
  const curPct = pct > 0 ? 1 : 0;

  const bgArc = `M${start.x},${start.y} A${r},${r} 0 ${largeArc} 1 ${end.x},${end.y}`;
  const valArc = pct > 0 ? `M${start.x},${start.y} A${r},${r} 0 ${curPct} 1 ${cur.x},${cur.y}` : '';

  const tickCount = 10;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const a = arcStart + (i / tickCount) * arcRange;
    const inner = arcPoint(a);
    const outerR = r + (i % 5 === 0 ? 8 : 5);
    const outer = { x: cx + outerR * Math.cos(toRad(a)), y: cy + outerR * Math.sin(toRad(a)) };
    return { inner, outer, major: i % 5 === 0 };
  });

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-0">
        <defs>
          <filter id="gauge-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>

        <path d={bgArc} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} strokeLinecap="round" />

        {pct > 0 && (
          <path d={valArc} fill="none" stroke={`url(#gauge-grad)`} strokeWidth={stroke} strokeLinecap="round" filter="url(#gauge-glow)" style={{ transition: 'all 0.35s ease-out' }} />
        )}

        {ticks.map((t, i) => (
          <line key={i} x1={t.inner.x} y1={t.inner.y} x2={t.outer.x} y2={t.outer.y} stroke={t.major ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'} strokeWidth={t.major ? 1.5 : 0.8} />
        ))}

        {running && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="12 30" opacity="0.3" style={{ animation: 'gaugeSpin 2s linear infinite', transformOrigin: `${cx}px ${cy}px` }} />
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: '8px' }}>
        <span className="text-4xl sm:text-5xl font-extrabold text-white tabular-nums leading-none tracking-tight" style={{ textShadow: `0 0 20px ${color}40` }}>
          {value}
        </span>
        <span className="text-[11px] text-gray-400 mt-1 font-medium tracking-wide uppercase">Mbps</span>
        <div className="mt-2 px-3 py-0.5 rounded-full text-[11px] font-semibold tracking-wider" style={{ backgroundColor: color + '15', color, border: `1px solid ${color}30` }}>
          {phase}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ currentPhase }) {
  const idx = PHASES.findIndex(p => p.key === currentPhase);
  return (
    <div className="flex items-center justify-center gap-2">
      {PHASES.map((p, i) => {
        const done = i < idx, active = i === idx;
        return (
          <div key={p.key} className="flex items-center gap-2">
            <div className={`relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
              done ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
              : active ? 'text-white' : 'border-gray-700/50 bg-gray-800/50 text-gray-600'
            }`} style={active ? { borderColor: p.color + '80', backgroundColor: p.color + '15', color: p.color, boxShadow: `0 0 16px ${p.color}25` } : {}}>
              {done ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              ) : (
                <span>{p.label[0]}</span>
              )}
              {active && (
                <span className="absolute inset-0 rounded-full border-2 animate-ping" style={{ borderColor: p.color + '30' }} />
              )}
            </div>
            {i < PHASES.length - 1 && (
              <div className={`w-8 sm:w-12 h-[2px] rounded-full transition-all duration-500 ${done ? 'bg-emerald-500/50' : 'bg-gray-700/30'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ResultCard({ label, value, unit, color, icon, sub }) {
  return (
    <div className="relative p-4 rounded-2xl bg-gray-700/20 border border-gray-600/20 text-center overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` }} />
      <div className="relative">
        <div className="text-xl mb-1.5" style={{ color }}>{icon}</div>
        <p className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums leading-none tracking-tight">{value ?? '--'}</p>
        <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{label} <span className="text-gray-600">({unit})</span></p>
        {sub && <p className="text-[10px] mt-1 font-medium" style={{ color: color + 'cc' }}>{sub}</p>}
      </div>
    </div>
  );
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
  const [cid] = useState(uid);

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
    return ACTIVITIES.map(a => ({ ...a, ok: d >= a.minDown && u >= a.minUp && l <= a.maxLatency }));
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
          phaseRef = 'download'; setCurrentPhase('download');
        } else if (type === 'download' && phaseRef !== 'download') {
          phaseRef = 'download'; setCurrentPhase('download');
        } else if (type === 'upload' && phaseRef !== 'upload') {
          phaseRef = 'upload'; setCurrentPhase('upload');
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
        setResults(r); setState('done'); setCurrentPhase(null);
        saveHistory(r); setHistory(loadHistory());
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
          if (phaseRef === 'latency') {
            const latPts = engine.results.getUnloadedLatencyPoints?.();
            if (latPts && latPts.length > 0) {
              const lastLat = latPts[latPts.length - 1];
              if (lastLat > 0) setLiveSpeed(Math.round(lastLat));
            }
          }
        } catch (_) {}
      }, 200);
    } catch {
      setState('error'); setCurrentPhase(null);
    }
  }, []);

  useEffect(() => () => { engineRef.current?.stop(); if (pollRef.current) clearInterval(pollRef.current); }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    setState('idle'); setCurrentPhase(null); setLiveSpeed(0); setChartPoints([]);
  }, []);

  const clearHistory = useCallback(() => { localStorage.removeItem(HISTORY_KEY); setHistory([]); }, []);

  const gaugeColor = currentPhase === 'upload' ? '#10b981' : currentPhase === 'latency' ? '#f59e0b' : '#3b82f6';
  const phaseLabel = PHASES.find(p => p.key === currentPhase)?.label || '';
  const chartColor = currentPhase === 'upload' ? '#10b981' : '#3b82f6';

  const dlPoints = chartPoints.filter(p => p.t === 'download');
  const ulPoints = chartPoints.filter(p => p.t === 'upload');

  return (
    <div className="bg-gray-800/80 rounded-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-gray-900/40">
      <style>{`
        @keyframes gaugeSpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>

      <div className="px-5 sm:px-6 pt-6 pb-4">
        {state === 'running' && (
          <div className="space-y-5">
            <StepIndicator currentPhase={currentPhase} />
            <Gauge value={liveSpeed} max={1000} phase={phaseLabel} color={gaugeColor} running />
            {currentPhase === 'download' && dlPoints.length >= 2 && (
              <div className="mx-1">
                <LiveChart points={dlPoints} color="#3b82f6" id={`dl-${cid}`} />
              </div>
            )}
            {currentPhase === 'upload' && ulPoints.length >= 2 && (
              <div className="mx-1">
                <LiveChart points={ulPoints} color="#10b981" id={`ul-${cid}`} />
              </div>
            )}
            <p className="text-[11px] text-gray-500 text-center">No cierres esta página</p>
          </div>
        )}

        {state === 'done' && results && (
          <div className="space-y-6">
            {quality && (
              <div className="text-center space-y-2">
                <div className="text-4xl">{quality.emoji}</div>
                <p className="text-xl font-extrabold tracking-tight" style={{ color: quality.color }}>{quality.label}</p>
                <div className="relative h-2.5 bg-gray-700/40 rounded-full overflow-hidden max-w-[240px] mx-auto">
                  <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out" style={{ width: `${quality.score}%`, backgroundColor: quality.color, boxShadow: `0 0 12px ${quality.color}60` }} />
                </div>
                <p className="text-[11px] text-gray-500 font-mono">{quality.score}/100</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Descarga" value={results.download} unit="Mbps" color="#3b82f6" icon="↓" />
              <ResultCard label="Subida" value={results.upload} unit="Mbps" color="#10b981" icon="↑" />
              <ResultCard label="Latencia" value={results.latency} unit="ms" color="#f59e0b" icon="↔"
                sub={results.latency && parseInt(results.latency) < 20 ? 'Muy baja' : results.latency && parseInt(results.latency) < 50 ? 'Baja' : ''} />
              <ResultCard label="Jitter" value={results.jitter} unit="ms" color="#a855f7" icon="∿"
                sub={results.jitter && parseInt(results.jitter) < 3 ? 'Muy estable' : results.jitter && parseInt(results.jitter) < 8 ? 'Estable' : ''} />
            </div>

            {results.loadedLatencyDown && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-700/15 border border-gray-700/20 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">↓ Bajo carga</p>
                  <p className="text-lg font-bold text-white mt-0.5">{results.loadedLatencyDown} <span className="text-[10px] text-gray-500">ms</span></p>
                </div>
                <div className="p-3 rounded-xl bg-gray-700/15 border border-gray-700/20 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">↑ Bajo carga</p>
                  <p className="text-lg font-bold text-white mt-0.5">{results.loadedLatencyUp} <span className="text-[10px] text-gray-500">ms</span></p>
                </div>
              </div>
            )}

            {dlPoints.length >= 2 && (
              <div className="space-y-3">
                <div className="mx-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Descarga — mediciones</p>
                  </div>
                  <LiveChart points={dlPoints} color="#3b82f6" id={`dlr-${cid}`} />
                </div>
                {ulPoints.length >= 2 && (
                  <div className="mx-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Subida — mediciones</p>
                    </div>
                    <LiveChart points={ulPoints} color="#10b981" id={`ulr-${cid}`} />
                  </div>
                )}
              </div>
            )}

            {activities.length > 0 && (
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-2.5">¿Qué podés hacer con esta velocidad?</p>
                <div className="grid grid-cols-2 gap-2">
                  {activities.map(a => (
                    <div key={a.name} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      a.ok ? 'bg-emerald-500/8 border border-emerald-500/15 text-emerald-300' : 'bg-gray-700/15 border border-gray-700/10 text-gray-500'
                    }`}>
                      <span className="text-sm">{a.icon}</span>
                      <span className="truncate">{a.name}</span>
                      <span className="ml-auto shrink-0">
                        {a.ok
                          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.scores && Object.keys(results.scores).length > 0 && (
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-2.5">AIM Scores (Cloudflare)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(results.scores).map(([k, v]) => (
                    <div key={k} className="px-3 py-2.5 rounded-xl bg-gray-700/15 border border-gray-700/15 text-center">
                      <p className="text-[10px] text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-lg font-bold text-white tabular-nums mt-0.5">{typeof v === 'number' ? v.toFixed(0) : v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => { setShowHistory(!showHistory); setShowShare(false); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                  showHistory ? 'border-blue-500/30 bg-blue-500/10 text-blue-300' : 'border-gray-600/40 bg-gray-700/30 text-gray-300 hover:bg-gray-600/30'
                }`}>
                Historial ({history.length})
              </button>
              <button onClick={() => { setShowShare(!showShare); setShowHistory(false); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                  showShare ? 'border-blue-500/30 bg-blue-500/10 text-blue-300' : 'border-gray-600/40 bg-gray-700/30 text-gray-300 hover:bg-gray-600/30'
                }`}>
                Compartir
              </button>
            </div>

            {showShare && (
              <div className="p-4 rounded-2xl bg-gray-700/15 border border-gray-700/20 space-y-3">
                <div className="bg-gray-900/80 rounded-xl p-5 text-center space-y-3">
                  <p className="text-sm font-bold text-white tracking-wide">FIBRAMAP</p>
                  <div className="flex justify-center gap-6">
                    <div><p className="text-2xl font-extrabold text-blue-400 tabular-nums">{results.download ?? '--'}</p><p className="text-[10px] text-gray-500 mt-0.5">↓ Mbps</p></div>
                    <div><p className="text-2xl font-extrabold text-green-400 tabular-nums">{results.upload ?? '--'}</p><p className="text-[10px] text-gray-500 mt-0.5">↑ Mbps</p></div>
                    <div><p className="text-2xl font-extrabold text-amber-400 tabular-nums">{results.latency ?? '--'}</p><p className="text-[10px] text-gray-500 mt-0.5">ms</p></div>
                  </div>
                  {quality && <p className="text-sm font-semibold" style={{ color: quality.color }}>{quality.emoji} {quality.label}</p>}
                  <p className="text-[10px] text-gray-600">{new Date().toLocaleDateString('es-AR')} • fibramap.com</p>
                </div>
                <button onClick={() => {
                  navigator.clipboard?.writeText(
                    `⚡ FIBRAMAP Speed Test\n↓ ${results.download ?? '--'} Mbps | ↑ ${results.upload ?? '--'} Mbps | ${results.latency ?? '--'} ms\n${quality ? quality.emoji + ' ' + quality.label : ''}\nhttps://alanmundler.github.io/fibramap-page/velocidad`
                  );
                }} className="w-full py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-[0.98]">
                  Copiar resultado
                </button>
              </div>
            )}
          </div>
        )}

        {state === 'idle' && (
          <div className="text-center py-8 space-y-3">
            <Gauge value={0} max={1000} phase="" color="#3b82f6" running={false} />
            <p className="text-sm text-gray-400 max-w-xs mx-auto mt-4">
              Test completo con gráfico en tiempo real. Servidores Cloudflare en Argentina.
            </p>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center py-8">
            <p className="text-sm text-red-400">Error al iniciar el test. Intentá de nuevo.</p>
          </div>
        )}
      </div>

      {showHistory && history.length > 0 && (
        <div className="px-5 pb-3 max-h-52 overflow-y-auto border-t border-gray-700/20 pt-3">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Últimas pruebas</p>
            <button onClick={clearHistory} className="text-[10px] text-red-400/70 hover:text-red-400 transition-colors">Borrar todo</button>
          </div>
          <div className="space-y-1">
            {history.slice(0, 15).map((h, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-700/10 text-[11px]">
                <span className="text-gray-600 shrink-0 font-mono">{new Date(h.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</span>
                <span className="text-blue-400 font-mono font-semibold">{h.download ?? '--'}</span>
                <span className="text-gray-600">↓</span>
                <span className="text-green-400 font-mono font-semibold">{h.upload ?? '--'}</span>
                <span className="text-gray-600">↑</span>
                <span className="text-amber-400 font-mono font-semibold">{h.latency ?? '--'}<span className="text-gray-600">ms</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 pb-5">
        {state === 'running' ? (
          <button onClick={stop} className="w-full py-3.5 rounded-xl text-sm font-semibold border border-gray-600/40 bg-gray-700/30 text-gray-300 hover:bg-gray-600/40 hover:border-gray-500/40 hover:text-white active:scale-[0.98] transition-all duration-200">
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
