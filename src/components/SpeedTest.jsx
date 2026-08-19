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

const NIC_LIMITS = {
  ethernet_100:   { label: 'Ethernet Fast (100 Mbps)', icon: '🔌', maxDown: 100, maxUp: 100 },
  wifi_4:         { label: 'Wi-Fi 4 (802.11n 2.4GHz)', icon: '📶', maxDown: 150, maxUp: 150 },
  wifi_5:         { label: 'Wi-Fi 5 (802.11ac 5GHz)', icon: '📶', maxDown: 500, maxUp: 500 },
  wifi_6:         { label: 'Wi-Fi 6 (802.11ax)', icon: '📶', maxDown: 900, maxUp: 900 },
  wifi_6e_7:      { label: 'Wi-Fi 6E / 7', icon: '📶', maxDown: 2000, maxUp: 2000 },
  ethernet_1g:    { label: 'Ethernet Gigabit (1 Gbps)', icon: '🔌', maxDown: 1000, maxUp: 1000 },
  ethernet_2_5g:  { label: 'Ethernet 2.5G', icon: '🔌', maxDown: 2500, maxUp: 2500 },
  ethernet_10g:   { label: 'Ethernet 10G', icon: '🔌', maxDown: 10000, maxUp: 10000 },
  unknown:        { label: 'Desconocido', icon: '❓', maxDown: null, maxUp: null },
};

function detectNIC() {
  if (typeof navigator === 'undefined') return { type: 'unknown', downlink: null, rtt: null, saveData: false };
  const c = navigator.connection;
  if (!c) return { type: 'unknown', downlink: null, rtt: null, saveData: false };

  const downlink = c.downlink;
  const effectiveType = c.effectiveType;
  const rtt = c.rtt;
  const saveData = c.saveData;
  const connType = c.type;

  let nicKey = 'unknown';

  if (connType === 'ethernet') {
    if (downlink >= 2500) nicKey = 'ethernet_10g';
    else if (downlink >= 1000) nicKey = 'ethernet_2_5g';
    else nicKey = 'ethernet_1g';
  } else if (connType === 'wifi' || connType === undefined || connType === null) {
    if (downlink >= 800) nicKey = 'wifi_6e_7';
    else if (downlink >= 400) nicKey = 'wifi_6';
    else if (downlink >= 100) nicKey = 'wifi_5';
    else if (downlink >= 30) nicKey = 'wifi_4';
    else nicKey = 'wifi_4';
  } else {
    nicKey = 'unknown';
  }

  return { type: nicKey, downlink, rtt, saveData, effectiveType };
}

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

