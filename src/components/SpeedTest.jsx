import { useState, useRef, useCallback } from 'react';

export default function SpeedTest() {
  const [state, setState] = useState("idle");
  const [progress, setProgress] = useState({ phase: "", pct: 0 });
  const [results, setResults] = useState(null);
  const engineRef = useRef(null);

  const run = useCallback(async () => {
    setState("running");
    setResults(null);
    setProgress({ phase: "Iniciando...", pct: 0 });

    try {
      const { default: SpeedTest } = await import("@cloudflare/speedtest");

      const engine = new SpeedTest({
        autoStart: false,
        measurements: [
          { type: "latency", numPackets: 20 },
          { type: "download", bytes: 1e5, count: 9 },
          { type: "download", bytes: 1e6, count: 8 },
          { type: "upload", bytes: 1e5, count: 8 },
          { type: "upload", bytes: 1e6, count: 6 },
          { type: "download", bytes: 1e7, count: 6 },
          { type: "upload", bytes: 1e7, count: 4 },
          { type: "download", bytes: 2.5e7, count: 4 },
          { type: "upload", bytes: 2.5e7, count: 4 },
          { type: "download", bytes: 1e8, count: 3 },
          { type: "upload", bytes: 5e7, count: 3 },
          { type: "download", bytes: 2.5e8, count: 2 },
        ],
      });

      const phases = { latency: "Midiendo latencia...", download: "Descargando...", upload: "Subiendo..." };
      let phaseCount = 0;
      const totalPhases = 3;

      engine.onRunningChange = (running) => {
        if (!running) return;
        phaseCount++;
        const pct = Math.min(95, Math.round((phaseCount / totalPhases) * 90));
        const t = engine.transaction;
        const phase = t?.type || "download";
        setProgress({ phase: phases[phase] || "Midiendo...", pct });
      };

      engine.onFinish = (res) => {
        const s = res.getSummary();
        setResults({
          download: s.download ? (s.download / 1e6).toFixed(1) : null,
          upload: s.upload ? (s.upload / 1e6).toFixed(1) : null,
          latency: s.latency ? s.latency.toFixed(0) : null,
          jitter: s.jitter ? s.jitter.toFixed(0) : null,
          loadedLatencyUp: s.loadedLatencyUp ? s.loadedLatencyUp.toFixed(0) : null,
          loadedLatencyDown: s.loadedLatencyDown ? s.loadedLatencyDown.toFixed(0) : null,
        });
        setState("done");
        setProgress({ phase: "Completado", pct: 100 });
      };

      engineRef.current = engine;
      engine.play();
    } catch (e) {
      console.error("SpeedTest error:", e);
      setState("error");
      setProgress({ phase: "Error al iniciar el test", pct: 0 });
    }
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setState("idle");
    setProgress({ phase: "", pct: 0 });
  }, []);

  return (
    <div className="bg-gray-800/80 rounded-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden shadow-xl shadow-gray-900/30">
      {results && state === "done" && (
        <div className="px-6 pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
            {[
              { label: "Descarga", value: results.download, unit: "Mbps", icon: "↓", color: "text-blue-400" },
              { label: "Subida", value: results.upload, unit: "Mbps", icon: "↑", color: "text-emerald-400" },
              { label: "Latencia", value: results.latency, unit: "ms", icon: "↔", color: "text-amber-400" },
              { label: "Jitter", value: results.jitter, unit: "ms", icon: "∿", color: "text-purple-400" },
            ].map(({ label, value, unit, icon, color }) => (
              <div key={label} className="p-3.5 rounded-xl bg-gray-700/30 border border-gray-600/30">
                <span className={`text-lg ${color}`}>{icon}</span>
                <p className="text-2xl font-bold mt-1 text-white">{value ?? "--"}</p>
                <p className="text-[11px] text-gray-400">{label} ({unit})</p>
              </div>
            ))}
          </div>

          {results.loadedLatencyDown && (
            <div className="flex justify-center gap-6 mt-3 text-xs text-gray-400">
              <span>Latencia cargada ↓ {results.loadedLatencyDown} ms</span>
              <span>Latencia cargada ↑ {results.loadedLatencyUp} ms</span>
            </div>
          )}
        </div>
      )}

      {state === "running" && (
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">{progress.phase}</span>
            <span className="text-xs text-gray-500">{progress.pct}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 rounded-full transition-all duration-500 ease-out shadow-lg shadow-blue-500/30"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">No cierres esta página durante el test</p>
        </div>
      )}

      {state === "error" && (
        <div className="px-6 pt-6">
          <p className="text-sm text-red-400 text-center">{progress.phase}</p>
        </div>
      )}

      {state === "idle" && (
        <div className="px-6 pt-6 text-center">
          <p className="text-sm text-gray-400">
            Mide tu velocidad de descarga, subida y latencia usando los servidores de Cloudflare.
          </p>
        </div>
      )}

      <div className="p-4">
        {state === "running" ? (
          <button
            onClick={stop}
            className="w-full py-3 rounded-xl text-sm font-medium border border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:border-gray-500 hover:text-white active:scale-[0.98] transition-all duration-200"
          >
            Cancelar
          </button>
        ) : (
          <button
            onClick={run}
            className="w-full btn-primary"
          >
            {state === "done" ? "Medir de nuevo" : "Iniciar test de velocidad"}
          </button>
        )}
      </div>
    </div>
  );
}
