import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

const WORKER_URL = 'https://quiet-bird-94ce.alan-mundler.workers.dev';

const COLO_MAP = {
  EZE: 'Buenos Aires, AR',
  SCL: 'Santiago, CL',
  MIA: 'Miami, US',
  IAD: 'Ashburn, US',
  LAX: 'Los Angeles, US',
  ORD: 'Chicago, US',
  FRA: 'Frankfurt, DE',
  LHR: 'Londres, GB',
  AMS: 'Ámsterdam, NL',
  CDG: 'París, FR',
  NRT: 'Tokio, JP',
  HKG: 'Hong Kong',
  SIN: 'Singapur',
  SYD: 'Sídney, AU',
  GRU: 'São Paulo, BR',
  BOG: 'Bogotá, CO',
  LIM: 'Lima, PE',
  MEX: 'México, MX',
  GIG: 'Rio de Janeiro, BR',
  BUE: 'Buenos Aires, AR',
  CCT: 'Buenos Aires, AR',
  AEP: 'Buenos Aires, AR',
  COR: 'Córdoba, AR',
  ROS: 'Rosario, AR',
  MDE: 'Medellín, CO',
  UIO: 'Quito, EC',
  PTY: 'Panamá, PA',
  MAD: 'Madrid, ES',
  BCN: 'Barcelona, ES',
  LIS: 'Lisboa, PT',
};

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
  ethernet_100:  { label: 'Ethernet Fast', icon: '🔌', maxDown: 100 },
  wifi_4:        { label: 'Wi-Fi 4', icon: '📶', maxDown: 150 },
  wifi_5:        { label: 'Wi-Fi 5', icon: '📶', maxDown: 500 },
  wifi_6:        { label: 'Wi-Fi 6', icon: '📶', maxDown: 900 },
  wifi_6e_7:     { label: 'Wi-Fi 6E/7', icon: '📶', maxDown: 2000 },
  wifi_generic:  { label: 'Wi-Fi', icon: '📶', maxDown: null },
  ethernet_1g:   { label: 'Ethernet 1G', icon: '🔌', maxDown: 1000 },
  ethernet_2_5g: { label: 'Ethernet 2.5G', icon: '🔌', maxDown: 2500 },
  ethernet_10g:  { label: 'Ethernet 10G', icon: '🔌', maxDown: 10000 },
  cellular:      { label: 'Datos móviles', icon: '📱', maxDown: null },
  unknown:       { label: 'Desconocido', icon: '❓', maxDown: null },
};

const NIC_TABLE = [
  ['Wi-Fi 4', '~150 Mbps'],
  ['Wi-Fi 5', '~500 Mbps'],
  ['Wi-Fi 6/6E', '~900 Mbps'],
  ['Ethernet 1G', '1000 Mbps'],
  ['Ethernet 2.5G+', '2500+ Mbps'],
];

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function detectNIC() {
  if (typeof navigator === 'undefined') return { type: 'unknown', downlink: null, rtt: null, saveData: false };
  const c = navigator.connection;

  if (!c) {
    const mobile = isMobileDevice();
    return mobile
      ? { type: 'wifi_generic', downlink: null, rtt: null, saveData: false }
      : { type: 'unknown', downlink: null, rtt: null, saveData: false };
  }

  const downlink = c.downlink ?? null;
  const rtt = c.rtt ?? null;
  const saveData = !!c.saveData;
  const connType = c.type || null;
  const effectiveType = c.effectiveType || null;
  let nicKey = 'unknown';

  if (connType === 'ethernet') {
    if (downlink >= 2500) nicKey = 'ethernet_10g';
    else if (downlink >= 1000) nicKey = 'ethernet_2_5g';
    else nicKey = 'ethernet_1g';
  } else if (connType === 'wifi') {
    if (downlink >= 800) nicKey = 'wifi_6e_7';
    else if (downlink >= 400) nicKey = 'wifi_6';
    else if (downlink >= 100) nicKey = 'wifi_5';
    else nicKey = 'wifi_4';
  } else if (connType === 'cellular') {
    nicKey = 'cellular';
  } else {
    if (downlink != null && downlink > 0) {
      if (downlink >= 800) nicKey = 'wifi_6e_7';
      else if (downlink >= 400) nicKey = 'wifi_6';
      else if (downlink >= 100) nicKey = 'wifi_5';
      else if (downlink >= 20) nicKey = 'wifi_4';
      else if (effectiveType === '4g' || effectiveType === '3g') nicKey = 'wifi_generic';
      else nicKey = 'cellular';
    } else if (rtt != null && rtt > 0) {
      nicKey = rtt < 50 ? 'wifi_generic' : 'cellular';
    } else if (effectiveType) {
      if (effectiveType === '4g') nicKey = 'wifi_generic';
      else nicKey = 'cellular';
    } else {
      nicKey = isMobileDevice() ? 'wifi_generic' : 'unknown';
    }
  }

  return { type: nicKey, downlink, rtt, saveData };
}

