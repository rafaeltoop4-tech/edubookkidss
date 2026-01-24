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
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const menuItems = [
  { icon: LayoutGrid, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Package, label: 'Produtos', path: '/admin/products' },
  { icon: BarChart3, label: 'Métricas', path: '/admin/metrics' },
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

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/admin');
  };

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-fredoka font-bold text-lg">Edu Book Kids</h1>
            <p className="text-xs text-muted-foreground">Painel Admin</p>
          </div>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
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
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  "hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                )}
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
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
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
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Sair do Painel
        </Button>
      </div>
    </aside>
  );
}
