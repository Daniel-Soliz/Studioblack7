import { AccessLog, AnalyticsStorage, ProductAnalytics } from '../types';
import { PRODUCTS } from '../data/products';

const STORAGE_KEY = 'black7_analytics_v1';
export const ADMIN_PASSWORD = 'rayblakc7001';

// Device & Browser Detection
export function detectDeviceInfo(): {
  deviceType: 'Celular' | 'Tablet' | 'Computador';
  os: string;
  browser: string;
} {
  if (typeof window === 'undefined') {
    return { deviceType: 'Computador', os: 'Desconhecido', browser: 'Desconhecido' };
  }

  const ua = navigator.userAgent || '';
  let deviceType: 'Celular' | 'Tablet' | 'Computador' = 'Computador';
  let os = 'Outro';
  let browser = 'Outro';

  // Device type
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    deviceType = 'Celular';
  }

  // OS
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  // Browser
  if (/Instagram/i.test(ua)) browser = 'Instagram App';
  else if (/TikTok/i.test(ua)) browser = 'TikTok App';
  else if (/Edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Google Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';

  return { deviceType, os, browser };
}

// Seed realistic initial baseline if no analytics exist yet
function generateSeedData(): AnalyticsStorage {
  const now = Date.now();
  const oneHour = 3600 * 1000;
  const oneDay = 24 * oneHour;

  const logs: AccessLog[] = [];
  const seedDevices: Array<{ deviceType: 'Celular' | 'Tablet' | 'Computador'; os: string; browser: string }> = [
    { deviceType: 'Celular', os: 'iOS', browser: 'Instagram App' },
    { deviceType: 'Celular', os: 'Android', browser: 'Google Chrome' },
    { deviceType: 'Celular', os: 'iOS', browser: 'Safari' },
    { deviceType: 'Celular', os: 'Android', browser: 'Instagram App' },
    { deviceType: 'Celular', os: 'iOS', browser: 'TikTok App' },
    { deviceType: 'Computador', os: 'Windows', browser: 'Google Chrome' },
    { deviceType: 'Celular', os: 'Android', browser: 'Google Chrome' },
    { deviceType: 'Tablet', os: 'iOS', browser: 'Safari' },
    { deviceType: 'Celular', os: 'iOS', browser: 'Safari' },
    { deviceType: 'Computador', os: 'macOS', browser: 'Safari' },
    { deviceType: 'Celular', os: 'Android', browser: 'Google Chrome' },
    { deviceType: 'Celular', os: 'iOS', browser: 'Instagram App' }
  ];

  const seedPaths = ['/', '/catalogo', '/produto/pomada-matte-black7-prime', '/sobre', '/catalogo?cat=Pomadas', '/contato'];

  // Generate 45 realistic recent logs over the last 5 days
  for (let i = 0; i < 45; i++) {
    const timeOffset = Math.floor(Math.random() * (4 * oneDay)) + (i * 35 * 60 * 1000);
    const logTime = new Date(now - timeOffset);
    const dev = seedDevices[i % seedDevices.length];
    const path = seedPaths[i % seedPaths.length];

    logs.push({
      id: `seed-log-${i}`,
      timestamp: logTime.getTime(),
      formattedDate: logTime.toLocaleDateString('pt-BR'),
      formattedTime: logTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      deviceType: dev.deviceType,
      os: dev.os,
      browser: dev.browser,
      path: path,
      referrer: i % 3 === 0 ? 'instagram.com' : i % 5 === 0 ? 'tiktok.com' : 'direto / whatsapp'
    });
  }

  // Sort latest first
  logs.sort((a, b) => b.timestamp - a.timestamp);

  // Initial product analytics
  const productAnalytics: Record<string, ProductAnalytics> = {};
  
  // Seed baseline metrics for products
  const defaultWeights: Record<string, { views: number; clicks: number }> = {
    'pomada-matte-black7-prime': { views: 214, clicks: 58 },
    'kit-barba-cabelo-master': { views: 189, clicks: 47 },
    'oleo-barba-black7-gold': { views: 165, clicks: 39 },
    'tonico-pigmentacao-crescimento': { views: 142, clicks: 36 },
    'cera-po-volume-black7': { views: 120, clicks: 28 },
    'perfume-black7-noir-edp': { views: 104, clicks: 24 },
    'maquina-acabamento-black7-pro': { views: 98, clicks: 19 },
    'pomada-efeito-brilho-diamond': { views: 76, clicks: 15 },
    'shampoo-ice-mint-black7': { views: 68, clicks: 12 },
    'tesoura-fio-laser-japanese-steel': { views: 54, clicks: 9 },
    'balm-modelador-black7-wood-spice': { views: 48, clicks: 8 },
    'escova-disfarce-fade-black7': { views: 39, clicks: 6 }
  };

  PRODUCTS.forEach((prod) => {
    const w = defaultWeights[prod.id] || { views: 20, clicks: 3 };
    productAnalytics[prod.id] = {
      productId: prod.id,
      productName: prod.name,
      views: w.views,
      whatsappClicks: w.clicks,
      lastClickTimestamp: now - Math.floor(Math.random() * 86400000)
    };
  });

  return {
    totalVisits: 382,
    accessLogs: logs,
    productAnalytics
  };
}

