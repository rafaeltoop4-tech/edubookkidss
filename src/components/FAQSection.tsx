import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order_index: number;
}

const demoFAQs: FAQ[] = [
  {
    id: '1',
    question: 'Como recebo os materiais após a compra?',
    answer: 'Assim que a compra é confirmada, você recebe o acesso ao PDF por e-mail ou WhatsApp. É rápido e prático! 📧',
    order_index: 0,
  },
  {
    id: '2',
    question: 'Os materiais são adequados para qual idade?',
    answer: 'Temos materiais para crianças de 2 a 10 anos. Cada produto indica a faixa etária recomendada na descrição. 👶👧',
    order_index: 1,
  },
  {
    id: '3',
    question: 'Posso imprimir os materiais quantas vezes quiser?',
    answer: 'Sim! Após a compra, você pode imprimir quantas vezes precisar para uso pessoal ou em sala de aula. 🖨️',
    order_index: 2,
  },
  {
    id: '4',
    question: 'Vocês oferecem materiais para professores?',
    answer: 'Claro! Muitos dos nossos materiais são perfeitos para uso em sala de aula. Temos também kits especiais para educadores. 👩‍🏫',
    order_index: 3,
  },
  {
    id: '5',
    question: 'Como faço para entrar em contato?',
    answer: 'Você pode nos chamar pelo WhatsApp ou enviar um e-mail. Respondemos rapidinho! 💬',
    order_index: 4,
  },
];

export function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>(demoFAQs);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setFaqs(data);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-mint/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground px-4 py-2 rounded-full font-medium mb-4 text-foreground">
            <HelpCircle className="h-4 w-4" />
            <span>Dúvidas Frequentes</span>
          </div>
          <h2 className="font-fredoka text-3xl md:text-5xl font-bold text-foreground mb-4">
            Perguntas Frequentes 🤔
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tire suas dúvidas sobre nossos materiais educativos!
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="bg-card rounded-2xl border-2 border-primary/10 px-6 shadow-soft overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline py-5">
                  <span className="font-fredoka font-bold text-left text-lg text-foreground">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 font-nunito text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
