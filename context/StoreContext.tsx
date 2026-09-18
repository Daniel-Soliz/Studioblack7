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
        if (cloud.products) setProducts(cloud.products as Product[]);
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
          if (cloud.products) setProducts(cloud.products as Product[]);
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
    const res = StorageService.saveProduct(product);
    StorageService.logActivity(
      isNew ? 'Produto Criado' : 'Produto Atualizado',
      `Produto "${product.name}" salvo com sucesso.`
    );
    void CloudStoreService.save('products', StorageService.getProducts()).catch((error) => console.error('Falha ao sincronizar produtos:', error));
    refreshData();
    return res;
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    const res = StorageService.deleteProduct(id);
    StorageService.logActivity(
      'Produto Excluído',
      `Produto "${prod?.name || id}" removido do catálogo.`
    );
    void CloudStoreService.save('products', StorageService.getProducts()).catch((error) => console.error('Falha ao sincronizar produtos:', error));
    refreshData();
    return res;
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
