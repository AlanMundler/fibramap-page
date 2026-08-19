const MODEL = 'gemini-3.6-flash';
const SYSTEM = 'Sos un asistente de FibraMap, un portal independiente sobre fibra óptica en Córdoba, Argentina. Respondés en español, de forma breve y directa. Tu conocimiento se centra en proveedores de internet (Claro, Personal, Iplan, Internet Córdoba), planes, precios, cobertura por barrios, y consejos para elegir proveedor. Si te preguntan algo que no sabés, decilo honestamente.';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const RSS_FEEDS = [
  'https://feeds.feedburner.com/xataka/feed',
];

function decodeEntities(str) {
  return str
    .replace(/&#160;/g, ' ').replace(/&#xA0;/g, ' ').replace(/&nbsp;/g, ' ')
    .replace(/&#8216;/g, "'").replace(/&#8217;/g, "'").replace(/&#8218;/g, ",")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&#8211;/g, "–").replace(/&#8212;/g, "—")
    .replace(/&#039;/g, "'").replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function parseRSSItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
    const linkMatch = block.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/) || block.match(/<link\/>([\s\S]*?)<pubDate>/);
    const dateMatch = block.match(/<pubDate>(.*?)<\/pubDate>/);
    const descMatch = block.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s);
    if (!titleMatch || !linkMatch) continue;
    let title = decodeEntities(titleMatch[1].trim());
    let link = linkMatch[1].trim();
    if (link.includes('<')) link = link.split('<')[0].trim();
    let snippet = '';
    if (descMatch) {
      snippet = decodeEntities(descMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()).slice(0, 200);
    }
    items.push({ title, link, pubDate: dateMatch?.[1] || '', snippet });
  }
  return items;
}

async function handleRSS() {
  const all = [];
  const results = await Promise.allSettled(
    RSS_FEEDS.map(url => fetch(url, { signal: AbortSignal.timeout(8000) }).then(r => r.ok ? r.text() : ''))
  );
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) all.push(...parseRSSItems(r.value));
  }
  all.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  return new Response(JSON.stringify(all.slice(0, 30)), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    if (request.method === 'GET' && url.pathname === '/rss') {
      try {
        return await handleRSS();
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', ...CORS },
        });
      }
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    const API_KEY = env.GEMINI_API_KEY;
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    try {
      const { messages } = await request.json();
      if (!Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: 'Messages array required' }), {
          status: 400, headers: { 'Content-Type': 'application/json', ...CORS },
        });
      }

      const contents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: SYSTEM }] },
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }
      );

      if (!res.ok) {
        return new Response(JSON.stringify({ error: `Gemini API error ${res.status}` }), {
          status: res.status, headers: { 'Content-Type': 'application/json', ...CORS },
        });
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        return new Response(JSON.stringify({ error: 'Empty response' }), {
          status: 502, headers: { 'Content-Type': 'application/json', ...CORS },
        });
      }

      return new Response(JSON.stringify({ text }), {
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message || 'Internal error' }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }
  },
};
