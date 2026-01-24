import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, ArrowLeft, ShoppingCart, MessageCircle,
  Star, FileText, Download, Layers, Check, CreditCard, Share2
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
  const { trackView, trackCartAdd } = useProductMetrics();

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
      fetchWhatsappNumber();
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      trackView(product.id);
    }
  }, [product?.id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
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
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'whatsapp')
        .single();
      
      if (data?.value) {
        const settings = data.value as { phone?: string };
        setWhatsappNumber(settings.phone || '');
      }
    } catch (error) {
      console.error('Error fetching WhatsApp:', error);
    }
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
    toast.success(`${product.title} adicionado ao carrinho! 🎉`);
    openCart();
  };

  const generateSaleCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `EDU-${timestamp}-${random}`;
  };

  const handleWhatsAppClick = async () => {
    if (!product || !whatsappNumber) return;

    const saleCode = generateSaleCode();
    
    // Record sale in database
    try {
      await supabase.from('sales').insert({
        sale_code: saleCode,
        product_id: product.id,
        product_title: product.title,
        product_price: product.price,
        quantity: 1,
        session_id: sessionStorage.getItem('edu_session_id') || null,
      });
    } catch (error) {
      console.error('Error recording sale:', error);
    }

    const message = encodeURIComponent(
      `🛒 *Pedido Edu Book Kids*\n\n` +
      `📦 Produto: ${product.title}\n` +
      `💰 Valor: R$ ${product.price.toFixed(2)}\n` +
      `🎫 Código: ${saleCode}\n\n` +
      `Olá! Tenho interesse neste produto.`
    );

    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
  };

  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

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
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao início
        </Button>
      </div>
    );
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link 
              to="/#produtos" 
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para produtos
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={product.images[currentImageIndex] || '/placeholder.svg'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-background/90 rounded-full shadow-lg hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-background/90 rounded-full shadow-lg hover:bg-background transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {product.featured && (
                  <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-bold px-4 py-1">
                    ⭐ Destaque
                  </Badge>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-transparent hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Age Range */}
              {product.age_range && (
                <Badge variant="outline" className="text-sm">
                  👶 Faixa etária: {product.age_range}
                </Badge>
              )}

              {/* Title & Rating */}
              <div>
                <h1 className="font-fredoka text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {product.title}
                </h1>
                {avgRating && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(parseFloat(avgRating))
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {avgRating} ({reviews.length} avaliações)
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Price */}
              <div className="bg-muted/50 rounded-xl p-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-fredoka text-4xl font-bold text-accent">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>Pagamento via Pix</span>
                </div>
              </div>

              {/* Stock Info */}
              {product.show_stock && product.stock > 0 && product.stock <= 10 && (
                <p className="text-sm text-orange-600 font-medium">
                  ⚡ Apenas {product.stock} unidades restantes!
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleWhatsAppClick}
                  className="flex-1 h-14 text-lg font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl"
                  disabled={!whatsappNumber}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Comprar pelo WhatsApp
                </Button>
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="flex-1 h-14 text-lg font-bold rounded-xl"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Adicionar ao Carrinho
                </Button>
              </div>

              {/* Technical Info */}
              {product.show_technical_info && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Informações Técnicas
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {product.page_count && (
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-muted-foreground" />
                          <span>{product.page_count} páginas</span>
                        </div>
                      )}
                      {product.file_format && (
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-muted-foreground" />
                          <span>Formato: {product.file_format}</span>
                        </div>
                      )}
                      {product.file_size_mb && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{product.file_size_mb} MB</span>
                        </div>
                      )}
                      {product.paper_format && (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-muted-foreground" />
                          <span>Folha {product.paper_format}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16"
            >
              <Separator className="mb-8" />
              <h2 className="font-fredoka text-2xl font-bold mb-6">
                Avaliações ({reviews.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        "{review.content}"
                      </p>
                      <p className="text-xs font-medium text-foreground">
                        — {review.author_name}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <ShareButtons />
    </div>
  );
}