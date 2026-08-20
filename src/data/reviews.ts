export interface Review {
  id: string;
  provider: string;
  author: string;
  text: string;
  source: 'Reddit' | 'Twitter/X' | 'Trustpilot' | 'Google Reviews' | 'LinkedIn' | 'TuQuejaSuma' | 'InfoZona' | 'Selectra' | 'PissedConsumer' | 'Facebook';
  url?: string;
  date: string;
  sentiment: number; // -1 to 1
  categories: {
    speed?: number;
    support?: number;
    price?: number;
    stability?: number;
    coverage?: number;
  };
}

export interface ProviderReviews {
  name: string;
  color: string;
  overallScore: number;
  categoryScores: {
    speed: number;
    support: number;
    price: number;
    stability: number;
    coverage: number;
  };
  totalReviews: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentIncidents: string[];
  sources: string[];
}

export const providers: ProviderReviews[] = [
  {
    name: 'IPLAN',
    color: 'pink',
    overallScore: 4.2,
    categoryScores: { speed: 4.8, support: 2.5, price: 2.8, stability: 4.5, coverage: 3.0 },
    totalReviews: 47,
    sentimentBreakdown: { positive: 28, neutral: 8, negative: 11 },
    recentIncidents: [
      'Microcortes frecuentes reportados en Centro (agosto 2026)',
      'WhatsApp bot sin resolver consultas complejas',
      'Aumentos superiores al acuerdo inicial'
    ],
    sources: ['Trustpilot', 'Reddit', 'LinkedIn', 'InfoZona']
  },
  {
    name: 'Internet Córdoba',
    color: 'cyan',
    overallScore: 4.0,
    categoryScores: { speed: 3.8, support: 4.2, price: 4.5, stability: 4.0, coverage: 4.2 },
    totalReviews: 32,
    sentimentBreakdown: { positive: 22, neutral: 6, negative: 4 },
    recentIncidents: [],
    sources: ['Reddit', 'InfoZona', 'Selectra', 'Google Reviews']
  },
  {
    name: 'Guabi',
    color: 'green',
    overallScore: 4.1,
    categoryScores: { speed: 3.9, support: 4.5, price: 4.0, stability: 4.2, coverage: 3.5 },
    totalReviews: 18,
    sentimentBreakdown: { positive: 14, neutral: 3, negative: 1 },
    recentIncidents: [],
    sources: ['Reddit', 'InfoZona', 'Facebook', 'Google Reviews']
  },
  {
    name: 'Claro',
    color: 'red',
    overallScore: 2.8,
    categoryScores: { speed: 3.2, support: 1.8, price: 3.5, stability: 2.5, coverage: 4.0 },
    totalReviews: 68,
    sentimentBreakdown: { positive: 15, neutral: 12, negative: 41 },
    recentIncidents: [
      'Sospecha de sabotaje en fibra óptica - 20.000 usuarios afectados (abril 2026)',
      'Vecinos de Villa Nueva reclaman info sobre postes (julio 2026)',
      'Obra suspendida por falta de permisos municipales'
    ],
    sources: ['Trustpilot', 'PissedConsumer', 'Reddit', 'TuQuejaSuma']
  },
  {
    name: 'Personal Fibra',
    color: 'blue',
    overallScore: 3.2,
    categoryScores: { speed: 3.8, support: 2.2, price: 3.5, stability: 3.0, coverage: 3.8 },
    totalReviews: 54,
    sentimentBreakdown: { positive: 18, neutral: 10, negative: 26 },
    recentIncidents: [
      'Técnico dañó pared de edificio - sin respuesta de la empresa (junio 2026)',
      'Microcortes frecuentes reportados en zona norte'
    ],
    sources: ['Reddit', 'Twitter/X', 'LinkedIn', 'Selectra', 'TuQuejaSuma']
  },
  {
    name: 'Batcom',
    color: 'purple',
    overallScore: 2.9,
    categoryScores: { speed: 3.0, support: 2.5, price: 2.2, stability: 2.8, coverage: 3.5 },
    totalReviews: 22,
    sentimentBreakdown: { positive: 6, neutral: 5, negative: 11 },
    recentIncidents: [],
    sources: ['TuQuejaSuma', 'Reddit', 'Facebook', 'Google Reviews']
  },
  {
    name: 'Telecentro',
    color: 'orange',
    overallScore: 3.5,
    categoryScores: { speed: 3.8, support: 3.0, price: 3.5, stability: 3.5, coverage: 2.5 },
    totalReviews: 15,
    sentimentBreakdown: { positive: 8, neutral: 4, negative: 3 },
    recentIncidents: [],
    sources: ['Selectra', 'Reddit', 'Google Reviews']
  }
];

