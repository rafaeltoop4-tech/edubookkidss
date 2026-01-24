import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, Filter, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from './ProductCard';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  images: string[];
  tags: string[];
  stock: number;
  featured: boolean;
}

export function ProductsSection() {
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
        .select('*')
        .eq('active', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        // Map database fields to component interface
        const mappedProducts = data.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          price: p.price,
          images: p.images || [],
          tags: p.tags || [],
          stock: p.stock || 0,
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || product.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Don't render section if no products exist
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section id="produtos" className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-secondary/50 text-secondary-foreground px-4 py-2 rounded-full font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Nossos Materiais</span>
          </div>
          <h2 className="font-fredoka text-3xl md:text-5xl font-bold text-foreground mb-4">
            Produtos Educativos 📚
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Materiais desenvolvidos com carinho para transformar o aprendizado em uma 
            experiência divertida e enriquecedora!
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          {/* Search */}
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

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedTag === null ? 'default' : 'secondary'}
              className="cursor-pointer rounded-full px-4 py-2 font-medium transition-all hover:scale-105"
              onClick={() => setSelectedTag(null)}
            >
              <Filter className="h-3 w-3 mr-1" />
              Todos
            </Badge>
            {allTags.slice(0, 5).map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? 'default' : 'secondary'}
                className="cursor-pointer rounded-full px-4 py-2 font-medium transition-all hover:scale-105"
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Empty State - Only when filtering */}
        {filteredProducts.length === 0 && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              Nenhum produto encontrado 😢
            </p>
            <p className="text-muted-foreground">
              Tente buscar com outros termos ou remova os filtros.
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        )}
      </div>
    </section>
  );
}