function getQuality(d, l) {
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

function uid() { return ++chartId; }

function LiveChart({ points, color, id }) {
  const W = 500, H = 130;
  const pad = { t: 14, r: 10, b: 18, l: 38 };
  const usable = points.slice(-50);
  if (usable.length < 2) return null;

  const yMax = Math.max(10, ...usable.map(p => p.v)) * 1.15;
  const yTicks = 4;
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const toX = (i) => pad.l + (i / Math.max(1, usable.length - 1)) * plotW;
  const toY = (v) => pad.t + (1 - v / yMax) * plotH;

  const lastI = usable.length - 1;
  const lastX = toX(lastI);
  const lastY = toY(usable[lastI].v);

  const pathParts = [];
  const areaParts = [];
  for (let i = 0; i < usable.length; i++) {
    const x = toX(i).toFixed(1);
    const y = toY(usable[i].v).toFixed(1);
    if (i === 0) {
      pathParts.push(`M${x},${y}`);
    } else {
      const px = toX(i - 1);
      const py = toY(usable[i - 1].v);
      const cpx = ((px + parseFloat(x)) / 2).toFixed(1);
      pathParts.push(`C${cpx},${py.toFixed(1)} ${cpx},${y} ${x},${y}`);
    }
  }
  const lineD = pathParts.join(' ');
  const areaD = lineD + ` L${lastX.toFixed(1)},${(H - pad.b).toFixed(1)} L${toX(0).toFixed(1)},${(H - pad.b).toFixed(1)} Z`;

  const tipW = 48, tipH = 16, tipR = 4;
  const tipX = Math.max(pad.l + tipW / 2 + 2, Math.min(W - pad.r - tipW / 2 - 2, lastX));
  const tipY = Math.max(pad.t + tipH + 4, lastY - 10);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ height: '110px' }}>
      <defs>
        <linearGradient id={`cg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={`gw-${id}`}>
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const v = (yMax / yTicks) * i;
        const y = toY(v);
        return (
          <g key={i}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <text x={pad.l - 5} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.22)" fontSize="8.5" fontFamily="ui-monospace,monospace">
              {Math.round(v)}
            </text>
          </g>
        );
      })}

      <path d={areaD} fill={`url(#cg-${id})`} />
      <path d={lineD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter={`url(#gw-${id})`} />

      <circle cx={lastX} cy={lastY} r="8" fill={color} opacity="0.12" />
      <circle cx={lastX} cy={lastY} r="4" fill={color} stroke="#111827" strokeWidth="2" />

      <rect x={tipX - tipW / 2} y={tipY - tipH} width={tipW} height={tipH} rx={tipR} fill="rgba(17,24,39,0.92)" stroke={color} strokeWidth="0.5" />
      <text x={tipX} y={tipY - 5} textAnchor="middle" fill={color} fontSize="9" fontWeight="700" fontFamily="ui-monospace,monospace">
        {usable[lastI].v} <tspan fontSize="7" fill="rgba(255,255,255,0.4)">Mbps</tspan>
      </text>
    </svg>
  );
}

function Gauge({ value, max, phase, color, running, id }) {
  const size = 200, cx = 100, cy = 100;
  const r = 80, strokeW = 7;
  const arcStart = 140, arcEnd = 400, arcRange = arcEnd - arcStart;

  const toRad = (d) => (d * Math.PI) / 180;
  const arcPt = (deg) => ({ x: cx + r * Math.cos(toRad(deg)), y: cy + r * Math.sin(toRad(deg)) });

  const start = arcPt(arcStart), end = arcPt(arcEnd);
  const pct = Math.min(value / (max || 1000), 1);
  const cur = arcPt(arcStart + pct * arcRange);

  const bgArc = `M${start.x},${start.y} A${r},${r} 0 1 1 ${end.x},${end.y}`;
  const valArc = pct > 0 ? `M${start.x},${start.y} A${r},${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${cur.x},${cur.y}` : '';

  const majorTicks = 5;
  const minorTicks = 20;
  const ticks = Array.from({ length: minorTicks + 1 }, (_, i) => {
    const a = arcStart + (i / minorTicks) * arcRange;
    const isMajor = i % (minorTicks / majorTicks) === 0;
    const innerR = r - (isMajor ? 14 : 10);
    const outerR = r - (isMajor ? 8 : 6);
    return {
      x1: cx + innerR * Math.cos(toRad(a)), y1: cy + innerR * Math.sin(toRad(a)),
      x2: cx + outerR * Math.cos(toRad(a)), y2: cy + outerR * Math.sin(toRad(a)),
      major: isMajor,
    };
  });

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id={`gg-${id}`}>
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id={`ggr-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>

        <path d={bgArc} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeW} strokeLinecap="round" />

        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.major ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'}
            strokeWidth={t.major ? 1.5 : 0.7} strokeLinecap="round" />
        ))}

        {pct > 0 && (
          <path d={valArc} fill="none" stroke={`url(#ggr-${id})`} strokeWidth={strokeW} strokeLinecap="round" filter={`url(#gg-${id})`}
            style={{ transition: 'all 0.3s ease-out' }} />
        )}

        {running && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="8 24" opacity="0.25"
            style={{ animation: 'gSpin 2.5s linear infinite', transformOrigin: `${cx}px ${cy}px` }} />
        )}

        {pct > 0 && (
          <circle cx={cur.x} cy={cur.y} r="4" fill={color} opacity="0.8" style={{ transition: 'all 0.3s ease-out' }} />
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: '10px' }}>
        <span className="text-[2.5rem] sm:text-5xl font-extrabold text-white tabular-nums leading-none"
          style={{ textShadow: `0 0 24px ${color}50` }}>
          {value}
        </span>
        <span className="text-[10px] text-gray-500 mt-1 font-semibold tracking-[0.15em] uppercase">Mbps</span>
        {phase && (
          <span className="mt-2 px-3 py-[3px] rounded-full text-[10px] font-bold tracking-wider"
            style={{ backgroundColor: color + '12', color, border: `1px solid ${color}25` }}>
            {phase}
          </span>
        )}
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
            <div className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all duration-500 ${
              done ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
              : active ? 'text-white' : 'border-gray-700/40 bg-gray-800/40 text-gray-600'
            }`} style={active ? { borderColor: p.color + '70', backgroundColor: p.color + '12', color: p.color, boxShadow: `0 0 14px ${p.color}20` } : {}}>
              {done ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              ) : p.label[0]}
              {active && <span className="absolute inset-0 rounded-full border-2 animate-ping" style={{ borderColor: p.color + '25' }} />}
            </div>
            {i < PHASES.length - 1 && (
              <div className={`w-6 sm:w-10 h-[2px] rounded-full transition-all duration-500 ${done ? 'bg-emerald-500/40' : 'bg-gray-700/20'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function NICInfo({ nic }) {
  const info = NIC_LIMITS[nic.type] || NIC_LIMITS.unknown;
  const conn = typeof navigator !== 'undefined' ? navigator.connection : null;
  return (
    <div className="p-3 rounded-xl bg-gray-700/15 border border-gray-700/15">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm">{info.icon}</span>
        <span className="text-[11px] font-semibold text-gray-300">{info.label}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[9px] text-gray-500 uppercase tracking-wider">Estimado ↓</p>
          <p className="text-xs font-bold text-blue-400">{conn?.downlink ? `${conn.downlink} Mbps` : '—'}</p>
        </div>
        <div>
          <p className="text-[9px] text-gray-500 uppercase tracking-wider">RTT base</p>
          <p className="text-xs font-bold text-amber-400">{conn?.rtt != null ? `${conn.rtt} ms` : '—'}</p>
        </div>
        <div>
          <p className="text-[9px] text-gray-500 uppercase tracking-wider">Ahorro datos</p>
          <p className="text-xs font-bold text-gray-400">{conn?.saveData ? 'Sí' : 'No'}</p>
        </div>
      </div>
      {info.maxDown && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[9px] text-gray-500 mb-0.5">
            <span>Límite teórico ↓</span>
            <span>{info.maxDown} Mbps</span>
          </div>
          <div className="h-1.5 bg-gray-700/30 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500/40 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({ label, value, unit, color, icon, sub }) {
  return (
    <div className="relative p-3.5 sm:p-4 rounded-2xl bg-gray-700/15 border border-gray-600/15 text-center overflow-hidden">
      <div className="absolute inset-0 opacity-[0.025]" style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` }} />
      <div className="relative">
        <div className="text-lg mb-1" style={{ color }}>{icon}</div>
        <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums leading-none">{value ?? '—'}</p>
        <p className="text-[10px] text-gray-500 mt-1 font-medium">{label} <span className="text-gray-600">({unit})</span></p>
        {sub && <p className="text-[10px] mt-0.5 font-medium" style={{ color: color + 'bb' }}>{sub}</p>}
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
  const [nic, setNic] = useState({ type: 'unknown', downlink: null, rtt: null, saveData: false, effectiveType: null });
  const engineRef = useRef(null);
  const pollRef = useRef(null);
  const chartRef = useRef([]);
  const [cid] = useState(uid);

  useEffect(() => {
    setHistory(loadHistory());
    setNic(detectNIC());
  }, []);

  const nicInfo = NIC_LIMITS[nic.type] || NIC_LIMITS.unknown;

  const quality = useMemo(() => {
    if (!results) return null;
    return getQuality(
      results.download ? parseFloat(results.download) : 0,
      results.latency ? parseInt(results.latency) : 999
    );
  }, [results]);

  const nicEfficiency = useMemo(() => {
    if (!results || !nicInfo.maxDown) return null;
    const dl = parseFloat(results.download) || 0;
    const pct = Math.round((dl / nicInfo.maxDown) * 100);
    return pct;
  }, [results, nicInfo]);

  const activities = useMemo(() => {
    if (!results) return [];
    const d = results.download ? parseFloat(results.download) : 0;
    const u = results.upload ? parseFloat(results.upload) : 0;
    const l = results.latency ? parseInt(results.latency) : 999;
    return ACTIVITIES.map(a => ({ ...a, ok: d >= a.minDown && u >= a.minUp && l <= a.maxLatency }));
  }, [results]);

  const gaugeMax = liveSpeed > 0 ? Math.max(liveSpeed * 1.25, 100) : (nicInfo.maxDown ? Math.max(nicInfo.maxDown * 1.2, 200) : 200);

  const run = useCallback(async () => {
    setState('running');
    setResults(null);
    setCurrentPhase('latency');
    setLiveSpeed(0);
    setChartPoints([]);
    chartRef.current = [];
    setNic(detectNIC());

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

          if (phaseRef === 'download' || phaseRef === 'upload') {
            const aggBps = isUpload
              ? engine.results.getUploadBandwidth?.()
              : engine.results.getDownloadBandwidth?.();
            const mbps = aggBps ? Math.round(aggBps / 1e6) : 0;

            const pts = isUpload
              ? engine.results.getUploadBandwidthPoints?.()
              : engine.results.getDownloadBandwidthPoints?.();
            const lastBps = pts && pts.length > 0 ? pts[pts.length - 1].bps : 0;
            const lastMbps = lastBps > 0 ? bpsToMbps(lastBps) : 0;

            const displayMbps = mbps > 0 ? mbps : lastMbps;
            if (displayMbps > 0) {
              setLiveSpeed(displayMbps);
              chartRef.current = [...chartRef.current, { v: displayMbps, t: isUpload ? 'upload' : 'download' }];
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
      }, 300);
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

  const dlPoints = chartPoints.filter(p => p.t === 'download');
  const ulPoints = chartPoints.filter(p => p.t === 'upload');

  return (
    <div className="bg-gray-800/80 rounded-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-gray-900/40">
      <style>{`@keyframes gSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <div className="px-5 sm:px-6 pt-5 pb-4">
        {state === 'idle' && (
          <div className="space-y-4">
            <NICInfo nic={nic} />
            <div className="flex justify-center py-2">
              <Gauge value={0} max={gaugeMax} phase="" color="#3b82f6" running={false} id={`g-${cid}`} />
            </div>
            <p className="text-[11px] text-gray-500 text-center">
              Test de velocidad con servidores Cloudflare en Argentina.
            </p>
          </div>
        )}

        {state === 'running' && (
          <div className="space-y-4">
            <StepIndicator currentPhase={currentPhase} />
            <div className="flex justify-center">
              <Gauge value={liveSpeed} max={gaugeMax} phase={phaseLabel} color={gaugeColor} running id={`g-${cid}`} />
            </div>
            {currentPhase === 'download' && dlPoints.length >= 2 && (
              <LiveChart points={dlPoints} color="#3b82f6" id={`dl-${cid}`} />
            )}
            {currentPhase === 'upload' && ulPoints.length >= 2 && (
              <LiveChart points={ulPoints} color="#10b981" id={`ul-${cid}`} />
            )}
            <p className="text-[10px] text-gray-600 text-center">No cierres esta página</p>
          </div>
        )}

        {state === 'done' && results && (
          <div className="space-y-5">
            {quality && (
              <div className="text-center space-y-2">
                <div className="text-3xl">{quality.emoji}</div>
                <p className="text-lg font-extrabold tracking-tight" style={{ color: quality.color }}>{quality.label}</p>
                <div className="relative h-2 bg-gray-700/30 rounded-full overflow-hidden max-w-[200px] mx-auto">
                  <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${quality.score}%`, backgroundColor: quality.color, boxShadow: `0 0 10px ${quality.color}50` }} />
                </div>
                <p className="text-[10px] text-gray-600 font-mono">{quality.score}/100</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <ResultCard label="Descarga" value={results.download} unit="Mbps" color="#3b82f6" icon="↓" />
              <ResultCard label="Subida" value={results.upload} unit="Mbps" color="#10b981" icon="↑" />
              <ResultCard label="Latencia" value={results.latency} unit="ms" color="#f59e0b" icon="↔"
                sub={results.latency ? (parseInt(results.latency) < 20 ? 'Muy baja' : parseInt(results.latency) < 50 ? 'Baja' : parseInt(results.latency) > 100 ? 'Alta' : '') : ''} />
              <ResultCard label="Jitter" value={results.jitter} unit="ms" color="#a855f7" icon="∿"
                sub={results.jitter ? (parseInt(results.jitter) < 3 ? 'Muy estable' : parseInt(results.jitter) < 8 ? 'Estable' : parseInt(results.jitter) > 15 ? 'Inestable' : '') : ''} />
            </div>

            {nicInfo.maxDown && (
              <div className="p-3 rounded-xl bg-gray-700/10 border border-gray-700/15">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{nicInfo.icon}</span>
                    <span className="text-[11px] font-semibold text-gray-300">{nicInfo.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{nicEfficiency}% del máximo</span>
                </div>
                <div className="h-2 bg-gray-700/30 rounded-full overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-blue-500/50 transition-all duration-1000"
                    style={{ width: `${Math.min(nicEfficiency || 0, 100)}%` }} />
                  <div className="absolute inset-y-0 left-0 h-full w-[2px] bg-gray-400/60 rounded-full"
                    style={{ left: '100%', transform: 'translateX(-1px)' }} />
                </div>
                <div className="flex justify-between text-[9px] text-gray-600 mt-1">
                  <span>0</span>
                  <span>{nicInfo.maxDown} Mbps (teórico)</span>
                </div>
              </div>
            )}

            {results.loadedLatencyDown && (
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-gray-700/10 border border-gray-700/15 text-center">
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider font-medium">↓ Bajo carga</p>
                  <p className="text-base font-bold text-white mt-0.5">{results.loadedLatencyDown} <span className="text-[9px] text-gray-600">ms</span></p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-700/10 border border-gray-700/15 text-center">
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider font-medium">↑ Bajo carga</p>
                  <p className="text-base font-bold text-white mt-0.5">{results.loadedLatencyUp} <span className="text-[9px] text-gray-600">ms</span></p>
                </div>
              </div>
            )}

            {dlPoints.length >= 2 && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Descarga — cada medición</p>
                  </div>
                  <LiveChart points={dlPoints} color="#3b82f6" id={`dlr-${cid}`} />
                </div>
                {ulPoints.length >= 2 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Subida — cada medición</p>
                    </div>
                    <LiveChart points={ulPoints} color="#10b981" id={`ulr-${cid}`} />
                  </div>
                )}
              </div>
            )}

            {activities.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-2">¿Qué podés hacer con esta velocidad?</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {activities.map(a => (
                    <div key={a.name} className={`flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[11px] font-medium ${
                      a.ok ? 'bg-emerald-500/8 border border-emerald-500/12 text-emerald-300' : 'bg-gray-700/10 border border-gray-700/8 text-gray-500'
                    }`}>
                      <span className="text-xs">{a.icon}</span>
                      <span className="truncate">{a.name}</span>
                      <span className="ml-auto shrink-0 w-4 h-4 flex items-center justify-center">
                        {a.ok
                          ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                          : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.scores && Object.keys(results.scores).length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-2">AIM Scores (Cloudflare)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {Object.entries(results.scores).map(([k, v]) => (
                    <div key={k} className="px-2.5 py-2 rounded-xl bg-gray-700/10 border border-gray-700/10 text-center">
                      <p className="text-[9px] text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-base font-bold text-white tabular-nums mt-0.5">{typeof v === 'number' ? v.toFixed(0) : v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => { setShowHistory(!showHistory); setShowShare(false); }}
                className={`flex-1 py-2.5 rounded-xl text-[11px] font-semibold border transition-all duration-200 ${
                  showHistory ? 'border-blue-500/25 bg-blue-500/8 text-blue-300' : 'border-gray-600/30 bg-gray-700/20 text-gray-300 hover:bg-gray-600/25'
                }`}>
                Historial ({history.length})
              </button>
              <button onClick={() => { setShowShare(!showShare); setShowHistory(false); }}
                className={`flex-1 py-2.5 rounded-xl text-[11px] font-semibold border transition-all duration-200 ${
                  showShare ? 'border-blue-500/25 bg-blue-500/8 text-blue-300' : 'border-gray-600/30 bg-gray-700/20 text-gray-300 hover:bg-gray-600/25'
                }`}>
                Compartir
              </button>
            </div>

            {showShare && (
              <div className="p-3 rounded-2xl bg-gray-700/10 border border-gray-700/15 space-y-2.5">
                <div className="bg-gray-900/80 rounded-xl p-4 text-center space-y-2">
                  <p className="text-xs font-bold text-white tracking-widest uppercase">FIBRAMAP</p>
                  <div className="flex justify-center gap-5">
                    <div><p className="text-xl font-extrabold text-blue-400 tabular-nums">{results.download ?? '—'}</p><p className="text-[9px] text-gray-500 mt-0.5">↓ Mbps</p></div>
                    <div><p className="text-xl font-extrabold text-green-400 tabular-nums">{results.upload ?? '—'}</p><p className="text-[9px] text-gray-500 mt-0.5">↑ Mbps</p></div>
                    <div><p className="text-xl font-extrabold text-amber-400 tabular-nums">{results.latency ?? '—'}</p><p className="text-[9px] text-gray-500 mt-0.5">ms</p></div>
                  </div>
                  {quality && <p className="text-xs font-semibold" style={{ color: quality.color }}>{quality.emoji} {quality.label}</p>}
                  <p className="text-[9px] text-gray-600">{new Date().toLocaleDateString('es-AR')} • fibramap.com</p>
                </div>
                <button onClick={() => {
                  navigator.clipboard?.writeText(
                    `⚡ FIBRAMAP Speed Test\n↓ ${results.download ?? '—'} Mbps | ↑ ${results.upload ?? '—'} Mbps | ${results.latency ?? '—'} ms\n${quality ? quality.emoji + ' ' + quality.label : ''}\nhttps://alanmundler.github.io/fibramap-page/velocidad`
                  );
                }} className="w-full py-2 rounded-xl text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-[0.98]">
                  Copiar resultado
                </button>
              </div>
            )}
          </div>
        )}

        {state === 'error' && (
          <div className="text-center py-8">
            <p className="text-sm text-red-400">Error al iniciar el test. Intentá de nuevo.</p>
          </div>
        )}
      </div>

      {showHistory && history.length > 0 && (
        <div className="px-5 pb-3 max-h-48 overflow-y-auto border-t border-gray-700/15 pt-3">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Últimas pruebas</p>
            <button onClick={clearHistory} className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors">Borrar</button>
          </div>
          <div className="space-y-1">
            {history.slice(0, 12).map((h, i) => (
              <div key={i} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-gray-700/8 text-[11px]">
                <span className="text-gray-600 shrink-0 font-mono text-[10px]">{new Date(h.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</span>
                <span className="text-blue-400 font-mono font-semibold">{h.download ?? '—'}</span>
                <span className="text-gray-600">↓</span>
                <span className="text-green-400 font-mono font-semibold">{h.upload ?? '—'}</span>
                <span className="text-gray-600">↑</span>
                <span className="text-amber-400 font-mono font-semibold">{h.latency ?? '—'}<span className="text-gray-600">ms</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 pb-5">
        {state === 'running' ? (
          <button onClick={stop} className="w-full py-3 rounded-xl text-xs font-semibold border border-gray-600/30 bg-gray-700/20 text-gray-300 hover:bg-gray-600/30 hover:text-white active:scale-[0.98] transition-all duration-200">
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
