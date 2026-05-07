import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'operador';
export type SolicitacaoStatus = 'pendente' | 'aprovado' | 'rejeitado';

export interface User {
  id: string;
  nome: string;
  login: string;
  senha: string;
  role: UserRole;
  ativo: boolean;
  criadoEm: string;
  principal?: boolean;
}

export interface Solicitacao {
  id: string;
  nome: string;
  login: string;
  senha: string;
  role: UserRole;
  status: SolicitacaoStatus;
  criadoEm: string;
  avaliadoEm?: string;
}

export const ABAS_PERMITIDAS: Record<UserRole, string[]> = {
  admin: [
    'dashboard',
    'base_dados',
    'orcamento',
    'rateio',
    'cadastro_equipamento',
    'preenchimento',
    'importacao',
    'exportacao',
    'parametros',
    'usuarios',
    'historico',
  ],
  operador: ['preenchimento'],
};

function mapDbUserToUser(dbUser: any): User {
  return {
    id: dbUser.id,
    nome: dbUser.nome,
    login: dbUser.login,
    senha: dbUser.senha,
    role: dbUser.role as UserRole,
    ativo: dbUser.status === 'ativo',
    criadoEm: dbUser.criado_em,
    principal: dbUser.login === 'admin',
  };
}

interface AuthContextType {
  user: User | null;
  usuarios: User[];
  solicitacoes: Solicitacao[];
  loading: boolean;
  login: (loginStr: string, senha: string) => { ok: boolean; motivo?: string };
  logout: () => void;
  registrar: (nome: string, loginStr: string, senha: string, role: UserRole) => Promise<{ ok: boolean; motivo: string }>;
  aprovarSolicitacao: (id: string) => Promise<{ ok: boolean; motivo?: string }>;
  rejeitarSolicitacao: (id: string) => Promise<{ ok: boolean; motivo?: string }>;
  excluirUsuario: (id: string) => Promise<void>;
  alterarSenha: (id: string, novaSenha: string) => Promise<void>;
  podeAcessar: (aba: string) => boolean;
  isAdminPrincipal: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = sessionStorage.getItem('auth_user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('criado_em', { ascending: false });

    if (data && !error) {
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
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const login = useCallback((loginStr: string, senha: string): { ok: boolean; motivo?: string } => {
    const u = usuarios.find(
      u => u.login.toLowerCase() === loginStr.toLowerCase() && u.senha === senha
    );

    if (!u) return { ok: false, motivo: 'Usuário ou senha incorretos.' };
    if (!u.ativo) return { ok: false, motivo: 'Sua conta está inativa.' };

    setUser(u);
    sessionStorage.setItem('auth_user', JSON.stringify(u));
    return { ok: true };
  }, [usuarios]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('auth_user');
  }, []);

  const registrar = useCallback(async (
    nome: string,
    loginStr: string,
    senha: string,
    role: UserRole
  ): Promise<{ ok: boolean; motivo: string }> => {
    const loginUsado = usuarios.some(u => u.login.toLowerCase() === loginStr.toLowerCase());
    const solPendente = solicitacoes.some(s => s.login.toLowerCase() === loginStr.toLowerCase());

    if (loginUsado) return { ok: false, motivo: 'Este usuário já existe.' };
    if (solPendente) return { ok: false, motivo: 'Já existe uma solicitação pendente.' };

    // ✅ Nova regra:
    // - admin principal "admin" entra direto pois já existe no banco
    // - qualquer NOVO admin fica pendente
    // - operador também fica pendente
    const status = 'pendente';

    const { error } = await supabase.from('usuarios').insert({
      nome,
      login: loginStr,
      senha,
      role,
      status,
    });

    if (error) return { ok: false, motivo: 'Erro ao criar conta.' };

    await fetchAllUsers();

    if (role === 'admin') {
      return {
        ok: true,
        motivo: 'Solicitação de administrador enviada! Aguarde a aprovação do Administrador Principal.',
      };
    }

    return {
      ok: true,
      motivo: 'Solicitação enviada! Aguarde aprovação de um administrador.',
    };
  }, [usuarios, solicitacoes, fetchAllUsers]);

  const aprovarSolicitacao = useCallback(async (id: string): Promise<{ ok: boolean; motivo?: string }> => {
    const solicitacao = solicitacoes.find(s => s.id === id);
    if (!solicitacao) return { ok: false, motivo: 'Solicitação não encontrada.' };

    // ✅ Regra:
    // novos administradores só podem ser aprovados pelo admin principal
    if (
      solicitacao.role === 'admin' &&
      user?.login !== 'admin'
    ) {
      return {
        ok: false,
        motivo: 'Somente o Administrador Principal pode aprovar novos administradores.',
      };
    }

    const { error } = await supabase
      .from('usuarios')
      .update({ status: 'ativo' })
      .eq('id', id);

    if (error) {
      return { ok: false, motivo: 'Erro ao aprovar solicitação.' };
    }

    await fetchAllUsers();
    return { ok: true };
  }, [fetchAllUsers, solicitacoes, user]);

  const rejeitarSolicitacao = useCallback(async (id: string): Promise<{ ok: boolean; motivo?: string }> => {
    const solicitacao = solicitacoes.find(s => s.id === id);
    if (!solicitacao) return { ok: false, motivo: 'Solicitação não encontrada.' };

    if (
      solicitacao.role === 'admin' &&
      user?.login !== 'admin'
    ) {
      return {
        ok: false,
        motivo: 'Somente o Administrador Principal pode rejeitar novos administradores.',
      };
    }

    const { error } = await supabase
      .from('usuarios')
      .update({ status: 'rejeitado' })
      .eq('id', id);

    if (error) {
      return { ok: false, motivo: 'Erro ao rejeitar solicitação.' };
    }

    await fetchAllUsers();
    return { ok: true };
  }, [fetchAllUsers, solicitacoes, user]);

  const excluirUsuario = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (!error) await fetchAllUsers();
  }, [fetchAllUsers]);

  const alterarSenha = useCallback(async (id: string, novaSenha: string) => {
    const { error } = await supabase
      .from('usuarios')
      .update({ senha: novaSenha })
      .eq('id', id);

    if (!error) await fetchAllUsers();
  }, [fetchAllUsers]);

  const podeAcessar = useCallback((aba: string): boolean => {
    if (!user) return false;
    return ABAS_PERMITIDAS[user.role].includes(aba);
  }, [user]);

  const isAdminPrincipal = user?.login === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        usuarios,
        solicitacoes,
        loading,
        login,
        logout,
        registrar,
        aprovarSolicitacao,
        rejeitarSolicitacao,
        excluirUsuario,
        alterarSenha,
        podeAcessar,
        isAdminPrincipal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
