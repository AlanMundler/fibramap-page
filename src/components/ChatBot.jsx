import { useState, useEffect, useRef } from 'react';

const API_KEY = "AIzaSyCakhv_Iow9z_nmjDHtPoyM-LjdPo75XrU";
const MODEL_NAME = "gemini-1.0-pro";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    import("@google/generative-ai").then(({ GoogleGenerativeAI, HarmCategory, HarmBlockThreshold }) => {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      chatRef.current = model.startChat({
        generationConfig: { temperature: 0.9, topK: 1, topP: 1, maxOutputTokens: 2048 },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
      });
    }).catch(() => setError("No se pudo iniciar el chat."));
  }, []);

  const send = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { text: msg, role: "user", time: new Date() }]);
    try {
      if (!chatRef.current) return;
      const result = await chatRef.current.sendMessage(msg);
      setMessages(prev => [...prev, { text: result.response.text(), role: "bot", time: new Date() }]);
    } catch {
      setError("No se pudo enviar el mensaje.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <h2 className="font-semibold px-4 py-3 border-b border-gray-200 dark:border-gray-700">Chat IA</h2>
      <div className="h-72 sm:h-96 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "ml-auto" : ""}`}>
            <div className={`px-3 py-2 rounded-lg text-sm ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700"}`}>
              {msg.text}
            </div>
            <span className={`text-xs text-gray-400 mt-1 ${msg.role === "user" ? "text-right" : ""}`}>
              {msg.role === "bot" ? "IA" : "Vos"} · {msg.time.toLocaleTimeString()}
            </span>
          </div>
        ))}
        {messages.length === 0 && <p className="text-sm text-gray-400 text-center mt-8">Preguntá lo que quieras sobre fibra óptica en Córdoba.</p>}
      </div>
      {error && <p className="text-red-500 text-sm px-4">{error}</p>}
      <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Escribí tu mensaje..." className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Enviar</button>
      </form>
    </div>
  );
}
