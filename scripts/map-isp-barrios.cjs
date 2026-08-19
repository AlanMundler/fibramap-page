#!/usr/bin/env node
/**
 * Maps ISPs to real barrio polygons from Córdoba cadastral GeoJSON.
 * Uses rectangular bounding zones + point-in-polygon matching.
 * Outputs: src/data/isp-barrios.json (ISP → barrio name list)
 *          src/data/barrios-by-provider.json (GeoJSON features grouped by provider)
 */

const fs = require('fs');
const path = require('path');

const GEOJSON_PATH = path.join(__dirname, '..', 'src', 'data', 'cordoba-barrios-full.geojson');
const OUTPUT_BARRIOS = path.join(__dirname, '..', 'src', 'data', 'isp-barrios.json');
const OUTPUT_GEOJSON = path.join(__dirname, '..', 'src', 'data', 'barrios-by-provider.json');

// Point-in-polygon (ray casting)
function pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Get centroid of a polygon (average of first ring coordinates)
function getCentroid(coords) {
  if (!coords || !coords.length) return null;
  // coords can be [ring] or [[ring]]
  let ring = coords;
  if (Array.isArray(ring[0]) && Array.isArray(ring[0][0])) ring = ring[0];
  if (Array.isArray(ring[0]) && typeof ring[0][0] === 'number') ring = [ring];
  
  let totalLng = 0, totalLat = 0, count = 0;
  for (const r of ring) {
    for (const [lng, lat] of r) {
      totalLng += lng;
      totalLat += lat;
      count++;
    }
  }
  return count > 0 ? [totalLng / count, totalLat / count] : null;
}

// ISP approximate bounding zones (lat/lng rectangles)
// These are TIGHT bounds used only to find NEARBY barrios that might also be covered.
// The known barrio names list is the primary source of truth.
// Bounds are deliberately smaller than actual coverage to avoid false positives.
const ISP_BOUNDS = {
  'Claro': { 
    north: -31.355, south: -31.460, west: -64.250, east: -64.120,
    // Central Córdoba urban core only
  },
  'Personal Fibra': {
    north: -31.355, south: -31.460, west: -64.250, east: -64.120,
    // Same core area as Claro
  },
  'IPLAN': {
    north: -31.410, south: -31.435, west: -64.200, east: -64.165,
    // Centro/Nueva Córdoba/Alberdi — very tight
  },
  'Internet Córdoba': {
    north: -31.365, south: -31.460, west: -64.230, east: -64.110,
    // Central/south-east urban core
  },
  'Batcom': {
    north: -31.325, south: -31.375, west: -64.280, east: -64.200,
    // Norte/Noroeste only
  },
  'Guabi': {
    north: -31.300, south: -31.530, west: -64.350, east: -64.050,
    // Wide bounds — official map has 5 scattered barrios
  },
};

