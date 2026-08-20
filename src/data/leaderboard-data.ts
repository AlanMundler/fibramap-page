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
// Fuentes cruzadas: SpeedGeo Córdoba (jul 2025–jun 2026),
// SpeedGeo Argentina, Ookla H2 2025, nPerf 2026,
// Speedtest.net.ar (11/08/2026), Netflix ISP Index,
// SpeedOf.Me H1 2026
// ──────────────────────────────────────────────

export const sources = [
  {
    id: 'speedgeo-cordoba',
    name: 'SpeedGeo Córdoba',
    period: 'Jul 2025 – Jun 2026 (12 meses)',
    url: 'https://www.speedgeo.net/statistics/argentina/cordoba',
    description: 'Tests de banda ancha fija en Córdoba. WiFi/conexión cableada.',
    testCount: 'Córdoba',
  },
  {
    id: 'speedgeo',
    name: 'SpeedGeo Argentina',
    period: 'Q3 2025 – Q2 2026 (jul 2025–jun 2026)',
    url: 'https://www.speedgeo.net/statistics/argentina',
    description: '270.308 tests nacionales de banda ancha fija y móvil.',
    testCount: '270.308',
  },
  {
    id: 'ookla',
    name: 'Ookla Speedtest Intelligence',
    period: 'H2 2025 (jul–dic 2025)',
    url: 'https://www.ookla.com/research/reports/argentina-speedtest-connectivity-report-h2-2025',
    description: 'Medición global con tests de usuarios reales vía Speedtest.net.',
    testCount: 'Nacional',
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
    id: 'netflix',
    name: 'Netflix ISP Speed Index',
    period: 'Julio 2026',
    url: 'https://ispspeedindex.netflix.net/country/argentina/',
    description: 'Velocidad promedio de streaming Netflix por ISP. Escala 1-3.8.',
    testCount: 'Nacional',
  },
  {
    id: 'speedof-me',
    name: 'SpeedOf.Me',
    period: 'H1 2026',
    url: 'https://speedof.me/internet-speed/argentina',
    description: 'Tests vía navegador. Mediana de single-stream.',
    testCount: 'Nacional',
  },
  {
    id: 'enacom',
    name: 'ENACOM — Indicadores TIC',
    period: 'T1 2025 (último dato disponible)',
    url: 'https://indicadores.enacom.gob.ar/',
    description: 'Velocidad media de descarga nacional: 245,53 Mbps (dic 2025).',
    testCount: 'Nacional',
  },
];

// ═══════════════════════════════════════════
// CÓRDOBA: Solo ISPs de nuestra lista (servicios.ts)
// que aparecen en SpeedGeo Córdoba, más locales
// ═══════════════════════════════════════════

export const cordobaTests: SpeedTest[] = [
  {
    provider: 'Personal',
    download: 146.1,
    upload: 107.4,
    latency: 23,
    tests: 0,
    source: 'SpeedGeo Córdoba',
    sourceUrl: 'https://www.speedgeo.net/statistics/argentina/cordoba',
    period: 'Jul 2025 – Jun 2026',
    methodology: 'Tests de banda ancha fija en Córdoba. WiFi/conexión cableada.',
  },
  {
    provider: 'Claro',
    download: 120.8,
    upload: 93.3,
    latency: 21,
    tests: 0,
    source: 'SpeedGeo Córdoba',
    sourceUrl: 'https://www.speedgeo.net/statistics/argentina/cordoba',
    period: 'Jul 2025 – Jun 2026',
    methodology: 'Tests de banda ancha fija en Córdoba. WiFi/conexión cableada.',
  },
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
    provider: 'Batcom',
    download: 44.4,
    upload: 20.0,
    latency: 33,
    tests: 0,
    source: 'SpeedGeo Córdoba',
    sourceUrl: 'https://www.speedgeo.net/statistics/argentina/cordoba',
    period: 'Jul 2025 – Jun 2026',
    methodology: 'Tests de banda ancha fija en Córdoba. WiFi/conexión cableada.',
  },
];

