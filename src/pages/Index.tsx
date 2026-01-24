import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { ProductsSection } from '@/components/ProductsSection';
import { FAQSection } from '@/components/FAQSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { CartDrawer } from '@/components/CartDrawer';
import { ShareButtons } from '@/components/ShareButtons';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ProductsSection />
        <FAQSection />
        <TestimonialsSection />
      </main>
      <Footer />
      <CartDrawer />
      <ShareButtons />
    </div>
  );
};

export default Index;
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function loadProducts() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setProducts(data)
  }

  async function toggleProduct(id: string, currentStatus: boolean) {
    setLoading(true)

    const { error } = await supabase
      .from('produtos')
      .update({ ativo: !currentStatus })
      .eq('id', id)

    if (error) {
      alert('Erro ao atualizar produto')
      console.error(error)
    } else {
      loadProducts()
    }

    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h2>Produtos</h2>

      {products.map(product => (
        <div
          key={product.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 10,
            padding: 10,
            border: '1px solid #ddd',
            borderRadius: 6
          }}
        >
          <span>{product.nome}</span>

          <button
            disabled={loading}
            onClick={() => toggleProduct(product.id, product.ativo)}
          >
            {product.ativo ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      ))}
    </div>
  )
}
