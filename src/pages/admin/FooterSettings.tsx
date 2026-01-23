import { useState, useEffect } from 'react';
import { FileText, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const defaultFooter = {
  description: 'Materiais educativos criativos para crianças. Ebooks, atividades e muito mais para pais e professores que querem fazer a diferença na educação infantil! 🌈',
  email: 'edubookkids.apoio@gmail.com',
  instagram_url: 'https://instagram.com',
  whatsapp_display: 'WhatsApp disponível',
  location: 'Brasil',
  copyright_text: 'Edu Book Kids'
};

export default function FooterSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(defaultFooter);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['footer-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'footer_config')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  useEffect(() => {
    if (settings?.value) {
      setFormData({ ...defaultFooter, ...(settings.value as typeof defaultFooter) });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await supabase
        .from('site_settings')
        .upsert({ 
          key: 'footer_config', 
          value: formData 
        }, { onConflict: 'key' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footer-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Rodapé salvo!');
    },
    onError: (error) => {
      toast.error('Erro ao salvar: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-fredoka text-3xl font-bold">Rodapé</h1>
        <p className="text-muted-foreground">Configure o rodapé do site</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Informações do Rodapé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da empresa..."
                rows={3}
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@email.com"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>URL do Instagram</Label>
                <Input
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/perfil"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Texto do WhatsApp (público)</Label>
                <Input
                  value={formData.whatsapp_display}
                  onChange={(e) => setFormData({ ...formData, whatsapp_display: e.target.value })}
                  placeholder="WhatsApp disponível"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Localização</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Brasil"
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label>Texto de Copyright</Label>
              <Input
                value={formData.copyright_text}
                onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
                placeholder="Edu Book Kids"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saveMutation.isPending} className="btn-rainbow">
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? 'Salvando...' : 'Salvar Rodapé'}
          </Button>
        </div>
      </form>
    </div>
  );
}
