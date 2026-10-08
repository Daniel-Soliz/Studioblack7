import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, StoreProvider, CartProvider } from './context';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { InstallApp } from './components/InstallApp';
import { PrivacyPage } from './pages/PrivacyPage';
const BookingPage = lazy(() => import('./pages/BookingPage').then(m => ({ default: m.BookingPage })));
const AdminAppointmentsPage = lazy(() => import('./pages/admin/AdminAppointmentsPage').then(m => ({ default: m.AdminAppointmentsPage })));

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

// Load administrative screens only when they are used.
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminAccessPage = lazy(() => import('./pages/admin/AdminAccessPage').then(m => ({ default: m.AdminAccessPage })));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage').then(m => ({ default: m.AdminProductFormPage })));
const AdminInventoryPage = lazy(() => import('./pages/admin/AdminInventoryPage').then(m => ({ default: m.AdminInventoryPage })));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })));
const AdminServicesPage = lazy(() => import('./pages/admin/AdminServicesPage').then(m => ({ default: m.AdminServicesPage })));
const AdminSiteImagesPage = lazy(() => import('./pages/admin/AdminSiteImagesPage').then(m => ({ default: m.AdminSiteImagesPage })));
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage').then(m => ({ default: m.AdminContentPage })));
const AdminContactPage = lazy(() => import('./pages/admin/AdminContactPage').then(m => ({ default: m.AdminContactPage })));
const AdminLocationPage = lazy(() => import('./pages/admin/AdminLocationPage').then(m => ({ default: m.AdminLocationPage })));
const AdminHoursPage = lazy(() => import('./pages/admin/AdminHoursPage').then(m => ({ default: m.AdminHoursPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));

// Automatically scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (pathname.startsWith('/admin')) return;
    try {
      const now = Date.now();
      let visitorId = localStorage.getItem('sb7-visitor');
      if (!visitorId) { visitorId = crypto.randomUUID(); localStorage.setItem('sb7-visitor', visitorId); }
      const saved = sessionStorage.getItem('sb7-visit');
      let visit: { id: string; last: number; tracked: boolean } = saved ? JSON.parse(saved) : null;
      if (!visit || now - visit.last > 30 * 60000) visit = { id: crypto.randomUUID(), last: now, tracked: false };
      visit.last = now;
      sessionStorage.setItem('sb7-visit', JSON.stringify(visit));
      if (!visit.tracked) {
        const sessionId = visit.id;
        void fetch('https://oyghjlwujdmgfkopujip.supabase.co/functions/v1/appointments', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
          body: JSON.stringify({ action: 'track_access', sessionId, visitorId })
        }).then(response => {
          if (!response.ok) return;
          const current = JSON.parse(sessionStorage.getItem('sb7-visit') || 'null');
          if (current?.id === sessionId) sessionStorage.setItem('sb7-visit', JSON.stringify({ ...current, tracked: true }));
        }).catch(() => {});
      }
    } catch { /* Browsing continues when storage or analytics is unavailable. */ }
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <ScrollToTop />
            <InstallApp />
            <Suspense fallback={<div role="status" className="min-h-screen bg-zinc-950 text-amber-300 grid place-items-center">Carregando Studio Black7…</div>}>
            <Routes>
              {/* Public Website Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/servicos" element={<ServicesPage />} />
              <Route path="/agendar" element={<BookingPage />} />
              <Route path="/localizacao" element={<LocationPage />} />
              <Route path="/contato" element={<ContactPage />} />
              <Route path="/privacidade" element={<PrivacyPage />} />

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
              <Route path="/admin/agendamentos" element={<AdminAppointmentsPage />} />
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
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </StoreProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
