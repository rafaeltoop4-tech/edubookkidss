import { useState, useEffect } from 'react';
import { MessageCircle, Save, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function WhatsAppSettings() {
  const queryClient = useQueryClient();
  const [showNumber, setShowNumber] = useState(false);
  const [formData, setFormData] = useState({
    whatsapp_number: '',
    message_template: `Olá! Gostaria de finalizar minha compra:

*Cliente:* {nome}
*Telefone:* {telefone}

*Produtos:*
{produtos}

*Total:* R$ {total}

Aguardo confirmação! 🛒`
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['whatsapp-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .in('key', ['whatsapp_number', 'whatsapp_message_template']);
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (settings) {
      const numberSetting = settings.find(s => s.key === 'whatsapp_number');
      const templateSetting = settings.find(s => s.key === 'whatsapp_message_template');
      
      setFormData({
        whatsapp_number: (numberSetting?.value as string) || '5574999581805',
        message_template: (templateSetting?.value as string) || formData.message_template
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Upsert whatsapp number
      await supabase
        .from('site_settings')
        .upsert({ 
          key: 'whatsapp_number', 
          value: formData.whatsapp_number 
        }, { onConflict: 'key' });

      // Upsert message template
      await supabase
        .from('site_settings')
        .upsert({ 
          key: 'whatsapp_message_template', 
          value: formData.message_template 
        }, { onConflict: 'key' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Configurações do WhatsApp salvas!');
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
        <h1 className="font-fredoka text-3xl font-bold">Configurações do WhatsApp</h1>
        <p className="text-muted-foreground">Configure o número e mensagem para checkout</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              Número do WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Número (apenas números, com DDD e código do país)</Label>
              <div className="flex gap-2 mt-2">
                <div className="relative flex-1">
                  <Input
                    type={showNumber ? 'text' : 'password'}
                    value={formData.whatsapp_number}
                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                    placeholder="5574999581805"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowNumber(!showNumber)}
                  >
                    {showNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ⚠️ Este número NÃO aparece no site público. É usado apenas no momento do checkout.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modelo da Mensagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Mensagem automática do checkout</Label>
              <Textarea
                value={formData.message_template}
                onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                rows={10}
                className="font-mono text-sm mt-2"
              />
              <div className="mt-3 p-4 bg-muted rounded-xl">
                <p className="text-sm font-medium mb-2">Variáveis disponíveis:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><code className="bg-background px-1 rounded">{'{nome}'}</code> - Nome do cliente</li>
                  <li><code className="bg-background px-1 rounded">{'{telefone}'}</code> - Telefone do cliente</li>
                  <li><code className="bg-background px-1 rounded">{'{produtos}'}</code> - Lista de produtos</li>
                  <li><code className="bg-background px-1 rounded">{'{total}'}</code> - Valor total da compra</li>
                </ul>
              </div>
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
