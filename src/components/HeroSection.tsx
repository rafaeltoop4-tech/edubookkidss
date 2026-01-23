import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Star, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const floatingElements = [
    { icon: '📚', delay: 0, x: '10%', y: '20%' },
    { icon: '✏️', delay: 0.2, x: '85%', y: '15%' },
    { icon: '🌈', delay: 0.4, x: '90%', y: '60%' },
    { icon: '⭐', delay: 0.6, x: '5%', y: '70%' },
    { icon: '🎨', delay: 0.8, x: '75%', y: '80%' },
    { icon: '🎓', delay: 1, x: '15%', y: '85%' },
  ];

  return (
    <section className="relative min-h-[90vh] overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Floating Elements */}
      {floatingElements.map((el, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: el.delay, duration: 0.6 }}
          className="absolute text-3xl md:text-5xl bubble-float hidden md:block"
          style={{ left: el.x, top: el.y }}
        >
          {el.icon}
        </motion.div>
      ))}

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-secondary/80 backdrop-blur-sm text-secondary-foreground px-4 py-2 rounded-full font-medium mb-8"
          >
            <Sparkles className="h-4 w-4" />
            <span>Educação que encanta!</span>
            <Sparkles className="h-4 w-4" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-fredoka text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight"
          >
            Ebooks e Atividades
            <span className="block mt-2">
              para{' '}
              <span className="relative inline-block">
                Crianças
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute -bottom-2 left-0 w-full h-4"
                  viewBox="0 0 200 20"
                >
                  <path
                    d="M 0 15 Q 50 5 100 15 T 200 15"
                    fill="none"
                    stroke="hsl(43 100% 70%)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </span>
              {' '}Felizes! 🌟
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-primary-foreground/90 font-nunito max-w-2xl mb-10"
          >
            Descubra materiais educativos criativos, divertidos e pedagógicos. 
            Perfeitos para pais e professores que querem transformar o aprendizado 
            em uma aventura mágica! ✨
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              className="btn-rainbow text-lg px-8 py-6 rounded-2xl font-bold text-accent-foreground shadow-hover"
              asChild
            >
              <a href="#produtos">
                <BookOpen className="mr-2 h-5 w-5" />
                Ver Produtos
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-2xl font-bold bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
              asChild
            >
              <a href="#faq">
                <Star className="mr-2 h-5 w-5" />
                Saiba Mais
              </a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid grid-cols-3 gap-8 mt-16"
          >
            {[
              { value: '500+', label: 'Famílias' },
              { value: '50+', label: 'Materiais' },
              { value: '5⭐', label: 'Avaliação' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="font-fredoka text-2xl md:text-4xl font-bold text-primary-foreground">
                  {stat.value}
                </p>
                <p className="text-sm md:text-base text-primary-foreground/80 font-nunito">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ArrowDown className="h-8 w-8 text-primary-foreground/60" />
      </motion.div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L48 105C96 90 192 60 288 52.5C384 45 480 60 576 67.5C672 75 768 75 864 67.5C960 60 1056 45 1152 45C1248 45 1344 60 1392 67.5L1440 75V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
