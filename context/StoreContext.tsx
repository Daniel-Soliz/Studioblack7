import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  ProductCategoryItem, 
  ServiceItem, 
  GalleryItem, 
  SiteContent, 
  SiteSettings,
  Order,
  ActivityLog
} from '../types';
import { StorageService } from '../services/storageService';
import { CloudStoreService } from '../services/cloudStoreService';

interface StoreContextType {
  products: Product[];
  categories: ProductCategoryItem[];
  services: ServiceItem[];
  gallery: GalleryItem[];
  content: SiteContent;
  settings: SiteSettings;
  orders: Order[];
  activities: ActivityLog[];
  refreshData: () => void;
  // Admin mutations
  saveProduct: (product: Product) => { success: boolean; message: string; product?: Product };
  deleteProduct: (id: string) => boolean;
  saveCategories: (cats: ProductCategoryItem[]) => void;
  saveServices: (servs: ServiceItem[]) => void;
  saveGallery: (items: GalleryItem[]) => void;
  saveContent: (c: SiteContent) => void;
  saveSettings: (s: SiteSettings) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => boolean;
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Order;
  logActivity: (action: string, detail: string) => void;
  exportData: () => string;
  importData: (jsonString: string) => { success: boolean; message: string };
  resetDefaults: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategoryItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [content, setContent] = useState<SiteContent>(StorageService.getContent());
  const [settings, setSettings] = useState<SiteSettings>(StorageService.getSettings());
  const [orders, setOrders] = useState<Order[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const refreshData = useCallback(() => {
    setProducts(StorageService.getProducts());
    setCategories(StorageService.getCategories());
    setServices(StorageService.getServices());
    setGallery(StorageService.getGallery());
    setContent(StorageService.getContent());
    setSettings(StorageService.getSettings());
    setOrders(StorageService.getOrders());
    setActivities(StorageService.getActivities());
  }, []);

  useEffect(() => {
    refreshData();
    let active = true;

    CloudStoreService.loadAll()
      .then((cloud) => {
        if (!active) return;
        if (cloud.products) {
          const cloudProducts = cloud.products as Product[];
          StorageService.saveProducts(cloudProducts);
          setProducts(cloudProducts);
        }
        if (cloud.categories) setCategories(cloud.categories as ProductCategoryItem[]);
        if (cloud.services) setServices(cloud.services as ServiceItem[]);
        if (cloud.gallery) setGallery(cloud.gallery as GalleryItem[]);
        if (cloud.content) setContent({ ...StorageService.getContent(), ...(cloud.content as SiteContent) });
        if (cloud.settings) setSettings({ ...StorageService.getSettings(), ...(cloud.settings as SiteSettings) });
        if (cloud.orders) setOrders(cloud.orders as Order[]);
        if (cloud.activities) setActivities(cloud.activities as ActivityLog[]);
      })
      .catch((error) => console.warn('Sincronização com a nuvem indisponível:', error));

    const syncCloud = () => {
      CloudStoreService.loadAll()
        .then((cloud) => {
          if (!active) return;
          if (cloud.products) {
            const cloudProducts = cloud.products as Product[];
            StorageService.saveProducts(cloudProducts);
            setProducts(cloudProducts);
          }
          if (cloud.categories) setCategories(cloud.categories as ProductCategoryItem[]);
          if (cloud.services) setServices(cloud.services as ServiceItem[]);
          if (cloud.gallery) setGallery(cloud.gallery as GalleryItem[]);
          if (cloud.content) setContent({ ...StorageService.getContent(), ...(cloud.content as SiteContent) });
          if (cloud.settings) setSettings({ ...StorageService.getSettings(), ...(cloud.settings as SiteSettings) });
          if (cloud.orders) setOrders(cloud.orders as Order[]);
          if (cloud.activities) setActivities(cloud.activities as ActivityLog[]);
        })
        .catch((error) => console.warn('Sincronização com a nuvem indisponível:', error));
    };

    const interval = window.setInterval(syncCloud, 10000);
    window.addEventListener('focus', syncCloud);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', syncCloud);
    };
  }, [refreshData]);

