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
    north: -31.412, south: -31.435, west: -64.200, east: -64.170,
    // Centro/Nueva Córdoba only - very tight
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
    north: -31.445, south: -31.480, west: -64.225, east: -64.175,
    // Zona Sur - tighter bounds
  },
};

// Known barrio names per ISP (from research / distributor pages)
const KNOWN_BARRIOS = {
  'Claro': [
    'NUEVA CORDOBA', 'CERRO DE LAS ROSAS', 'ALBERDI', 'ALTA CORDOBA',
    'COFICO', 'GENERAL BUSTOS', 'CERRO NORTE', 'PROVIDENCIA', 'MULLER',
    'COLON', 'EMPALME', 'PARQUE SARMIENTO', 'PARQUE TABLADA', 'COMERCIAL',
    'GENERAL PAZ', 'CENTRO', 'PATRICIOS', 'SAN FRANCISCO', 'GUAYAQUIL',
    'MERCANTIL', 'TALLERES (E)', 'SARMIENTO', 'GENERAL PUEYRREDON',
    'GUEMES', 'SAN MARTIN', 'ALMIRANTE BROWN', 'GUIÑAZU', 'BOEDO',
    'PANAMERICANO', 'GRANADERO PRINGLES', 'FERREYRA', 'JARDIN',
    'CIUDADELA', 'SANTA RITA', 'RIVADAVIA', 'SAN VICENTE', 'URCA',
    'GENERAL BELGRANO', 'EL BOSQUE', 'LAS DELICIAS', 'LAS ROSAS',
    'YOFRE H', 'YOFRE I', 'YOFRE SUD', 'RESIDENCIAL SAN ROQUE',
    'LOS ALAMOS', 'LOS FILTROS', 'VILLA ARGENTINA', 'VILLA EL LIBERTADOR',
    'VILLA ALBERDI', 'VILLA CORONEL OLMEDO', 'VILLA AVALOS',
    'OÑA', '25 DE MAYO', 'INDEPENDENCIA', 'SANTA ISABEL 1A SECCION',
    'SANTA ISABEL 2A SECCION', 'SANTA ISABEL 3A SECCION',
    'GRANJA DE FUNES', 'OBSERVATORIO', 'COLONIA LOLA',
    'VILLA SIBURU', 'VILLA ALLENDE PARQUE',
  ],
  'Personal Fibra': [
    'NUEVA CORDOBA', 'GENERAL PAZ', 'ALBERDI', 'ALTA CORDOBA',
    'CENTRO', 'PATRICIOS', 'SAN FRANCISCO', 'GUAYAQUIL',
    'MERCANTIL', 'TALLERES (E)', 'SARMIENTO', 'SAN MARTIN',
    'GUEMES', 'CIUDADELA', 'SANTA RITA', 'RIVADAVIA',
    'BOEDO', 'PANAMERICANO', 'GRANADERO PRINGLES', 'FERREYRA',
    'JARDIN', 'SAN VICENTE', 'URCA', 'EL BOSQUE',
    'LAS DELICIAS', 'LAS ROSAS', 'YOFRE H', 'YOFRE I',
    'VILLA ARGENTINA', 'VILLA EL LIBERTADOR', 'VILLA ALBERDI',
    'OÑA', '25 DE MAYO', 'INDEPENDENCIA', 'GENERAL BELGRANO',
    'ALMIRANTE BROWN', 'GUIÑAZU', 'COLON', 'EMPALME',
    'COFICO', 'GENERAL BUSTOS', 'PROVIDENCIA', 'MULLER',
    'CERRO DE LAS ROSAS', 'CERRO NORTE', 'PARQUE SARMIENTO',
    'PARQUE TABLADA', 'COMERCIAL', 'GENERAL PUEYRREDON',
    'PARQUE CHATEAU CARRERAS', 'RESIDENCIAL SAN ROQUE',
    'VILLA CORONEL OLMEDO', 'VILLA AVALOS', 'VILLA REY',
    'PARQUE LATINO', 'SAN RAMON', 'SAN NICOLAS',
    'LOMAS DE SAN MARTIN', 'ALTOS SAN MARTIN',
    'PARQUE DEL ESTE', 'PARQUE DON BOSCO',
  ],
  'IPLAN': [
    'NUEVA CORDOBA', 'NUEVA CORDOBA ANEXA', 'CENTRO',
    'SAN FRANCISCO', 'GUAYAQUIL', 'MERCANTIL',
    'GENERAL PAZ', 'PATRICIOS', 'ALBERDI',
    'SARMIENTO', 'SAN MARTIN', 'RIVADAVIA',
    'OÑA', '25 DE MAYO', 'INDEPENDENCIA',
    'SAN VICENTE', 'CIUDADELA', 'BOEDO',
    'CONGRESO', 'AYACUCHO', 'DEAN FUNES',
    'JERONIMO LUIS DE CABRERA', 'ALTA CORDOBA',
  ],
  'Internet Córdoba': [
    'NUEVA CORDOBA', 'GENERAL PAZ', 'ALBERDI', 'ALTA CORDOBA',
    'CENTRO', 'PATRICIOS', 'COFICO', 'CERRO DE LAS ROSAS',
    'CERRO NORTE', 'PROVIDENCIA', 'MULLER', 'COLON', 'EMPALME',
    'SAN FRANCISCO', 'GUAYAQUIL', 'MERCANTIL', 'TALLERES (E)',
    'SARMIENTO', 'SAN MARTIN', 'GUEMES', 'CIUDADELA',
    'SANTA RITA', 'RIVADAVIA', 'BOEDO', 'PANAMERICANO',
    'FERREYRA', 'JARDIN', 'SAN VICENTE', 'URCA',
    'EL BOSQUE', 'LAS DELICIAS', 'GENERAL BELGRANO',
    'ALMIRANTE BROWN', 'GUIÑAZU', 'OÑA', '25 DE MAYO',
    'INDEPENDENCIA', 'VILLA ARGENTINA', 'VILLA EL LIBERTADOR',
    'VILLA ALBERDI', 'VILLA CORONEL OLMEDO', 'VILLA AVALOS',
    'YOFRE H', 'YOFRE I', 'YOFRE SUD',
    'GENERAL BUSTOS', 'GENERAL PUEYRREDON', 'GRANADERO PRINGLES',
    'PARQUE SARMIENTO', 'PARQUE TABLADA', 'COMERCIAL',
    'RESIDENCIAL SAN ROQUE', 'RESIDENCIAL SAN CARLOS',
    'LOS ALAMOS', 'LOS FILTROS',
    'VILLA SIBURU', 'GRANJA DE FUNES', 'OBSERVATORIO',
    'PARQUE CHATEAU CARRERAS', 'SAN RAMON', 'SAN NICOLAS',
    'LOMAS DE SAN MARTIN', 'ALTOS SAN MARTIN',
    'PARQUE DEL ESTE', 'PARQUE DON BOSCO',
    'CHATEAU CARRERAS', 'PARQUE LATINO',
    'VILLA BUSTOS', 'VILLA CORINA', 'VILLA PAEZ',
    'LAS MAGNOLIAS', 'LAS LILAS',
  ],
  'Batcom': [
    'ALTA CORDOBA', 'ALTO PALERMO', 'ALTO VERDE',
    'ALTOS SAN MARTIN', 'AMANCAES', 'ARGUELLO', 'ARGUELLO NORTE',
    'BELLA VISTA', 'BELLA VISTA OESTE', 'CERRO NORTE',
    'CIUDAD DE JUAN PABLO II', 'COLINAS DE BELLA VISTA',
    'CRISOL NORTE', 'GENERAL ARTIGAS', 'HORIZONTE',
    'JARDIN ESPINOSA', 'JUAN XXIII', 'LOS ALAMOS',
    'LOS EUCALIPTUS', 'LOS FILTROS', 'LOS GIGANTES',
    'LOS GRANADOS', 'LOS NARANJOS', 'LOS PARAISOS',
    'LOS PINOS', 'LOS PLATANOS', 'LOS ROBLES',
    'LOS SAUCES', 'MANANTIALES', 'MIRADOR DEL CHATEAU',
    'PARQUE ALAMEDA', 'PARQUE CAPITAL', 'PARQUE CAPITAL SUR',
    'PARQUE FUTURA', 'PARQUE JORGE NEWBERY',
    'QUEBRADA DE LAS ROSAS', 'RECREO DEL NORTE',
    'RESIDENCIAL SAN JORGE', 'SAN DANIEL', 'SAN PEDRO NOLASCO',
    'SIETE SOLES', 'VILLA ALBERTO', 'VILLA ALBERTO ANEXO',
    'VILLA CLAUDINA', 'VILLA GRAN PARQUE', 'VILLA RETIRO',
    'VILLA RETIRO DE HORIZONTE', 'VILLA REVOL',
    'VILLA REVOL ANEXO', 'VIVERO NORTE',
    'YOFRE NORTE',
  ],
  'Guabi': [
    'ARGUELLO', 'ARGUELLO NORTE', 'BETANIA', 'CARRARA',
    'CARRARA DE HORIZONTE',
    'EL PUEBLITO', 'EL QUEBRACHAL', 'EL QUEBRACHO',
    'EL REFUGIO', 'EL TREBOL', 'EL VIEJO ALGARROBO',
    'HORIZONTE', 'JARDIN',
    'JARDIN DEL PILAR', 'JARDIN HIPODROMO',
    'KAIROS', 'LA CARBONADA', 'LA RESERVA',
    'LAS CAÑITAS', 'LAS DALIAS', 'LAS FLORES',
    'LAS HUERTILLAS', 'LAS VIOLETAS',
    'LOS ANGELES', 'LOS CEIBOS',
    'LOS FILTROS', 'LOS FRESNOS',
    'LOS HORNILLOS', 'LOS JACARANDAES', 'LOS OLMOS',
    'LOS OLMOS SUD', 'LOS PARAISOS', 'LOS PINOS',
    'LOS ROBLES', 'LOS SAUCES',
    'MANANTIALES', 'MANANTIALES II',
    'PASO DE LOS ANDES',
    'PUENTE BLANCO',
    'RESIDENCIAL AMERICA', 'RESIDENCIAL ARAGON',
    'RESIDENCIAL OLIVOS', 'RESIDENCIAL SUD',
    'RESIDENCIAL VELEZ SARSFIELD',
    'ROCIO DEL SUR', 'ROGELIO MARTINEZ', 'ROSEDAL',
    'SAN MARCELO', 'SAN RAFAEL', 'SAN SALVADOR',
    'SANTA ANA RESIDENCIAL', 'SANTA CECILIA',
    'SANTA CLARA DE ASIS', 'SANTA ROSA RESIDENCIAL',
    'SOLARES DE SANTA MARIA', 'TABLADA PARK',
    'TEJAS DE LA CANDELARIA', 'TEJAS DEL SUR',
    'VALLE CERCANO', 'VALLE DEL CERRO', 'VALLE ESCONDIDO',
    'VILLA CENTENARIO', 'VILLA CLARET', 'VILLA DERNA',
    'VILLA EUCARISTICA', 'VILLA GENERAL URQUIZA',
    'VILLA MAFEKIN', 'VILLA MARTA', 'VILLA MARTINEZ',
    'VILLA QUISQUIZACATE', 'VILLA SALDAN',
    'VILLA SAN CARLOS', 'VILLA SAN ISIDRO',
    'VILLA SERRANA', 'VILLA SILVANO FUNES',
    'VILLA SOLFERINO', 'VILLA WARCALDE', 'VILLA ZEPPELIN',
    'YAPEYU', 'QUEBRADA DE LAS ROSAS',
    'PORTAL DE CORDOBA', 'PORTAL DEL JACARANDA',
    'ALTOS DE VELEZ SARSFIELD', 'COLINAS DE VELEZ SARSFIELD',
    'PARQUE VELEZ SARSFIELD',
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
  const maxFromBounds = Math.ceil(knownNames.length * 0.15); // max 15% expansion
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