// ═══════════════════════════════════════════
// NACIONAL: Todos los ISPs de SpeedGeo Argentina
// + Ookla + nPerf + Speedtest.net.ar + Netflix + SpeedOf.Me
// ═══════════════════════════════════════════

export const nationalOokla: ProviderSummary[] = [
  { name: 'Movistar', color: '#2563eb', download: 177.2, upload: 164.1, latency: 20, tests: 270308, sources: ['speedgeo'], notes: 'Ganador SpeedGeo Q2 2026 — 270.308 tests' },
  { name: 'Personal', color: '#3b82f6', download: 130.3, upload: 87.2, latency: 26, tests: 270308, sources: ['speedgeo', 'ookla'], notes: 'Ookla H2 2025: Mejor red fija (216.62 Mbps DL)' },
  { name: 'Claro', color: '#dc2626', download: 118.4, upload: 95.2, latency: 28, tests: 270308, sources: ['speedgeo', 'nperf'], notes: 'nPerf FTTH: 294.1 DL / 296.6 UL' },
  { name: 'Telecentro', color: '#f97316', download: 178.2, upload: 93.3, latency: 23.5, tests: 580, sources: ['speedtest-ar', 'nperf'], notes: 'nPerf: Mejor latencia (23.48 ms) por 5to año' },
  { name: 'IPLAN', color: '#ec4899', download: 213, upload: 0, latency: 0, tests: 0, sources: ['speedof-me'], notes: 'SpeedOf.Me H1 2026: Más rápido de Argentina (213 Mbps)' },
  { name: 'Starlink', color: '#eab308', download: 77.5, upload: 19.7, latency: 39, tests: 270308, sources: ['speedgeo', 'speedtest-ar'], notes: 'Satelital. Speedtest.net.ar: 79.6 DL' },
];

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

// Netflix ISP Speed Index — Argentina julio 2026
export const netflixData = [
  { name: 'Claro Fibra', score: 3.0, tech: 'Fiber', rank: 1 },
  { name: 'Movistar Fibra', score: 3.0, tech: 'Fiber', rank: 1 },
  { name: 'Movistar DSL', score: 3.0, tech: 'DSL', rank: 1 },
  { name: 'Personal ex Fibertel', score: 3.0, tech: 'Fiber|Cable', rank: 1 },
  { name: 'Personal ex Fibertel Lite', score: 3.0, tech: 'DSL', rank: 1 },
  { name: 'TeleCentro', score: 3.0, tech: 'Cable', rank: 1 },
  { name: 'Gigared', score: 2.8, tech: 'Cable', rank: 2 },
  { name: 'SuperCanal', score: 2.6, tech: 'Fiber|Cable', rank: 3 },
  { name: 'TeleRed', score: 2.6, tech: 'Cable', rank: 3 },
];

// Proveedores locales en servicios.ts sin datos SpeedGeo Córdoba
export const localProviders = [
  {
    name: 'Internet Córdoba',
    color: '#f59e0b',
    note: 'ISP local (AS270099). 73 barrios. No aparece en rankings de SpeedGeo por volumen insuficiente de tests.',
    website: 'https://www.internetcordoba.com.ar',
    coverage: '73 barrios',
  },
  {
    name: 'Guabi',
    color: '#06b6d4',
    note: 'ISP local. Zona Sur exclusivamente. No aparece en rankings de SpeedGeo.',
    website: 'https://www.guabi.com.ar',
    coverage: 'Zona Sur',
  },
  {
    name: 'Telecentro',
    color: '#f97316',
    note: 'Cobertura confirmada en Nueva Córdoba, Centro y Alberdi. No aparece en rankings de SpeedGeo Córdoba.',
    website: 'https://telecentro.com.ar',
    coverage: 'Nueva Córdoba/Centro/Alberdi',
  },
];
