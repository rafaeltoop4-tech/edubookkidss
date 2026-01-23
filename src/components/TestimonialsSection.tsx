import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  avatar_url: string | null;
  rating: number;
}

const demoTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Maria Silva',
    role: 'Mãe de 2 crianças',
    content: 'Os materiais são incríveis! Meus filhos amam as atividades e aprendem brincando. Super recomendo! 💕',
    avatar_url: null,
    rating: 5,
  },
  {
    id: '2',
    name: 'Prof. Ana Costa',
    role: 'Professora de Ed. Infantil',
    content: 'Uso os materiais da Edu Book Kids nas minhas aulas e as crianças ficam muito engajadas. Qualidade excelente!',
    avatar_url: null,
    rating: 5,
  },
  {
    id: '3',
    name: 'Carla Mendes',
    role: 'Mãe',
    content: 'Melhor investimento que fiz! Os ebooks são lindos, educativos e minha filha adora. Vale cada centavo! ⭐',
    avatar_url: null,
    rating: 5,
  },
];

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(demoTestimonials);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      if (data && data.length > 0) {
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const bgColors = [
    'bg-primary/20',
    'bg-secondary/40',
    'bg-mint/40',
    'bg-lavender/40',
    'bg-accent/20',
  ];

  return (
    <section id="depoimentos" className="py-16 md:py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-accent/30 text-foreground px-4 py-2 rounded-full font-medium mb-4">
            <Heart className="h-4 w-4 fill-current" />
            <span>O que dizem sobre nós</span>
          </div>
          <h2 className="font-fredoka text-3xl md:text-5xl font-bold text-foreground mb-4">
            Depoimentos 💬
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Veja o que pais e professores estão falando sobre nossos materiais!
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-3xl p-6 shadow-card relative overflow-hidden group hover:shadow-hover transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-primary/20">
                <Quote className="h-10 w-10" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-secondary fill-secondary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 font-nunito leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full ${
                    bgColors[index % bgColors.length]
                  } flex items-center justify-center font-fredoka font-bold text-foreground`}
                >
                  {testimonial.avatar_url ? (
                    <img
                      src={testimonial.avatar_url}
                      alt={testimonial.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(testimonial.name)
                  )}
                </div>
                <div>
                  <p className="font-fredoka font-bold text-foreground">
                    {testimonial.name}
                  </p>
                  {testimonial.role && (
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
