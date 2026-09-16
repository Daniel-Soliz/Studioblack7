export type ServiceCategory = 
  | 'Todos'
  | 'Cortes'
  | 'Barba'
  | 'Penteado / Acabamento'
  | 'Química / Alisamento'
  | 'Coloração';

export interface ServiceItem {
  id: string;
  name: string;
  price: string;
  promoPrice?: string;
  priceNumber?: number;
  duration?: string;
  category: Exclude<ServiceCategory, 'Todos'> | string;
  description?: string;
  popular?: boolean;
  featured?: boolean;
  status?: 'active' | 'inactive';
  order?: number;
  image?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  alt: string;
  tag: string;
  visible?: boolean;
  order?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  experience: string;
  specialty?: string;
  image: string;
  description: string;
  instagram?: string;
  whatsapp?: string;
  phone?: string;
  services?: string[];
  active?: boolean;
  order?: number;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  servicePrice?: string;
  professionalId: string;
  professionalName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Promotion {
  id: string;
  title: string;
  description?: string;
  originalPrice: number;
  promoPrice: number;
  discountPercent?: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
  badge?: string;
  category?: string;
  image?: string;
  serviceId?: string;
  productId?: string;
  order?: number;
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  hash?: string;
  active: boolean;
  order: number;
  isExternal?: boolean;
}

export interface HomeSectionConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  description?: string;
}

export interface StatItem {
  value: string;
  label: string;
  detail: string;
}

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';
export type ProductBadge = 'Novo' | 'Oferta' | 'Destaque' | string;
export type ProductCategory = string;

export interface ProductCategoryItem {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  status: 'active' | 'inactive';
}

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  slug?: string;
  category: string;
  shortDescription?: string;
  description: string;
  price: number;
  salePrice?: number;
  originalPrice?: number;
  images?: string[];
  thumbnail?: string;
  image?: string;
  gallery?: string[];
  stock?: number;
  minStock?: number;
  sku?: string;
  status?: ProductStatus;
  featured?: boolean;
  badge?: ProductBadge;
  isBestSeller?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  volumeOrSize?: string;
  rating?: number;
  reviewCount?: number;
  howToUse?: string;
  benefits?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'preparing'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface CustomerAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode?: string;
  postalCode?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: CustomerAddress;
}

export interface OrderItem {
  productId: string;
  name?: string;
  productName?: string;
  price?: number;
  unitPrice?: number;
  quantity: number;
  totalPrice?: number;
  image?: string;
  sku?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  shippingMethod: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock?: number;
  newStock?: number;
  reason: string;
  createdAt?: string;
  date?: string;
  performedBy?: string;
}

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  heroBadge?: string;
  heroTagline?: string;
  heroImageUrl?: string;
  heroButtonBookingText?: string;
  heroButtonServicesText?: string;
  heroButtonStoreText?: string;
  aboutTitle: string;
  aboutText: string;
  aboutQuote: string;
  founderName: string;
  founderBio: string;
  founderSpecialty: string;
  founderExperience: string;
  founderImageUrl?: string;
  positioningQuote: string;
  storeTitle: string;
  storeSubtitle: string;
  storeBannerUrl?: string;
  bookingTitle?: string;
  bookingSubtitle?: string;
  locationTitle?: string;
  locationDescription?: string;
  footerText?: string;
  footerCopyright?: string;
  homeSections?: HomeSectionConfig[];
}

export interface SiteSettings {
  companyName: string;
  whatsapp: string;
  whatsappRaw: string;
  phone?: string;
  email?: string;
  instagramStudio: string;
  instagramRay: string;
  instagram?: string;
  facebookUrl?: string;
  address: string;
  addressStreet?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  referencePoint?: string;
  mapsUrl?: string;
  businessHoursWeekdays: string;
  businessHoursSaturday: string;
  businessHoursSunday: string;
  statusNote?: string;
  logoUrl: string;
  faviconUrl: string;
  heroImageUrl?: string;
  founderImageUrl?: string;
  storeBannerUrl?: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  lowStockThreshold: number;
  adminPasswordHash?: string;
  adminEmail?: string;
  cloudSyncUrl?: string;
  cloudSyncKey?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
  dateFormatted?: string;
  userName?: string;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  token: string;
  expiresAt: number;
}

export interface AccessLog {
  id: string;
  timestamp: number;
  formattedDate: string;
  formattedTime: string;
  deviceType: 'Celular' | 'Tablet' | 'Computador';
  os: string;
  browser: string;
  path: string;
  referrer: string;
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  views: number;
  whatsappClicks: number;
  lastClickTimestamp?: number;
}

export interface AnalyticsStorage {
  totalVisits: number;
  accessLogs: AccessLog[];
  productAnalytics: Record<string, ProductAnalytics>;
}