// Known barrio names per ISP (verified from official sources)
// Sources: batcom.com.ar, internetcordoba.com.ar, distributor pages, phontel, selectra
const KNOWN_BARRIOS = {
  'Claro': [
    // Confirmed by official distributor (internetytelefoniaencordoba.com)
    'NUEVA CORDOBA', 'CERRO DE LAS ROSAS', 'GUEMES', 'ALTA CORDOBA',
    'CENTRO', 'GENERAL PAZ', 'COFICO', 'GENERAL BUSTOS',
    'CERRO NORTE', 'PROVIDENCIA', 'MULLER', 'COLON', 'EMPALME',
    'PARQUE TABLADA', 'COMERCIAL',
    // Confirmed initial 10 barrios (2019 launch)
    'JARDIN', 'SAN VICENTE', 'SARMIENTO', 'MAIPU 1A SECCION',
    'SAN CARLOS', 'OÑA', 'AYACUCHO',
    // Confirmed by phontel.com.ar
    'ALBERDI', 'PATRICIOS',
    // Additional known Claro barrios from coverage checker
    'SAN FRANCISCO', 'GUAYAQUIL', 'MERCANTIL', 'TALLERES (E)',
    'GENERAL PUEYRREDON', 'SAN MARTIN', 'PARQUE SARMIENTO',
    'RIVADAVIA', 'CIUDADELA', 'SANTA RITA', 'BOEDO',
    'FERREYRA', '25 DE MAYO', 'INDEPENDENCIA', 'EL BOSQUE',
    'LAS DELICIAS', 'LAS ROSAS', 'URCA', 'GENERAL BELGRANO',
    'ALMIRANTE BROWN', 'GUIÑAZU', 'VILLA ARGENTINA',
    'VILLA EL LIBERTADOR', 'VILLA ALBERDI', 'VILLA AVALOS',
    'VILLA CORONEL OLMEDO', 'PARQUE CHATEAU CARRERAS',
    'YOFRE H', 'YOFRE I', 'YOFRE SUD',
  ],
  'Personal Fibra': [
    // Confirmed by phontel.com.ar and selectra.com.ar
    // ex-Fibertel/Cablevisión HFC + new FTTH deployment
    // "Amplia" coverage — largest national network
    'NUEVA CORDOBA', 'GENERAL PAZ', 'ALTA CORDOBA',
    'CENTRO', 'CERRO DE LAS ROSAS',
    // Broader HFC + FTTH coverage (ex-Cablevisión infrastructure)
    'ALBERDI', 'PATRICIOS', 'SAN FRANCISCO', 'GUAYAQUIL',
    'MERCANTIL', 'GUEMES', 'SAN MARTIN', 'SARMIENTO',
    'COLON', 'EMPALME', 'COFICO', 'GENERAL BUSTOS',
    'PROVIDENCIA', 'MULLER', 'CERRO NORTE',
    'TALLERES (E)', 'RIVADAVIA', 'CIUDADELA', 'SANTA RITA',
    'BOEDO', 'FERREYRA', 'JARDIN', 'SAN VICENTE',
    'URCA', 'EL BOSQUE', 'GENERAL BELGRANO',
    'OÑA', '25 DE MAYO', 'INDEPENDENCIA',
    'ALMIRANTE BROWN', 'GUIÑAZU', 'PARQUE SARMIENTO',
    'PARQUE TABLADA', 'COMERCIAL', 'GENERAL PUEYRREDON',
    'PARQUE CHATEAU CARRERAS', 'PARQUE LATINO',
    'VILLA ARGENTINA', 'VILLA EL LIBERTADOR',
    'VILLA ALBERDI', 'VILLA AVALOS',
    'VILLA CORONEL OLMEDO', 'SAN RAMON', 'SAN NICOLAS',
    'YOFRE H', 'YOFRE I', 'YOFRE SUD',
    'GRANADERO PRINGLES', 'PANAMERICANO',
    'LAS DELICIAS', 'LAS ROSAS',
    'RESIDENCIAL SAN ROQUE', 'RESIDENCIAL SAN CARLOS',
    'LOS ALAMOS', 'LOS FILTROS',
    'PARQUE DEL ESTE', 'PARQUE DON BOSCO',
    'LOMAS DE SAN MARTIN', 'ALTOS SAN MARTIN',
  ],
  'IPLAN': [
    'NUEVA CORDOBA', 'CENTRO', 'ALBERDI',
  ],
  'Internet Córdoba': [
    // Explicit list from internetcordoba.com.ar — 67+ barrios
    // South/southeast focus, Empalme, peripheral areas
    '1RO DE MAYO', '4 DE FEBRERO', 'ACOSTA',
    'ALTAMIRA', 'ALTOS SUD DE SAN VICENTE',
    'AMPLIACION 1RO DE MAYO', 'AMPLIACION ALTAMIRA',
    'AMPLIACION EMPALME', 'AMPLIACION PUEYRREDON',
    'AMPLIACION YAPEYU', 'BAJO GENERAL PAZ',
    'COLON', 'COLONIA LOLA', 'CORRAL DE PALOS',
    'CRISOL NORTE', 'CRISOL SUD', 'DEAN FUNES',
    'EMAUS', 'EMPALME', 'EMPALME CASAS DE OBREROS Y EMPLEADOS',
    'FERROVIARIO MITRE', 'GENERAL PAZ', 'GENERAL PUEYRREDON',
    'JOSE IGNACIO DIAZ 1A SECCION', 'JOSE IGNACIO DIAZ 2A SECCION',
    'LA TABLITA', 'LAS LILAS', 'LOS ARTESANOS',
    'LOS CEIBOS', 'LOS JOSEFINOS', 'LOS PARAISOS',
    'MAIPU 1A SECCION', 'MAIPU 2A SECCION', 'MALDONADO',
    'MULLER', 'MIRADOR', 'MIRALTA',
    'NICOLAS AVELLANEDA', 'PARQUE SAN VICENTE',
    'PORTAL DE CORDOBA', 'RENACIMIENTO',
    'RIVADAVIA', 'SAN CAYETANO', 'SAN JAVIER',
    'SARMIENTO', 'TALLERES SUD', 'URQUIZA',
    'VILLA ARGENTINA', 'VILLA BUSTOS',
    'YAPEYU', 'ZEPA',
  ],
  'Batcom': [
    // Official batcom.com.ar Google Maps markers (15 total)
    'LOS BOULEVARES', 'CHACRA DEL NORTE',
    'MALVINAS ARGENTINAS', 'JUAREZ CELMAN',
    'PROCREAR LICEO', 'UNIVERSITARIO DE HORIZONTE',
    'CARRARA DE HORIZONTE', 'SPILIMBERGO',
    'LA CALERA', 'LA CUESTA', 'CUESTA COLORADA',
    'SAN CARLOS DE HORIZONTE', 'RAMON J. CARCANO',
    'VALLE ESCONDIDO', 'VILLA ALLENDE PARQUE',
  ],
  'Guabi': [
    // Official map (5 barrios FO): https://www.google.com/maps/d/viewer?mid=1PoRTMASxcRlnWflR03VGpFh4_zFLheE
    'UNIVERSITARIO DE HORIZONTE', 'LA ESPERANZA',
    'VALLE CERCANO', 'PARQUE FUTURA',
    'VILLA SAN CARLOS',
  ],
};

