import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
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
          <Route path="/admin" element={<AdminLogin />} />
          
          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="whatsapp" element={<WhatsAppSettings />} />
            <Route path="layout" element={<LayoutSettings />} />
            <Route path="header" element={<HeaderSettings />} />
            <Route path="footer" element={<FooterSettings />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="faq" element={<FAQAdmin />} />
            <Route path="settings" element={<GeneralSettings />} />
            <Route path="metrics" element={<Metrics />} />
            <Route path="sales" element={<Sales />} />
            <Route path="reviews" element={<Reviews />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
