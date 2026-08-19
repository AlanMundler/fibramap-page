const MODEL = 'gemini-3.6-flash';
const SYSTEM = 'Sos un asistente de FibraMap, un portal independiente sobre fibra óptica en Córdoba, Argentina. Respondés en español, de forma breve y directa. Tu conocimiento se centra en proveedores de internet (Claro, Personal, Iplan, Internet Córdoba), planes, precios, cobertura por barrios, y consejos para elegir proveedor. Si te preguntan algo que no sabés, decilo honestamente.';

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const API_KEY = env.GEMINI_API_KEY;
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const { messages } = await request.json();
      if (!Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: 'Messages array required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const contents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: SYSTEM }] },
            generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
          }),
        }
      );

      if (!res.ok) {
        return new Response(JSON.stringify({ error: `Gemini API error ${res.status}` }), {
          status: res.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(res.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message || 'Internal error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
