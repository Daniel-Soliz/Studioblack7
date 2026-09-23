import { ServiceItem, ServiceCategory, GalleryItem, TeamMember, StatItem } from '../types';
import { BARBER_PORTRAIT_IMG, BARBER_HERO_IMG, BARBER_AVATAR_IMG } from '../assets/images';

export const BRAND_NAME = 'STUDIO BLACK7';
export const BRAND_SLOGAN = 'Barbearia premium na Zona Norte de São Paulo. Estilo, elegância e precisão em cada corte.';
export const BRAND_POSITIONING_QUOTE = 'Aqui não é só sobre cortar cabelo. É sobre entregar confiança, estilo e motivação para quem senta na cadeira.';

export const WHATSAPP_NUMBER = '+55 11 98726-7087';
export const WHATSAPP_RAW = '5511987267087';

export const INSTAGRAM_RAY = 'rayblakc7';
export const INSTAGRAM_STUDIO = 'barber_black7_';

export const INSTAGRAM_RAY_URL = 'https://instagram.com/rayblakc7';
export const INSTAGRAM_STUDIO_URL = 'https://instagram.com/barber_black7_';

export const ADDRESS = {
  street: 'R. Boa Vista',
  neighborhood: 'Jardim Paulistano',
  zone: 'Zona Norte',
  city: 'São Paulo',
  state: 'SP',
  full: 'R. Boa Vista — Jardim Paulistano (Zona Norte) — São Paulo/SP',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=R.+Boa+Vista+-+Jardim+Paulistano,+S%C3%A3o+Paulo+-+SP',
};

export const BUSINESS_HOURS = {
  weekdays: '09h00–12h00 e 13h30–21h00',
  saturday: '09h00–12h00 e 13h30–21h00',
  sunday: 'Fechado',
  intervals: [
    { start: 9 * 60, end: 12 * 60 },
    { start: 13 * 60 + 30, end: 21 * 60 },
  ],
};

export const STATS: StatItem[] = [
  {
    value: '4+',
    label: 'Anos do Fundador',
    detail: 'Ray Black7 na arte e estética masculina',
  },
  {
    value: '5+',
    label: 'Anos de Experiência',
    detail: 'Do barbeiro executor em cortes de precisão',
  },
  {
    value: '#1',
    label: 'Acabamento de Precisão',
    detail: 'Foco em cortes, acabamento e estilo masculino',
  },
];