  const saveProduct = (product: Product) => {
    const isNew = !products.some(p => p.id === product.id);
    const now = new Date().toISOString();
    const normalized: Product = {
      ...product,
      id: product.id || `prod-${Date.now()}`,
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      createdAt: product.createdAt || now,
      updatedAt: now
    };

    const current = [...products];
    const existingIndex = current.findIndex(p => p.id === normalized.id);
    const skuConflict = normalized.sku
      ? current.find(p => p.sku?.trim().toLowerCase() === normalized.sku?.trim().toLowerCase() && p.id !== normalized.id)
      : undefined;

    if (skuConflict) {
      return { success: false, message: `O SKU "${normalized.sku}" já está em uso pelo produto "${skuConflict.name}".` };
    }

    if (existingIndex >= 0) current[existingIndex] = normalized;
    else current.unshift(normalized);

    StorageService.saveProducts(current);
    setProducts(current);
    StorageService.logActivity(
      isNew ? 'Produto Criado' : 'Produto Atualizado',
      `Produto "${normalized.name}" salvo com sucesso.`
    );
    void CloudStoreService.save('products', current).catch((error) => console.error('Falha ao sincronizar produtos:', error));

    return {
      success: true,
      message: isNew ? 'Produto criado com sucesso.' : 'Produto atualizado com sucesso.',
      product: normalized
    };
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    const next = products.filter(p => p.id !== id);
    if (next.length === products.length) return false;

    StorageService.saveProducts(next);
    setProducts(next);
    StorageService.logActivity(
      'Produto Excluído',
      `Produto "${prod?.name || id}" removido do catálogo.`
    );
    void CloudStoreService.save('products', next).catch((error) => console.error('Falha ao sincronizar produtos:', error));
    return true;
  };

  const saveCategories = (cats: ProductCategoryItem[]) => {
    StorageService.saveCategories(cats);
    void CloudStoreService.save('categories', cats).catch((error) => console.error('Falha ao sincronizar categorias:', error));
    StorageService.logActivity('Categorias Atualizadas', `${cats.length} categorias salvas.`);
    refreshData();
  };

  const saveServices = (servs: ServiceItem[]) => {
    StorageService.saveServices(servs);
    void CloudStoreService.save('services', servs).catch((error) => console.error('Falha ao sincronizar serviços:', error));
    StorageService.logActivity('Serviços Atualizados', `${servs.length} serviços cadastrados.`);
    refreshData();
  };

  const saveGallery = (items: GalleryItem[]) => {
    StorageService.saveGallery(items);
    void CloudStoreService.save('gallery', items).catch((error) => console.error('Falha ao sincronizar galeria:', error));
    StorageService.logActivity('Galeria Atualizada', `${items.length} fotos salvas na galeria.`);
    refreshData();
  };

  const saveContent = (c: SiteContent) => {
    StorageService.saveContent(c);
    void CloudStoreService.save('content', c).catch((error) => console.error('Falha ao sincronizar conteúdo:', error));
    StorageService.logActivity('Conteúdo Institucional Atualizado', 'Textos principais do site atualizados.');
    refreshData();
  };

  const saveSettings = (s: SiteSettings) => {
    StorageService.saveSettings(s);
    void CloudStoreService.save('settings', s).catch((error) => console.error('Falha ao sincronizar configurações:', error));
    StorageService.logActivity('Configurações Atualizadas', 'Contato, horários ou informações gerais salvas.');
    refreshData();
  };

  const updateOrderStatus = (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => {
    const res = StorageService.updateOrderStatus(orderId, status, paymentStatus);
    StorageService.logActivity('Status de Pedido Alterado', `Pedido ${orderId} atualizado para: ${status}.`);
    void CloudStoreService.save('orders', StorageService.getOrders()).catch((error) => console.error('Falha ao sincronizar pedidos:', error));
    refreshData();
    return res;
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    const newOrd = StorageService.createOrder(orderData);
    StorageService.logActivity('Novo Pedido Recebido', `Pedido #${newOrd.orderNumber} - R$ ${newOrd.total.toFixed(2)}.`);
    void CloudStoreService.save('orders', StorageService.getOrders()).catch((error) => console.error('Falha ao sincronizar pedidos:', error));
    refreshData();
    return newOrd;
  };

  const logActivity = (action: string, detail: string) => {
    StorageService.logActivity(action, detail);
    void CloudStoreService.save('activities', StorageService.getActivities()).catch((error) => console.error('Falha ao sincronizar atividades:', error));
    refreshData();
  };

  const exportData = () => {
    return StorageService.exportAllData();
  };

  const importData = (jsonString: string) => {
    const res = StorageService.importAllData(jsonString);
    refreshData();
    return res;
  };

  const resetDefaults = () => {
    StorageService.resetToDefaults();
    refreshData();
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        services,
        gallery,
        content,
        settings,
        orders,
        activities,
        refreshData,
        saveProduct,
        deleteProduct,
        saveCategories,
        saveServices,
        saveGallery,
        saveContent,
        saveSettings,
        updateOrderStatus,
        createOrder,
        logActivity,
        exportData,
        importData,
        resetDefaults
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore deve ser utilizado dentro de um StoreProvider');
  }
  return context;
};
