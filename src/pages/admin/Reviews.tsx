import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Plus, Trash2, Save, X, MessageSquare, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { toast } from 'sonner';

interface Review {
  id: string;
  product_id: string;
  author_name: string;
  content: string;
  rating: number;
  active: boolean;
  created_at: string;
}

export default function Reviews() {
  const queryClient = useQueryClient();
  const { fetchProducts } = useAdminProducts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    product_id: '',
    author_name: '',
    content: '',
    rating: 5,
    active: true
  });

  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchProducts,
  });

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Review[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingReview) {
        const { error } = await supabase
          .from('product_reviews')
          .update(data)
          .eq('id', editingReview.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('product_reviews')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success(editingReview ? 'Avaliação atualizada!' : 'Avaliação criada!');
      resetForm();
    },
    onError: () => {
      toast.error('Erro ao salvar avaliação');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Avaliação excluída!');
    },
    onError: () => {
      toast.error('Erro ao excluir avaliação');
    }
  });

  const resetForm = () => {
    setFormData({
      product_id: '',
      author_name: '',
      content: '',
      rating: 5,
      active: true
    });
    setEditingReview(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (review: Review) => {
    setEditingReview(review);
    setFormData({
      product_id: review.product_id,
      author_name: review.author_name,
      content: review.content,
      rating: review.rating,
      active: review.active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const getProductTitle = (productId: string) => {
    return products?.find(p => p.id === productId)?.title || 'Produto removido';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-fredoka text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Avaliações
          </h1>
          <p className="text-muted-foreground">Gerencie comentários por produto</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="btn-rainbow">
              <Plus className="mr-2 h-4 w-4" />
              Nova Avaliação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingReview ? 'Editar Avaliação' : 'Nova Avaliação'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Produto *</Label>
                <Select 
                  value={formData.product_id} 
                  onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nome do Avaliador *</Label>
                <Input
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  placeholder="Ex: Maria S."
                  required
                />
              </div>
              <div>
                <Label>Avaliação (4-5 estrelas) *</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        formData.rating === rating
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-muted hover:border-yellow-200'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Comentário *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Descreva a experiência com o produto..."
                  rows={3}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label>Avaliação ativa (visível no site)</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveMutation.isPending || !formData.product_id}>
                  <Save className="mr-2 h-4 w-4" />
                  {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : reviews?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Nenhuma avaliação cadastrada</h3>
            <p className="text-muted-foreground text-sm">
              Adicione avaliações aos seus produtos para aumentar a confiança dos clientes
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews?.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={!review.active ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-medium">{review.author_name}</span>
                        <div className="flex">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                        {!review.active && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">Inativo</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">"{review.content}"</p>
                      <p className="text-xs text-muted-foreground">
                        Produto: <span className="font-medium">{getProductTitle(review.product_id)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(review)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (confirm('Excluir esta avaliação?')) {
                            deleteMutation.mutate(review.id);
                          }
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}