function inferNICFromSpeed(mbps) {
  if (!mbps || mbps <= 0) return null;
  if (mbps >= 800) return 'wifi_6e_7';
  if (mbps >= 400) return 'wifi_6';
  if (mbps >= 100) return 'wifi_5';
  if (mbps >= 20) return 'wifi_4';
  return 'cellular';
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

function uid() { return ++chartId; }

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

  const majorTicks = 5, minorTicks = 20;
  const ticks = Array.from({ length: minorTicks + 1 }, (_, i) => {
    const a = arcStart + (i / minorTicks) * arcRange;
    const isMajor = i % (minorTicks / majorTicks) === 0;
    const innerR = r - (isMajor ? 12 : 9);
    const outerR = r - (isMajor ? 6 : 4);
    return {
      x1: cx + innerR * Math.cos(toRad(a)), y1: cy + innerR * Math.sin(toRad(a)),
      x2: outerR * Math.cos(toRad(a)) + cx, y2: outerR * Math.sin(toRad(a)) + cy,
      major: isMajor,
    };
  });

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
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.major ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}
            strokeWidth={t.major ? 1.2 : 0.6} strokeLinecap="round" />
        ))}
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
        <span className="text-[9px] text-gray-500 mt-0.5 font-semibold tracking-[0.15em] uppercase">Mbps</span>
        {phase && (
          <span className="mt-1 px-2.5 py-[2px] rounded-full text-[9px] font-bold tracking-wider"
            style={{ backgroundColor: color + '12', color, border: `1px solid ${color}20` }}>
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
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      {PHASES.map((p, i) => {
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
            {i < PHASES.length - 1 && (
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

export default function SpeedTest() {
  const [state, setState] = useState('idle');
  const [currentPhase, setCurrentPhase] = useState(null);
  const [liveSpeed, setLiveSpeed] = useState(0);
  const [results, setResults] = useState(null);
  const [chartPoints, setChartPoints] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nic, setNic] = useState({ type: 'unknown', downlink: null, rtt: null, saveData: false });
  const [trace, setTrace] = useState(null);
  const engineRef = useRef(null);
  const abortRef = useRef(null);
  const pollRef = useRef(null);
  const cancelledRef = useRef(false);
  const smoothRef = useRef(0);
  const chartRef = useRef([]);
  const nicRef = useRef(nic);
  const [cid] = useState(uid);

  useEffect(() => {
    setHistory(loadHistory());
    setNic(detectNIC());
    fetch(`${WORKER_URL}/trace`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.ip) setTrace(d); })
      .catch(() => {});
  }, []);

  useEffect(() => { nicRef.current = nic; }, [nic]);

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
    return Math.round((parseFloat(results.download) || 0) / nicInfo.maxDown * 100);
  }, [results, nic]);

  const activities = useMemo(() => {
    if (!results) return [];
    const d = parseFloat(results.download) || 0;
    const u = parseFloat(results.upload) || 0;
    const l = parseInt(results.latency) || 999;
    return ACTIVITIES.map(a => ({ ...a, ok: d >= a.minDown && u >= a.minUp && l <= a.maxLatency }));
  }, [results]);

  const gaugeMax = liveSpeed > 0 ? Math.max(liveSpeed * 1.25, 100) : (nicInfo.maxDown ? Math.max(nicInfo.maxDown * 1.2, 200) : 200);

  async function measureParallelUpload(signal) {
    const STREAMS = 6;
    const BYTES_PER_STREAM = 10 * 1024 * 1024;
    const startTime = performance.now();
    const streamLoaded = new Array(STREAMS).fill(0);

    setCurrentPhase('upload');
    smoothRef.current = 0;
    chartRef.current = [];
    setChartPoints([]);

    const uploadOneStream = (streamIndex) => {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://speed.cloudflare.com/__up');

        xhr.upload.onprogress = (e) => {
          if (cancelledRef.current || signal.aborted) { xhr.abort(); resolve(); return; }
          if (e.lengthComputable) {
            streamLoaded[streamIndex] = e.loaded;
            const totalBytes = streamLoaded.reduce((a, b) => a + b, 0);
            const elapsed = (performance.now() - startTime) / 1000;
            if (elapsed > 0.1) {
              const mbps = Math.round((totalBytes * 8) / (elapsed * 1000000));
              const prev = smoothRef.current;
              smoothRef.current = prev === 0 ? mbps : Math.round(prev * 0.5 + mbps * 0.5);
              setLiveSpeed(Math.max(smoothRef.current, mbps));
              chartRef.current = [...chartRef.current, { v: mbps, t: 'upload' }];
              if (chartRef.current.length > 200) chartRef.current = chartRef.current.slice(-200);
              setChartPoints([...chartRef.current]);
            }
          }
        };

        xhr.onload = () => { globalUploadedBytes += BYTES_PER_STREAM; resolve(); };
        xhr.onerror = () => resolve();
        xhr.onabort = () => resolve();

        if (signal) {
          signal.addEventListener('abort', () => { try { xhr.abort(); } catch (_) {} }, { once: true });
        }

        const data = new ArrayBuffer(BYTES_PER_STREAM);
        new Uint8Array(data).fill(0xAB);
        xhr.send(data);
      });
    };

    const promises = [];
    for (let i = 0; i < STREAMS; i++) {
      promises.push(uploadOneStream(i));
    }
    await Promise.allSettled(promises);

    if (cancelledRef.current || signal.aborted) return 0;

    const elapsed = (performance.now() - startTime) / 1000;
    const totalBytes = STREAMS * BYTES_PER_STREAM;
    const mbps = elapsed > 0 ? Math.round((totalBytes * 8) / (elapsed * 1000000)) : 0;

    setLiveSpeed(mbps);
    chartRef.current = [{ v: mbps, t: 'upload' }];
    setChartPoints([...chartRef.current]);

    return mbps;
  }

  const run = useCallback(async () => {
    setState('running');
    setResults(null);
    setCurrentPhase('latency');
    setLiveSpeed(0);
    setChartPoints([]);
    chartRef.current = [];
    smoothRef.current = 0;
    cancelledRef.current = false;
    setNic(detectNIC());

    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    try {
      const { default: SpeedTestEngine } = await import('@cloudflare/speedtest');
      const ts = Date.now();
      const engine = new SpeedTestEngine({
        autoStart: false,
        logAimApiUrl: null,
        downloadApiUrl: `https://speed.cloudflare.com/__down?_=${ts}`,
        uploadApiUrl: `https://speed.cloudflare.com/__up?_=${ts}`,
        measurements: [
          { type: 'latency', numPackets: 20 },
          { type: 'download', bytes: 1e5, count: 9 },
          { type: 'download', bytes: 1e6, count: 8 },
          { type: 'download', bytes: 1e7, count: 6 },
          { type: 'download', bytes: 2.5e7, count: 4 },
          { type: 'download', bytes: 7e7, count: 5 },
          { type: 'upload', bytes: 1e5, count: 1 },
          { type: 'upload', bytes: 1e6, count: 1 },
        ],
      });

      let phaseRef = 'latency';
      let engineDownload = null;
      let engineLatency = null;
      let engineJitter = null;

      engine.onResultsChange = ({ type }) => {
        if (cancelledRef.current || signal.aborted) return;
        if (type === 'latency' && phaseRef === 'latency') {
          phaseRef = 'download'; setCurrentPhase('download');
        } else if (type === 'download' && phaseRef !== 'download') {
          phaseRef = 'download'; setCurrentPhase('download');
        }
      };

      engine.onFinish = (res) => {
        if (cancelledRef.current || signal.aborted) return;
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        try { res.stop(); } catch (_) {}

        const s = res.getSummary();
        engineDownload = s.download ? (s.download / 1e6).toFixed(1) : null;
        engineLatency = s.latency ? s.latency.toFixed(0) : null;
        engineJitter = s.jitter ? s.jitter.toFixed(0) : null;

        measureParallelUpload(signal).then((uploadMbps) => {
          if (cancelledRef.current || signal.aborted) return;
          const r = {
            download: engineDownload,
            upload: String(uploadMbps || 0),
            latency: engineLatency,
            jitter: engineJitter,
            loadedLatencyDown: s.downLoadedLatency ? s.downLoadedLatency.toFixed(0) : null,
            loadedLatencyUp: s.upLoadedLatency ? s.upLoadedLatency.toFixed(0) : null,
          };
          setResults(r); setState('done'); setCurrentPhase(null);
          saveHistory(r); setHistory(loadHistory());
          const curType = nicRef.current.type;
          if (curType === 'unknown' || curType === 'wifi_generic' || curType === 'cellular') {
            const inferred = inferNICFromSpeed(parseFloat(r.download));
            if (inferred) setNic(prev => ({ ...prev, type: inferred }));
          }
        }).catch(() => {
          if (!cancelledRef.current && !signal.aborted) {
            setState('error'); setCurrentPhase(null);
          }
        });
      };

      engineRef.current = engine;
      engine.play();

      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        if (!engine.results || cancelledRef.current || signal.aborted) return;
        try {
          if (phaseRef === 'download') {
            const aggBps = engine.results.getDownloadBandwidth?.();
            const aggMbps = aggBps ? Math.round(aggBps / 1e6) : 0;
            const pts = engine.results.getDownloadBandwidthPoints?.();
            const lastBps = pts && pts.length > 0 ? pts[pts.length - 1].bps : 0;
            const lastMbps = lastBps > 0 ? Math.round(lastBps / 1e6) : 0;
            const rawMbps = aggMbps > 0 ? aggMbps : lastMbps;
            if (rawMbps > 0) {
              const prev = smoothRef.current;
              smoothRef.current = prev === 0 ? rawMbps : Math.round(prev * 0.6 + rawMbps * 0.4);
              setLiveSpeed(Math.max(smoothRef.current, rawMbps));
              chartRef.current = [...chartRef.current, { v: rawMbps, t: 'download' }];
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
      if (!cancelledRef.current && !signal.aborted) {
        setState('error'); setCurrentPhase(null);
      }
    }
  }, []);

  useEffect(() => () => { cancelledRef.current = true; abortRef.current?.abort(); engineRef.current?.stop(); if (pollRef.current) clearInterval(pollRef.current); }, []);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    abortRef.current?.abort();
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    try { engineRef.current?.stop(); } catch (_) {}
    setState('idle'); setCurrentPhase(null); setLiveSpeed(0); setChartPoints([]);
  }, []);

  const clearHistory = useCallback(() => { localStorage.removeItem(HISTORY_KEY); setHistory([]); }, []);

  const gaugeColor = currentPhase === 'upload' ? '#10b981' : currentPhase === 'latency' ? '#f59e0b' : '#3b82f6';
  const phaseLabel = PHASES.find(p => p.key === currentPhase)?.label || '';

  const dlPoints = useMemo(() => chartPoints.filter(p => p.t === 'download'), [chartPoints]);
  const ulPoints = useMemo(() => chartPoints.filter(p => p.t === 'upload'), [chartPoints]);

  return (
    <div className="bg-gray-800/80 rounded-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-gray-900/40">

      {/* NIC info — horizontal row, idle only */}
      {state === 'idle' && (
        <div className="px-4 sm:px-5 pt-4 pb-2">
          <div className="flex gap-2">
            {/* NIC detected */}
            <div className="flex-1 p-2.5 rounded-xl bg-gray-700/15 border border-gray-700/15 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">{NIC_LIMITS[nic.type]?.icon || '❓'}</span>
                <span className="text-[10px] font-semibold text-gray-300 truncate">{NIC_LIMITS[nic.type]?.label || 'Desconocido'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center">
                <div>
                  <p className="text-[8px] text-gray-500 uppercase">↓ Est.</p>
                  <p className="text-[10px] font-bold text-blue-400">{nic.downlink ? `${nic.downlink}` : '—'}</p>
                </div>
                <div>
                  <p className="text-[8px] text-gray-500 uppercase">RTT</p>
                  <p className="text-[10px] font-bold text-amber-400">{nic.rtt != null ? `${nic.rtt}` : '—'}</p>
                </div>
                <div>
                  <p className="text-[8px] text-gray-500 uppercase">Ahorro</p>
                  <p className="text-[10px] font-bold text-gray-400">{nic.saveData ? 'Sí' : 'No'}</p>
                </div>
              </div>
            </div>
            {/* NIC speed limits */}
            <div className="flex-1 p-2.5 rounded-xl bg-gray-700/15 border border-gray-700/15 min-w-0">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Límites por red</p>
              <div className="text-[9px] text-gray-500 space-y-0">
                {NIC_TABLE.map(([label, speed]) => (
                  <div key={label} className="flex justify-between">
                    <span>{label}</span>
                    <span className="text-gray-400 font-mono">{speed}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* ISP + Server info */}
          {trace && (
            <div className="mt-2 p-2 rounded-xl bg-gray-700/15 border border-gray-700/15">
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
                <div className="w-px h-2.5 bg-gray-700/40 shrink-0" />
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-gray-600 shrink-0">Servidor</span>
                  <span className="text-gray-300 font-semibold truncate">
                    Cloudflare {trace.colo} {COLO_MAP[trace.colo] ? `(${COLO_MAP[trace.colo]})` : ''}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gauge — always mounted */}
      <div className="flex justify-center py-3">
        <Gauge
          value={state === 'running' ? liveSpeed : 0}
          max={gaugeMax}
          phase={state === 'running' ? phaseLabel : ''}
          color={state === 'running' ? gaugeColor : '#3b82f6'}
          running={state === 'running'}
          id={`g-${cid}`}
        />
      </div>

      {/* Phase-specific content below gauge */}
      <div className="px-4 sm:px-5 pb-2 min-h-[32px]">
        {state === 'idle' && (
          <p className="text-[10px] text-gray-500 text-center">
            Test de velocidad con servidores Cloudflare en Argentina.
          </p>
        )}

        {state === 'running' && (
          <div className="space-y-2">
            <StepIndicator currentPhase={currentPhase} />
            <div className="flex justify-center">
              {currentPhase === 'download' && dlPoints.length >= 2 && (
                <div className="w-full"><LiveChart points={dlPoints} color="#3b82f6" id={`dl-${cid}`} /></div>
              )}
              {currentPhase === 'upload' && ulPoints.length >= 2 && (
                <div className="w-full"><LiveChart points={ulPoints} color="#10b981" id={`ul-${cid}`} /></div>
              )}
            </div>
            <p className="text-[9px] text-gray-600 text-center">No cierres esta página</p>
          </div>
        )}

        {state === 'error' && (
          <p className="text-sm text-red-400 text-center py-3">Error al iniciar el test. Intentá de nuevo.</p>
        )}
      </div>

      {/* Results */}
      {state === 'done' && results && (
        <div className="px-4 sm:px-5 pb-2 space-y-3">
          {quality && (
            <div className="text-center">
              <span className="text-xl">{quality.emoji}</span>
              <p className="text-sm font-extrabold tracking-tight mt-0.5" style={{ color: quality.color }}>{quality.label}</p>
            </div>
          )}

          {trace && (
            <div className="p-2 rounded-xl bg-gray-700/15 border border-gray-700/15">
              <div className="flex items-center justify-center gap-3 text-[9px]">
                <span className="text-gray-500">{trace.ip}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-300 font-semibold">{trace.isp || '—'}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-300 font-semibold">Cloudflare {trace.colo}{COLO_MAP[trace.colo] ? ` (${COLO_MAP[trace.colo]})` : ''}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <ResultCard label="Descarga" value={results.download} unit="Mbps" color="#3b82f6" icon="↓" />
            <ResultCard label="Subida" value={results.upload} unit="Mbps" color="#10b981" icon="↑" />
            <ResultCard label="Latencia" value={results.latency} unit="ms" color="#f59e0b" icon="↔" />
            <ResultCard label="Jitter" value={results.jitter} unit="ms" color="#a855f7" icon="∿" />
          </div>

          {results.loadedLatencyDown && (
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-gray-700/10 border border-gray-700/12 text-center">
                <p className="text-[8px] text-gray-500 uppercase tracking-wider">↓ bajo carga</p>
                <p className="text-sm font-bold text-white tabular-nums">{results.loadedLatencyDown} <span className="text-[9px] text-gray-600">ms</span></p>
              </div>
              <div className="p-2 rounded-lg bg-gray-700/10 border border-gray-700/12 text-center">
                <p className="text-[8px] text-gray-500 uppercase tracking-wider">↑ bajo carga</p>
                <p className="text-sm font-bold text-white tabular-nums">{results.loadedLatencyUp} <span className="text-[9px] text-gray-600">ms</span></p>
              </div>
            </div>
          )}

          {nicInfo.maxDown && nicEfficiency != null && (
            <div className="p-2.5 rounded-xl bg-gray-700/10 border border-gray-700/15">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{nicInfo.icon}</span>
                  <span className="text-[10px] font-semibold text-gray-300">{nicInfo.label}</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400">{nicEfficiency}% del máximo</span>
              </div>
              <div className="h-1.5 bg-gray-700/30 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500/50 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(nicEfficiency, 100)}%` }} />
              </div>
            </div>
          )}

          {dlPoints.length >= 2 && (
            <div>
              <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wider mb-1">Descarga</p>
              <LiveChart points={dlPoints} color="#3b82f6" id={`dlr-${cid}`} />
            </div>
          )}
          {ulPoints.length >= 2 && (
            <div>
              <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wider mb-1">Subida</p>
              <LiveChart points={ulPoints} color="#10b981" id={`ulr-${cid}`} />
            </div>
          )}

          {activities.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5">
              {activities.map(a => (
                <div key={a.name} className={`flex items-center gap-1.5 px-2 py-[5px] rounded-lg text-[10px] font-medium ${
                  a.ok ? 'bg-emerald-500/8 border border-emerald-500/10 text-emerald-300' : 'bg-gray-700/8 border border-gray-700/6 text-gray-500'
                }`}>
                  <span className="text-[10px]">{a.icon}</span>
                  <span className="truncate">{a.name}</span>
                  <span className="ml-auto shrink-0">
                    {a.ok
                      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                      : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    }
                  </span>
                </div>
              ))}
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
                <p className="text-[10px] font-bold text-white tracking-widest uppercase">FIBRAMAP</p>
                <div className="flex justify-center gap-4">
                  <div><p className="text-lg font-extrabold text-blue-400 tabular-nums">{results.download ?? '—'}</p><p className="text-[8px] text-gray-500">↓ Mbps</p></div>
                  <div><p className="text-lg font-extrabold text-green-400 tabular-nums">{results.upload ?? '—'}</p><p className="text-[8px] text-gray-500">↑ Mbps</p></div>
                  <div><p className="text-lg font-extrabold text-amber-400 tabular-nums">{results.latency ?? '—'}</p><p className="text-[8px] text-gray-500">ms</p></div>
                </div>
                {quality && <p className="text-[10px] font-semibold" style={{ color: quality.color }}>{quality.emoji} {quality.label}</p>}
              </div>
              <button onClick={() => {
                navigator.clipboard?.writeText(
                  `⚡ FIBRAMAP Speed Test\n↓ ${results.download ?? '—'} Mbps | ↑ ${results.upload ?? '—'} Mbps | ${results.latency ?? '—'} ms\n${quality ? quality.emoji + ' ' + quality.label : ''}\nhttps://alanmundler.github.io/fibramap-page/velocidad`
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

      {/* History */}
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
                <span className="text-amber-400 font-mono font-semibold">{h.latency ?? '—'}<span className="text-gray-600">ms</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom button */}
      <div className="px-4 sm:px-5 pb-4">
        {state === 'running' ? (
          <button onClick={stop} className="w-full py-2.5 rounded-xl text-xs font-semibold border border-red-500/30 bg-red-500/8 text-red-400 hover:bg-red-500/15 hover:text-red-300 active:scale-[0.98] transition-all">
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
