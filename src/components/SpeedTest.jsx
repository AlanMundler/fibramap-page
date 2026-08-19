import { useState, useRef, useCallback, useEffect } from 'react';

const PHASES = [
  { key: 'latency', label: 'Latencia', icon: '↔', color: '#f59e0b' },
  { key: 'download', label: 'Descarga', icon: '↓', color: '#3b82f6' },
  { key: 'upload', label: 'Subida', icon: '↑', color: '#10b981' },
];

function Gauge({ value, max, phase, color }) {
  const radius = 90;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const pct = Math.min(value / max, 1);
  const strokeDashoffset = circumference - pct * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="rgba(255,255,255,0.06)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.3s ease-out' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl sm:text-5xl font-bold text-white tabular-nums">{value}</span>
        <span className="text-xs text-gray-400 mt-0.5">Mbps</span>
        <span className="text-[10px] mt-1 px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: color + '20', color }}>
          {phase}
        </span>
      </div>
    </div>
  );
}

function StepIndicator({ currentPhase }) {
  const currentIdx = PHASES.findIndex(p => p.key === currentPhase);
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      {PHASES.map((p, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={p.key} className="flex items-center gap-1.5">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-medium border transition-all duration-300 ${
              done ? 'bg-green-500/20 border-green-500/50 text-green-400'
              : active ? 'border-blue-500/50 text-white'
              : 'border-gray-700 text-gray-600'
            }`} style={active ? { backgroundColor: p.color + '20', borderColor: p.color + '80', color: p.color } : {}}>
              {done ? '✓' : p.icon}
            </div>
            {i < PHASES.length - 1 && (
              <div className={`w-6 sm:w-10 h-0.5 rounded ${done ? 'bg-green-500/50' : 'bg-gray-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SpeedTest() {
  const [state, setState] = useState("idle");
  const [currentPhase, setCurrentPhase] = useState(null);
  const [liveSpeed, setLiveSpeed] = useState(0);
  const [results, setResults] = useState(null);
  const engineRef = useRef(null);
  const liveSpeedRef = useRef(0);

  const run = useCallback(async () => {
    setState("running");
    setResults(null);
    setCurrentPhase("latency");
    setLiveSpeed(0);
    liveSpeedRef.current = 0;

    try {
      const { default: SpeedTest } = await import("@cloudflare/speedtest");

      const engine = new SpeedTest({
        autoStart: false,
        measurements: [
          { type: "latency", numPackets: 20 },
          { type: "download", bytes: 1e5, count: 9 },
          { type: "download", bytes: 1e6, count: 8 },
          { type: "download", bytes: 1e7, count: 6 },
          { type: "download", bytes: 2.5e7, count: 4 },
          { type: "download", bytes: 1e8, count: 3 },
          { type: "download", bytes: 2.5e8, count: 2 },
          { type: "upload", bytes: 1e5, count: 8 },
          { type: "upload", bytes: 1e6, count: 6 },
          { type: "upload", bytes: 1e7, count: 4 },
          { type: "upload", bytes: 5e7, count: 3 },
        ],
      });

      let lastPhase = null;

      engine.onRunningChange = (running) => {
        if (!running) return;
        const t = engine.transaction;
        const phase = t?.type || 'download';
        if (phase !== lastPhase) {
          lastPhase = phase;
          setCurrentPhase(phase);
          liveSpeedRef.current = 0;
          setLiveSpeed(0);
        }
        if (phase === 'download' || phase === 'upload') {
          const speed = t?.progress ? (t.progress * (phase === 'download' ? t.bytes : t.bytes) / 1e6) : 0;
          if (speed > 0 && speed < 10000) {
            liveSpeedRef.current = Math.round(speed);
            setLiveSpeed(Math.round(speed));
          }
        }
      };

      engine.onFinish = (res) => {
        const s = res.getSummary();
        setResults({
          download: s.download ? (s.download / 1e6).toFixed(1) : null,
          upload: s.upload ? (s.upload / 1e6).toFixed(1) : null,
          latency: s.latency ? s.latency.toFixed(0) : null,
          jitter: s.jitter ? s.jitter.toFixed(0) : null,
          loadedLatencyDown: s.loadedLatencyDown ? s.loadedLatencyDown.toFixed(0) : null,
          loadedLatencyUp: s.loadedLatencyUp ? s.loadedLatencyUp.toFixed(0) : null,
        });
        setState("done");
        setCurrentPhase(null);
      };

      engineRef.current = engine;
      engine.play();
    } catch (e) {
      setState("error");
      setCurrentPhase(null);
    }
  }, []);

  useEffect(() => {
    return () => { engineRef.current?.stop(); };
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setState("idle");
    setCurrentPhase(null);
    setLiveSpeed(0);
  }, []);

  const gaugeMax = currentPhase === 'upload' ? 1000 : 1000;
  const gaugeColor = currentPhase === 'upload' ? '#10b981' : currentPhase === 'latency' ? '#f59e0b' : '#3b82f6';

  return (
    <div className="bg-gray-800/80 rounded-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden shadow-xl shadow-gray-900/30">
      <div className="px-5 pt-6 pb-4">
        {state === "running" && (
          <div className="space-y-5">
            <StepIndicator currentPhase={currentPhase} />
            <Gauge value={liveSpeed} max={gaugeMax} phase={PHASES.find(p => p.key === currentPhase)?.label || ''} color={gaugeColor} />
            <p className="text-xs text-gray-500 text-center">No cierres esta página durante el test</p>
          </div>
        )}

        {state === "done" && results && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Descarga", value: results.download, unit: "Mbps", color: "#3b82f6", icon: "↓" },
                { label: "Subida", value: results.upload, unit: "Mbps", color: "#10b981", icon: "↑" },
                { label: "Latencia", value: results.latency, unit: "ms", color: "#f59e0b", icon: "↔" },
                { label: "Jitter", value: results.jitter, unit: "ms", color: "#a855f7", icon: "∿" },
              ].map(({ label, value, unit, color, icon }) => (
                <div key={label} className="p-4 rounded-xl bg-gray-700/30 border border-gray-600/30 text-center">
                  <div className="text-lg mb-1" style={{ color }}>{icon}</div>
                  <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{value ?? "--"}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{label} ({unit})</p>
                </div>
              ))}
            </div>

            {results.loadedLatencyDown && (
              <div className="flex justify-center gap-6 text-xs text-gray-400">
                <span>Latencia cargada ↓ {results.loadedLatencyDown} ms</span>
                <span>Latencia cargada ↑ {results.loadedLatencyUp} ms</span>
              </div>
            )}
          </div>
        )}

        {state === "idle" && (
          <div className="text-center py-6 space-y-3">
            <div className="text-4xl">⚡</div>
            <p className="text-sm text-gray-400">
              Test de velocidad con servidores de Cloudflare. Mide descarga, subida y latencia en tiempo real.
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="text-center py-6">
            <p className="text-sm text-red-400">Error al iniciar el test. Intentá de nuevo.</p>
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        {state === "running" ? (
          <button onClick={stop} className="w-full py-3 rounded-xl text-sm font-medium border border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:border-gray-500 hover:text-white active:scale-[0.98] transition-all duration-200">
            Cancelar
          </button>
        ) : (
          <button onClick={run} className="w-full btn-primary">
            {state === "done" ? "Medir de nuevo" : "Iniciar test de velocidad"}
          </button>
        )}
      </div>
    </div>
  );
}
