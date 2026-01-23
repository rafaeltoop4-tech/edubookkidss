import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Globe, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const defaultSettings = {
  site_name: 'Edu Book Kids',
  site_description: 'Materiais educativos criativos para crianças. Ebooks, atividades e muito mais!',
  contact_email: 'edubookkids.apoio@gmail.com',
  meta_title: 'Edu Book Kids - Materiais Educativos para Crianças',
  meta_description: 'Ebooks e atividades educativas para pais e professores. Aprendizado divertido e criativo para crianças.',
  meta_keywords: 'educação infantil, ebooks, atividades, crianças, aprendizado'
};

export default function GeneralSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(defaultSettings);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['general-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'general_config')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  useEffect(() => {
    if (settings?.value) {
      setFormData({ ...defaultSettings, ...(settings.value as typeof defaultSettings) });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await supabase
        .from('site_settings')
        .upsert({ 
          key: 'general_config', 
          value: formData 
        }, { onConflict: 'key' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Configurações salvas!');
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
        <h1 className="font-fredoka text-3xl font-bold">Configurações Gerais</h1>
        <p className="text-muted-foreground">Configurações globais do site</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Informações do Site
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome do Site</Label>
              <Input
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                placeholder="Edu Book Kids"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Descrição do Site</Label>
              <Textarea
                value={formData.site_description}
                onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
                placeholder="Descrição..."
                rows={3}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-mail de Contato
              </Label>
              <Input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="contato@email.com"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-secondary" />
              SEO (Otimização para Buscadores)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Título Meta (aparece na aba do navegador)</Label>
              <Input
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                placeholder="Título do site"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Máximo recomendado: 60 caracteres ({formData.meta_title.length}/60)
              </p>
            </div>
            <div>
              <Label>Descrição Meta</Label>
              <Textarea
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                placeholder="Descrição para buscadores..."
                rows={3}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Máximo recomendado: 160 caracteres ({formData.meta_description.length}/160)
              </p>
            </div>
            <div>
              <Label>Palavras-chave (separadas por vírgula)</Label>
              <Input
                value={formData.meta_keywords}
                onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                placeholder="educação, crianças, ebooks..."
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saveMutation.isPending} className="btn-rainbow">
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </form>
    </div>
  );
}
