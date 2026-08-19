import { useState, useEffect, useRef } from 'react';

const API_KEY = import.meta.env.PUBLIC_GEMINI_API_KEY || "";
const MODEL = "gemini-3.6-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const SYSTEM = "Sos un asistente de FibraMap, un portal independiente sobre fibra óptica en Córdoba, Argentina. Respondés en español, de forma breve y directa. Tu conocimiento se centra en proveedores de internet (Claro, Personal, Iplan, Movistar, Internet Córdoba), planes, precios, cobertura por barrios, y consejos para elegir proveedor. Si te preguntan algo que no sabés, decilo honestamente.";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!API_KEY) setError("API key no configurada.");
  }, []);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    if (!API_KEY) { setError("No hay API key configurada."); return; }

    setInput("");
    setError(null);
    setMessages(prev => [...prev, { text: msg, role: "user", time: new Date() }]);
    setLoading(true);

    try {
      const contents = [...messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })), { role: "user", parts: [{ text: msg }] }];

      let text = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt));
        const res = await fetch(`${API_URL}?key=${API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: SYSTEM }] },
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const detail = err?.error?.message || `HTTP ${res.status}`;
          if (res.status === 503 && attempt < 2) continue;
          if (res.status === 400) throw new Error(`Clave inválida o modelo no disponible: ${detail}`);
          if (res.status === 403) throw new Error(`Acceso denegado: ${detail}`);
          if (res.status === 429) throw new Error(`Cuota excedida: ${detail}`);
          throw new Error(`Error ${res.status}: ${detail}`);
        }
        const data = await res.json();
        text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) break;
      }
      if (!text) throw new Error("El modelo no respondió. Intentá de nuevo en unos segundos.");
      setMessages(prev => [...prev, { text, role: "bot", time: new Date() }]);
    } catch (e) {
      setError(e.message || "No se pudo obtener respuesta.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-800/80 rounded-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden shadow-xl shadow-gray-900/30">
      <div className="px-5 py-3.5 border-b border-gray-700/50 flex items-center gap-2.5">
        <div className={`w-2.5 h-2.5 rounded-full ${API_KEY ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50' : 'bg-red-500'}`} />
        <h2 className="font-semibold text-sm text-white">Chat IA — Gemini {MODEL}</h2>
        {!API_KEY && <span className="text-xs text-red-400 ml-auto">Sin API key</span>}
      </div>

      <div className="h-80 sm:h-96 overflow-y-auto px-5 py-4 space-y-3 scroll-smooth">
        {messages.length === 0 && !loading && (
          <div className="text-center mt-12 space-y-2">
            <p className="text-sm text-gray-400">Preguntá sobre fibra óptica en Córdoba</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {["¿Qué proveedor me conviene?", "¿Claro tiene fibra en Nueva Córdoba?", "Compará Iplan y Movistar"].map(q => (
                <button key={q} onClick={() => setInput(q)} className="btn-pill">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-blue-600 text-white rounded-br-md"
                : "bg-gray-700 text-gray-100 rounded-bl-md"
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-blue-200" : "text-gray-400"}`}>
                {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="mx-4 mb-2 px-3 py-2 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2.5 p-4 border-t border-gray-700/50">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={API_KEY ? "Escribí tu pregunta..." : "API key no configurada"}
          disabled={loading || !API_KEY}
          className="flex-1 px-4 py-2.5 rounded-xl bg-gray-700/50 border border-gray-600/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 transition-all"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || !API_KEY}
          className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          ) : "Enviar"}
        </button>
      </form>
    </div>
  );
}
