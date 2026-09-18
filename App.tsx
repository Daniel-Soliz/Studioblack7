import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, StoreProvider, CartProvider } from './context';

// Public Pages
import {
  HomePage,
  StorePage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
  AboutPage,
  ServicesPage,
  LocationPage,
  ContactPage,
} from './pages';

// Admin Pages
import {
  AdminLoginPage,
  AdminDashboardPage,
  AdminAccessPage,
  AdminProductsPage,
  AdminProductFormPage,
  AdminInventoryPage,
  AdminOrdersPage,
  AdminCategoriesPage,
  AdminServicesPage,
  AdminSiteImagesPage,
  AdminContentPage,
  AdminContactPage,
  AdminLocationPage,
  AdminHoursPage,
  AdminSettingsPage,
} from './pages/admin';

// Automatically scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <ScrollToTop />
            <Routes>
              {/* Public Website Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/servicos" element={<ServicesPage />} />
              <Route path="/localizacao" element={<LocationPage />} />
              <Route path="/contato" element={<ContactPage />} />

              {/* Store & Checkout Routes */}
              <Route path="/loja" element={<StorePage />} />
              <Route path="/produto/:id" element={<ProductDetailPage />} />
              <Route path="/carrinho" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />

              {/* Admin Panel Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/acessos" element={<AdminAccessPage />} />
              <Route path="/admin/servicos" element={<AdminServicesPage />} />
              <Route path="/admin/produtos" element={<AdminProductsPage />} />
              <Route path="/admin/produtos/novo" element={<AdminProductFormPage />} />
              <Route path="/admin/produtos/:id" element={<AdminProductFormPage />} />
              <Route path="/admin/imagens" element={<AdminSiteImagesPage />} />
              <Route path="/admin/conteudo" element={<AdminContentPage />} />
              <Route path="/admin/contato" element={<AdminContactPage />} />
              <Route path="/admin/localizacao" element={<AdminLocationPage />} />
              <Route path="/admin/horarios" element={<AdminHoursPage />} />
              <Route path="/admin/pedidos" element={<AdminOrdersPage />} />
              <Route path="/admin/estoque" element={<AdminInventoryPage />} />
              <Route path="/admin/categorias" element={<AdminCategoriesPage />} />
              <Route path="/admin/configuracoes" element={<AdminSettingsPage />} />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
