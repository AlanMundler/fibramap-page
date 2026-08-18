import { useState, useRef, useCallback } from 'react';

export default function SpeedTest() {
  const [state, setState] = useState("idle"); // idle | running | done | error
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Results */}
      {results && state === "done" && (
        <div className="px-6 pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { label: "Descarga", value: results.download, unit: "Mbps", icon: "↓", color: "text-blue-500" },
              { label: "Subida", value: results.upload, unit: "Mbps", icon: "↑", color: "text-green-500" },
              { label: "Latencia", value: results.latency, unit: "ms", icon: "↔", color: "text-amber-500" },
              { label: "Jitter", value: results.jitter, unit: "ms", icon: "∿", color: "text-purple-500" },
            ].map(({ label, value, unit, icon, color }) => (
              <div key={label} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <span className={`text-lg ${color}`}>{icon}</span>
                <p className="text-2xl font-bold mt-1">{value ?? "--"}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{label} ({unit})</p>
              </div>
            ))}
          </div>

          {results.loadedLatencyDown && (
            <div className="flex justify-center gap-6 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span>Latencia cargada ↓ {results.loadedLatencyDown} ms</span>
              <span>Latencia cargada ↑ {results.loadedLatencyUp} ms</span>
            </div>
          )}
        </div>
      )}

      {/* Progress */}
      {state === "running" && (
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{progress.phase}</span>
            <span className="text-xs text-gray-500">{progress.pct}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">No cierres esta página durante el test</p>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="px-6 pt-6">
          <p className="text-sm text-red-500 text-center">{progress.phase}</p>
        </div>
      )}

      {/* Idle intro */}
      {state === "idle" && (
        <div className="px-6 pt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mide tu velocidad de descarga, subida y latencia usando los servidores de Cloudflare.
          </p>
        </div>
      )}

      {/* Action button */}
      <div className="p-4">
        {state === "running" ? (
          <button
            onClick={stop}
            className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
        ) : (
          <button
            onClick={run}
            className="w-full py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            {state === "done" ? "Medir de nuevo" : "Iniciar test de velocidad"}
          </button>
        )}
      </div>
    </div>
  );
}
