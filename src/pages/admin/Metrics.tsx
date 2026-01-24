import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Eye, ShoppingCart, DollarSign, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminProducts, Product } from '@/hooks/useAdminProducts';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MetricData {
  product_id: string;
  event_type: string;
  quantity: number;
  created_at: string;
}

export default function Metrics() {
  const { fetchProducts } = useAdminProducts();
  const [selectedDays, setSelectedDays] = useState(7);
  
  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchProducts,
  });

  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['admin-detailed-metrics', selectedDays],
    queryFn: async () => {
      const startDate = subDays(new Date(), selectedDays).toISOString();
      
      try {
        const { data, error } = await supabase
          .from('product_metrics')
          .select('*')
          .gte('created_at', startDate)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.log('Metrics query error:', error);
          return [];
        }

        return data as MetricData[];
      } catch {
        return [];
      }
    }
  });

  // Calculate stats per product
  const productStats = products?.map(product => {
    const productMetrics = metrics?.filter(m => m.product_id === product.id) || [];
    
    const views = productMetrics.filter(m => m.event_type === 'view').length;
    const cartAdds = productMetrics.filter(m => m.event_type === 'cart_add').length;
    const purchases = productMetrics
      .filter(m => m.event_type === 'purchase')
      .reduce((sum, m) => sum + (m.quantity || 1), 0);
    
    const conversionRate = views > 0 ? ((purchases / views) * 100).toFixed(1) : '0';

    return {
      ...product,
      views,
      cartAdds,
      purchases,
      conversionRate
    };
  }) || [];

  // Sort by views descending
  const sortedStats = [...productStats].sort((a, b) => b.views - a.views);

  // Total stats
  const totalViews = productStats.reduce((sum, p) => sum + p.views, 0);
  const totalCartAdds = productStats.reduce((sum, p) => sum + p.cartAdds, 0);
  const totalPurchases = productStats.reduce((sum, p) => sum + p.purchases, 0);
  const avgConversion = totalViews > 0 ? ((totalPurchases / totalViews) * 100).toFixed(1) : '0';

  const summaryCards = [
    { icon: Eye, label: 'Visualizações', value: totalViews, color: 'bg-primary' },
    { icon: ShoppingCart, label: 'Adições ao Carrinho', value: totalCartAdds, color: 'bg-secondary' },
    { icon: DollarSign, label: 'Vendas Iniciadas', value: totalPurchases, color: 'bg-green-500' },
    { icon: TrendingUp, label: 'Taxa de Conversão', value: `${avgConversion}%`, color: 'bg-accent' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-fredoka text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Métricas
          </h1>
          <p className="text-muted-foreground">Acompanhe o desempenho dos seus produtos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={selectedDays === 7 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDays(7)}
          >
            7 dias
          </Button>
          <Button
            variant={selectedDays === 30 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDays(30)}
          >
            30 dias
          </Button>
          <Button
            variant={selectedDays === 90 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDays(90)}
          >
            90 dias
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Últimos {selectedDays} dias
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Product Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Produto</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando métricas...
            </div>
          ) : sortedStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma métrica registrada ainda.</p>
              <p className="text-sm">As métricas serão exibidas quando visitantes interagirem com seus produtos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Produto</th>
                    <th className="text-center py-3 px-2 font-medium">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-4 w-4" />
                        Views
                      </div>
                    </th>
                    <th className="text-center py-3 px-2 font-medium">
                      <div className="flex items-center justify-center gap-1">
                        <ShoppingCart className="h-4 w-4" />
                        Carrinho
                      </div>
                    </th>
                    <th className="text-center py-3 px-2 font-medium">
                      <div className="flex items-center justify-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Vendas
                      </div>
                    </th>
                    <th className="text-center py-3 px-2 font-medium">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Conversão
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <BarChart3 className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium truncate max-w-[200px]">{product.title}</p>
                            <p className="text-xs text-muted-foreground">
                              R$ {product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className="font-bold text-primary">{product.views}</span>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className="font-bold text-secondary">{product.cartAdds}</span>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className="font-bold text-green-600">{product.purchases}</span>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className={`font-bold ${parseFloat(product.conversionRate) > 5 ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {product.conversionRate}%
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Como as métricas funcionam:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Views:</strong> Cada vez que um produto aparece na tela do visitante</li>
                <li><strong>Carrinho:</strong> Quando o visitante adiciona o produto ao carrinho</li>
                <li><strong>Vendas:</strong> Quando o visitante clica em "Enviar pelo WhatsApp"</li>
                <li><strong>Conversão:</strong> Porcentagem de views que resultaram em venda</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}