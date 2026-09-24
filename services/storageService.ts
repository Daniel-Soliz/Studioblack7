import { 
  Product, 
  ProductCategoryItem, 
  Order, 
  InventoryMovement, 
  ServiceItem, 
  GalleryItem, 
  SiteContent, 
  SiteSettings,
  ActivityLog,
  Appointment,
  TeamMember,
  Promotion,
  MenuItem,
  HomeSectionConfig
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'sb7_products_v1',
  CATEGORIES: 'sb7_categories_v1',
  ORDERS: 'sb7_orders_v1',
  INVENTORY: 'sb7_inventory_v1',
  SERVICES: 'sb7_services_v1',
  GALLERY: 'sb7_gallery_v1',
  CONTENT: 'sb7_content_v1',
  SETTINGS: 'sb7_settings_v1',
  AUTH: 'sb7_admin_auth_v1',
  CART: 'sb7_cart_v1',
  ACTIVITIES: 'sb7_activities_v1',
  APPOINTMENTS: 'sb7_appointments_v1',
  TEAM: 'sb7_team_v1',
  PROMOTIONS: 'sb7_promotions_v1',
  MENU: 'sb7_menu_v1',
};

// INITIAL SEED DATA
const INITIAL_CATEGORIES: ProductCategoryItem[] = [
  { id: 'cat-cabelo', name: 'Cabelo', slug: 'cabelo', description: 'Pomadas, ceras, shampoos, finalizadores e cuidados capilares', status: 'active' },
  { id: 'cat-barba', name: 'Barba', slug: 'barba', description: 'Óleos, balms, shampoos e cuidados para barba', status: 'active' },
  { id: 'cat-facial', name: 'Facial', slug: 'facial', description: 'Cuidados faciais e produtos para a pele', status: 'active' },
  { id: 'cat-kits', name: 'Kits', slug: 'kits', description: 'Combinações e kits de produtos', status: 'active' },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'pomada-matte-black7',
    name: 'Pomada Matte Studio Black7',
    slug: 'pomada-matte-black7',
    category: 'Cabelo',
    shortDescription: 'Fixação forte e acabamento 100% seco para cortes modernos e estruturados.',
    description: 'Desenvolvida com a exigência da bancada do Studio Black7. Proporciona fixação de alta performance sem deixar resíduos brancos ou aspecto oleoso. Ideal para penteados texturizados, fades e pompadours. Sai facilmente com água.',
    price: 49.90,
    salePrice: 42.90,
    originalPrice: 49.90,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    stock: 24,
    sku: 'SB7-POM-01',
    status: 'active',
    featured: true,
    badge: 'Destaque',
    volumeOrSize: '150g',
    rating: 4.9,
    reviewCount: 48,
    howToUse: 'Aplique uma quantidade do tamanho de uma moeda nas mãos secas, esfregue até aquecer e distribua pelos fios secos ou levemente úmidos.',
    benefits: [
      'Fixação duradoura de até 16 horas',
      'Efeito matte sem resíduo esbranquiçado',
      'Fragrância amadeirada nobre',
      'Fácil remoção na água'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'oleo-barba-black7-gold',
    name: 'Óleo para Barba Black7 Gold',
    slug: 'oleo-barba-black7-gold',
    category: 'Barba',
    shortDescription: 'Hidratação profunda, toque sedoso e aroma marcante amadeirado.',
    description: 'Elaborado com blend nobre de óleos vegetais de jojoba, argan e semente de uva. Amacia até os fios mais rebeldes, reduz a coceira na raiz e confere brilho natural sem engordurar a pele.',
    price: 54.90,
    salePrice: 48.00,
    originalPrice: 54.90,
    images: [
      'https://images.unsplash.com/photo-1608248597359-009138404a55?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1608248597359-009138404a55?auto=format&fit=crop&w=800&q=80',
    stock: 18,
    sku: 'SB7-OIL-02',
    status: 'active',
    featured: true,
    badge: 'Oferta',
    volumeOrSize: '60ml',
    rating: 5.0,
    reviewCount: 39,
    howToUse: 'Pingue de 3 a 5 gotas na palma da mão, espalhe e massageie da raiz às pontas da barba.',
    benefits: [
      'Absorção rápida sem sensação pegajosa',
      'Nutrição intensiva dos fios da barba',
      'Acalma a pele sob a barba',
      'Fragrância assinatura do Studio'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'balm-barba-modelador',
    name: 'Balm Alinhador de Barba Black7',
    slug: 'balm-barba-modelador',
    category: 'Barba',
    shortDescription: 'Alinha os fios da barba, controla o frizz e hidrata o rosto.',
    description: 'Combina manteiga de karité e cera natural para domar os fios rebeldes e proteger contra o ressecamento do sol e poluição urbana.',
    price: 45.00,
    images: [
      'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&w=800&q=80',
    stock: 15,
    sku: 'SB7-BLM-03',
    status: 'active',
    featured: true,
    badge: 'Novo',
    volumeOrSize: '120g',
    rating: 4.8,
    reviewCount: 22,
    howToUse: 'Retire uma pequena quantidade com a ponta dos dedos, esfregue nas mãos e passe na barba de cima para baixo.',
    benefits: [
      'Alinhamento instantâneo',
      'Elimina o frizz sem endurecer os fios',
      'Hidratação para pele e barba'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'shampoo-cabelo-barba-ice',
    name: 'Shampoo Refrescante Cabelo & Barba Ice',
    slug: 'shampoo-cabelo-barba-ice',
    category: 'Cabelo',
    shortDescription: 'Limpeza purificante com efeito mentolado refrescante.',
    description: 'Fórmula 2 em 1 para homens práticos. Limpa profundamente couro cabeludo e barba, desobstruindo os poros e proporcionando sensação gelada revigorante.',
    price: 42.00,
    images: [
      'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
    stock: 12,
    sku: 'SB7-SHP-04',
    status: 'active',
    featured: true,
    badge: '',
    volumeOrSize: '250ml',
    rating: 4.9,
    reviewCount: 31,
    howToUse: 'Aplique nos cabelos e barba úmidos, massageie até formar espuma cremosa e enxágue bem.',
    benefits: [
      'Refrescância mentolada imediata',
      'Não resseca as pontas dos fios',
      'Uso diário para cabelo e barba'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cera-brilho-natural',
    name: 'Cera Modeladora Brilho Natural Black7',
    slug: 'cera-brilho-natural',
    category: 'Cabelo',
    shortDescription: 'Fixação média com acabamento acetinado de barbearia clássica.',
    description: 'Para quem busca visual polido, alinhado e elegante sem rigidez excessiva. Permite remodelar o cabelo ao longo do dia.',
    price: 46.00,
    images: [
      'https://images.unsplash.com/photo-1590159763121-7c9ff3149e0a?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1590159763121-7c9ff3149e0a?auto=format&fit=crop&w=800&q=80',
    stock: 8,
    sku: 'SB7-CER-05',
    status: 'active',
    featured: false,
    badge: '',
    volumeOrSize: '100g',
    rating: 4.7,
    reviewCount: 19,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'kit-black7-executive',
    name: 'Kit Black7 Executive Grooming',
    slug: 'kit-black7-executive',
    category: 'Kits',
    shortDescription: 'Pomada Matte + Óleo Gold + Pente de Madeira Exclusivo.',
    description: 'O combo definitivo para o homem moderno manter a barba alinhada e o cabelo impecável todos os dias. Acompanha embalagem premium do Studio Black7.',
    price: 119.00,
    salePrice: 99.90,
    originalPrice: 119.00,
    images: [
      'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597359-009138404a55?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
    stock: 5,
    sku: 'SB7-KIT-06',
    status: 'active',
    featured: true,
    badge: 'Oferta',
    volumeOrSize: 'Kit 3 itens',
    rating: 5.0,
    reviewCount: 56,
    benefits: [
      'Economia de mais de 20% no combo',
      'Acompanha pente antiestático de madeira nobre',
      'Presente ideal masculino'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pente-madeira-black7',
    name: 'Pente de Madeira Antiestático Black7',
    slug: 'pente-madeira-black7',
    category: 'Cabelo',
    shortDescription: 'Dentes duplos finos e médios, não quebra os fios e retira a eletricidade estática.',
    description: 'Feito em madeira nobre tratada. Indispensável para pentear a barba e alinhar os fios sem gerar frizz.',
    price: 29.90,
    images: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    stock: 0,
    sku: 'SB7-ACC-07',
    status: 'out_of_stock',
    featured: false,
    badge: '',
    volumeOrSize: 'Unidade',
    rating: 4.8,
    reviewCount: 14,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_SERVICES: ServiceItem[] = [
  { id: 'corte', name: 'Corte', price: 'R$ 50,00', priceNumber: 50, category: 'Cortes', description: 'Corte masculino com acabamento e alinhamento preciso.', popular: true, status: 'active', order: 1 },
  { id: 'barba', name: 'Barba', price: 'R$ 35,00', priceNumber: 35, category: 'Barba', description: 'Modelagem e alinhamento de barba com acabamento profissional.', popular: true, status: 'active', order: 2 },
  { id: 'corte-barba', name: 'Corte + Barba', price: 'R$ 80,00', priceNumber: 80, category: 'Cortes', description: 'Combo completo com corte e barba.', popular: true, status: 'active', order: 3 },
  { id: 'sobrancelha', name: 'Sobrancelha', price: 'R$ 10,00', priceNumber: 10, category: 'Penteado / Acabamento', description: 'Alinhamento e acabamento de sobrancelha.', status: 'active', order: 4 },
  { id: 'penteado', name: 'Penteado', price: 'R$ 25,00', priceNumber: 25, category: 'Penteado / Acabamento', description: 'Modelagem e finalização profissional dos fios.', status: 'active', order: 6 },
  { id: 'progressiva', name: 'Progressiva', price: 'R$ 120,00', priceNumber: 120, category: 'Química / Alisamento', description: 'Tratamento de alinhamento térmico com acabamento refinado.', status: 'active', order: 7 },
  { id: 'luzes', name: 'Luzes', price: 'R$ 110,00', priceNumber: 110, category: 'Coloração', description: 'Mechas e pontos de iluminação para destacar o corte.', status: 'active', order: 8 },
  { id: 'nevou', name: 'Nevou', price: 'R$ 160,00', priceNumber: 160, category: 'Coloração', description: 'Platinado total com tonalização fria e acabamento de alto impacto.', popular: true, status: 'active', order: 9 },
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Corte degradê premium',
    category: 'Corte degradê premium',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    alt: 'Corte degradê premium Studio Black7',
    tag: 'Degradê & Fade',
    visible: true,
    order: 1
  },
  {
    id: 'gal-2',
    title: 'Barba modelada',
    category: 'Barba modelada',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    alt: 'Barba modelada e alinhada Studio Black7',
    tag: 'Barba de Respeito',
    visible: true,
    order: 2
  },
  {
    id: 'gal-4',
    title: 'Luzes masculinas',
    category: 'Luzes masculinas',
    image: 'https://images.unsplash.com/photo-1517832606589-7629c33971a6?auto=format&fit=crop&w=800&q=80',
    alt: 'Luzes masculinas e iluminação de fios',
    tag: 'Coloração & Destaque',
    visible: true,
    order: 4
  },
  {
    id: 'gal-5',
    title: 'Acabamento perfeito',
    category: 'Acabamento perfeito',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=800&q=80',
    alt: 'Pezinho alinhado e contorno cirúrgico',
    tag: 'Precisão & Pezinho',
    visible: true,
    order: 5
  },
  {
    id: 'gal-6',
    title: 'Estilo único',
    category: 'Estilo único',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
    alt: 'Visual exclusivo e transformação no Studio Black7',
    tag: 'Visagismo Masculino',
    visible: true,
    order: 6
  }
];

export const DEFAULT_HOME_SECTIONS: HomeSectionConfig[] = [
  { id: 'hero', name: 'Hero (Destaque Principal)', enabled: true, order: 1, description: 'Frase de impacto, foto de destaque e botões de ação' },
  { id: 'services', name: 'Serviços & Tabela de Preços', enabled: true, order: 2, description: 'Catálogo de cortes, barba, química, coloração e tratamentos' },
  { id: 'promotions', name: 'Promoções & Combos VIP', enabled: true, order: 3, description: 'Ofertas exclusivas com valores promocionais' },
  { id: 'gallery', name: 'Galeria de Trabalhos', enabled: true, order: 4, description: 'Fotos reais de cortes, barbas, visagismo e coloração' },
  { id: 'testimonials', name: 'Depoimentos & Prova Social', enabled: true, order: 6, description: 'Avaliações de clientes do Studio Black7' },
  { id: 'store', name: 'Loja de Produtos Premium', enabled: true, order: 7, description: 'Pomadas, óleos e cosméticos masculinos' },
  { id: 'team', name: 'Equipe de Barbeiros', enabled: true, order: 8, description: 'Apresentação dos profissionais especialistas' },
  { id: 'about', name: 'Sobre o Studio & Fundador', enabled: true, order: 9, description: 'História do Studio Black7 e trajetória do Ray Silva' },
  { id: 'location', name: 'Localização & Horários', enabled: true, order: 10, description: 'Endereço na Zona Norte de SP, mapa interativo e horários' },
  { id: 'contact', name: 'Canais de Atendimento', enabled: true, order: 11, description: 'WhatsApp oficial, telefone e redes sociais' },
];

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'team-ray',
    name: 'Ray Silva (Ray Black7)',
    role: 'Fundador & Master Barber',
    experience: '4 anos de profissão',
    specialty: 'Cortes modernos & Visagismo masculino',
    image: '/images/Ray.png',
    description: 'Fundador do Studio Black7. Profissional focado em visagismo masculino, cortes modernos e acabamento de alta precisão.',
    instagram: '@rayblakc7',
    whatsapp: '5511987267087',
    phone: '(11) 98726-7087',
    services: ['Cortes', 'Barba', 'Nevou', 'Penteados'],
    active: true,
    order: 1
  },
  {
    id: 'team-barber-2',
    name: 'Lucas Ferreira',
    role: 'Barbeiro Especialista',
    experience: '3 anos de profissão',
    specialty: 'Fade Navalhado & Barboterapia',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    description: 'Especialista em alinhamento de barba com toalha quente, degradê na navalha e finalizações texturizadas.',
    instagram: '@barber_black7_',
    whatsapp: '5511987267087',
    phone: '(11) 98726-7087',
    services: ['Cortes', 'Barba', 'Acabamento'],
    active: true,
    order: 2
  }
];

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    title: 'Combo Experiência: Corte + Barba Alinhada',
    description: 'Corte degradê de alta precisão com acabamento navalhado e barba alinhada com toalha quente.',
    originalPrice: 85.00,
    promoPrice: 70.00,
    discountPercent: 18,
    active: true,
    badge: 'Mais Pedido',
    category: 'Combos',
    image: '/images/ray_barber_1789410748280.jpg',
    order: 1
  },
];

export const INITIAL_MENU: MenuItem[] = [
  { id: 'menu-inicio', label: 'Início', path: '/', hash: '#inicio', active: true, order: 1 },
  { id: 'menu-sobre', label: 'Sobre', path: '/sobre', hash: '#sobre', active: true, order: 2 },
  { id: 'menu-servicos', label: 'Serviços', path: '/servicos', hash: '#servicos', active: true, order: 3 },
  { id: 'menu-loja', label: 'Loja', path: '/loja', active: true, order: 4 },
  { id: 'menu-localizacao', label: 'Localização', path: '/localizacao', hash: '#localizacao', active: true, order: 5 },
  { id: 'menu-contato', label: 'Contato', path: '/contato', hash: '#contato', active: true, order: 6 },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1',
    clientName: 'Gabriel Oliveira',
    clientPhone: '(11) 98111-2233',
    serviceId: 'srv-corte-degrade',
    serviceName: 'Corte Degradê Navalhado',
    servicePrice: 'R$ 40,00',
    professionalId: 'team-ray',
    professionalName: 'Ray Silva (Ray Black7)',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    status: 'confirmed',
    notes: 'Degradê baixo na zero e sobrancelha',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
];

export const INITIAL_CONTENT: SiteContent = {
  heroTitle: 'Mais do que um corte, uma experiência.',
  heroSubtitle: 'No Studio Black7, cada detalhe é pensado para valorizar seu estilo, sua presença e sua confiança. Técnica, precisão e atendimento de alto padrão em um só lugar.',
  heroTagline: 'STUDIO BLACK7 · EXPERIÊNCIA & ALTA BARBEARIA',
  heroBadge: 'Referência na Zona Norte de SP',
  heroButtonServicesText: 'VER SERVIÇOS',
  heroButtonStoreText: 'CONHECER A LOJA',
  heroImageUrl: '/images/ray_barber_1789410748280.jpg',
  aboutTitle: 'Mais do que um corte, uma experiência.',
  aboutText: 'O Studio Black7 nasceu da visão de Ray Black7 (Ray Silva), profissional apaixonado por transformação visual e autoestima. O espaço foi criado com o objetivo de oferecer mais do que um simples corte: uma experiência premium, baseada em técnica, cuidado, estilo e atendimento.',
  aboutQuote: 'Cada detalhe é pensado para que o cliente saia da cadeira não apenas com um novo visual, mas com mais confiança.',
  founderName: 'Ray Silva / Ray Black7',
  founderBio: 'Profissional com 4 anos de profissão na estética masculina de alto padrão, com foco em cortes modernos, visagismo e acabamento de precisão.',
  founderSpecialty: 'Cortes modernos e visagismo masculino',
  founderExperience: '4 anos de profissão',
  founderImageUrl: '/images/Ray.png',
  positioningQuote: 'Aqui não é só sobre cortar cabelo. É sobre entregar confiança, estilo e motivação para quem senta na cadeira.',
  storeTitle: 'Produtos Studio Black7',
  storeSubtitle: 'Leve a experiência Studio Black7 para sua rotina.',
  storeBannerUrl: '',
  locationTitle: 'Localização & Ambiente',
  locationDescription: 'Espaço climatizado, moderno e estruturado para seu conforto na Zona Norte de São Paulo.',
  footerText: 'Barbearia premium na Zona Norte de São Paulo. Estilo, elegância e motivação em cada detalhe.',
  footerCopyright: '© 2026 Studio Black7. Todos os direitos reservados.',
  homeSections: DEFAULT_HOME_SECTIONS
};

export const INITIAL_SETTINGS: SiteSettings = {
  companyName: 'STUDIO BLACK7',
  whatsapp: '+55 11 98726-7087',
  whatsappRaw: '5511987267087',
  phone: '(11) 98726-7087',
  email: 'contato@studioblack7.com.br',
  instagramStudio: '@barber_black7_',
  instagramRay: '@rayblakc7',
  instagram: 'https://instagram.com/barber_black7_',
  address: 'R. Boa Vista — Jardim Paulistano — Zona Norte, São Paulo/SP',
  addressStreet: 'R. Boa Vista',
  addressNeighborhood: 'Jardim Paulistano',
  addressCity: 'São Paulo',
  addressState: 'SP',
  addressZipCode: '',
  referencePoint: '',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=R.+Boa+Vista+-+Jardim+Paulistano,+S%C3%A3o+Paulo+-+SP',
  businessHoursWeekdays: '09h00–12h00 e 13h30–21h00',
  businessHoursSaturday: '09h00–12h00 e 13h30–21h00',
  businessHoursSunday: 'Fechado',
  statusNote: 'Segunda a Sábado — consulte disponibilidade pelo WhatsApp',
  logoUrl: '/images/ray_logo.png',
  faviconUrl: '/images/ray_logo.png',
  heroImageUrl: '/images/ray_barber_1789410748280.jpg',
  founderImageUrl: '/images/Ray.png',
  metaTitle: 'Studio Black7 | Barbearia Premium na Zona Norte de São Paulo',
  metaDescription: 'Studio Black7 — Barbearia premium na Zona Norte de São Paulo. Cortes, barba, penteados, química, coloração e produtos masculinos.',
  lowStockThreshold: 5,
  adminPasswordHash: '067462d6fd87e8dcb22d7130736e6b2036021692166785531d2ca1f486aed709'
};

// INITIAL DEMO ORDERS
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'SB7-1001',
    customer: {
      name: 'Marcos Vinicius Santos',
      email: 'marcos.santos@email.com',
      phone: '(11) 97123-4567',
      address: {
        street: 'Rua Imirim',
        number: '1250',
        neighborhood: 'Imirim',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '02464-000'
      }
    },
    items: [
      {
        productId: 'pomada-matte-black7',
        productName: 'Pomada Matte Studio Black7',
        price: 42.90,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        sku: 'SB7-POM-01'
      },
      {
        productId: 'oleo-barba-black7-gold',
        productName: 'Óleo para Barba Black7 Gold',
        price: 48.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1608248597359-009138404a55?auto=format&fit=crop&w=800&q=80',
        sku: 'SB7-OIL-02'
      }
    ],
    subtotal: 133.80,
    shipping: 0,
    shippingMethod: 'Retirada no Studio Black7 (Gratuita)',
    total: 133.80,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Pix no Balcão / WhatsApp',
    notes: 'Cliente irá retirar na barbearia no sábado.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString()
  },
  {
    id: 'ord-1002',
    orderNumber: 'SB7-1002',
    customer: {
      name: 'Gabriel Ribeiro da Costa',
      email: 'gabriel.costa@email.com',
      phone: '(11) 98845-9012',
      address: {
        street: 'Av. Direitos Humanos',
        number: '410',
        complement: 'Apto 32',
        neighborhood: 'Mandaqui',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '02475-000'
      }
    },
    items: [
      {
        productId: 'kit-black7-executive',
        productName: 'Kit Black7 Executive Grooming',
        price: 99.90,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
        sku: 'SB7-KIT-06'
      }
    ],
    subtotal: 99.90,
    shipping: 15.00,
    shippingMethod: 'Entrega Expressa Zona Norte',
    total: 114.90,
    status: 'processing',
    paymentStatus: 'pending',
    paymentMethod: 'A combinar no WhatsApp',
    createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
  }
];

export class StorageService {
  private static getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Erro ao salvar no storage (${key}):`, e);
    }
  }

  // PRODUCTS
  static getProducts(): Product[] {
    const prods = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    if (!prods || prods.length === 0) {
      this.setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return prods;
  }

  static saveProducts(products: Product[]): void {
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
  }

  static getProductById(id: string): Product | undefined {
    const products = this.getProducts();
    return products.find(p => p.id === id || p.slug === id);
  }

  static saveProduct(product: Product): { success: boolean; message: string; product?: Product } {
    const products = this.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);

    // Validate unique SKU if provided
    if (product.sku) {
      const skuConflict = products.find(p => p.sku.trim().toLowerCase() === product.sku.trim().toLowerCase() && p.id !== product.id);
      if (skuConflict) {
        return { success: false, message: `O SKU "${product.sku}" já está em uso pelo produto "${skuConflict.name}".` };
      }
    }

    if (existingIndex >= 0) {
      const previous = products[existingIndex];
      const updated: Product = {
        ...product,
        updatedAt: new Date().toISOString()
      };
      products[existingIndex] = updated;
      this.saveProducts(products);

      // Check stock adjustment log
      if (previous.stock !== updated.stock) {
        this.logInventoryMovement({
          id: `mov-${Date.now()}`,
          productId: updated.id,
          productName: updated.name,
          type: updated.stock > previous.stock ? 'in' : 'out',
          quantity: Math.abs(updated.stock - previous.stock),
          previousStock: previous.stock,
          newStock: updated.stock,
          reason: 'Ajuste manual via edição de produto',
          createdAt: new Date().toISOString()
        });
      }

      return { success: true, message: 'Produto atualizado com sucesso.', product: updated };
    } else {
      const newProduct: Product = {
        ...product,
        id: product.id || `prod-${Date.now()}`,
        slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      products.unshift(newProduct);
      this.saveProducts(products);

      this.logInventoryMovement({
        id: `mov-${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'in',
        quantity: newProduct.stock,
        previousStock: 0,
        newStock: newProduct.stock,
        reason: 'Cadastro inicial de produto',
        createdAt: new Date().toISOString()
      });

      return { success: true, message: 'Produto criado com sucesso.', product: newProduct };
    }
  }

  static deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length !== products.length) {
      this.saveProducts(filtered);
      return true;
    }
    return false;
  }

  // CATEGORIES
  static getCategories(): ProductCategoryItem[] {
    const cats = this.getItem<ProductCategoryItem[]>(STORAGE_KEYS.CATEGORIES, []);
    if (!cats || cats.length === 0) {
      this.setItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    return cats;
  }

  static saveCategories(categories: ProductCategoryItem[]): void {
    this.setItem(STORAGE_KEYS.CATEGORIES, categories);
  }

  // ORDERS
  static getOrders(): Order[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (raw === null) {
        this.setItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
        return INITIAL_ORDERS;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static saveOrders(orders: Order[]): void {
    this.setItem(STORAGE_KEYS.ORDERS, orders);
  }

  static createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const orders = this.getOrders();
    const orderNumber = `SB7-${1001 + orders.length}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);

    // Decrement stock for ordered items
    const products = this.getProducts();
    newOrder.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const prevStock = prod.stock;
        prod.stock = Math.max(0, prod.stock - item.quantity);
        if (prod.stock === 0) prod.status = 'out_of_stock';

        this.logInventoryMovement({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: prod.id,
          productName: prod.name,
          type: 'out',
          quantity: item.quantity,
          previousStock: prevStock,
          newStock: prod.stock,
          reason: `Venda Pedido #${orderNumber}`,
          createdAt: new Date().toISOString()
        });
      }
    });
    this.saveProducts(products);

    return newOrder;
  }

  static updateOrderStatus(orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index >= 0) {
      orders[index].status = status;
      if (paymentStatus) orders[index].paymentStatus = paymentStatus;
      orders[index].updatedAt = new Date().toISOString();
      this.saveOrders(orders);
      return true;
    }
    return false;
  }

  static saveOrder(order: Order): Order {
    const orders = this.getOrders();
    const now = new Date().toISOString();
    const normalized: Order = {
      ...order,
      id: order.id || `ord-${Date.now()}`,
      orderNumber: order.orderNumber || `SB7-${Date.now().toString().slice(-6)}`,
      createdAt: order.createdAt || now,
      updatedAt: now,
    };

    const index = orders.findIndex(o => o.id === normalized.id);
    if (index >= 0) orders[index] = normalized;
    else orders.unshift(normalized);

    this.saveOrders(orders);
    return normalized;
  }

  static deleteOrder(orderId: string): boolean {
    const orders = this.getOrders();
    const next = orders.filter(o => o.id !== orderId);
    if (next.length === orders.length) return false;
    this.saveOrders(next);
    return true;
  }

  // INVENTORY
  static getInventoryMovements(): InventoryMovement[] {
    return this.getItem<InventoryMovement[]>(STORAGE_KEYS.INVENTORY, []);
  }

  static logInventoryMovement(movement: InventoryMovement): void {
    const list = this.getInventoryMovements();
    list.unshift(movement);
    // Keep last 150 records
    this.setItem(STORAGE_KEYS.INVENTORY, list.slice(0, 150));
  }

  static addInventoryMovement(movement: InventoryMovement): void {
    this.logInventoryMovement(movement);
  }

  // SERVICES
  static getServices(): ServiceItem[] {
    const servs = this.getItem<ServiceItem[]>(STORAGE_KEYS.SERVICES, []);
    if (!servs || servs.length === 0) {
      this.setItem(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
      return INITIAL_SERVICES;
    }
    return servs.sort((a, b) => a.order - b.order);
  }

  static saveServices(services: ServiceItem[]): void {
    this.setItem(STORAGE_KEYS.SERVICES, services);
  }

  // GALLERY
  static getGallery(): GalleryItem[] {
    const gallery = this.getItem<GalleryItem[]>(STORAGE_KEYS.GALLERY, []);
    if (!gallery || gallery.length === 0) {
      this.setItem(STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
      return INITIAL_GALLERY;
    }
    return gallery.sort((a, b) => a.order - b.order);
  }

  static saveGallery(gallery: GalleryItem[]): void {
    this.setItem(STORAGE_KEYS.GALLERY, gallery);
  }

  // CONTENT
  static getContent(): SiteContent {
    const content = this.getItem<SiteContent>(STORAGE_KEYS.CONTENT, INITIAL_CONTENT);
    return { ...INITIAL_CONTENT, ...content };
  }

  static saveContent(content: SiteContent): void {
    this.setItem(STORAGE_KEYS.CONTENT, content);
  }

  // SETTINGS
  static getSettings(): SiteSettings {
    const settings = this.getItem<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    return { ...INITIAL_SETTINGS, ...settings };
  }

  static saveSettings(settings: SiteSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // ACTIVITY LOGS
  static getActivities(): ActivityLog[] {
    const list = this.getItem<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, []);
    if (!list || list.length === 0) {
      const initialLogs: ActivityLog[] = [
        {
          id: 'act-1',
          action: 'Inicialização do Sistema',
          detail: 'Configurações de alta barbearia e catálogo carregados.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          dateFormatted: new Date(Date.now() - 3600000).toLocaleString('pt-BR'),
          userName: 'Ray Silva'
        },
        {
          id: 'act-2',
          action: 'Atualização de Textos da Home',
          detail: 'Novo posicionamento "Mais do que um corte, uma experiência" publicado.',
          timestamp: new Date().toISOString(),
          dateFormatted: new Date().toLocaleString('pt-BR'),
          userName: 'Sistema Black7'
        }
      ];
      this.setItem(STORAGE_KEYS.ACTIVITIES, initialLogs);
      return initialLogs;
    }
    return list;
  }

  static logActivity(action: string, detail: string, userName = 'Admin Studio Black7'): void {
    const list = this.getActivities();
    const newLog: ActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      action,
      detail,
      timestamp: new Date().toISOString(),
      dateFormatted: new Date().toLocaleString('pt-BR'),
      userName
    };
    list.unshift(newLog);
    this.setItem(STORAGE_KEYS.ACTIVITIES, list.slice(0, 100));
  }

  // BACKUP & EXPORT
  static exportAllData(): string {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      categories: this.getCategories(),
      services: this.getServices(),
      gallery: this.getGallery(),
      content: this.getContent(),
      settings: this.getSettings(),
      orders: this.getOrders(),
      activities: this.getActivities()
    };
    return JSON.stringify(payload, null, 2);
  }

  static importAllData(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.products && Array.isArray(parsed.products)) {
        this.saveProducts(parsed.products);
      }
      if (parsed.categories && Array.isArray(parsed.categories)) {
        this.saveCategories(parsed.categories);
      }
      if (parsed.services && Array.isArray(parsed.services)) {
        this.saveServices(parsed.services);
      }
      if (parsed.gallery && Array.isArray(parsed.gallery)) {
        this.saveGallery(parsed.gallery);
      }
      if (parsed.content && typeof parsed.content === 'object') {
        this.saveContent(parsed.content);
      }
      if (parsed.settings && typeof parsed.settings === 'object') {
        this.saveSettings(parsed.settings);
      }
      if (parsed.orders && Array.isArray(parsed.orders)) {
        this.saveOrders(parsed.orders);
      }
      this.logActivity('Importação de Backup', 'Restauração completa de dados via arquivo JSON.');
      return { success: true, message: 'Dados restaurados com sucesso!' };
    } catch (err: any) {
      return { success: false, message: `Falha ao processar arquivo JSON: ${err?.message || 'Arquivo inválido'}` };
    }
  }

  static resetToDefaults(): void {
    this.setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    this.setItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    this.setItem(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    this.setItem(STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
    this.setItem(STORAGE_KEYS.CONTENT, INITIAL_CONTENT);
    this.setItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    this.setItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    this.logActivity('Restauração de Fábrica', 'Todos os dados foram redefinidos para os padrões de fábrica.');
  }
}
