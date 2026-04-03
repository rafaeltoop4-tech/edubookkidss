import { Link } from 'react-router-dom';
import { BookOpen, Instagram, MessageCircle, Mail, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-lavender text-foreground">
      {/* Rainbow Border */}
      <div className="h-1 w-full" style={{ background: 'var(--gradient-rainbow)' }} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-mint rounded-xl">
                <BookOpen className="h-6 w-6 text-foreground" />
              </div>
              <span className="font-fredoka text-2xl font-bold">Edu Book Kids</span>
            </div>
            <p className="text-foreground/80 font-nunito mb-4 max-w-md">
              Materiais educativos criativos para crianças. Ebooks, atividades e muito mais 
              para pais e professores que querem fazer a diferença na educação infantil! 🌈
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-primary/20 rounded-xl hover:bg-primary/40 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/5574999581805"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-mint/40 rounded-xl hover:bg-mint/60 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href="mailto:edubookkids.apoio@gmail.com"
                className="p-3 bg-secondary/40 rounded-xl hover:bg-secondary/60 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-fredoka font-bold text-lg mb-4">Links Rápidos</h4>
            <nav className="flex flex-col gap-2">
              <a href="/#produtos" className="text-foreground/80 hover:text-foreground transition-colors">
                Produtos
              </a>
              <a href="/#faq" className="text-foreground/80 hover:text-foreground transition-colors">
                Perguntas Frequentes
              </a>
              <a href="/#depoimentos" className="text-foreground/80 hover:text-foreground transition-colors">
                Depoimentos
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-fredoka font-bold text-lg mb-4">Contato</h4>
            <div className="flex flex-col gap-2 text-foreground/80">
              <p>📧 edubookkids.apoio@gmail.com</p>
              <p>📱 WhatsApp disponível</p>
              <p>🇧🇷 Brasil</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-foreground/10 text-center">
          <p className="text-foreground/70 font-nunito flex items-center justify-center gap-1">
            Feito com <Heart className="h-4 w-4 text-accent fill-accent" /> para crianças
            © {currentYear} Edu Book Kids
          </p>
        </div>
      </div>
    </footer>
  );
}
