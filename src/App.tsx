import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import Auth from "./pages/Auth";
import ProductDetail from "./pages/ProductDetail";
import Catalog from "./pages/Catalog";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import WhatsAppSettings from "./pages/admin/WhatsApp";
import LayoutSettings from "./pages/admin/Layout";
import HeaderSettings from "./pages/admin/HeaderSettings";
import FooterSettings from "./pages/admin/FooterSettings";
import Testimonials from "./pages/admin/Testimonials";
import FAQAdmin from "./pages/admin/FAQ";
import GeneralSettings from "./pages/admin/Settings";
import Metrics from "./pages/admin/Metrics";
import Sales from "./pages/admin/Sales";
import Reviews from "./pages/admin/Reviews";
import Admins from "./pages/admin/Admins";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/produto/:id" element={<ProductDetail />} />
          <Route path="/entrar" element={<Auth />} />
          <Route path="/admin" element={<AdminLogin />} />
          
          {/* Admin Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/whatsapp" element={<WhatsAppSettings />} />
            <Route path="/admin/layout" element={<LayoutSettings />} />
            <Route path="/admin/header" element={<HeaderSettings />} />
            <Route path="/admin/footer" element={<FooterSettings />} />
            <Route path="/admin/testimonials" element={<Testimonials />} />
            <Route path="/admin/faq" element={<FAQAdmin />} />
            <Route path="/admin/settings" element={<GeneralSettings />} />
            <Route path="/admin/metrics" element={<Metrics />} />
            <Route path="/admin/sales" element={<Sales />} />
            <Route path="/admin/reviews" element={<Reviews />} />
            <Route path="/admin/admins" element={<Admins />} />
          </Route>
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
