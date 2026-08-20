export interface SpeedTest {
  provider: string;
  barrio?: string;
  download: number;
  upload: number;
  latency: number;
  tests: number;
  source: string;
  sourceUrl: string;
  period: string;
  methodology: string;
}

export interface ProviderSummary {
  name: string;
  color: string;
  download: number;
  upload: number;
  latency: number;
  tests: number;
  sources: string[];
  notes?: string;
}

// ──────────────────────────────────────────────
// DATOS REALES — ninguna cifra inventada
// Fuentes: Ookla Speedtest Intelligence H2 2025,
// SpeedGeo Q3 2025–Q2 2026, nPerf 2026,
// Speedtest.net.ar (11/08/2026), ENACOM T1 2025
// ──────────────────────────────────────────────

export const sources = [
  {
    id: 'ookla',
    name: 'Ookla Speedtest Intelligence',
    period: 'H2 2025 (jul–dic 2025)',
    url: 'https://www.ookla.com/research/reports/argentina-speedtest-connectivity-report-h2-2025',
    description: 'Medición global con tests de usuarios reales vía Speedtest.net. Ranking nacional.',
    testCount: 'Nacional',
  },
  {
    id: 'speedgeo',
    name: 'SpeedGeo / V-SPEED',
    period: 'Q3 2025 – Q2 2026 (jul 2025–jun 2026)',
    url: 'https://www.speedgeo.net/statistics/argentina',
    description: '270.308 tests de banda ancha fija y móvil, WiFi/conexión cableada.',
    testCount: '270.308',
  },
  {
    id: 'nperf',
    name: 'nPerf Barómetro 2026',
    period: 'abr 2025 – mar 2026',
    url: 'https://dplnews.com/nperf-identifica-mejoras-notables-de-velocidad-y-rendimiento-de-redes-fijas-de-argentina/',
    description: '104.264 tests fijos. Score nPoints = descarga (2/3) + subida (1/3) + latencia.',
    testCount: '104.264',
  },
  {
    id: 'speedtest-ar',
    name: 'Speedtest.net.ar',
    period: 'Acumulado al 11/08/2026',
    url: 'https://speedtest.net.ar/ranking',
    description: 'Tests de usuarios reales contra nodos de medición propios. Mínimo 10 tests por ISP.',
    testCount: '5.173',
  },
  {
    id: 'speedtest-cordoba',
    name: 'Speedtest Global Index — Córdoba',
    period: 'Junio 2026 (promedio 3 meses)',
    url: 'https://www.speedtest.net/global-index/argentina?city=C%C3%B3rdoba',
    description: 'Velocidad mediana de la ciudad de Córdoba (fija y móvil).',
    testCount: 'Córdoba',
  },
  {
    id: 'enacom',
    name: 'ENACOM — Indicadores TIC',
    period: 'T1 2025 (último dato disponible)',
    url: 'https://indicadores.enacom.gob.ar/',
    description: 'Velocidad media de descarga nacional: 245,53 Mbps (dic 2025). Datos provinciales.',
    testCount: 'Nacional',
  },
];

// Nacional: principales ISPs — Ookla H2 2025
export const nationalOokla: ProviderSummary[] = [
  { name: 'Personal Fibra', color: '#3b82f6', download: 216.62, upload: 189.65, latency: 0, tests: 0, sources: ['ookla'], notes: 'Mejor red fija de Argentina según Ookla H2 2025' },
  { name: 'Movistar', color: '#2563eb', download: 177.2, upload: 164.1, latency: 20.5, tests: 0, sources: ['speedgeo'], notes: 'Ganador SpeedGeo Q2 2026 — 270.308 tests' },
  { name: 'Claro', color: '#dc2626', download: 118.4, upload: 95.2, latency: 27.8, tests: 0, sources: ['speedgeo'], notes: 'En FTTH: 294,1 DL / 296,6 UL (nPerf)' },
  { name: 'Telecentro', color: '#f97316', download: 178.2, upload: 93.3, latency: 154.1, tests: 0, sources: ['speedtest-ar'], notes: 'Mejor latencia del ranking nPerf (23,48 ms)' },
  { name: 'Starlink', color: '#eab308', download: 77.5, upload: 19.7, latency: 39, tests: 0, sources: ['speedgeo'] },
];

