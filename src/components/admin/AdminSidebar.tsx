import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Package, 
  MessageCircle, 
  Palette, 
  LayoutGrid,
  Settings, 
  Eye, 
  LogOut,
  BookOpen,
  Home,
  FileText,
  Star,
  HelpCircle,
  BarChart3,
  DollarSign,
  MessageSquare,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const menuItems = [
  { icon: LayoutGrid, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Package, label: 'Produtos', path: '/admin/products' },
  { icon: DollarSign, label: 'Vendas', path: '/admin/sales' },
  { icon: BarChart3, label: 'Métricas', path: '/admin/metrics' },
  { icon: MessageSquare, label: 'Avaliações', path: '/admin/reviews' },
  { icon: MessageCircle, label: 'WhatsApp', path: '/admin/whatsapp' },
  { icon: Palette, label: 'Layout & Cores', path: '/admin/layout' },
  { icon: Home, label: 'Cabeçalho', path: '/admin/header' },
  { icon: FileText, label: 'Rodapé', path: '/admin/footer' },
  { icon: Star, label: 'Depoimentos', path: '/admin/testimonials' },
  { icon: HelpCircle, label: 'FAQ', path: '/admin/faq' },
  { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  { icon: Eye, label: 'Ver Site', path: '/', external: true },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/admin');
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl">
            <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-fredoka font-bold text-base md:text-lg">Edu Book Kids</h1>
            <p className="text-xs text-muted-foreground">Painel Admin</p>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 md:p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.external) {
            return (
              <a
                key={item.path}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-sm font-medium transition-all",
                  "hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </a>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-sm font-medium transition-all",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-primary/10 text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 md:p-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Sair do Painel
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="p-1.5 bg-primary rounded-lg">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-fredoka font-bold text-sm">Edu Book Kids</span>
        </Link>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <aside 
            className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-card border-r border-border flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}
