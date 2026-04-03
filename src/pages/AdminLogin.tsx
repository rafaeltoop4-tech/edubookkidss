import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowLeft, BookOpen, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAdmin, isLoading: authLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAdmin && !authLoading) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-primary rounded-xl">
            <BookOpen className="h-8 w-8 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-muted-foreground">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  if (isAdmin) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Preencha email e senha');
      return;
    }
    setIsLoading(true);

    const result = await login(email, password);
    if (result.success) {
      toast.success('Login realizado com sucesso! 🎉');
      // The onAuthStateChange will set isAdmin and trigger redirect
    } else {
      toast.error(result.error || 'Email ou senha incorretos');
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
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="p-3 bg-primary rounded-xl">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-fredoka text-2xl font-bold mb-2">Área Admin</h1>
            <p className="text-muted-foreground">Edu Book Kids</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
                  autoComplete="current-password"
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
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-rainbow py-6 rounded-xl font-bold text-lg"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao site
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
