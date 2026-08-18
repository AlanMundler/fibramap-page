import { useState, useEffect, useRef } from 'react';

const API_KEY = import.meta.env.PUBLIC_GEMINI_API_KEY || "AIzaSyCakhv_Iow9z_nmjDHtPoyM-LjdPo75XrU";
const MODEL = "gemini-2.5-flash";
const SYSTEM = `Sos un asistente de FibraMap, un portal independiente sobre fibra óptica en Córdoba, Argentina.
Respondés en español, de forma breve y directa.
Tu conocimiento se centra en proveedores de internet (Claro, Personal, Iplan, Movistar, Internet Córdoba), planes, precios, cobertura por barrios, y consejos para elegir proveedor.
Si te preguntan algo que no sabés, decilo honestamente.`;

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const chatRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    import("@google/generative-ai").then(({ GoogleGenerativeAI }) => {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: SYSTEM,
      });
      chatRef.current = model.startChat({
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      });
      setReady(true);
    }).catch(() => setError("No se pudo cargar el modelo de IA. Revisá la configuración."));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading || !chatRef.current) return;

    setInput("");
    setError(null);
    setMessages(prev => [...prev, { text: msg, role: "user", time: new Date() }]);
    setLoading(true);

    try {
      const result = await chatRef.current.sendMessage(msg);
      const text = result.response.text();
      setMessages(prev => [...prev, { text, role: "bot", time: new Date() }]);
    } catch (e) {
      const msg = e?.message || "";
      if (msg.includes("429") || msg.includes("quota")) {
        setError("Se acabó la cuota gratuita. Probá de nuevo en un rato.");
      } else if (msg.includes("403") || msg.includes("API key")) {
        setError("API key inválida. Generá una nueva en aistudio.google.com");
      } else {
        setError("No se pudo obtener respuesta. Intentá de nuevo.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <h2 className="font-semibold text-sm">Chat IA — Gemini {MODEL}</h2>
        {!ready && <span className="text-xs text-gray-400 ml-auto">Conectando...</span>}
      </div>

      <div className="h-80 sm:h-96 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
        {messages.length === 0 && !loading && (
          <div className="text-center mt-12 space-y-2">
            <p className="text-sm text-gray-400">Preguntá sobre fibra óptica en Córdoba</p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {["¿Qué proveedor me conviene?", "¿Claro tiene fibra en Nueva Córdoba?", "Compará Iplan y Movistar"].map(q => (
                <button key={q} onClick={() => { setInput(q); }} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300">
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
                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md"
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
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-md">
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
        <div className="mx-4 mb-2 px-3 py-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2 p-3 border-t border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={ready ? "Escribí tu pregunta..." : "Cargando..."}
          disabled={!ready || loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
          autoFocus
        />
        <button
          type="submit"
          disabled={!ready || loading || !input.trim()}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          ) : "Enviar"}
        </button>
      </form>
    </div>
  );
}
