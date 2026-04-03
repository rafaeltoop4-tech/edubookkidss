import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Trash2, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export default function Admins() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('id, user_id, created_at')
        .eq('role', 'admin');

      if (error) throw error;

      const adminList: AdminUser[] = [];
      for (const role of roles || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', role.user_id)
          .single();

        adminList.push({
          id: role.id,
          user_id: role.user_id,
          email: profile?.email || 'N/A',
          full_name: profile?.full_name || 'N/A',
          created_at: role.created_at || '',
        });
      }
      setAdmins(adminList);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Erro ao carregar administradores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!email.trim()) {
      toast.error('Informe o email do usuário');
      return;
    }
    setIsAdding(true);

    try {
      // Find user by email in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (profileError || !profile) {
        toast.error('Usuário não encontrado. O usuário precisa ter uma conta cadastrada.');
        setIsAdding(false);
        return;
      }

      // Check if already admin
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', profile.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (existing) {
        toast.error('Este usuário já é administrador');
        setIsAdding(false);
        return;
      }

      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: profile.id, role: 'admin' });

      if (error) throw error;

      toast.success(`${profile.full_name || email} promovido a administrador! 🎉`);
      setEmail('');
      fetchAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error('Erro ao adicionar administrador');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAdmin = async (admin: AdminUser) => {
    if (admins.length <= 1) {
      toast.error('Não é possível remover o último administrador');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', admin.id);

      if (error) throw error;

      toast.success(`Permissão de ${admin.full_name} removida`);
      fetchAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Erro ao remover administrador');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" /> Administradores
        </h1>
        <p className="text-muted-foreground mt-1">Gerencie quem tem acesso ao painel administrativo</p>
      </div>

      {/* Add Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> Adicionar Administrador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="adminEmail" className="sr-only">Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email do usuário cadastrado"
                className="rounded-xl"
              />
            </div>
            <Button onClick={handleAddAdmin} disabled={isAdding} className="rounded-xl">
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Adicionar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            O usuário precisa ter uma conta cadastrada no sistema.
          </p>
        </CardContent>
      </Card>

      {/* Admin List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Administradores Atuais ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {admins.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium">{admin.full_name}</p>
                <p className="text-sm text-muted-foreground">{admin.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAdmin(admin)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={admins.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
