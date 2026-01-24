import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  show_stock?: boolean;
  featured: boolean;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const { addItem, openCart } = useCartStore();
  const { trackView, trackCartAdd } = useProductMetrics();

  // Track view when product comes into viewport
  useEffect(() => {
    if (!hasTrackedView) {
      trackView(product.id);
      setHasTrackedView(true);
    }
  }, [hasTrackedView, product.id, trackView]);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0] || '/placeholder.svg',
    });
    
    // Track cart add event
    trackCartAdd(product.id, 1);
    
    toast.success(`${product.title} adicionado ao carrinho! 🎉`);
    openCart();
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Check if stock should be shown
  const showStock = product.show_stock !== false;
  const isLowStock = showStock && product.stock > 0 && product.stock <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="card-product group"
    >
      {/* Featured Badge */}
      {product.featured && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-accent text-accent-foreground font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Destaque
          </Badge>
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
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

        {/* Image Navigation */}
        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Image Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-primary w-4'
                      : 'bg-primary/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-foreground/10 backdrop-blur-[2px] flex items-center justify-center"
        >
          <Button
            onClick={handleAddToCart}
            className="btn-rainbow rounded-2xl font-bold"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5">
        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs font-medium rounded-full px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="font-fredoka font-bold text-lg md:text-xl text-foreground mb-2 line-clamp-2">
          {product.title}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-fredoka text-2xl font-bold text-accent">
              {formatPrice(product.price)}
            </span>
            {isLowStock && (
              <span className="text-xs text-muted-foreground">
                Apenas {product.stock} restantes!
              </span>
            )}
          </div>
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl md:hidden"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}