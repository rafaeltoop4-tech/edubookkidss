import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, ArrowLeft, ShoppingCart, MessageCircle,
  Star, FileText, Download, Layers, Check, CreditCard, Share2, Accessibility,
  Shield, Zap, Heart, Gift, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ShareButtons } from '@/components/ShareButtons';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useProductMetrics } from '@/hooks/useProductMetrics';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  images: string[];
  tags: string[];
  stock: number;
  show_stock: boolean;
  featured: boolean;
  active: boolean;
  page_count: number | null;
  file_format: string | null;
  file_size_mb: number | null;
  paper_format: string | null;
  show_technical_info: boolean;
  age_range: string | null;
  is_accessible: boolean;
  show_accessibility: boolean;
}

interface Review {
  id: string;
  author_name: string;
  content: string;
  rating: number;
  created_at: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  
  const { addItem, openCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { trackView, trackCartAdd } = useProductMetrics();

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
      fetchWhatsappNumber();
    }
  }, [id]);

  useEffect(() => {
    if (product) trackView(product.id);
  }, [product?.id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, description, price, images, tags, stock, show_stock, featured, active, age_range, page_count, file_format, file_size_mb, paper_format, show_technical_info, is_accessible, show_accessibility, created_at, updated_at')
        .eq('id', id)
        .eq('active', true)
        .single();
      if (error) throw error;
      setProduct(data as Product);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', id)
        .eq('active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchWhatsappNumber = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'whatsapp').single();
      if (data?.value) {
        const settings = data.value as { phone?: string };
        setWhatsappNumber(settings.phone || '');
      }
    } catch (error) { console.error('Error fetching WhatsApp:', error); }
  };

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      toast.error('Faça login para finalizar a compra', { description: 'Crie uma conta ou entre para continuar.' });
      navigate('/entrar');
      return;
    }
    action();
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0] || '/placeholder.svg',
    });
    trackCartAdd(product.id, 1);

    // Track cart event in DB if logged in
    const userId = useAuthStore.getState().user?.id;
    if (userId) {
      supabase.from('cart_events').insert({
        user_id: userId,
        product_id: product.id,
        event_type: 'add',
      }).then(() => {});
    }

    toast.success(`${product.title} adicionado ao carrinho! 🎉`);
    openCart();
  };

  const generateSaleCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `EDU-${timestamp}-${random}`;
  };

  const handleWhatsAppClick = () => {
    requireAuth(async () => {
      if (!product) return;
      const numberToUse = whatsappNumber || '5574999581805';
      const saleCode = generateSaleCode();
      
      try {
        await supabase.from('sales').insert({
          sale_code: saleCode,
          product_id: product.id,
          product_title: product.title,
          product_price: product.price,
          quantity: 1,
          session_id: sessionStorage.getItem('edu_session_id') || null,
        });
      } catch (error) { console.error('Error recording sale:', error); }

      const message = encodeURIComponent(
        `🛒 *Pedido Edu Book Kids*\n\n📦 Produto: ${product.title}\n💰 Valor: R$ ${product.price.toFixed(2)}\n🎫 Código: ${saleCode}\n\nOlá! Tenho interesse neste produto.`
      );
      const cleanNumber = numberToUse.replace(/\D/g, '');
      const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
      window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
    });
  };

  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => prev === product.images.length - 1 ? 0 : prev + 1);
  };

  const prevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => prev === 0 ? product.images.length - 1 : prev - 1);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Produto não encontrado</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao início
        </Button>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const benefits = [
    { icon: <Zap className="h-5 w-5" />, title: 'Entrega Instantânea', desc: 'Receba o PDF imediatamente após o pagamento' },
    { icon: <Shield className="h-5 w-5" />, title: 'Pagamento Seguro', desc: 'Pix com confirmação instantânea' },
    { icon: <Heart className="h-5 w-5" />, title: 'Feito com Amor', desc: 'Material educacional de qualidade' },
    { icon: <Gift className="h-5 w-5" />, title: 'Presente Perfeito', desc: 'Ideal para crianças que amam aprender' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />
      
      {/* Hero Section - Emotional */}
      <section className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Link to="/#produtos" className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para produtos
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="relative aspect-[3/4] md:aspect-square rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    src={product.images[currentImageIndex] || '/placeholder.svg'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {product.images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {product.featured && (
                  <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-bold px-4 py-2 text-sm">
                    ⭐ Destaque
                  </Badge>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all ${
                        index === currentImageIndex ? 'border-white ring-2 ring-white/50 scale-105' : 'border-white/30 hover:border-white/60'
                      }`}
                    >
                      <img src={img} alt={`${product.title} - ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info - Hero */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} className="bg-white/20 text-primary-foreground border-white/30 rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {product.age_range && (
                <Badge className="bg-white/20 text-primary-foreground border-white/30 text-sm">
                  👶 Faixa etária: {product.age_range}
                </Badge>
              )}

              <div>
                <h1 className="font-fredoka text-3xl md:text-5xl font-bold text-primary-foreground mb-3 leading-tight">
                  {product.title}
                </h1>
                {avgRating && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-5 w-5 ${star <= Math.round(parseFloat(avgRating)) ? 'text-yellow-300 fill-yellow-300' : 'text-white/40'}`} />
                      ))}
                    </div>
                    <span className="text-primary-foreground/80 text-sm">{avgRating} ({reviews.length} avaliações)</span>
                  </div>
                )}
              </div>

              {product.description && (
                <p className="text-primary-foreground/90 text-lg leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Price Card */}
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-fredoka text-5xl font-bold text-primary-foreground">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <CreditCard className="h-4 w-4" />
                  <span>Pagamento via Pix • Entrega digital instantânea</span>
                </div>
              </div>

              {product.show_stock && product.stock > 0 && product.stock <= 10 && (
                <p className="text-yellow-200 font-semibold text-sm animate-pulse-soft">
                  ⚡ Últimas {product.stock} unidades! Aproveite agora.
                </p>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleWhatsAppClick}
                  className="w-full h-16 text-lg font-bold bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                  disabled={false}
                >
                  <MessageCircle className="mr-2 h-6 w-6" />
                  Comprar Agora pelo WhatsApp
                </Button>
                <Button
                  onClick={handleAddToCart}
                  className="w-full h-14 text-lg font-bold bg-white/20 hover:bg-white/30 text-primary-foreground border border-white/30 rounded-2xl backdrop-blur-sm"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Adicionar ao Carrinho
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl mb-3">
                  {benefit.icon}
                </div>
                <h3 className="font-fredoka font-bold text-sm mb-1">{benefit.title}</h3>
                <p className="text-muted-foreground text-xs">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Info + Accessibility */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {product.show_technical_info && (
              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-fredoka font-bold text-lg mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Informações Técnicas
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {product.page_count && (
                      <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-muted-foreground" /><span>{product.page_count} páginas</span></div>
                    )}
                    {product.file_format && (
                      <div className="flex items-center gap-2"><Download className="h-4 w-4 text-muted-foreground" /><span>Formato: {product.file_format}</span></div>
                    )}
                    {product.file_size_mb && (
                      <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span>{product.file_size_mb} MB</span></div>
                    )}
                    {product.paper_format && (
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-muted-foreground" /><span>Folha {product.paper_format}</span></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {product.is_accessible && product.show_accessibility && (
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Accessibility className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-fredoka font-bold text-blue-800">Produto Acessível</h3>
                      <p className="text-sm text-blue-600">Material adaptado para acessibilidade educacional e cognitiva</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Social Proof - Reviews */}
      {reviews.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-fredoka text-3xl font-bold text-center mb-2">
                O que os pais estão dizendo 💬
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                {reviews.length} avaliações • Nota média: {avgRating} ⭐
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {reviews.map((review) => (
                  <motion.div key={review.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                    <Card className="h-full">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">"{review.content}"</p>
                        <p className="font-bold text-sm">{review.author_name}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-16" style={{ background: 'var(--gradient-cta)' }}>
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-accent-foreground/80" />
            <h2 className="font-fredoka text-3xl md:text-4xl font-bold text-accent-foreground mb-4">
              Garanta agora o {product.title}!
            </h2>
            <p className="text-accent-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Material educativo digital de alta qualidade. Receba imediatamente após o pagamento via Pix.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button
                onClick={handleWhatsAppClick}
                className="flex-1 h-14 text-lg font-bold bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg"
                disabled={false}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Comprar pelo WhatsApp
              </Button>
            </div>
            <p className="text-accent-foreground/60 text-sm mt-4">
              {formatPrice(product.price)} • Entrega digital instantânea • PDF formato {product.paper_format || 'A4'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Share */}
      <section className="py-8">
        <div className="container mx-auto px-4 text-center">
          <ShareButtons url={window.location.href} title={product.title} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
