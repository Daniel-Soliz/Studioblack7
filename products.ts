import { Product } from '../types';
import { WHATSAPP_RAW } from './barbershop';

export function createWhatsAppLink(productName?: string, customMessage?: string): string {
  let message = customMessage;
  if (!message) {
    if (productName) {
      message = `Olá! Tenho interesse em comprar o produto: ${productName} — vi na Black7 Store.`;
    } else {
      message = 'Olá! Gostaria de tirar dúvidas sobre os produtos da Black7 Store.';
    }
  }
  return `https://wa.me/${WHATSAPP_RAW}?text=${encodeURIComponent(message)}`;
}

export const PRODUCTS: Product[] = [
  {
    id: 'pomada-matte-black7-prime',
    name: 'Pomada Efeito Matte Black7 Prime',
    subtitle: 'Fixação extra forte sem brilho para finalizações impecáveis',
    category: 'Pomadas',
    price: 49.90,
    originalPrice: 65.00,
    volumeOrSize: '150g',
    rating: 4.9,
    reviewCount: 128,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A pomada carro-chefe da bancada do Studio Black7. Formulada para proporcionar fixação ultra duradoura com acabamento 100% seco e natural. Não deixa resíduos brancos, resiste ao suor e à umidade do dia a dia e sai facilmente na lavagem com água.',
    howToUse: 'Espalhe uma pequena quantidade (do tamanho de uma moeda de 1 real) na palma das mãos, friccione bem até aquecer o produto e aplique uniformemente nos fios secos ou levemente umedecidos. Modele com as mãos ou com pente de dentes médios para a estrutura desejada.',
    benefits: [
      'Fixação alta (hold 9/10) com textura matte autêntica',
      'Ideal para cortes fade, quiff, pompadour e texturizados',
      'Fragrância amadeirada marcante e sofisticada',
      'Fórmula hidrossolúvel: sai 100% no banho sem agredir o couro cabeludo'
    ]
  },
  {
    id: 'oleo-barba-black7-gold',
    name: 'Óleo Hidratante de Barba Black7 Gold Edition',
    subtitle: 'Nutrição profunda com toque seco e brilho nobre',
    category: 'Óleos de Barba',
    price: 54.90,
    originalPrice: 69.90,
    volumeOrSize: '60ml',
    rating: 5.0,
    reviewCount: 94,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1608248597358-1f19f2a00c66?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1608248597358-1f19f2a00c66?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Blended com óleos nobres de Argan marroquino, Jojoba e Semente de Uva. Desenvolvido no Studio Black7 para amaciar até os fios mais rebeldes, eliminar a coceira da barba e perfumar com notas de tabaco e âmbar dourado.',
    howToUse: 'Aplique de 3 a 6 gotas na palma das mãos (dependendo do comprimento da barba). Esfregue as mãos e espalhe da raiz até as pontas dos fios da barba, massageando a pele por baixo. Finalize alinhando com um pente de madeira.',
    benefits: [
      'Absorção rápida com sensação de toque aveludado e seco',
      'Previne pontas duplas e fios quebradiços',
      'Acalma a pele sob a barba evitando foliculite',
      'Fragrância premium com notas ambaradas de longa duração'
    ]
  },
  {
    id: 'pomada-efeito-brilho-diamond',
    name: 'Pomada Modeladora Black7 Diamond Wet Look',
    subtitle: 'Brilho clássico vintage e alinhamento impecável',
    category: 'Pomadas',
    price: 49.90,
    originalPrice: 60.00,
    volumeOrSize: '150g',
    rating: 4.8,
    reviewCount: 67,
    isFeatured: false,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1597854710119-a5a843967337?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1597854710119-a5a843967337?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Perfeita para penteados clássicos como Slick Back, Side Part e Executive Contour. Concede brilho molhado sofisticado sem aspecto gorduroso ou pesado, mantendo os fios no lugar durante todo o dia.',
    howToUse: 'Trabalhe o produto nos fios ligeiramente úmidos para maior brilho e fixação flexível, ou nos fios secos para fixação máxima. Penteie no sentido do corte.',
    benefits: [
      'Brilho sofisticado clássico (efeito molhado controlado)',
      'Fixação média-alta com flexibilidade para repenetear',
      'Base aquosa que não agride os fios',
      'Rendimento profissional prolongado'
    ]
  },
  {
    id: 'cera-po-volume-black7',
    name: 'Cera em Pó Black7 Volume & Texture Powder',
    subtitle: 'Volume imediato na raiz e sustentação para cabelos finos',
    category: 'Ceras',
    price: 45.00,
    originalPrice: 58.00,
    volumeOrSize: '15g',
    rating: 4.9,
    reviewCount: 112,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'O segredo dos barbeiros para os penteados modernos com textura desconectada e topetes altos. A cera em pó Black7 adere à fibra capilar instantaneamente, conferindo densidade visual, efeito mate total e sustentação que dura até o final da noite.',
    howToUse: 'Bata suavemente o frasco aplicando uma leve nuvem de pó diretamente na raiz dos cabelos totalmente secos. Massageie com a ponta dos dedos para ativar o volume e estilize como desejar.',
    benefits: [
      'Efeito lifting de raiz instantâneo',
      'Textura moderna e acabamento 100% fosco',
      'Controla a oleosidade excessiva ao longo do dia',
      'Embalagem compacta de fácil transporte'
    ]
  },
  {
    id: 'shampoo-ice-mint-black7',
    name: 'Shampoo Anticaspa & Fortalecedor Black7 Ice Mint',
    subtitle: 'Refrescância extrema e limpeza profunda para couro e barba',
    category: 'Shampoos',
    price: 42.90,
    originalPrice: 52.00,
    volumeOrSize: '300ml',
    rating: 4.9,
    reviewCount: 78,
    isFeatured: false,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Desenvolvido com mentol puro e piritionato de zinco, proporciona uma explosão de refrescância gelada logo nos primeiros segundos de massagem. Desobstrui os poros, combate a caspa e remove o excesso de pomadas sem ressecar as pontas.',
    howToUse: 'Aplique nos cabelos e na barba molhados, massageando suavemente com as pontas dos dedos até formar espuma densa. Deixe agir por 1 a 2 minutos para sentir a ação do mentol e enxágue abundantemente.',
    benefits: [
      'Sensação térmica gelada energizante',
      'Combate à caspa e controle da descamação',
      'Pode ser usado no cabelo e na barba diariamente',
      'Livre de parabenos e petrolatos pesados'
    ]
  },
  {
    id: 'tonico-pigmentacao-crescimento',
    name: 'Tônico Fortalecedor & Pigmentação Black7 Special Care',
    subtitle: 'Fórmula exclusiva Rayblack7 para densidade e realce capilar',
    category: 'Shampoos',
    price: 64.90,
    originalPrice: 85.00,
    volumeOrSize: '100ml',
    rating: 5.0,
    reviewCount: 145,
    isBestSeller: true,
    isNew: true,
    isFeatured: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Criado a partir da vasta experiência do barbeiro Rayblack7 em pigmentação capilar na Zona Norte de SP. Este tônico combina Biotina concentrada, Pantenol e cafeína ativa para estimular a circulação no folículo, fortalecendo falhas na barba e na linha frontal do cabelo, prolongando o visual denso e alinhado.',
    howToUse: 'Borrife de 4 a 6 vezes diretamente nas áreas de falhas ou ralas (cabelo ou barba limpos). Massageie em movimentos circulares até a completa absorção. Use duas vezes ao dia para resultados consistentes.',
    benefits: [
      'Estímulo ao crescimento e preenchimento de falhas',
      'Auxilia na manutenção de procedimentos de pigmentação',
      'Não engordura nem mancha a pele',
      'Testado e aprovado com clientes do Studio Black7'
    ]
  },
  {
    id: 'perfume-black7-noir-edp',
    name: 'Black7 Noir Eau de Parfum Masculino',
    subtitle: 'A fragrância assinatura do Studio Black7: couro, âmbar e especiarias',
    category: 'Perfumes',
    price: 139.90,
    originalPrice: 179.90,
    volumeOrSize: '100ml',
    rating: 5.0,
    reviewCount: 83,
    isFeatured: true,
    isNew: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'O aroma exclusivo que todo cliente do Studio Black7 reconhece ao entrar na barbearia. Uma fragrância imponente com notas de topo de bergamota negra e pimenta preta, corpo encorpado de couro toscano e base duradoura de âmbar dourado e cedro.',
    howToUse: 'Borrife a 15cm da pele nos pontos de pulsação: pescoço, nuca e pulsos. Para um rastro ainda mais envolvente, borrife uma névoa suave sobre a barba alinhada.',
    benefits: [
      'Concentração Eau de Parfum: fixação de 8 a 12 horas',
      'Presença sofisticada que impõe respeito e elegância',
      'Frasco premium em preto fosco e detalhes dourados',
      'Criação autoral e exclusiva da marca Black7'
    ]
  },
  {
    id: 'maquina-acabamento-black7-pro',
    name: 'Máquina de Acabamento Black7 Blade Pro Cordless',
    subtitle: 'Lâmina T-Wide Zero Gap com motor potente de 7200 RPM',
    category: 'Ferramentas',
    price: 289.90,
    originalPrice: 349.00,
    volumeOrSize: 'Bateria 180min',
    rating: 4.9,
    reviewCount: 52,
    isFeatured: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A mesma máquina que Rayblack7 utiliza para contornos cirúrgicos, pézinho limpo e acabamento em degradê. Corpo em metal esculpido ergonômico, lâmina em aço carbono com afiação extrema e carregamento USB-C veloz.',
    howToUse: 'Utilize para marcações de linhas, contorno de barba, desenhos e raspagem rente. Limpe com a escovinha após cada uso e aplique 2 gotas de óleo lubrificante na lâmina semanalmente.',
    benefits: [
      'Corte rente tipo navalha (zero gap regulável)',
      'Bateria de lítio com autonomia de até 3 horas contínuas',
      'Design em relevo vintage dourado com pegada firme',
      'Acompanha 4 pentes guia (1mm, 2mm, 3mm e 4mm), cabo e óleo'
    ]
  },
  {
    id: 'tesoura-fio-laser-japanese-steel',
    name: 'Tesoura de Corte Fio Laser Black7 Japanese Steel 6.0"',
    subtitle: 'Precisão milimétrica em aço inoxidável 440C forjado a frio',
    category: 'Ferramentas',
    price: 159.90,
    originalPrice: 199.90,
    volumeOrSize: '6.0 Polegadas',
    rating: 5.0,
    reviewCount: 38,
    isFeatured: false,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Instrumento cirúrgico para barbeiros e cabeleireiros exigentes. Lâminas com afiação laser que não mastigam os fios, cabo anatômico com descanso de dedo removível e parafuso tensor com ajuste de clique micrométrico banhado a ouro.',
    howToUse: 'Ideal para técnicas de tesoura sobre pente, corte reto e acabamentos de topo. Mantenha sempre guardada no estojo protetor aveludado incluso.',
    benefits: [
      'Aço 440C de alta retenção de corte',
      'Equilíbrio de peso perfeito para evitar fadiga no pulso',
      'Acabamento em preto ônix acetinado com acento dourado',
      'Acompanha estojo rígido em couro sintético'
    ]
  },
  {
    id: 'kit-barba-cabelo-master',
    name: 'Kit Completo Barba & Cabelo Studio Black7 Master',
    subtitle: 'O combo supremo: Pomada Matte + Óleo Gold + Shampoo Mint + Pente de Madeira',
    category: 'Kits',
    price: 149.90,
    originalPrice: 194.70,
    volumeOrSize: 'Kit 4 Itens',
    rating: 5.0,
    reviewCount: 168,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A experiência completa do Studio Black7 dentro da sua casa. O kit definitivo que reúne nossa pomada matte campeã de vendas, o óleo de barba nutritivo Gold Edition, o shampoo refrescante Ice Mint e um pente exclusivo de madeira nobre anti-estática gravado a laser.',
    howToUse: 'Lave com o Shampoo Ice Mint no banho. Ao sair, aplique o Óleo Gold na barba e alinhe com o pente de madeira. Nos cabelos secos, finalize o penteado com a Pomada Matte Black7 Prime.',
    benefits: [
      'Economia de mais de 20% em comparação à compra individual',
      'Caixa presenteável personalizada Black7 em preto fosco e dourado',
      'Pente de madeira exclusivo que não gera frizz e distribui o óleo',
      'O presente mais desejado da barbearia'
    ]
  },
  {
    id: 'balm-modelador-black7-wood-spice',
    name: 'Balm Modelador de Barba Black7 Wood & Spice',
    subtitle: 'Hidratação com alinhamento e controle de fios rebeldes',
    category: 'Óleos de Barba',
    price: 46.90,
    originalPrice: 56.00,
    volumeOrSize: '120g',
    rating: 4.8,
    reviewCount: 49,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1567928815116-f6d2f3ff646e?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1567928815116-f6d2f3ff646e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Creme condicionante e alinhador com Manteiga de Karité e Óleo de Café Verde. Modela fios médios e longos mantendo a barba disciplinada sem endurecer, criando um escudo protetor contra poluição e odores.',
    howToUse: 'Espalhe uma pequena porção nas mãos e distribua por toda a extensão da barba, da raiz às pontas, modelando com os dedos no formato desejado.',
    benefits: [
      'Alinhamento sem rigidez ou aspecto pegajoso',
      'Ação anti-frizz comprovada na bancada',
      'Aroma sutil de madeira nobre e cravo suave',
      'Proteção térmica contra o secador'
    ]
  },
  {
    id: 'escova-disfarce-fade-black7',
    name: 'Escova de Disfarce e Limpeza Fade Black7 Cerdas Naturais',
    subtitle: 'Cerdas macias de javali para degradê perfeito e conforto total',
    category: 'Ferramentas',
    price: 34.90,
    originalPrice: 45.00,
    volumeOrSize: 'Cerdas Naturais',
    rating: 4.9,
    reviewCount: 41,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1508380702597-707c1b00695c?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1508380702597-707c1b00695c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Essencial para a execução de degradês limpos e precisos. As cerdas naturais limpam instantaneamente os fios cortados sem irritar o couro cabeludo sensível, permitindo enxergar cada tom do fade com clareza.',
    howToUse: 'Passe suavemente sobre a área cortada durante o processo de graduação ou para alinhar a barba no dia a dia.',
    benefits: [
      'Cerdas naturais selecionadas que não pinicam',
      'Madeira maciça envernizada com gravação Black7',
      'Pegada ergonômica compacta',
      'Durabilidade de uso profissional diário'
    ]
  }
];

export const CATEGORIES = [
  'Todas',
  'Pomadas',
  'Óleos de Barba',
  'Shampoos',
  'Ceras',
  'Ferramentas',
  'Kits',
  'Perfumes'
] as const;
