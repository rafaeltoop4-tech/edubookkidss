import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, Package, Calendar, Check, Clock, X, Plus, 
  RefreshCw, Search, Filter, TrendingUp, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Sale {
  id: string;
  sale_code: string;
  product_id: string | null;
  product_title: string;
  product_price: number;
  quantity: number;
  status: string;
  customer_phone: string | null;
  notes: string | null;
  created_at: string;
}

export default function Sales() {
  const queryClient = useQueryClient();
  const [selectedDays, setSelectedDays] = useState(30);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSale, setNewSale] = useState({
    product_title: '',
    product_price: '',
    quantity: '1',
    status: 'confirmed' as string,
    notes: ''
  });

  const { data: sales, isLoading, refetch } = useQuery({
    queryKey: ['admin-sales', selectedDays],
    queryFn: async () => {
      const startDate = subDays(new Date(), selectedDays).toISOString();
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Sale[];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('sales')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sales'] });
      toast.success('Status atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    }
  });

  const createSaleMutation = useMutation({
    mutationFn: async (sale: typeof newSale) => {
      const saleCode = `EDU-${Date.now().toString(36).toUpperCase()}-MAN`;
      
      const { error } = await supabase.from('sales').insert({
        sale_code: saleCode,
        product_title: sale.product_title,
        product_price: parseFloat(sale.product_price) || 0,
        quantity: parseInt(sale.quantity) || 1,
        status: sale.status,
        notes: sale.notes || null,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sales'] });
      toast.success('Venda registrada!');
      setIsDialogOpen(false);
      setNewSale({
        product_title: '',
        product_price: '',
        quantity: '1',
        status: 'confirmed',
        notes: ''
      });
    },
    onError: () => {
      toast.error('Erro ao registrar venda');
    }
  });

  const filteredSales = sales?.filter(sale => {
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    const matchesSearch = 
      sale.product_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.sale_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const stats = {
    total: sales?.length || 0,
    confirmed: sales?.filter(s => s.status === 'confirmed').length || 0,
    pending: sales?.filter(s => s.status === 'pending').length || 0,
    cancelled: sales?.filter(s => s.status === 'cancelled').length || 0,
    revenue: sales?.filter(s => s.status === 'confirmed')
      .reduce((sum, s) => sum + (s.product_price * s.quantity), 0) || 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700">Confirmada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pendente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-fredoka text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Vendas
          </h1>
          <p className="text-muted-foreground">Gerencie pedidos e confirmações</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[7, 30, 90, 180].map((days) => (
            <Button
              key={days}
              variant={selectedDays === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDays(days)}
            >
              {days} dias
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-rainbow">
                <Plus className="mr-2 h-4 w-4" />
                Nova Venda
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Venda Manual</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createSaleMutation.mutate(newSale); }} className="space-y-4">
                <div>
                  <Label>Nome do Produto</Label>
                  <Input
                    value={newSale.product_title}
                    onChange={(e) => setNewSale({ ...newSale, product_title: e.target.value })}
                    placeholder="Ex: Ebook Alfabetização"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Preço (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newSale.product_price}
                      onChange={(e) => setNewSale({ ...newSale, product_price: e.target.value })}
                      placeholder="29.90"
                      required
                    />
                  </div>
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      value={newSale.quantity}
                      onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={newSale.status} 
                    onValueChange={(value: 'confirmed' | 'pending' | 'cancelled') => setNewSale({ ...newSale, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmada</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Observações (opcional)</Label>
                  <Input
                    value={newSale.notes}
                    onChange={(e) => setNewSale({ ...newSale, notes: e.target.value })}
                    placeholder="Ex: Pagamento via Pix"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createSaleMutation.isPending}>
                  {createSaleMutation.isPending ? 'Salvando...' : 'Registrar Venda'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-green-600">Confirmadas</div>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-yellow-600">Pendentes</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-red-600">Canceladas</div>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Receita</div>
            <div className="text-2xl font-bold text-primary">
              R$ {stats.revenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por produto ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="confirmed">Confirmadas</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sales Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Carregando vendas...
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma venda encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Código</th>
                    <th className="text-left py-3 px-4 font-medium">Produto</th>
                    <th className="text-center py-3 px-4 font-medium">Valor</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium">Data</th>
                    <th className="text-center py-3 px-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale, index) => (
                    <motion.tr
                      key={sale.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b hover:bg-muted/30"
                    >
                      <td className="py-3 px-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {sale.sale_code}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium truncate max-w-[200px]">
                          {sale.product_title}
                        </div>
                        {sale.notes && (
                          <div className="text-xs text-muted-foreground truncate">
                            {sale.notes}
                          </div>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="font-bold">
                          R$ {(sale.product_price * sale.quantity).toFixed(2)}
                        </span>
                        {sale.quantity > 1 && (
                          <div className="text-xs text-muted-foreground">
                            {sale.quantity}x
                          </div>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        {getStatusBadge(sale.status)}
                      </td>
                      <td className="text-center py-3 px-4 text-sm text-muted-foreground">
                        {format(new Date(sale.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {sale.status !== 'confirmed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatusMutation.mutate({ id: sale.id, status: 'confirmed' })}
                              title="Confirmar"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {sale.status !== 'pending' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatusMutation.mutate({ id: sale.id, status: 'pending' })}
                              title="Marcar como pendente"
                            >
                              <Clock className="h-4 w-4 text-yellow-600" />
                            </Button>
                          )}
                          {sale.status !== 'cancelled' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatusMutation.mutate({ id: sale.id, status: 'cancelled' })}
                              title="Cancelar"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}