// Córdoba: datos reales por ISP — Speedtest.net.ar
export const cordobaTests: SpeedTest[] = [
  {
    provider: 'IPLAN',
    download: 188.8,
    upload: 146.3,
    latency: 77.6,
    tests: 47,
    source: 'Speedtest.net.ar',
    sourceUrl: 'https://speedtest.net.ar/ranking',
    period: 'Al 11/08/2026',
    methodology: 'Tests de usuarios reales contra nodos propios. Score: 68/100.',
  },
  {
    provider: 'Personal',
    download: 131.6,
    upload: 97.2,
    latency: 122.4,
    tests: 1315,
    source: 'Speedtest.net.ar',
    sourceUrl: 'https://speedtest.net.ar/ranking',
    period: 'Al 11/08/2026',
    methodology: 'Tests de usuarios reales contra nodos propios. Score: 30/100.',
  },
  {
    provider: 'Movistar',
    download: 189.5,
    upload: 178.5,
    latency: 161.6,
    tests: 723,
    source: 'Speedtest.net.ar',
    sourceUrl: 'https://speedtest.net.ar/ranking',
    period: 'Al 11/08/2026',
    methodology: 'Tests de usuarios reales contra nodos propios. Score: 36/100.',
  },
  {
    provider: 'Claro',
    download: 118.4,
    upload: 95.2,
    latency: 27.8,
    tests: 0,
    source: 'SpeedGeo',
    sourceUrl: 'https://www.speedgeo.net/statistics/argentina',
    period: 'Q3 2025 – Q2 2026',
    methodology: '270.308 tests nacionales. Datos nacionales (Córdoba no separada).',
  },
  {
    provider: 'Gigared',
    download: 107.3,
    upload: 77.7,
    latency: 87.7,
    tests: 88,
    source: 'Speedtest.net.ar',
    sourceUrl: 'https://speedtest.net.ar/ranking',
    period: 'Al 11/08/2026',
    methodology: 'Tests de usuarios reales contra nodos propios. Score: 34/100.',
  },
];

// nPerf FTTH específico — fibra al hogar
export const ftthData: ProviderSummary[] = [
  { name: 'Claro FTTH', color: '#dc2626', download: 294.1, upload: 296.6, latency: 0, tests: 0, sources: ['nperf'], notes: 'nPerf 2026: mejora +96% interanual en subida' },
  { name: 'Personal FTTH', color: '#3b82f6', download: 216.62, upload: 189.65, latency: 0, tests: 0, sources: ['ookla', 'nperf'], notes: 'Mejor score FTTH en nPerf (133.800 nPoints)' },
];

// Velocidad mediana Córdoba — Speedtest Global Index junio 2026
export const cordobaCity = {
  mobile: { rank: 95, download: 88.52, upload: 13.90, latency: 26 },
  fixed: { rank: 87, download: 120.81, upload: 93.71, latency: 13 },
};

// ENACOM — velocidad media Córdoba
export const enacomCordoba = {
  nationalAvg: 245.53,
  period: 'Dic 2025',
  source: 'https://indicadores.enacom.gob.ar/',
};

// Proveedores locales sin datos de velocidad verificables públicos
// Estos ISPs operan en Córdoba pero no aparecen en rankings nacionales
export const localProviders = [
  {
    name: 'Internet Córdoba',
    color: '#f59e0b',
    note: 'ISP local (AS270099). No aparece en rankings nacionales de Ookla/nPerf/SpeedGeo por volumen insuficiente de tests.',
    website: 'https://www.internetcordoba.com.ar',
    coverage: '67 barrios',
  },
  {
    name: 'Guabi',
    color: '#06b6d4',
    note: 'ISP local sin presencia en rankings nacionales. Datos de velocidad no disponibles públicamente.',
    website: 'https://www.guabi.com.ar',
    coverage: 'Córdoba Capital',
  },
  {
    name: 'Batcom',
    color: '#8b5cf6',
    note: 'ISP local (ISO 9001:2015). No aparece en rankings nacionales.',
    website: 'https://batcom.com.ar',
    coverage: 'Zona oeste',
  },
];