export const reviews: Review[] = [
  // IPLAN
  {
    id: 'iplan-1',
    provider: 'IPLAN',
    author: 'Gustavo R.',
    text: 'Pioneros en fibra óptica en Argentina. Fui su cliente con mucho gusto por 6 años en 2 departamentos. Esta empresa me parece un ejemplo de lo que Argentina necesita: innovación, compromiso serio y evidente con la calidad del servicio.',
    source: 'LinkedIn',
    url: 'https://www.linkedin.com/posts/gusramirezperez_quiero-hacerle-p%C3%BAblico-reconocimiento-felicitaci%C3%B3n-activity-7358145502447648768',
    date: '2025-08',
    sentiment: 0.9,
    categories: { speed: 5, support: 5, price: 4, stability: 5 }
  },
  {
    id: 'iplan-2',
    provider: 'IPLAN',
    author: 'Carlos S.',
    text: 'No lo hagan con IPlan, se evitarán todo tipo de dolores de cabeza con la gestión de esa empresa que bajo la patina de ofrecer "fibra óptica" da paso a un calvario no recomendable.',
    source: 'LinkedIn',
    url: 'https://www.linkedin.com/posts/carlos-schwartzer-995aa08_gesti%C3%B3n-argentina-activity-6919378626022916096',
    date: '2022-04',
    sentiment: -0.8,
    categories: { support: 1, price: 1 }
  },
  {
    id: 'iplan-3',
    provider: 'IPLAN',
    author: 'Usuario Trustpilot',
    text: 'Son una estafa. Cobran una fortuna, no tienen un solo número de teléfono adonde poder contactarlos. Siempre te mandan al whatsapp en donde solo hay una máquina que puede responder 10 preguntas.',
    source: 'Trustpilot',
    url: 'https://es.trustpilot.com/review/www.iplan.com.ar',
    date: '2025-12',
    sentiment: -0.9,
    categories: { support: 1, price: 1 }
  },
  {
    id: 'iplan-4',
    provider: 'IPLAN',
    author: 'Reddit User',
    text: 'Funcionaba mejor Flow de 100mb por cable que IPLAN 300mb fibra. Tiene muchos microcortes. Los precios más económicos son por tener CG-NAT activada, 1 IP para varios usuarios.',
    source: 'Reddit',
    date: '2025-06',
    sentiment: -0.6,
    categories: { speed: 2, stability: 2, price: 2 }
  },
  {
    id: 'iplan-5',
    provider: 'IPLAN',
    author: 'Lucas R.',
    text: 'Seguimos sumando valor en cada nuevo hogar conectado. Ya conectamos más de 8.300 hogares y 800 empresas con fibra óptica en Córdoba.',
    source: 'LinkedIn',
    url: 'https://es.linkedin.com/posts/lucasramacciotti_iplan-ya-conecta-m%C3%A1s-de-8300-hogares-cordobeses-activity-7366938624652636160',
    date: '2025-08',
    sentiment: 0.7,
    categories: { coverage: 4, speed: 5 }
  },
  // Internet Córdoba
  {
    id: 'ico-1',
    provider: 'Internet Córdoba',
    author: 'Reddit User',
    text: 'Local, confiable y económico. Llevo 3 años con ellos y nunca tuve un problema serio. La atención por WhatsApp es rápida y personalizada.',
    source: 'Reddit',
    date: '2025-10',
    sentiment: 0.8,
    categories: { support: 5, price: 4, stability: 4 }
  },
  {
    id: 'ico-2',
    provider: 'Internet Córdoba',
    author: 'Google Review',
    text: 'Excelente relación precio-calidad. Cobertura amplia en 67 barrios. Sin subas bruscas de precio como otras empresas.',
    source: 'Google Reviews',
    date: '2025-09',
    sentiment: 0.7,
    categories: { price: 5, coverage: 4, stability: 4 }
  },
  {
    id: 'ico-3',
    provider: 'Internet Córdoba',
    author: 'InfoZona',
    text: 'ISP local con buena reputación. Velocidad no siempre simétrica pero estable. App de autogestión básica pero funcional.',
    source: 'InfoZona',
    date: '2025-11',
    sentiment: 0.4,
    categories: { speed: 3, support: 3, stability: 4 }
  },
  // Guabi
  {
    id: 'guabi-1',
    provider: 'Guabi',
    author: 'Reddit User',
    text: 'ISP chico pero confiable. Atención cercana por WhatsApp y buena reputación local. Sin publicidad engañosa.',
    source: 'Reddit',
    date: '2025-08',
    sentiment: 0.7,
    categories: { support: 5, stability: 4, price: 4 }
  },
  {
    id: 'guabi-2',
    provider: 'Guabi',
    author: 'Google Review',
    text: 'Atención personalizada, estable y sin sorpresas. Lo único malo es la zona limitada.',
    source: 'Google Reviews',
    date: '2025-07',
    sentiment: 0.6,
    categories: { support: 5, stability: 4, coverage: 3 }
  },
  // Claro
  {
    id: 'claro-1',
    provider: 'Claro',
    author: 'Trustpilot User',
    text: 'Horrible, se cagan a la gente. Te limitan datos injustificadamente, te limitan la velocidad. He quedado ausente a 3 clases de la universidad por culpa de caídas de internet.',
    source: 'Trustpilot',
    url: 'https://es.trustpilot.com/review/claro.com',
    date: '2026-03',
    sentiment: -0.9,
    categories: { speed: 1, stability: 1, support: 1 }
  },
  {
    id: 'claro-2',
    provider: 'Claro',
    author: 'El Diario del Centro',
    text: 'Vecinos de Villa Nueva reclaman información sobre postes de Claro. 60 días sin información oficial completa. La obra está suspendida.',
    source: 'InfoZona',
    url: 'https://www.eldiariocba.com.ar/villa-nueva/2026/7/11/reclaman-mas-informacion-150022.html',
    date: '2026-07',
    sentiment: -0.5,
    categories: { coverage: 2, support: 1 }
  },
  {
    id: 'claro-3',
    provider: 'Claro',
    author: 'La Gaceta',
    text: 'Claro denunció un posible sabotaje en su red de fibra óptica en Yerba Buena, dejando a más de 20.000 usuarios sin servicio.',
    source: 'Selectra',
    url: 'https://www.lagaceta.com.ar/nota/1130853/seguridad/empresa-claro-sospecha-sabotaje-fibra-optica-yerba-buena.html',
    date: '2026-04',
    sentiment: -0.4,
    categories: { stability: 1 }
  },
  {
    id: 'claro-4',
    provider: 'Claro',
    author: 'Reddit User',
    text: 'Promos agresivas pero el servicio es inestable. Tardaron 3 semanas en venir a instalar. Netflix gratis es lo único bueno.',
    source: 'Reddit',
    date: '2025-12',
    sentiment: -0.3,
    categories: { price: 4, stability: 2, support: 2 }
  },
  // Personal Fibra
  {
    id: 'personal-1',
    provider: 'Personal Fibra',
    author: 'Christian B.',
    text: 'Un técnico de Fibertel dañó la pared de durlock del hall de mi edificio. Desde ese día comenzó una odisea de casi dos semanas. La falta de coordinación es total.',
    source: 'LinkedIn',
    url: 'https://es.linkedin.com/posts/christian-bazdikian-0a01b712a_telecom-fibertel-defensadelconsumidor-activity-7472652984267509760',
    date: '2026-06',
    sentiment: -0.8,
    categories: { support: 1, stability: 2 }
  },
  {
    id: 'personal-2',
    provider: 'Personal Fibra',
    author: 'Reddit User',
    text: 'No tengan Personal. Es pésimo el servicio a todo nivel. NADA funciona bien: ni la instalación ni la atención al cliente que te tiene un pseudo chat GPT que no resuelve nada.',
    source: 'Twitter/X',
    date: '2023-04',
    sentiment: -0.9,
    categories: { support: 1, stability: 1 }
  },
  {
    id: 'personal-3',
    provider: 'Personal Fibra',
    author: 'Alejandro M.',
    text: 'Personal fue distinguida por Ookla como la mejor red fija del país y como la Red Móvil 5G más rápida del país.',
    source: 'LinkedIn',
    url: 'https://es.linkedin.com/posts/alejandro-martinez-1200606_personal-se-consolida-con-la-mejor-red-fija-activity-7399626687770013696',
    date: '2025-11',
    sentiment: 0.8,
    categories: { speed: 5, stability: 4 }
  },
  {
    id: 'personal-4',
    provider: 'Personal Fibra',
    author: 'La Posta Noticias',
    text: 'Durante todo 2024 la empresa Fibertel-Personal ha encontrado demasiados problemas para dar el servicio. Larga lista de robos de cables y señal discontinua.',
    source: 'Selectra',
    url: 'https://www.lapostanoticias.com.ar/2024-07-22/pesadilla-personal-en-general-rodriguez-vivir-sin-servicio-y-no-poder-quejarse/',
    date: '2024-07',
    sentiment: -0.7,
    categories: { stability: 2, support: 1, coverage: 2 }
  },
  // Batcom
  {
    id: 'batcom-1',
    provider: 'Batcom',
    author: 'Facebook User',
    text: 'Escribo por WhatsApp varias veces incluso por correo para un cambio de titularidad y nunca me respondieron. Es urgente cambiar el titular.',
    source: 'Facebook',
    url: 'https://www.facebook.com/batcom.arg/',
    date: '2026-01',
    sentiment: -0.7,
    categories: { support: 1 }
  },
  {
    id: 'batcom-2',
    provider: 'Batcom',
    author: 'Reddit User',
    text: 'Única opción en zona oeste. Servicio caro para lo que ofrece, caídas frecuentes y soporte difícil.',
    source: 'Reddit',
    date: '2025-09',
    sentiment: -0.5,
    categories: { price: 2, stability: 2, support: 2 }
  },
  {
    id: 'batcom-3',
    provider: 'Batcom',
    author: 'Wise CX Case',
    text: 'Batcom logró canalizar el 80% de las consultas por WhatsApp con su BOT. NPS subió de 10% a 80% de promotores.',
    source: 'InfoZona',
    url: 'https://wisecx.com/como-optimizar-tu-servicio-con-un-batcom/',
    date: '2025-08',
    sentiment: 0.6,
    categories: { support: 4 }
  },
  // Telecentro
  {
    id: 'telecentro-1',
    provider: 'Telecentro',
    author: 'Reddit User',
    text: 'Tengo 300 megas con Telecentro en Centro. Anda bien, el precio es competitivo. Lo malo es que el upload es muy bajo, apenas 20 megas.',
    source: 'Reddit',
    date: '2026-05',
    sentiment: 0.4,
    categories: { speed: 4, price: 4, stability: 3 }
  },
  {
    id: 'telecentro-2',
    provider: 'Telecentro',
    author: 'Google Reviews',
    text: 'Instalación rápida y sin costo. El técnico fue puntual. Lleva 2 meses y no tuve cortes.',
    source: 'Google Reviews',
    date: '2026-06',
    sentiment: 0.8,
    categories: { speed: 4, support: 4, stability: 5 }
  }
];