// Load GeoJSON
const geojson = JSON.parse(fs.readFileSync(GEOJSON_PATH, 'utf8'));

// Normalize barrio name for matching
function normalize(name) {
  return name.toUpperCase().trim().replace(/\s+/g, ' ');
}

// Build lookup: normalized name → feature
const barrioByName = {};
for (const feature of geojson.features) {
  const name = normalize(feature.properties.Nombre || '');
  if (name && name !== 'SD' && name.length > 1) {
    if (!barrioByName[name]) barrioByName[name] = feature;
  }
}

// Check if barrio centroid is within bounds
function centroidInBounds(centroid, bounds) {
  if (!centroid) return false;
  const [lng, lat] = centroid;
  return lat >= bounds.south && lat <= bounds.north && 
         lng >= bounds.west && lng <= bounds.east;
}

// Match barrios to providers
const providerBarrios = {};
const providerGeoFeatures = {};

for (const [provider, bounds] of Object.entries(ISP_BOUNDS)) {
  const knownNames = (KNOWN_BARRIOS[provider] || []).map(normalize);
  const matchedBarrios = new Set();
  const matchedFeatures = [];

  // 1. Match by known names
  for (const name of knownNames) {
    if (barrioByName[name]) {
      matchedBarrios.add(name);
      matchedFeatures.push(barrioByName[name]);
    }
  }

  // 2. Match by centroid within tight bounds (limited expansion)
  // IPLAN/Guabi: no expansion — user-confirmed coverage only
  const noExpand = ['IPLAN', 'Guabi', 'Batcom'];
  const maxFromBounds = noExpand.includes(provider) ? 0 : Math.ceil(knownNames.length * 0.15);
  let boundsCount = 0;
  for (const [name, feature] of Object.entries(barrioByName)) {
    if (matchedBarrios.has(name)) continue;
    if (boundsCount >= maxFromBounds) break;
    
    // Get centroid
    const coords = feature.geometry?.coordinates;
    if (!coords) continue;
    const centroid = getCentroid(coords);
    if (centroidInBounds(centroid, bounds)) {
      matchedBarrios.add(name);
      matchedFeatures.push(feature);
      boundsCount++;
    }
  }

  providerBarrios[provider] = [...matchedBarrios].sort();
  providerGeoFeatures[provider] = {
    type: 'FeatureCollection',
    features: matchedFeatures,
  };

  console.log(`${provider}: ${matchedBarrios.size} barrios`);
}

