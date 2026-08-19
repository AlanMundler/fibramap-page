import { useState } from 'react';
import { servicios as rawServicios, fmt } from '../data/servicios';

const planes = rawServicios.filter(s => s.precioDesc > 0).map(s => ({
  id: s.id,
  proveedor: s.proveedor,
  plan: s.plan,
  download: s.download,
  upload: s.upload,
  precioDesc: s.precioDesc,
  precioLista: s.precioLista,
  simetrico: s.simetrico,
  tecnologia: s.tecnologia,
  descuento: s.descuento,
  cobertura: s.cobertura,
  destacado: s.destacado,
}));

const preguntas = [
  {
    id: 'dispositivos',
    texto: '¿Cuántos dispositivos se conectan al mismo tiempo en tu casa?',
    opciones: [
      { label: '1–3', valor: 1, icono: '📱' },
      { label: '4–8', valor: 2, icono: '💻📱' },
      { label: '9–15', valor: 3, icono: '🖥️📱🎮' },
      { label: '16+', valor: 4, icono: '🏢' },
    ],
  },
  {
    id: 'presupuesto',
    texto: '¿Cuánto querés gastar por mes como máximo?',
    opciones: [
      { label: 'Hasta $25.000', valor: 1, icono: '💰' },
      { label: 'Hasta $35.000', valor: 2, icono: '💰💰' },
      { label: 'Hasta $50.000', valor: 3, icono: '💰💰💰' },
      { label: 'Sin límite', valor: 4, icono: '🚀' },
    ],
  },
  {
    id: 'subida',
    texto: '¿Necesitás buena velocidad de subida?',
    opciones: [
      { label: 'No, solo bajo', valor: 0, icono: '↓' },
      { label: 'Algo de subida', valor: 1, icono: '↕️' },
      { label: 'Sí, simétrica', valor: 2, icono: '↕️✨' },
    ],
  },
];

function recomendar(respuestas) {
  const disp = respuestas.dispositivos || 2;
  const presu = respuestas.presupuesto || 2;
  const subida = respuestas.subida || 0;

  let minDownload;
  if (disp <= 1) minDownload = 100;
  else if (disp <= 2) minDownload = 300;
  else if (disp <= 3) minDownload = 500;
  else minDownload = 600;

  let maxPrecio;
  if (presu === 1) maxPrecio = 27000;
  else if (presu === 2) maxPrecio = 38000;
  else if (presu === 3) maxPrecio = 55000;
  else maxPrecio = Infinity;

  const candidatos = planes.filter(p => {
    if (p.download < minDownload) return false;
    if (p.precioDesc > maxPrecio) return false;
    if (subida === 2 && !p.simetrico) return false;
    return true;
  });

  if (candidatos.length === 0) {
    return planes
      .filter(p => p.download >= 100)
      .sort((a, b) => a.precioDesc - b.precioDesc)
      .slice(0, 3);
  }

  const scored = candidatos.map(p => {
    let score = 0;
    score += (p.download / 1000) * 30;
    score += p.simetrico ? 15 : 0;
    score += p.precioDesc > 0 ? Math.max(0, 30 - (p.precioDesc / maxPrecio) * 30) : 10;
    score += p.descuento.includes('gratis') ? 5 : 0;
    score += p.descuento.includes('mes gratis') ? 5 : 0;
    score += p.cobertura === 'Anillo urbano' ? 5 : 0;
    score += p.cobertura === 'Amplia' ? 3 : 0;
    return { ...p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3);
}

export default function QuizIsland() {
  const [step, setStep] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [resultados, setResultados] = useState(null);

  const current = preguntas[step];
  const total = preguntas.length;

  const seleccionar = (valor) => {
    const nuevas = { ...respuestas, [current.id]: valor };
    setRespuestas(nuevas);

    if (step < total - 1) {
      setStep(step + 1);
    } else {
      setResultados(recomendar(nuevas));
    }
  };

  const reiniciar = () => {
    setStep(0);
    setRespuestas({});
    setResultados(null);
  };

  if (resultados) {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-white">Te recomendamos estos planes</h2>
          <p className="text-sm text-gray-400">Basado en tus respuestas</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {resultados.map((p, i) => (
            <div key={p.id} className={`p-4 rounded-xl border backdrop-blur-sm ${i === 0 ? 'border-blue-500/50 bg-blue-500/10' : 'border-gray-700/50 bg-gray-800/80'}`}>
              {i === 0 && <div className="text-[10px] font-bold text-blue-400 mb-2 uppercase tracking-wider">Mejor opción</div>}
              <div className="text-[10px] text-gray-400 mb-1">{p.proveedor}</div>
              <div className="font-semibold text-white">{p.plan}</div>
              <div className="text-xl font-bold text-white mt-2">{fmt(p.precioDesc)}<span className="text-xs font-normal text-gray-400">/mes</span></div>
              <div className="text-[10px] text-gray-500 mt-1">{p.download}↓ / {p.upload}↑ {p.simetrico && '• Simétrico'}</div>
              <div className="text-[10px] text-blue-400 mt-1">{p.descuento}</div>
              <div className="text-[10px] text-gray-500 mt-1">{p.cobertura}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          <button onClick={reiniciar} className="btn-pill">Hacer de nuevo</button>
          <a href="/compare" className="btn-primary text-sm">Comparar estos planes</a>
        </div>
      </div>
    );
  }

  const progress = ((step) / total) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold text-white">¿Qué plan te conviene?</h2>
        <p className="text-sm text-gray-400">Respondé 3 preguntas y te recomendamos el mejor plan</p>
      </div>

      <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="bg-gray-800/80 rounded-xl border border-gray-700/50 p-5 backdrop-blur-sm">
        <p className="text-xs text-gray-500 mb-3">Pregunta {step + 1} de {total}</p>
        <h3 className="text-white font-medium mb-4">{current.texto}</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {current.opciones.map(o => (
            <button
              key={o.valor}
              onClick={() => seleccionar(o.valor)}
              className="p-3 rounded-xl border border-gray-600 bg-gray-700/30 hover:border-blue-500/50 hover:bg-blue-500/10 text-left transition-all duration-200 active:scale-[0.97]"
            >
              <div className="text-lg mb-1">{o.icono}</div>
              <div className="text-sm text-white">{o.label}</div>
            </button>
          ))}
        </div>
      </div>

      {step > 0 && (
        <div className="flex justify-center">
          <button onClick={() => setStep(step - 1)} className="btn-pill text-gray-500 hover:text-white">← Atrás</button>
        </div>
      )}
    </div>
  );
}