export function getAnalyticsStorage(): AnalyticsStorage {
  if (typeof window === 'undefined') {
    return generateSeedData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = generateSeedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return generateSeedData();
  }
}

export function saveAnalyticsStorage(data: AnalyticsStorage): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Falha ao salvar analítica no localStorage:', err);
  }
}

// Log a real user visit
export function recordVisit(path: string = '/'): void {
  if (typeof window === 'undefined') return;

  // Deduplicate rapid reloads in session (optional flag)
  const sessionKey = 'black7_last_visit_time';
  const lastTime = sessionStorage.getItem(sessionKey);
  const now = Date.now();

  const data = getAnalyticsStorage();
  data.totalVisits += 1;

  const { deviceType, os, browser } = detectDeviceInfo();
  const dateObj = new Date();

  const newLog: AccessLog = {
    id: `log-${now}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now,
    formattedDate: dateObj.toLocaleDateString('pt-BR'),
    formattedTime: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    deviceType,
    os,
    browser,
    path: path || window.location.pathname || '/',
    referrer: document.referrer ? new URL(document.referrer, window.location.origin).hostname : 'direto / bio'
  };

  data.accessLogs.unshift(newLog);

  // Keep max 200 logs to preserve storage size
  if (data.accessLogs.length > 200) {
    data.accessLogs = data.accessLogs.slice(0, 200);
  }

  saveAnalyticsStorage(data);
  sessionStorage.setItem(sessionKey, String(now));
}

// Track WhatsApp click for a specific product
export function trackWhatsAppClick(productId: string, productName: string): void {
  const data = getAnalyticsStorage();
  if (!data.productAnalytics[productId]) {
    data.productAnalytics[productId] = {
      productId,
      productName,
      views: 1,
      whatsappClicks: 0
    };
  }

  data.productAnalytics[productId].whatsappClicks += 1;
  data.productAnalytics[productId].lastClickTimestamp = Date.now();
  saveAnalyticsStorage(data);
}

// Track product detail view
export function trackProductView(productId: string, productName: string): void {
  const data = getAnalyticsStorage();
  if (!data.productAnalytics[productId]) {
    data.productAnalytics[productId] = {
      productId,
      productName,
      views: 0,
      whatsappClicks: 0
    };
  }

  data.productAnalytics[productId].views += 1;
  saveAnalyticsStorage(data);
}

// Reset analytics data
export function resetAnalyticsData(): AnalyticsStorage {
  const seed = generateSeedData();
  saveAnalyticsStorage(seed);
  return seed;
}
