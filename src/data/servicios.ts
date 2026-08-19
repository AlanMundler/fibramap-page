export interface Servicio {
  id: string;
  proveedor: string;
  plan: string;
  download: number;
  upload: string;
  tecnologia: string;
  simetrico: boolean;
  precioDesc: number;
  precioLista: number;
  instalacion: number;
  promoMeses: number;
  mesesGratis: number;
  descuento: string;
  detalle: string;
  cobertura: string;
  atencionCl: string;
  descripcion: string;
  destacado: boolean;
}

export const servicios: Servicio[] = [
  // ── Personal Fibra (verificados: phontel, selectra, speedtest.net.ar) ──
  // ASIMÉTRICO: subida NO publicada, suele ser menor que bajada
  { id: 'personal-300', proveedor: 'Personal Fibra', plan: '300 Mbps', download: 300, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 26000, precioLista: 86610, instalacion: 0, promoMeses: 6, mesesGratis: 0, descuento: '74% OFF x6 meses', detalle: 'WiFi Backup y Video Pass incluidos. Subida no publicada (asimétrico).', cobertura: 'Amplia', atencionCl: '0800-444-0800', descripcion: 'Internet asimétrico (subida menor). Soporte 24/7.', destacado: false },
  { id: 'personal-300-flow', proveedor: 'Personal Fibra', plan: '300 + Flow', download: 300, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 36000, precioLista: 125480, instalacion: 0, promoMeses: 6, mesesGratis: 0, descuento: '76% OFF x6 meses', detalle: 'Incluye Flow Full (150+ canales). Subida no publicada.', cobertura: 'Amplia', atencionCl: '0800-444-0800', descripcion: 'Internet + TV por Flow. 2 pantallas simultáneas.', destacado: false },
  { id: 'personal-600', proveedor: 'Personal Fibra', plan: '600 Mbps', download: 600, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 31000, precioLista: 101540, instalacion: 0, promoMeses: 6, mesesGratis: 0, descuento: '70% OFF x6 meses', detalle: 'Internet Backup incluido. Subida no publicada (asimétrico).', cobertura: 'Amplia', atencionCl: '0800-444-0800', descripcion: 'Internet asimétrico (subida menor). Internet Backup.', destacado: true },

  // ── Claro (verificados: distribuidor oficial, internetwifi.com.ar, selectra) ──
  // SIMÉTRICO: 200, 500 y 800 MB son simétricos (subida = bajada)
  { id: 'claro-200', proveedor: 'Claro', plan: 'Fibra 200', download: 200, upload: '200 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 18999, precioLista: 63330, instalacion: 0, promoMeses: 5, mesesGratis: 1, descuento: '70% OFF x5 meses + 1 gratis', detalle: 'SIMÉTRICO. 64+ barrios. Instalación bonificada.', cobertura: '64+ barrios', atencionCl: '0800-123-5555', descripcion: 'Fibra simétrica. Mayor cobertura: 64+ barrios.', destacado: false },
  { id: 'claro-500', proveedor: 'Claro', plan: 'Fibra 500', download: 500, upload: '500 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 21999, precioLista: 73330, instalacion: 0, promoMeses: 5, mesesGratis: 1, descuento: '70% OFF x5 meses + 1 gratis', detalle: 'SIMÉTRICO. 64+ barrios. Instalación bonificada.', cobertura: '64+ barrios', atencionCl: '0800-123-5555', descripcion: 'Fibra simétrica. Mayor cobertura: 64+ barrios.', destacado: false },
  { id: 'claro-800', proveedor: 'Claro', plan: 'Fibra 800', download: 800, upload: '800 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 26999, precioLista: 89997, instalacion: 0, promoMeses: 5, mesesGratis: 1, descuento: '70% OFF x5 meses + 1 gratis', detalle: 'SIMÉTRICO. 64+ barrios. Mejor precio/velocidad.', cobertura: '64+ barrios', atencionCl: '0800-123-5555', descripcion: 'Fibra simétrica. Mayor cobertura.', destacado: true },

  // ── IPLAN (verificados: iplan.com.ar, selectra, speedtest.net.ar) ──
  // SIMÉTRICO: 100% fibra FTTH con red propia, subida = bajada
  { id: 'iplan-500', proveedor: 'IPLAN', plan: '500 Megas', download: 500, upload: '500 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 0, precioLista: 0, instalacion: 0, promoMeses: 12, mesesGratis: 0, descuento: '44% OFF x12 meses', detalle: 'SIMÉTRICO. Solo Centro. WiFi 6. Precio: consultar WhatsApp.', cobertura: 'Centro/Nueva Córdoba', atencionCl: 'WhatsApp +54 11 5032-0000', descripcion: 'Fibra 100% simétrica. Red propia. Referente de calidad.', destacado: false },
  { id: 'iplan-800', proveedor: 'IPLAN', plan: '800 Megas', download: 800, upload: '800 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 0, precioLista: 0, instalacion: 0, promoMeses: 12, mesesGratis: 0, descuento: '44% OFF x12 meses', detalle: 'SIMÉTRICO. Solo Centro. WiFi 6. Precio: consultar WhatsApp.', cobertura: 'Centro/Nueva Córdoba', atencionCl: 'WhatsApp +54 11 5032-0000', descripcion: 'Fibra 100% simétrica. Red propia. Plan más elegido.', destacado: false },
  { id: 'iplan-1000', proveedor: 'IPLAN', plan: '1.000 Megas', download: 1000, upload: '1 Gbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 0, precioLista: 0, instalacion: 0, promoMeses: 12, mesesGratis: 0, descuento: '44% OFF x12 meses', detalle: 'SIMÉTRICO. Solo Centro. WiFi 6. Precio: consultar WhatsApp.', cobertura: 'Centro/Nueva Córdoba', atencionCl: 'WhatsApp +54 11 5032-0000', descripcion: 'Fibra 100% simétrica. Red propia. Plan máximo.', destacado: true },

  // ── Internet Córdoba (verificados: internetcordoba.com.ar) ──
  { id: 'icba-100', proveedor: 'Internet Córdoba', plan: '100 Megas', download: 100, upload: '30 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 24100, precioLista: 24100, instalacion: 0, promoMeses: 0, mesesGratis: 0, descuento: 'Precio fijo', detalle: '67 barrios. WiFi 2.4/5 GHz incluido.', cobertura: '67 barrios', atencionCl: '0800-345-5858', descripcion: 'ISP local. Cobertura amplia.', destacado: false },
  { id: 'icba-150', proveedor: 'Internet Córdoba', plan: '150 Megas', download: 150, upload: '40 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 25400, precioLista: 25400, instalacion: 0, promoMeses: 0, mesesGratis: 0, descuento: 'Precio fijo', detalle: '67 barrios. WiFi 2.4/5 GHz incluido.', cobertura: '67 barrios', atencionCl: '0800-345-5858', descripcion: 'ISP local. Plan intermedio.', destacado: false },
  { id: 'icba-300', proveedor: 'Internet Córdoba', plan: '300 Megas', download: 300, upload: '60 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 26800, precioLista: 26800, instalacion: 0, promoMeses: 0, mesesGratis: 0, descuento: 'Precio fijo', detalle: '67 barrios. WiFi 2.4/5 GHz incluido.', cobertura: '67 barrios', atencionCl: '0800-345-5858', descripcion: 'ISP local. Mayor velocidad.', destacado: true },

  // ── Batcom (verificados: batcom.com.ar) ──
  { id: 'batcom-100', proveedor: 'Batcom', plan: '100 Mbps', download: 100, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 36400, precioLista: 45500, instalacion: 0, promoMeses: 12, mesesGratis: 0, descuento: '20% OFF x12 meses', detalle: '1er mes bonificado. WiFi de cortesía. Equipos comodato.', cobertura: 'Norte/Noroeste', atencionCl: 'WhatsApp 351-222-0960', descripcion: 'Cobertura: 50+ barrios norte y noroeste.', destacado: false },
  { id: 'batcom-300', proveedor: 'Batcom', plan: '300 Mbps', download: 300, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 40640, precioLista: 50800, instalacion: 0, promoMeses: 12, mesesGratis: 0, descuento: '20% OFF x12 meses', detalle: '1er mes bonificado. WiFi de cortesía. Equipos comodato.', cobertura: 'Norte/Noroeste', atencionCl: 'WhatsApp 351-222-0960', descripcion: 'Cobertura: 50+ barrios norte y noroeste.', destacado: false },
  { id: 'batcom-500', proveedor: 'Batcom', plan: '500 Mbps', download: 500, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 45280, precioLista: 58300, instalacion: 0, promoMeses: 12, mesesGratis: 0, descuento: '20% OFF x12 meses', detalle: '1er mes bonificado. WiFi de cortesía. Equipos comodato.', cobertura: 'Norte/Noroeste', atencionCl: 'WhatsApp 351-222-0960', descripcion: 'Cobertura: 50+ barrios norte y noroeste. Mayor velocidad.', destacado: true },

  // ── Guabi (verificados: guabi.com.ar, Instagram, Reddit) ──
  // Exclusivamente ZONA SUR
  { id: 'guabi-100', proveedor: 'Guabi', plan: '100 Mbps', download: 100, upload: '50 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 23940, precioLista: 36830, instalacion: 0, promoMeses: 6, mesesGratis: 0, descuento: '35% OFF x6 meses', detalle: 'Zona Sur exclusivamente. Verificar dirección.', cobertura: 'Zona Sur', atencionCl: 'WhatsApp 351-366-7959', descripcion: 'ISP local. Zona Sur exclusivamente.', destacado: false },
  { id: 'guabi-300', proveedor: 'Guabi', plan: '300 Mbps', download: 300, upload: '100 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 31707, precioLista: 48780, instalacion: 0, promoMeses: 6, mesesGratis: 0, descuento: '35% OFF x6 meses', detalle: 'Zona Sur exclusivamente. Más vendido.', cobertura: 'Zona Sur', atencionCl: 'WhatsApp 351-366-7959', descripcion: 'ISP local. Zona Sur exclusivamente.', destacado: false },
  { id: 'guabi-600', proveedor: 'Guabi', plan: '600 Mbps', download: 600, upload: '200 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 35750, precioLista: 55000, instalacion: 0, promoMeses: 6, mesesGratis: 0, descuento: '35% OFF x6 meses', detalle: 'Zona Sur exclusivamente. Mayor velocidad.', cobertura: 'Zona Sur', atencionCl: 'WhatsApp 351-366-7959', descripcion: 'ISP local. Zona Sur exclusivamente.', destacado: true },

  // ── Krillcom (verificados: krillcom.com.ar) ──
  // Inalámbrico, NO fibra
  { id: 'krill-50', proveedor: 'Krillcom', plan: '50 Mbps', download: 50, upload: '10 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 29900, precioLista: 36200, instalacion: 70000, promoMeses: 0, mesesGratis: 0, descuento: 'Con IVA', detalle: 'Router no incluido. Inalámbrico.', cobertura: 'Periférico', atencionCl: 'Consultar', descripcion: 'ISP local. Inalámbrico (no fibra).', destacado: false },
  { id: 'krill-100', proveedor: 'Krillcom', plan: '100/50 + TV', download: 100, upload: '50 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 56700, precioLista: 56700, instalacion: 70000, promoMeses: 0, mesesGratis: 0, descuento: 'Con IVA', detalle: 'Incluye TV. Router Wi-Fi: $75.000 aparte.', cobertura: 'Periférico', atencionCl: 'Consultar', descripcion: 'ISP local. Plan con TV incluida.', destacado: false },

  // ── MetroWL ─────────────────────────────────────────────────
  { id: 'metro-50', proveedor: 'MetroWL', plan: '50 Mbps', download: 50, upload: 'No informado', tecnologia: 'FTTH/GPON', simetrico: false, precioDesc: 0, precioLista: 0, instalacion: 0, promoMeses: 0, mesesGratis: 0, descuento: '', detalle: 'FTTH confirmado. Equipos Huawei/ZTE. Router Wi-Fi 6 opcional.', cobertura: 'No informado', atencionCl: 'Consultar', descripcion: 'ISP local. Precios y cobertura no informados.', destacado: false },
  { id: 'metro-100', proveedor: 'MetroWL', plan: '100 Mbps', download: 100, upload: 'No informado', tecnologia: 'FTTH/GPON', simetrico: false, precioDesc: 0, precioLista: 0, instalacion: 0, promoMeses: 0, mesesGratis: 0, descuento: '', detalle: 'FTTH confirmado. Latencia <5ms anunciada.', cobertura: 'No informado', atencionCl: 'Consultar', descripcion: 'ISP local. Precios y cobertura no informados.', destacado: false },
  { id: 'metro-300', proveedor: 'MetroWL', plan: '300 Mbps', download: 300, upload: 'No informado', tecnologia: 'FTTH/GPON', simetrico: false, precioDesc: 0, precioLista: 0, instalacion: 0, promoMeses: 0, mesesGratis: 0, descuento: '', detalle: 'FTTH confirmado. Velocidad máxima del catálogo.', cobertura: 'No informado', atencionCl: 'Consultar', descripcion: 'ISP local. Precios y cobertura no informados.', destacado: false },

  // ── Trimotion ───────────────────────────────────────────────
  { id: 'trimo-100', proveedor: 'Trimotion', plan: '100 Mbps', download: 100, upload: 'No informado', tecnologia: 'FTTH', simetrico: false, precioDesc: 28900, precioLista: 28900, instalacion: 70000, promoMeses: 0, mesesGratis: 0, descuento: 'Precios julio 2026', detalle: 'Precio agosto NO CONFIRMADO. Verificar vigencia.', cobertura: 'Variable', atencionCl: 'Consultar', descripcion: 'ISP local. Precios sujetos a confirmación.', destacado: false },
  { id: 'trimo-200', proveedor: 'Trimotion', plan: '200 Mbps', download: 200, upload: 'No informado', tecnologia: 'FTTH', simetrico: false, precioDesc: 31900, precioLista: 31900, instalacion: 70000, promoMeses: 0, mesesGratis: 0, descuento: 'Precios julio 2026', detalle: 'Precio agosto NO CONFIRMADO.', cobertura: 'Variable', atencionCl: 'Consultar', descripcion: 'ISP local. Precios sujetos a confirmación.', destacado: false },
  { id: 'trimo-300', proveedor: 'Trimotion', plan: '300 Mbps', download: 300, upload: 'No informado', tecnologia: 'FTTH', simetrico: false, precioDesc: 34900, precioLista: 34900, instalacion: 70000, promoMeses: 0, mesesGratis: 0, descuento: 'Precios julio 2026', detalle: 'Precio agosto NO CONFIRMADO.', cobertura: 'Variable', atencionCl: 'Consultar', descripcion: 'ISP local. Precios sujetos a confirmación.', destacado: false },
];

export const proveedores = [
  'Personal Fibra',
  'Claro',
  'IPLAN',
  'Internet Córdoba',
  'Batcom',
  'Guabi',
  'Krillcom',
  'MetroWL',
  'Trimotion',
];

export const fmt = (n: number) => n ? `$${n.toLocaleString('es-AR')}` : 'Consultar';
export const fmtStr = (n: number) => n ? `$${n.toLocaleString('es-AR')}` : 'Consultar';
