import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, User, ArrowLeft, Eye, EyeOff, Check, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import authIllustration from '@/assets/auth-illustration.jpg';

const benefits = [
  { icon: '✔', text: 'Acesso imediato após compra' },
  { icon: '✔', text: 'Material pronto para imprimir' },
  { icon: '✔', text: 'Pagamento seguro via Pix' },
  { icon: '✔', text: 'Suporte dedicado por WhatsApp' },
];

export default function Auth() {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const passwordStrength = (pw: string) => {
    if (pw.length < 6) return { label: 'Muito curta', color: 'bg-destructive', width: '20%' };
    if (pw.length < 8) return { label: 'Fraca', color: 'bg-orange-400', width: '40%' };
    if (/(?=.*[A-Z])(?=.*[0-9])/.test(pw)) return { label: 'Forte', color: 'bg-green-500', width: '100%' };
    return { label: 'Média', color: 'bg-yellow-400', width: '60%' };
  };

  const validateForm = () => {
    if (isSignUp && !fullName.trim()) { toast.error('Informe seu nome completo'); return false; }
    if (!email.trim()) { toast.error('Informe seu email'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Email inválido'); return false; }
    if (password.length < 6) { toast.error('Senha deve ter pelo menos 6 caracteres'); return false; }
    if (isSignUp && password !== confirmPassword) { toast.error('As senhas não coincidem'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    if (isSignUp) {
      const result = await signup(email, password, fullName);
      if (result.success) {
        toast.success('Conta criada! Verifique seu email para confirmar. 📧');
      } else {
        toast.error(result.error || 'Erro ao criar conta');
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Bem-vindo(a) de volta! 🎉');
        navigate('/');
      } else {
        toast.error(result.error || 'Email ou senha incorretos');
      }
    }

    setIsLoading(false);
  };

  const strength = passwordStrength(password);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration (hidden on mobile) */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg">
          <motion.img
            src={authIllustration}
            alt="Criança aprendendo"
            width={400}
            height={512}
            className="rounded-3xl shadow-2xl mb-8 object-cover"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
          <h2 className="font-fredoka text-2xl xl:text-3xl font-bold text-primary-foreground mb-4 leading-tight">
            Invista no desenvolvimento do seu filho de forma simples e divertida
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Materiais educativos prontos para uso, com entrega digital instantânea 🌈
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-secondary/30 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="p-3 bg-primary rounded-2xl shadow-md"
              >
                <BookOpen className="h-7 w-7 text-primary-foreground" />
              </motion.div>
              <span className="font-fredoka text-2xl font-bold text-foreground">Edu Book Kids</span>
            </Link>
            <h1 className="font-fredoka text-3xl font-bold text-foreground mb-2">
              {isSignUp ? 'Criar sua conta' : 'Bem-vindo(a) de volta'}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp ? 'Junte-se a milhares de pais e educadores' : 'Entre para acessar seus materiais'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Label htmlFor="fullName" className="text-sm font-medium mb-2 block">
                  Nome Completo
                </Label>
                <div className={`relative rounded-xl border-2 transition-all duration-300 ${
                  focusedField === 'name' ? 'border-primary shadow-md shadow-primary/10' : 'border-border'
                }`}>
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Seu nome completo"
                    className="border-0 pl-10 h-12 bg-transparent focus-visible:ring-0"
                    required
                  />
                </div>
              </motion.div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                Email
              </Label>
              <div className={`relative rounded-xl border-2 transition-all duration-300 ${
                focusedField === 'email' ? 'border-primary shadow-md shadow-primary/10' : 'border-border'
              }`}>
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="seu@email.com"
                  className="border-0 pl-10 h-12 bg-transparent focus-visible:ring-0"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium mb-2 block">
                Senha
              </Label>
              <div className={`relative rounded-xl border-2 transition-all duration-300 ${
                focusedField === 'password' ? 'border-primary shadow-md shadow-primary/10' : 'border-border'
              }`}>
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="border-0 pl-10 pr-10 h-12 bg-transparent focus-visible:ring-0"
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password strength indicator */}
              {isSignUp && password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2"
                >
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${strength.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: strength.width }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Senha: {strength.label}</p>
                </motion.div>
              )}
            </div>

            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Label htmlFor="confirmPassword" className="text-sm font-medium mb-2 block">
                  Confirmar Senha
                </Label>
                <div className={`relative rounded-xl border-2 transition-all duration-300 ${
                  focusedField === 'confirm' ? 'border-primary shadow-md shadow-primary/10' : 'border-border'
                } ${confirmPassword && password === confirmPassword ? 'border-green-500' : ''}`}>
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="border-0 pl-10 pr-10 h-12 bg-transparent focus-visible:ring-0"
                    required
                    autoComplete="new-password"
                  />
                  {confirmPassword && password === confirmPassword && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-bold rounded-xl btn-rainbow shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              {isLoading ? 'Aguarde...' : (isSignUp ? 'Criar Conta Grátis' : 'Entrar')}
            </Button>
          </form>

          {/* Benefits */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 grid grid-cols-2 gap-3"
            >
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-green-500 font-bold">{benefit.icon}</span>
                  <span>{benefit.text}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Toggle mode */}
          <div className="mt-8 text-center space-y-3">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setConfirmPassword(''); setFullName(''); }}
              className="text-primary hover:underline text-sm font-medium"
            >
              {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se grátis'}
            </button>
            <div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao site
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
