import { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';

const API_URL = `${import.meta.env.BASE_URL || '/fibramap-page/'}api/gemini`;

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const messagesRef = useRef([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 || loading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading || msg.length > 500) return;

    setInput("");
    setError(null);
    setMessages(prev => [...prev, { text: msg, role: "user", time: new Date() }]);
    setLoading(true);

    try {
      const apiMessages = [...messagesRef.current.map(m => ({
        text: m.text,
        role: m.role,
      })), { text: msg, role: "user" }];

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let botText = "";
      let buffer = "";

      setMessages(prev => [...prev, { text: "", role: "bot", time: new Date() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          if (!jsonStr) continue;
          try {
            const data = JSON.parse(jsonStr);
            if (data.error) throw new Error(data.error);
            if (data.text) {
              botText += data.text;
              const captured = botText;
              setMessages(prev => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last && last.role === "bot") {
                  next[next.length - 1] = { ...last, text: captured };
                }
                return next;
              });
            }
          } catch (e) {
            if (e.message && !e.message.includes('JSON')) throw e;
          }
        }
      }
    } catch (e) {
      setError(e.message || "No se pudo obtener respuesta.");
      setMessages(prev => {
        if (prev.length > 0 && prev[prev.length - 1].role === "bot" && prev[prev.length - 1].text === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-800/80 rounded-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden shadow-xl shadow-gray-900/30 flex flex-col h-full">
      <div className="px-5 py-3.5 border-b border-gray-700/50 flex items-center gap-2.5 flex-shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50" />
        <h2 className="font-semibold text-sm text-white">Chat IA — Gemini 2.5 Flash</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 sm:px-5 py-4 space-y-3 scroll-smooth">
        {messages.length === 0 && !loading && (
          <div className="text-center h-full flex flex-col items-center justify-center space-y-2">
            <p className="text-sm text-gray-400">Preguntá sobre fibra óptica en Córdoba</p>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
              {["¿Qué proveedor me conviene?", "¿Claro tiene fibra en Nueva Córdoba?", "Compará Iplan y Movistar"].map(q => (
                <button key={q} onClick={() => setInput(q)} className="btn-pill text-[11px] sm:text-xs">
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
              <div className="prose-chat">
                {msg.text ? <Markdown>{msg.text}</Markdown> : (
                  <div className="flex gap-1 py-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  </div>
                )}
              </div>
              {msg.text && (
                <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-blue-200" : "text-gray-400"}`}>
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {error && (
        <div role="alert" className="mx-4 mb-2 px-3 py-2 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2 sm:gap-2.5 p-3 sm:p-4 border-t border-gray-700/50 flex-shrink-0">
        <label className="sr-only" htmlFor="chat-input">Pregunta al chat</label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribí tu pregunta..."
          disabled={loading}
          maxLength={500}
          className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 rounded-xl bg-gray-700/50 border border-gray-600/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Enviar mensaje"
          className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none px-4 sm:px-5 shrink-0"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          ) : "Enviar"}
        </button>
      </form>
    </div>
  );
}
