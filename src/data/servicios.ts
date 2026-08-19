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
  // ── Personal Fibra (verificado: personal.com.ar/internet, ago 2026) ──
  // ASIMÉTRICO: subida NO publicada
  { id: 'personal-300', proveedor: 'Personal Fibra', plan: '300 Mbps', download: 300, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 27000, precioLista: 88160, instalacion: 0, promoMeses: 6, mesesGratis: 0, descuento: '70% OFF x6 meses', detalle: 'Subida no publicada (asimétrico). Instalación sin costo. Soporte 24/7.', cobertura: 'Amplia', atencionCl: '0800-199-7342', descripcion: 'Internet asimétrico.', destacado: false },
  { id: 'personal-300-flow', proveedor: 'Personal Fibra', plan: '300 + Flow', download: 300, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 39000, precioLista: 127800, instalacion: 0, promoMeses: 6, mesesGratis: 0, descuento: '70% OFF x6 meses', detalle: 'Incluye Flow Full (150+ canales). Subida no publicada. 2 pantallas simultáneas.', cobertura: 'Amplia', atencionCl: '0800-199-7342', descripcion: 'Internet + TV por Flow.', destacado: false },
  { id: 'personal-600', proveedor: 'Personal Fibra', plan: '600 Mbps', download: 600, upload: 'No publicada', tecnologia: 'FTTH', simetrico: false, precioDesc: 30000, precioLista: 103360, instalacion: 0, promoMeses: 6, mesesGratis: 0, descuento: '71% OFF x6 meses', detalle: 'Subida no publicada (asimétrico). Instalación sin costo. Soporte 24/7.', cobertura: 'Amplia', atencionCl: '0800-199-7342', descripcion: 'Internet asimétrico. Mayor velocidad.', destacado: true },

  // ── Claro (verificado: claro.com.ar + claroplanes.ar + distribuidor oficial Córdoba, ago 2026) ──
  // SIMÉTRICO: 200, 500 y 800 MB son simétricos (subida = bajada)
  // Incluye línea fija con 4000 min. 1 mes gratis. Disney+ y Prime Video 1 mes gratis.
  { id: 'claro-200', proveedor: 'Claro', plan: 'Fibra 200', download: 200, upload: '200 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 18999, precioLista: 55289, instalacion: 0, promoMeses: 11, mesesGratis: 1, descuento: '1 mes gratis + descuento x11 meses', detalle: 'SIMÉTRICO. Incluye línea fija (4000 min). 1 mes gratis. Disney+ y Prime Video 1 mes gratis.', cobertura: 'Anillo urbano', atencionCl: '0800-122-1000', descripcion: 'Fibra simétrica + línea fija.', destacado: false },
  { id: 'claro-500', proveedor: 'Claro', plan: 'Fibra 500', download: 500, upload: '500 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 21999, precioLista: 65289, instalacion: 0, promoMeses: 11, mesesGratis: 1, descuento: '1 mes gratis + descuento x11 meses', detalle: 'SIMÉTRICO. Incluye línea fija (4000 min). 1 mes gratis. Disney+ y Prime Video 1 mes gratis.', cobertura: 'Anillo urbano', atencionCl: '0800-122-1000', descripcion: 'Fibra simétrica + línea fija.', destacado: false },
  { id: 'claro-800', proveedor: 'Claro', plan: 'Fibra 800', download: 800, upload: '800 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 26999, precioLista: 70759, instalacion: 0, promoMeses: 11, mesesGratis: 1, descuento: '1 mes gratis + descuento x11 meses', detalle: 'SIMÉTRICO. Incluye línea fija (4000 min). 1 mes gratis. Disney+ y Prime Video 1 mes gratis.', cobertura: 'Anillo urbano', atencionCl: '0800-122-1000', descripcion: 'Fibra simétrica + línea fija. Mayor velocidad.', destacado: true },

  // ── IPLAN (verificado: iplan.com.ar/hogar + selectra + speedtest.net.ar, ago 2026) ──
  // SIMÉTRICO: 100% fibra FTTH red propia. Precios: consultar dirección (requiere cobertura)
  { id: 'iplan-500', proveedor: 'IPLAN', plan: '500 Megas', download: 500, upload: '500 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 0, precioLista: 0, instalacion: 0, promoMeses: 12, mesesGratis: 1, descuento: '1er mes gratis + descuento x11 meses', detalle: 'SIMÉTRICO. Solo Centro. WiFi 6. Primer mes bonificado. Precio: consultar por dirección.', cobertura: 'Centro/Nueva Córdoba', atencionCl: 'WhatsApp +54 11 5032-0000', descripcion: 'Fibra 100% simétrica. Red propia.', destacado: false },
  { id: 'iplan-800', proveedor: 'IPLAN', plan: '800 Megas', download: 800, upload: '800 Mbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 0, precioLista: 0, instalacion: 0, promoMeses: 12, mesesGratis: 1, descuento: '1er mes gratis + descuento x11 meses', detalle: 'SIMÉTRICO. Solo Centro. WiFi 6. Primer mes bonificado. Precio: consultar por dirección.', cobertura: 'Centro/Nueva Córdoba', atencionCl: 'WhatsApp +54 11 5032-0000', descripcion: 'Fibra 100% simétrica. Red propia. Plan más elegido.', destacado: false },
  { id: 'iplan-1000', proveedor: 'IPLAN', plan: '1.000 Megas', download: 1000, upload: '1 Gbps', tecnologia: 'FTTH', simetrico: true, precioDesc: 0, precioLista: 0, instalacion: 0, promoMeses: 12, mesesGratis: 1, descuento: 'Nuevo lanzamiento', detalle: 'SIMÉTRICO. Solo Centro. WiFi 6. Velocidad ilimitada. Precio: consultar por dirección.', cobertura: 'Centro/Nueva Córdoba', atencionCl: 'WhatsApp +54 11 5032-0000', descripcion: 'Fibra 100% simétrica. Red propia. Plan máximo.', destacado: true },

  // ── Internet Córdoba (verificado: internetcordoba.com.ar, ago 2026) ──
  // ASIMÉTRICO. Precio fijo, sin promociones temporales.
  { id: 'icba-100', proveedor: 'Internet Córdoba', plan: '100 Megas', download: 100, upload: '30 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 24100, precioLista: 24100, instalacion: 0, promoMeses: 0, mesesGratis: 0, descuento: 'Precio fijo', detalle: '73 barrios. WiFi 2.4/5 GHz incluido. Sin sorpresas, precio fijo.', cobertura: '73 barrios', atencionCl: '0800-345-5858', descripcion: 'ISP local. Precio fijo sin promociones.', destacado: false },
  { id: 'icba-150', proveedor: 'Internet Córdoba', plan: '150 Megas', download: 150, upload: '40 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 25400, precioLista: 25400, instalacion: 0, promoMeses: 0, mesesGratis: 0, descuento: 'Precio fijo', detalle: '73 barrios. WiFi 2.4/5 GHz incluido. Sin sorpresas, precio fijo.', cobertura: '73 barrios', atencionCl: '0800-345-5858', descripcion: 'ISP local. Plan intermedio.', destacado: false },
  { id: 'icba-300', proveedor: 'Internet Córdoba', plan: '300 Megas', download: 300, upload: '60 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 26800, precioLista: 26800, instalacion: 0, promoMeses: 0, mesesGratis: 0, descuento: 'Precio fijo', detalle: '73 barrios. WiFi 2.4/5 GHz incluido. Sin sorpresas, precio fijo.', cobertura: '73 barrios', atencionCl: '0800-345-5858', descripcion: 'ISP local. Mayor velocidad.', destacado: true },

  // ── Batcom (verificado: batcom.com.ar/batcom-masivo, ago 2026) ──
  // ASIMÉTRICO. 1er mes 100% bonificado + 20% OFF x12 meses.
  { id: 'batcom-100', proveedor: 'Batcom', plan: '100 Mbps', download: 100, upload: '50 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 37200, precioLista: 46500, instalacion: 0, promoMeses: 12, mesesGratis: 1, descuento: '1er mes gratis + 20% OFF x12 meses', detalle: '1er mes bonificado. WiFi de cortesía. Equipos en comodato. Instalación bonificada.', cobertura: 'Norte/Noroeste', atencionCl: 'WhatsApp 351-222-0960', descripcion: 'ISP local. Cobertura norte y noroeste.', destacado: false },
  { id: 'batcom-300', proveedor: 'Batcom', plan: '300 Mbps', download: 300, upload: '150 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 41520, precioLista: 51900, instalacion: 0, promoMeses: 12, mesesGratis: 1, descuento: '1er mes gratis + 20% OFF x12 meses', detalle: '1er mes bonificado. WiFi de cortesía. Equipos en comodato. Instalación bonificada.', cobertura: 'Norte/Noroeste', atencionCl: 'WhatsApp 351-222-0960', descripcion: 'ISP local. Cobertura norte y noroeste.', destacado: false },
  { id: 'batcom-500', proveedor: 'Batcom', plan: '500 Mbps', download: 500, upload: '250 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 47680, precioLista: 59600, instalacion: 0, promoMeses: 12, mesesGratis: 1, descuento: '1er mes gratis + 20% OFF x12 meses', detalle: '1er mes bonificado. WiFi de cortesía. Equipos en comodato. Instalación bonificada.', cobertura: 'Norte/Noroeste', atencionCl: 'WhatsApp 351-222-0960', descripcion: 'ISP local. Mayor velocidad.', destacado: true },

  // ── Guabi (verificado: guabi.com.ar/internet, ago 2026) ──
  // ASIMÉTRICO. Zona Sur exclusivamente. 35% OFF x6 meses.
  // Planes Residenciales Standard
  { id: 'guabi-100', proveedor: 'Guabi', plan: '100 Mbps', download: 100, upload: '50 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 23940, precioLista: 36830, instalacion: 0, promoMeses: 6, mesesGratis: 0, descuento: '35% OFF x6 meses', detalle: 'Zona Sur exclusivamente. Prioridad de tráfico: Media. Verificar dirección.', cobertura: 'Zona Sur', atencionCl: 'WhatsApp 351-366-7959', descripcion: 'ISP local. Zona Sur exclusivamente.', destacado: false },
  { id: 'guabi-300', proveedor: 'Guabi', plan: '300 Mbps', download: 300, upload: '100 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 31707, precioLista: 48780, instalacion: 0, promoMeses: 6, mesesGratis: 0, descuento: '35% OFF x6 meses', detalle: 'Zona Sur exclusivamente. Más vendido. Prioridad de tráfico: Media.', cobertura: 'Zona Sur', atencionCl: 'WhatsApp 351-366-7959', descripcion: 'ISP local. Zona Sur exclusivamente.', destacado: false },
  { id: 'guabi-600', proveedor: 'Guabi', plan: '600 Mbps', download: 600, upload: '200 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 35750, precioLista: 55000, instalacion: 0, promoMeses: 6, mesesGratis: 0, descuento: '35% OFF x6 meses', detalle: 'Zona Sur exclusivamente. Mayor velocidad. Prioridad de tráfico: Media.', cobertura: 'Zona Sur', atencionCl: 'WhatsApp 351-366-7959', descripcion: 'ISP local. Zona Sur exclusivamente.', destacado: true },
  // Planes Residenciales HomeOffice
  { id: 'guabi-150-ho', proveedor: 'Guabi', plan: '150 HO', download: 150, upload: '75 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 32780, precioLista: 50430, instalacion: 0, promoMeses: 6, mesesGratis: 0, descuento: '35% OFF x6 meses', detalle: 'Zona Sur. HomeOffice. Prioridad de tráfico: Media Alta.', cobertura: 'Zona Sur', atencionCl: 'WhatsApp 351-366-7959', descripcion: 'ISP local. Plan HomeOffice.', destacado: false },
  { id: 'guabi-300-ho', proveedor: 'Guabi', plan: '300 HO', download: 300, upload: '150 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 38259, precioLista: 58860, instalacion: 0, promoMeses: 6, mesesGratis: 0, descuento: '35% OFF x6 meses', detalle: 'Zona Sur. HomeOffice. Prioridad de tráfico: Media Alta.', cobertura: 'Zona Sur', atencionCl: 'WhatsApp 351-366-7959', descripcion: 'ISP local. Plan HomeOffice.', destacado: false },
  { id: 'guabi-600-ho', proveedor: 'Guabi', plan: '600 HO', download: 600, upload: '300 Mbps', tecnologia: 'FTTH', simetrico: false, precioDesc: 43550, precioLista: 67000, instalacion: 0, promoMeses: 6, mesesGratis: 0, descuento: '35% OFF x6 meses', detalle: 'Zona Sur. HomeOffice. Prioridad de tráfico: Media Alta.', cobertura: 'Zona Sur', atencionCl: 'WhatsApp 351-366-7959', descripcion: 'ISP local. Plan HomeOffice. Mayor velocidad.', destacado: false },
];

export const proveedores = [
  'Personal Fibra',
  'Claro',
  'IPLAN',
  'Internet Córdoba',
  'Batcom',
  'Guabi',
];

export const fmt = (n: number) => n ? `$${n.toLocaleString('es-AR')}` : 'Consultar';
