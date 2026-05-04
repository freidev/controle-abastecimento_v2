import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'operador';

export interface User {
  id: string;
  nome: string;
  login: string;
  senha: string;
  role: UserRole;
  ativo: boolean;
  criadoEm: string;
}

export interface Solicitacao {
  id: string;
  nome: string;
  login: string;
  senha: string;
  role: UserRole;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  criadoEm: string;
  avaliadoEm?: string;
}

// ── Abas permitidas por perfil ────────────────────────────────────────────────
export const ABAS_PERMITIDAS: Record<UserRole, string[]> = {
  admin: ['dashboard', 'base_dados', 'orcamento', 'rateio', 'cadastro_equipamento', 'preenchimento', 'importacao', 'exportacao', 'parametros', 'usuarios'],
  operador: ['preenchimento'],
};

// ── Helpers de Conversão ──────────────────────────────────────────────────────
function mapDbUserToUser(dbUser: any): User {
  return {
    id: dbUser.id,
    nome: dbUser.nome,
    login: dbUser.login,
    senha: dbUser.senha,
    role: dbUser.role as UserRole,
    ativo: dbUser.status === 'ativo',
    criadoEm: dbUser.criado_em,
  };
}

// ── Context ───────────────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  usuarios: User[];
  solicitacoes: Solicitacao[];
  login: (loginStr: string, senha: string) => { ok: boolean; motivo?: string };
  logout: () => void;
  registrar: (nome: string, loginStr: string, senha: string, role: UserRole) => { ok: boolean; motivo: string };
  aprovarSolicitacao: (id: string) => void;
  rejeitarSolicitacao: (id: string) => void;
  excluirUsuario: (id: string) => void;
  alterarSenha: (id: string, novaSenha: string) => void;
  podeAcessar: (aba: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = sessionStorage.getItem('auth_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Carrega dados do Supabase ao iniciar ──────────────────────────────────────
  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('criado_em', { ascending: false });

    if (data && !error) {
      // Separa usuários ativos das solicitações pendentes
      const users = data
        .filter(u => u.status === 'ativo')
        .map(mapDbUserToUser);
      
      const requests = data
        .filter(u => u.status === 'pendente')
        .map(u => ({
          id: u.id,
          nome: u.nome,
          login: u.login,
          senha: u.senha,
          role: u.role as UserRole,
          status: 'pendente' as const,
          criadoEm: u.criado_em,
        }));

      setUsuarios(users);
      setSolicitacoes(requests);
    }
    setLoading(false);
  };

  const login = useCallback((loginStr: string, senha: string): { ok: boolean; motivo?: string } => {
    // Busca na lista local (que vem do Supabase)
    const u = usuarios.find(u => u.login.toLowerCase() === loginStr.toLowerCase() && u.senha === senha);
    if (!u) return { ok: false, motivo: 'Usuário ou senha incorretos.' };
    if (!u.ativo) return { ok: false, motivo: 'Sua conta está inativa. Contate o administrador.' };
    
    setUser(u);
    sessionStorage.setItem('auth_user', JSON.stringify(u));
    return { ok: true };
  }, [usuarios]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('auth_user');
  }, []);

  const registrar = useCallback(async (nome: string, loginStr: string, senha: string, role: UserRole): Promise<{ ok: boolean; motivo: string }> => {
    // Verifica duplicidade local
    const loginUsado = usuarios.some(u => u.login.toLowerCase() === loginStr.toLowerCase());
    const solPendente = solicitacoes.some(s => s.login.toLowerCase() === loginStr.toLowerCase());
    
    if (loginUsado) return { ok: false, motivo: 'Este usuário já existe.' };
    if (solPendente) return { ok: false, motivo: 'Já existe uma solicitação pendente com este usuário.' };

    // Define status: Admin entra direto, Operador fica pendente
    const status = role === 'admin' ? 'ativo' : 'pendente';

    const { error } = await supabase.from('usuarios').insert({
      nome,
      login: loginStr,
      senha,
      role,
      status,
    });

    if (error) {
        return { ok: false, motivo: 'Erro ao criar conta. Tente novamente.' };
    }

    // Recarrega a lista
    fetchAllUsers();

    if (role === 'admin') {
      return { ok: true, motivo: 'Administrador cadastrado com sucesso! Faça login.' };
    } else {
      return { ok: true, motivo: 'Solicitação enviada! Aguarde a aprovação do administrador.' };
    }
  }, [usuarios, solicitacoes]);

  const aprovarSolicitacao = useCallback(async (id: string) => {
    const sol = solicitacoes.find(s => s.id === id);
    if (!sol) return;

    // Atualiza status para 'ativo' no Supabase
    const { error } = await supabase
      .from('usuarios')
      .update({ status: 'ativo' })
      .eq('id', id);

    if (!error) {
      fetchAllUsers();
    }
  }, [solicitacoes]);

  const rejeitarSolicitacao = useCallback(async (id: string) => {
    const sol = solicitacoes.find(s => s.id === id);
    if (!sol) return;

    // Atualiza status para 'rejeitado' no Supabase
    const { error } = await supabase
      .from('usuarios')
      .update({ status: 'rejeitado' })
      .eq('id', id);

    if (!error) {
      fetchAllUsers();
    }
  }, [solicitacoes]);

  const excluirUsuario = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchAllUsers();
    }
  }, []);

  const alterarSenha = useCallback(async (id: string, novaSenha: string) => {
    const { error } = await supabase
      .from('usuarios')
      .update({ senha: novaSenha })
      .eq('id', id);

    if (!error) {
      fetchAllUsers();
    }
  }, []);

  const podeAcessar = useCallback((aba: string): boolean => {
    if (!user) return false;
    return ABAS_PERMITIDAS[user.role].includes(aba);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, usuarios, solicitacoes, login, logout, registrar, aprovarSolicitacao, rejeitarSolicitacao, excluirUsuario, alterarSenha, podeAcessar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
