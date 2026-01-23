import { motion } from 'framer-motion';
import { Package, Star, HelpCircle, Eye, TrendingUp, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const { data: products } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: async () => {
      const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: testimonials } = useQuery({
    queryKey: ['admin-testimonials-count'],
    queryFn: async () => {
      const { count } = await supabase.from('testimonials').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: faqs } = useQuery({
    queryKey: ['admin-faq-count'],
    queryFn: async () => {
      const { count } = await supabase.from('faq').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const stats = [
    { icon: Package, label: 'Produtos', value: products || 0, color: 'bg-primary' },
    { icon: Star, label: 'Depoimentos', value: testimonials || 0, color: 'bg-secondary' },
    { icon: HelpCircle, label: 'Perguntas FAQ', value: faqs || 0, color: 'bg-mint' },
    { icon: Eye, label: 'Visualizações', value: '—', color: 'bg-accent' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-fredoka text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao painel administrativo do Edu Book Kids</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a 
              href="/admin/products" 
              className="block p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <div className="font-medium">Adicionar Produto</div>
              <div className="text-sm text-muted-foreground">Cadastre novos ebooks e atividades</div>
            </a>
            <a 
              href="/admin/layout" 
              className="block p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <div className="font-medium">Personalizar Layout</div>
              <div className="text-sm text-muted-foreground">Altere cores, fontes e estilos</div>
            </a>
            <a 
              href="/admin/whatsapp" 
              className="block p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <div className="font-medium">Configurar WhatsApp</div>
              <div className="text-sm text-muted-foreground">Defina o número para checkout</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-secondary" />
              Dicas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>✅ Todas as alterações são salvas automaticamente no banco de dados</p>
            <p>✅ O site atualiza em tempo real após cada modificação</p>
            <p>✅ O número do WhatsApp fica oculto do público</p>
            <p>✅ Produtos podem ter múltiplas imagens e PDF anexo</p>
            <p>✅ Faça logout quando terminar de editar</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
