import type { APIRoute } from 'astro';

const API_KEY = import.meta.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const SYSTEM = 'Sos un asistente de FibraMap, un portal independiente sobre fibra óptica en Córdoba, Argentina. Respondés en español, de forma breve y directa. Tu conocimiento se centra en proveedores de internet (Claro, Personal, Iplan, Internet Córdoba), planes, precios, cobertura por barrios, y consejos para elegir proveedor. Si te preguntan algo que no sabés, decilo honestamente.';

export const POST: APIRoute = async ({ request }) => {
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'API key no configurada en el servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const contents = messages.map((m: { text: string; role: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    let lastError: string | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1000));

      const res = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: SYSTEM }] },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          },
        }),
      });

      if (res.status === 503) {
        lastError = 'Servicio temporalmente no disponible';
        continue;
      }

      if (!res.ok) {
        lastError = `Gemini API error ${res.status}`;
        continue;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return new Response(JSON.stringify({ text }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      lastError = 'Respuesta vacía de Gemini';
    }

    return new Response(JSON.stringify({ error: lastError || 'Error desconocido' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
