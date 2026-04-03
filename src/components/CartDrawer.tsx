import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, MessageCircle, Send, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cartStore';
import { useProductMetrics } from '@/hooks/useProductMetrics';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
  phone: z.string().min(10, 'Telefone inválido').max(20, 'Telefone muito longo'),
});

export function CartDrawer() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeItem, 
    updateQuantity, 
    clearCart,
    getTotalPrice 
  } = useCartStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const { trackPurchase } = useProductMetrics();

  const totalPrice = getTotalPrice();

  // Fetch WhatsApp number from admin settings
  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'whatsapp')
          .single();
        
        if (!error && data?.value) {
          const settings = data.value as { phone?: string };
          const phone = settings.phone || '';
          const clean = phone.replace(/\D/g, '');
          setWhatsappNumber(clean.startsWith('55') ? clean : `55${clean}`);
        }
      } catch (error) {
        console.error('Error fetching WhatsApp number:', error);
      }
    };
    fetchWhatsAppNumber();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setCustomerPhone(formatted);
  };

  const generateWhatsAppMessage = () => {
    let message = `🛒 *NOVO PEDIDO - Edu Book Kids*\n\n`;
    message += `👤 *Cliente:* ${customerName}\n`;
    message += `📱 *Telefone:* ${customerPhone}\n\n`;
    message += `📦 *Produtos:*\n`;
    
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.title}\n`;
      message += `   Qtd: ${item.quantity} x ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}\n\n`;
    });
    
    message += `━━━━━━━━━━━━━━━━\n`;
    message += `💰 *TOTAL: ${formatPrice(totalPrice)}*\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;
    message += `Obrigado pela compra! 🌈`;
    
    return message;
  };

  const handlePreview = () => {
    setErrors({});
    
    try {
      checkoutSchema.parse({ name: customerName, phone: customerPhone.replace(/\D/g, '') });
      setShowPreview(true);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: { name?: string; phone?: string } = {};
        err.errors.forEach((e) => {
          if (e.path[0] === 'name') newErrors.name = e.message;
          if (e.path[0] === 'phone') newErrors.phone = e.message;
        });
        setErrors(newErrors);
      }
    }
  };

  const handleSendWhatsApp = () => {
    // Track purchase events for all items
    items.forEach(item => {
      trackPurchase(item.id, item.quantity);
    });
    
    const message = encodeURIComponent(generateWhatsAppMessage());
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast.success('Redirecionando para o WhatsApp! 📱');
    clearCart();
    setCustomerName('');
    setCustomerPhone('');
    setShowPreview(false);
    closeCart();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b bg-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary-foreground">
                  <ShoppingBag className="h-6 w-6" />
                  <h2 className="font-fredoka text-xl font-bold">
                    {showPreview ? 'Confirmar Pedido' : 'Seu Carrinho'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    if (showPreview) {
                      setShowPreview(false);
                    } else {
                      closeCart();
                    }
                  }}
                  className="p-2 hover:bg-primary-foreground/10 rounded-xl text-primary-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {showPreview ? (
                /* Preview Mode */
                <div className="p-4">
                  <div className="bg-muted rounded-2xl p-4 font-mono text-sm whitespace-pre-wrap">
                    {generateWhatsAppMessage()}
                  </div>
                </div>
              ) : items.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="p-6 bg-muted rounded-full mb-4">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-fredoka text-xl font-bold mb-2">
                    Carrinho Vazio
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Adicione produtos incríveis para seus pequenos! 🌈
                  </p>
                  <Button onClick={closeCart} className="btn-rainbow rounded-xl">
                    Ver Produtos
                  </Button>
                </div>
              ) : (
                /* Cart Items */
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 bg-card rounded-2xl p-3 shadow-soft"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 rounded-xl object-cover bg-muted"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-fredoka font-bold text-sm line-clamp-2 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-accent font-bold">
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 bg-muted rounded-lg hover:bg-muted-foreground/20 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-bold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 bg-muted rounded-lg hover:bg-muted-foreground/20 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 ml-auto text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <Separator className="my-4" />

                  {/* Customer Info */}
                  <div className="space-y-4">
                    <h3 className="font-fredoka font-bold text-lg">
                      Seus Dados
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4" />
                          Nome
                        </Label>
                        <Input
                          id="name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Seu nome completo"
                          className="rounded-xl"
                          maxLength={100}
                        />
                        {errors.name && (
                          <p className="text-destructive text-sm mt-1">{errors.name}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                          <Phone className="h-4 w-4" />
                          WhatsApp
                        </Label>
                        <Input
                          id="phone"
                          value={customerPhone}
                          onChange={handlePhoneChange}
                          placeholder="(00) 00000-0000"
                          className="rounded-xl"
                          maxLength={16}
                        />
                        {errors.phone && (
                          <p className="text-destructive text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 bg-card">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-fredoka text-lg font-bold">Total:</span>
                  <span className="font-fredoka text-2xl font-bold text-accent">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                {showPreview ? (
                  <Button
                    onClick={handleSendWhatsApp}
                    className="w-full btn-rainbow text-lg py-6 rounded-2xl font-bold"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Enviar pelo WhatsApp
                  </Button>
                ) : (
                  <Button
                    onClick={handlePreview}
                    className="w-full bg-mint hover:bg-mint/90 text-foreground text-lg py-6 rounded-2xl font-bold"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Finalizar Compra
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
