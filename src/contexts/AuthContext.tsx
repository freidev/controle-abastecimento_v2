import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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

// ── Usuários padrão do sistema ────────────────────────────────────────────────
const USUARIOS_PADRAO: User[] = [
  { id: 'admin-1', nome: 'Administrador', login: 'admin', senha: 'admin123', role: 'admin', ativo: true, criadoEm: new Date().toISOString() },
];

// ── Abas permitidas por perfil ────────────────────────────────────────────────
export const ABAS_PERMITIDAS: Record<UserRole, string[]> = {
  admin: ['dashboard','base_dados','orcamento','rateio','cadastro_equipamento','preenchimento','importacao','exportacao','parametros','usuarios'],
  operador: ['preenchimento'],
};

// ── Helpers localStorage ──────────────────────────────────────────────────────
const KEYS = { usuarios: 'auth_usuarios', solicitacoes: 'auth_solicitacoes', sessao: 'auth_sessao' };

function loadUsuarios(): User[] {
  try { const s = localStorage.getItem(KEYS.usuarios); return s ? JSON.parse(s) : USUARIOS_PADRAO; } catch { return USUARIOS_PADRAO; }
}
function saveUsuarios(u: User[]) { try { localStorage.setItem(KEYS.usuarios, JSON.stringify(u)); } catch { /* ignora */ } }

function loadSolicitacoes(): Solicitacao[] {
  try { const s = localStorage.getItem(KEYS.solicitacoes); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveSolicitacoes(s: Solicitacao[]) { try { localStorage.setItem(KEYS.solicitacoes, JSON.stringify(s)); } catch { /* ignora */ } }

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
  const [user,         setUser        ] = useState<User | null>(() => {
    try { const s = sessionStorage.getItem(KEYS.sessao); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [usuarios,      setUsuarios    ] = useState<User[]>(loadUsuarios);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(loadSolicitacoes);

  const login = useCallback((loginStr: string, senha: string): { ok: boolean; motivo?: string } => {
    const u = usuarios.find(u => u.login.toLowerCase() === loginStr.toLowerCase() && u.senha === senha);
    if (!u) return { ok: false, motivo: 'Usuário ou senha incorretos.' };
    if (!u.ativo) return { ok: false, motivo: 'Sua conta está inativa. Contate o administrador.' };
    setUser(u);
    sessionStorage.setItem(KEYS.sessao, JSON.stringify(u));
    return { ok: true };
  }, [usuarios]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(KEYS.sessao);
  }, []);

  const registrar = useCallback((nome: string, loginStr: string, senha: string, role: UserRole): { ok: boolean; motivo: string } => {
    const loginUsado = usuarios.some(u => u.login.toLowerCase() === loginStr.toLowerCase());
    const solPendente = solicitacoes.some(s => s.login.toLowerCase() === loginStr.toLowerCase() && s.status === 'pendente');
    if (loginUsado)  return { ok: false, motivo: 'Este usuário já existe.' };
    if (solPendente) return { ok: false, motivo: 'Já existe uma solicitação pendente com este usuário.' };

    if (role === 'admin') {
      // Admin se cadastra diretamente
      const novoUser: User = { id: Math.random().toString(36).slice(2), nome, login: loginStr, senha, role, ativo: true, criadoEm: new Date().toISOString() };
      const novosUsuarios = [...usuarios, novoUser];
      setUsuarios(novosUsuarios);
      saveUsuarios(novosUsuarios);
      return { ok: true, motivo: 'Administrador cadastrado com sucesso! Faça login.' };
    } else {
      // Operador precisa de aprovação
      const sol: Solicitacao = { id: Math.random().toString(36).slice(2), nome, login: loginStr, senha, role, status: 'pendente', criadoEm: new Date().toISOString() };
      const novas = [...solicitacoes, sol];
      setSolicitacoes(novas);
      saveSolicitacoes(novas);
      return { ok: true, motivo: 'Solicitação enviada! Aguarde a aprovação do administrador.' };
    }
  }, [usuarios, solicitacoes]);

  const aprovarSolicitacao = useCallback((id: string) => {
    const sol = solicitacoes.find(s => s.id === id);
    if (!sol) return;
    const novoUser: User = { id: Math.random().toString(36).slice(2), nome: sol.nome, login: sol.login, senha: sol.senha, role: sol.role, ativo: true, criadoEm: new Date().toISOString() };
    const novosUsuarios = [...usuarios, novoUser];
    setUsuarios(novosUsuarios);
    saveUsuarios(novosUsuarios);
    const novas = solicitacoes.map(s => s.id === id ? { ...s, status: 'aprovado' as SolicitacaoStatus, avaliadoEm: new Date().toISOString() } : s);
    setSolicitacoes(novas);
    saveSolicitacoes(novas);
  }, [solicitacoes, usuarios]);

  const rejeitarSolicitacao = useCallback((id: string) => {
    const novas = solicitacoes.map(s => s.id === id ? { ...s, status: 'rejeitado' as SolicitacaoStatus, avaliadoEm: new Date().toISOString() } : s);
    setSolicitacoes(novas);
    saveSolicitacoes(novas);
  }, [solicitacoes]);

  const excluirUsuario = useCallback((id: string) => {
    const novos = usuarios.filter(u => u.id !== id);
    setUsuarios(novos);
    saveUsuarios(novos);
  }, [usuarios]);

  const alterarSenha = useCallback((id: string, novaSenha: string) => {
    const novos = usuarios.map(u => u.id === id ? { ...u, senha: novaSenha } : u);
    setUsuarios(novos);
    saveUsuarios(novos);
  }, [usuarios]);

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
