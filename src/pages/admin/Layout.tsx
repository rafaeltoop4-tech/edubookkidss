import { useState, useEffect } from 'react';
import { Palette, Save, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const defaultColors = {
  primary: '#7EC8E3',
  secondary: '#FFD966',
  mint: '#A3E4D7',
  accent: '#FFB347',
  lavender: '#CBA0FF',
  background: '#FFFFFF',
  muted: '#F5F5F5'
};

export default function LayoutSettings() {
  const queryClient = useQueryClient();
  const [colors, setColors] = useState(defaultColors);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['layout-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'site_colors')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  useEffect(() => {
    if (settings?.value) {
      setColors({ ...defaultColors, ...(settings.value as typeof defaultColors) });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await supabase
        .from('site_settings')
        .upsert({ 
          key: 'site_colors', 
          value: colors 
        }, { onConflict: 'key' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layout-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Cores salvas! Recarregue o site para ver as mudanças.');
    },
    onError: (error) => {
      toast.error('Erro ao salvar: ' + error.message);
    }
  });

  const handleReset = () => {
    setColors(defaultColors);
    toast.info('Cores restauradas para o padrão');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  }

  const colorFields = [
    { key: 'primary', label: 'Azul Claro (Principal)', description: 'Cabeçalho, botões principais' },
    { key: 'secondary', label: 'Amarelo', description: 'Destaques, ícones' },
    { key: 'mint', label: 'Verde Menta', description: 'Sucesso, confirmações' },
    { key: 'accent', label: 'Laranja', description: 'Call to actions, urgência' },
    { key: 'lavender', label: 'Lilás Suave', description: 'Rodapé, fundos suaves' },
    { key: 'background', label: 'Fundo', description: 'Cor de fundo principal' },
    { key: 'muted', label: 'Cinza Suave', description: 'Áreas secundárias' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-fredoka text-3xl font-bold">Layout & Cores</h1>
          <p className="text-muted-foreground">Personalize a aparência do site</p>
        </div>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Restaurar Padrão
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Paleta de Cores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colorFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>{field.label}</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-12 h-10 rounded-lg border-2 border-border flex-shrink-0"
                      style={{ backgroundColor: colors[field.key as keyof typeof colors] }}
                    />
                    <Input
                      type="text"
                      value={colors[field.key as keyof typeof colors]}
                      onChange={(e) => setColors({ ...colors, [field.key]: e.target.value })}
                      placeholder="#FFFFFF"
                    />
                    <Input
                      type="color"
                      value={colors[field.key as keyof typeof colors]}
                      onChange={(e) => setColors({ ...colors, [field.key]: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 rounded-xl" style={{ backgroundColor: colors.muted }}>
              <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: colors.primary }}>
                <span className="text-white font-bold">Cabeçalho</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: colors.secondary }}>
                  <span className="font-medium">Card</span>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: colors.mint }}>
                  <span className="font-medium">Card</span>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: colors.accent }}>
                  <span className="font-medium text-white">Card</span>
                </div>
              </div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: colors.lavender }}>
                <span className="font-medium">Rodapé</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saveMutation.isPending} className="btn-rainbow">
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? 'Salvando...' : 'Salvar Cores'}
          </Button>
        </div>
      </form>
    </div>
  );
}
