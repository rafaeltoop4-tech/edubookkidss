import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ShoppingCart, Menu, X, BookOpen, User, LogOut } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getTotalItems, openCart } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const totalItems = getTotalItems();

  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerScale = useTransform(scrollY, [0, 100], [1, 0.98]);
  const headerOpacity = useTransform(scrollY, [0, 100], [0.95, 1]);

  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/#produtos', label: 'Produtos' },
    { href: '/#faq', label: 'Perguntas' },
    { href: '/#depoimentos', label: 'Depoimentos' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <motion.header 
      style={{ scale: headerScale, opacity: headerOpacity }}
      className={`sticky top-0 z-50 w-full transition-all duration-500 rounded-b-2xl ${
        isScrolled 
          ? 'bg-primary/90 backdrop-blur-xl shadow-xl' 
          : 'bg-primary/95 backdrop-blur-md shadow-soft'
      }`}
    >
      <div className="container mx-auto px-4">
        <motion.div 
          className="flex h-16 md:h-20 items-center justify-between"
          animate={{ scale: isScrolled ? 0.98 : 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className={`p-2 bg-primary-foreground/20 rounded-xl transition-all duration-300 ${
                isScrolled ? 'scale-90' : 'scale-100'
              }`}
            >
              <BookOpen className={`text-primary-foreground transition-all duration-300 ${
                isScrolled ? 'h-5 w-5 md:h-6 md:w-6' : 'h-6 w-6 md:h-8 md:w-8'
              }`} />
            </motion.div>
            <div className="flex flex-col">
              <span className={`font-fredoka font-bold text-primary-foreground leading-tight transition-all duration-300 ${
                isScrolled ? 'text-base md:text-xl' : 'text-lg md:text-2xl'
              }`}>
                Edu Book Kids
              </span>
              <motion.span 
                className="hidden md:block text-xs text-primary-foreground/80 font-nunito"
                animate={{ opacity: isScrolled ? 0 : 1, height: isScrolled ? 0 : 'auto' }}
                transition={{ duration: 0.2 }}
              >
                Educação que encanta ✨
              </motion.span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-primary-foreground/90 hover:text-primary-foreground font-medium transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-primary-foreground/80 text-sm truncate max-w-[120px]">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-primary-foreground/20 rounded-xl text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/entrar')}
                variant="ghost"
                className="hidden md:flex text-primary-foreground hover:bg-primary-foreground/20 gap-2"
              >
                <User className="h-4 w-4" />
                Entrar
              </Button>
            )}

            {/* Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCart}
              className={`relative bg-secondary rounded-xl text-secondary-foreground hover:shadow-hover transition-all ${
                isScrolled ? 'p-2' : 'p-2 md:p-3'
              }`}
            >
              <ShoppingCart className={`transition-all duration-300 ${
                isScrolled ? 'h-5 w-5' : 'h-5 w-5 md:h-6 md:w-6'
              }`} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-primary-foreground"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary/95 backdrop-blur-md border-t border-primary-foreground/10"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-primary-foreground py-2 px-4 rounded-xl hover:bg-primary-foreground/10 transition-colors font-medium"
                >
                  {link.label}
                </a>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="text-primary-foreground py-2 px-4 rounded-xl hover:bg-primary-foreground/10 transition-colors font-medium text-left flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              ) : (
                <Link
                  to="/entrar"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-primary-foreground py-2 px-4 rounded-xl hover:bg-primary-foreground/10 transition-colors font-medium flex items-center gap-2"
                >
                  <User className="h-4 w-4" /> Entrar / Cadastrar
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
