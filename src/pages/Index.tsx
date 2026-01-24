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
