import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, Filter } from 'lucide-react';
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

// Demo products for initial display
const demoProducts: Product[] = [
  {
    id: '1',
    title: 'Ebook Alfabetização Divertida',
    description: 'Aprenda o alfabeto com atividades coloridas e jogos interativos para crianças de 3 a 6 anos.',
    price: 29.90,
    images: ['/placeholder.svg'],
    tags: ['Alfabetização', '3-6 anos'],
    stock: 100,
    featured: true,
  },
  {
    id: '2',
    title: 'Kit Matemática Brincando',
    description: 'Números, formas e primeiras operações matemáticas através de brincadeiras educativas.',
    price: 34.90,
    images: ['/placeholder.svg'],
    tags: ['Matemática', '4-7 anos'],
    stock: 50,
    featured: true,
  },
  {
    id: '3',
    title: 'Atividades de Coordenação Motora',
    description: 'Exercícios para desenvolver a coordenação motora fina e preparar para a escrita.',
    price: 24.90,
    images: ['/placeholder.svg'],
    tags: ['Motor', '2-5 anos'],
    stock: 75,
    featured: false,
  },
  {
    id: '4',
    title: 'Histórias para Colorir',
    description: 'Lindas histórias ilustradas para colorir e estimular a criatividade e imaginação.',
    price: 19.90,
    images: ['/placeholder.svg'],
    tags: ['Colorir', 'Criatividade'],
    stock: 200,
    featured: false,
  },
];

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>(demoProducts);
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
      
      if (data && data.length > 0) {
        setProducts(data);
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

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground text-lg">
              Nenhum produto encontrado 😢
            </p>
            <p className="text-muted-foreground">
              Tente buscar com outros termos ou remova os filtros.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
