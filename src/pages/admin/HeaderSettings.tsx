import { useState, useEffect } from 'react';
import { Home, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const defaultHeader = {
  logo_text: 'Edu Book Kids',
  tagline: 'Aprendendo com diversão! 🌈',
  show_cart: true,
  menu_items: [
    { label: 'Produtos', href: '#produtos' },
    { label: 'Depoimentos', href: '#depoimentos' },
    { label: 'FAQ', href: '#faq' },
  ]
};

export default function HeaderSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(defaultHeader);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['header-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'header_config')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  useEffect(() => {
    if (settings?.value) {
      setFormData({ ...defaultHeader, ...(settings.value as typeof defaultHeader) });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await supabase
        .from('site_settings')
        .upsert({ 
          key: 'header_config', 
          value: formData 
        }, { onConflict: 'key' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['header-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Cabeçalho salvo!');
    },
    onError: (error) => {
      toast.error('Erro ao salvar: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const updateMenuItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.menu_items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, menu_items: newItems });
  };

  const addMenuItem = () => {
    setFormData({
      ...formData,
      menu_items: [...formData.menu_items, { label: 'Novo Item', href: '#' }]
    });
  };

  const removeMenuItem = (index: number) => {
    setFormData({
      ...formData,
      menu_items: formData.menu_items.filter((_, i) => i !== index)
    });
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-fredoka text-3xl font-bold">Cabeçalho</h1>
        <p className="text-muted-foreground">Configure o topo do site</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Informações Principais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome/Logo (texto)</Label>
              <Input
                value={formData.logo_text}
                onChange={(e) => setFormData({ ...formData, logo_text: e.target.value })}
                placeholder="Edu Book Kids"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Slogan/Tagline</Label>
              <Input
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Aprendendo com diversão!"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Itens do Menu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.menu_items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>Texto</Label>
                  <Input
                    value={item.label}
                    onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                    placeholder="Produtos"
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label>Link</Label>
                  <Input
                    value={item.href}
                    onChange={(e) => updateMenuItem(index, 'href', e.target.value)}
                    placeholder="#produtos"
                    className="mt-1"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeMenuItem(index)}
                  className="text-destructive"
                >
                  Remover
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addMenuItem}>
              + Adicionar Item
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saveMutation.isPending} className="btn-rainbow">
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? 'Salvando...' : 'Salvar Cabeçalho'}
          </Button>
        </div>
      </form>
    </div>
  );
}
