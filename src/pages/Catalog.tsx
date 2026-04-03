import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Package, Star, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ShareButtons } from '@/components/ShareButtons';
import { ProductCard } from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';

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
}

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, description, price, images, tags, stock, show_stock, featured, active, age_range, page_count, file_format, file_size_mb, paper_format, show_technical_info, is_accessible, show_accessibility, created_at, updated_at')
        .eq('active', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        const mappedProducts = data.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          price: p.price,
          images: p.images || [],
          tags: p.tags || [],
          stock: p.stock || 0,
          show_stock: (p as any).show_stock !== false,
          featured: p.featured || false
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const allTags = Array.from(new Set(products.flatMap((p) => p.tags)));
  const featuredProducts = products.filter(p => p.featured);
  const regularProducts = products.filter(p => !p.featured);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || product.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-secondary/50 text-secondary-foreground px-4 py-2 rounded-full font-medium mb-4">
              <Package className="h-4 w-4" />
              <span>Catálogo Completo</span>
            </div>
            <h1 className="font-fredoka text-4xl md:text-5xl font-bold text-foreground mb-4">
              Nossos Produtos 📚
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore nossa coleção completa de materiais educativos
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-2 border-primary/20 focus:border-primary"
              />
            </div>

            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedTag === null ? 'default' : 'secondary'}
                  className="cursor-pointer rounded-full px-4 py-2 font-medium transition-all hover:scale-105"
                  onClick={() => setSelectedTag(null)}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Todos
                </Badge>
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? 'default' : 'secondary'}
                    className="cursor-pointer rounded-full px-4 py-2 font-medium transition-all hover:scale-105"
                    onClick={() => setSelectedTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Carregando produtos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Nenhum produto disponível</h3>
              <p className="text-muted-foreground">
                Volte em breve para conferir novidades!
              </p>
            </div>
          ) : searchTerm || selectedTag ? (
            // Filtered view
            <>
              <p className="text-muted-foreground mb-6">
                {filteredProducts.length} produto(s) encontrado(s)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            // Default view with featured section
            <>
              {/* Featured Products */}
              {featuredProducts.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-12"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                    <h2 className="font-fredoka text-2xl font-bold">Em Destaque</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* All Products */}
              {regularProducts.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="font-fredoka text-2xl font-bold mb-6">Todos os Produtos</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {regularProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </motion.section>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <ShareButtons />
    </div>
  );
}