export const TEAM: TeamMember[] = [
  {
    id: 'ray-black7',
    name: 'Ray Silva (Ray Black7)',
    role: 'Fundador & Barbeiro Profissional',
    experience: '4 anos de profissão',
    specialty: 'Cortes modernos, acabamento de precisão e visagismo masculino',
    image: BARBER_PORTRAIT_IMG,
    description: 'Profissional apaixonado por transformação visual, estilo e autoestima. Fundador do Studio Black7, focado em entregar uma experiência de alto padrão.',
    instagram: '@rayblakc7',
  },
  {
    id: 'barbeiro-executor',
    name: 'Barbeiro Executor',
    role: 'Barbeiro Profissional',
    experience: '5 anos de experiência',
    specialty: 'Cortes clássicos, degradê com precisão e alinhamento de barba',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    description: 'Com 5 anos de maestria e técnica em bancada, dedica-se à execução impecável de cortes, barbas alinhadas e acabamentos de alto nível.',
  },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Todos',
  'Cortes',
  'Barba',
  'Penteado / Acabamento',
  'Química / Alisamento',
  'Coloração',
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'corte',
    name: 'Corte',
    price: 'R$ 50,00',
    priceNumber: 50,
    category: 'Cortes',
    description: 'Corte masculino com acabamento e alinhamento preciso.',
    popular: true,
  },
  {
    id: 'barba',
    name: 'Barba',
    price: 'R$ 35,00',
    priceNumber: 35,
    category: 'Barba',
    description: 'Modelagem e alinhamento de barba com acabamento profissional.',
    popular: true,
  },
  {
    id: 'corte-barba',
    name: 'Corte + Barba',
    price: 'R$ 80,00',
    priceNumber: 80,
    category: 'Cortes',
    description: 'Combo completo com corte e barba.',
    popular: true,
  },
  {
    id: 'sobrancelha',
    name: 'Sobrancelha',
    price: 'R$ 10,00',
    priceNumber: 10,
    category: 'Penteado / Acabamento',
    description: 'Alinhamento e acabamento de sobrancelha.',
  },
  {
    id: 'pigmentacao',
    name: 'Pigmentação',
    price: 'R$ 25,00',
    priceNumber: 25,
    category: 'Coloração',
    description: 'Pigmentação para realçar e uniformizar o visual.',
  },
  {
    id: 'penteado',
    name: 'Penteado',
    price: 'R$ 25,00',
    priceNumber: 25,
    category: 'Penteado / Acabamento',
    description: 'Modelagem e finalização profissional dos fios.',
  },
  {
    id: 'progressiva',
    name: 'Progressiva',
    price: 'R$ 120,00',
    priceNumber: 120,
    category: 'Química / Alisamento',
    description: 'Tratamento de alinhamento térmico com acabamento refinado.',
  },
  {
    id: 'luzes',
    name: 'Luzes',
    price: 'R$ 110,00',
    priceNumber: 110,
    category: 'Coloração',
    description: 'Mechas e pontos de iluminação para destacar o corte.',
  },
  {
    id: 'nevou',
    name: 'Nevou',
    price: 'R$ 160,00',
    priceNumber: 160,
    category: 'Coloração',
    description: 'Platinado total com tonalização fria e acabamento de alto impacto.',
    popular: true,
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'galeria-1',
    title: 'Corte Degradê Premium',
    category: 'Cortes',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=800&q=80',
    alt: 'Corte degradê fade de alta precisão realizado no Studio Black7',
    tag: 'Degradê & Fade',
  },
  {
    id: 'galeria-2',
    title: 'Barba Modelada',
    category: 'Barba',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    alt: 'Barba alinhada com desenho geométrico e toalha quente',
    tag: 'Alinhamento com Navalha',
  },
  {
    id: 'galeria-4',
    title: 'Luzes Masculinas',
    category: 'Coloração',
    image: 'https://images.unsplash.com/photo-1517832606589-7629c3395909?auto=format&fit=crop&w=800&q=80',
    alt: 'Luzes e mechas masculinas com estilo moderno',
    tag: 'Estilo & Iluminação',
  },
  {
    id: 'galeria-5',
    title: 'Acabamento Perfeito',
    category: 'Acabamento',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
    alt: 'Pezinho e contorno de precisão cirúrgica',
    tag: 'Pezinho & Contorno',
  },
  {
    id: 'galeria-6',
    title: 'Estilo Único',
    category: 'Transformação',
    image: BARBER_PORTRAIT_IMG,
    alt: 'Transformação visual completa no Studio Black7',
    tag: 'Confiança & Autoestima',
  },
];

export function createWhatsAppBookingUrl(serviceName?: string): string {
  const text = serviceName
    ? `Olá! Vim pelo site do Studio Black7 e gostaria de agendar um horário para ${serviceName}.`
    : 'Olá! Vim pelo site do Studio Black7 e gostaria de agendar um horário.';
  return `https://wa.me/${WHATSAPP_RAW}?text=${encodeURIComponent(text)}`;
}

export function isCurrentlyOpen(): { isOpen: boolean; message: string } {
  try {
    const now = new Date();
    // Calculate current time in America/Sao_Paulo
    const spTimeStr = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    const spDate = new Date(spTimeStr);
    const day = spDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    if (day === 0) {
      return { isOpen: false, message: 'Fechado hoje (Domingo)' };
    }
    
    const minutes = spDate.getHours() * 60 + spDate.getMinutes();
    const isMorning = minutes >= 9 * 60 && minutes < 12 * 60;
    const isAfternoon = minutes >= 13 * 60 + 30 && minutes < 21 * 60;
    
    if (isMorning || isAfternoon) {
      return { isOpen: true, message: 'Aberto agora · Atendimento até 21h' };
    }
    
    if (minutes >= 12 * 60 && minutes < 13 * 60 + 30) {
      return { isOpen: false, message: 'Intervalo de almoço · Retorno às 13h30' };
    }
    
    return { isOpen: false, message: 'Fechado no momento · Abre às 09h' };
  } catch {
    return { isOpen: true, message: 'Seg a Sáb: 09h–12h e 13h30–21h' };
  }
}
