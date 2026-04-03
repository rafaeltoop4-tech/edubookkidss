import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, User, ArrowLeft, BookOpen, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

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

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-primary rounded-xl">
            <BookOpen className="h-8 w-8 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    if (!email.trim()) { toast.error('Informe seu email'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Email inválido'); return false; }
    if (password.length < 6) { toast.error('Senha deve ter pelo menos 6 caracteres'); return false; }
    if (isSignUp) {
      if (!fullName.trim()) { toast.error('Informe seu nome completo'); return false; }
      if (password !== confirmPassword) { toast.error('As senhas não coincidem'); return false; }
    }
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
        toast.success('Login realizado com sucesso! 🎉');
        navigate('/');
      } else {
        toast.error(result.error || 'Email ou senha incorretos');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl shadow-hover p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="p-3 bg-primary rounded-xl">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
            </Link>
            <h1 className="font-fredoka text-2xl font-bold mb-2">
              {isSignUp ? 'Criar Conta' : 'Entrar'}
            </h1>
            <p className="text-muted-foreground">Edu Book Kids</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="fullName" className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" /> Nome Completo
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="rounded-xl"
                  required
                />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="rounded-xl"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4" /> Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl pr-10"
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {isSignUp && (
              <div>
                <Label htmlFor="confirmPassword" className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4" /> Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl"
                  required
                  autoComplete="new-password"
                />
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-rainbow py-6 rounded-xl font-bold text-lg"
            >
              {isLoading ? 'Aguarde...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setConfirmPassword(''); setFullName(''); }}
              className="text-primary hover:underline text-sm"
            >
              {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
            </button>
            <div>
              <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao site
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