// Douglas-Peucker simplification
function simplifyRing(ring, tolerance) {
  if (ring.length <= 2) return ring;
  
  // Find point farthest from line between first and last
  let maxDist = 0;
  let maxIdx = 0;
  const first = ring[0];
  const last = ring[ring.length - 1];
  
  for (let i = 1; i < ring.length - 1; i++) {
    const dist = perpendicularDist(ring[i], first, last);
    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }
  
  if (maxDist > tolerance) {
    const left = simplifyRing(ring.slice(0, maxIdx + 1), tolerance);
    const right = simplifyRing(ring.slice(maxIdx), tolerance);
    return left.slice(0, -1).concat(right);
  }
  
  return [first, last];
}

function perpendicularDist(point, lineStart, lineEnd) {
  const [px, py] = point;
  const [ax, ay] = lineStart;
  const [bx, by] = lineEnd;
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  const projX = ax + t * dx;
  const projY = ay + t * dy;
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

function simplifyGeometry(geometry, tolerance) {
  if (geometry.type === 'MultiPolygon') {
    return {
      type: 'MultiPolygon',
      coordinates: geometry.coordinates.map(polygon =>
        polygon.map(ring => simplifyRing(ring, tolerance))
      ),
    };
  }
  if (geometry.type === 'Polygon') {
    return {
      type: 'Polygon',
      coordinates: geometry.coordinates.map(ring => simplifyRing(ring, tolerance)),
    };
  }
  return geometry;
}

// Simplify all features in provider GeoJSON (tolerance ~0.0005 ≈ 50m)
const SIMPLIFY_TOLERANCE = 0.0005;
for (const provider of Object.keys(providerGeoFeatures)) {
  providerGeoFeatures[provider].features = providerGeoFeatures[provider].features.map(f => ({
    ...f,
    geometry: simplifyGeometry(f.geometry, SIMPLIFY_TOLERANCE),
    properties: { Nombre: f.properties.Nombre },
  }));
}

// Write outputs
fs.writeFileSync(OUTPUT_BARRIOS, JSON.stringify(providerBarrios, null, 2));
fs.writeFileSync(OUTPUT_GEOJSON, JSON.stringify(providerGeoFeatures, null, 2));

// Also create a combined GeoJSON with provider info in properties
const combinedFeatures = [];
for (const [provider, data] of Object.entries(providerGeoFeatures)) {
  for (const feature of data.features) {
    combinedFeatures.push({
      ...feature,
      properties: {
        ...feature.properties,
        provider: provider,
      },
    });
  }
}
const combinedGeoJSON = { type: 'FeatureCollection', features: combinedFeatures };
const OUTPUT_COMBINED = path.join(__dirname, '..', 'src', 'data', 'barrios-combined.json');
fs.writeFileSync(OUTPUT_COMBINED, JSON.stringify(combinedGeoJSON));

console.log(`\nWrote ${OUTPUT_BARRIOS}`);
console.log(`Wrote ${OUTPUT_GEOJSON}`);
console.log(`Wrote ${OUTPUT_COMBINED}`);
console.log(`Combined GeoJSON: ${Math.round(fs.statSync(OUTPUT_COMBINED).size / 1024)}KB`);

// Also output a summary of total unique barrios matched
const allBarrios = new Set();
for (const barrios of Object.values(providerBarrios)) {
  for (const b of barrios) allBarrios.add(b);
}
console.log(`\nTotal unique barrios across all ISPs: ${allBarrios.size}`);
console.log(`Total GeoJSON features: ${geojson.features.length}`);
