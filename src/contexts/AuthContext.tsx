
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

const USUARIOS_PADRAO: User[] = [
  {
    id: 'admin-1',
    nome: 'Administrador',
    login: 'admin',
    senha: 'admin123',
    role: 'admin',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
];

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

const KEYS = {
  usuarios: 'auth_usuarios',
  solicitacoes: 'auth_solicitacoes',
  sessao: 'auth_user',
};

function loadUsuarios(): User[] {
  try {
    const salvo = localStorage.getItem(KEYS.usuarios);
    const usuarios = salvo ? JSON.parse(salvo) as User[] : [];

    const temAdminPrincipal = usuarios.some(u => u.login === 'admin');

    if (!temAdminPrincipal) {
      const lista = [...USUARIOS_PADRAO, ...usuarios];
      localStorage.setItem(KEYS.usuarios, JSON.stringify(lista));
      return lista;
    }

    return usuarios.length > 0 ? usuarios : USUARIOS_PADRAO;
  } catch {
    return USUARIOS_PADRAO;
  }
}

function saveUsuarios(usuarios: User[]) {
  localStorage.setItem(KEYS.usuarios, JSON.stringify(usuarios));
}

function loadSolicitacoes(): Solicitacao[] {
  try {
    const salvo = localStorage.getItem(KEYS.solicitacoes);
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

function saveSolicitacoes(solicitacoes: Solicitacao[]) {
  localStorage.setItem(KEYS.solicitacoes, JSON.stringify(solicitacoes));
}

interface AuthContextType {
  user: User | null;
  usuarios: User[];
  solicitacoes: Solicitacao[];
  loading: boolean;
  login: (loginStr: string, senha: string) => { ok: boolean; motivo?: string };
  logout: () => void;
  registrar: (nome: string, loginStr: string, senha: string, role: UserRole) => Promise<{ ok: boolean; motivo: string }>;
  aprovarSolicitacao: (id: string) => Promise<void>;
  rejeitarSolicitacao: (id: string) => Promise<void>;
  excluirUsuario: (id: string) => Promise<void>;
  alterarSenha: (id: string, novaSenha: string) => Promise<void>;
  podeAcessar: (aba: string) => boolean;
  isAdminPrincipal: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<User[]>(loadUsuarios);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(loadSolicitacoes);
  const [loading] = useState(false);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const salvo = sessionStorage.getItem(KEYS.sessao);
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((loginStr: string, senha: string) => {
    const usuario = usuarios.find(
      u =>
        u.login.toLowerCase() === loginStr.toLowerCase() &&
        u.senha === senha &&
        u.ativo
    );

    if (!usuario) {
      return { ok: false, motivo: 'Usuário ou senha incorretos.' };
    }

    setUser(usuario);
    sessionStorage.setItem(KEYS.sessao, JSON.stringify(usuario));

    return { ok: true };
  }, [usuarios]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(KEYS.sessao);
  }, []);

  const registrar = useCallback(async (
    nome: string,
    loginStr: string,
    senha: string,
    role: UserRole
  ) => {
    const loginExiste = usuarios.some(
      u => u.login.toLowerCase() === loginStr.toLowerCase()
    );

    const pedidoExiste = solicitacoes.some(
      s =>
        s.login.toLowerCase() === loginStr.toLowerCase() &&
        s.status === 'pendente'
    );

    if (loginExiste) {
      return { ok: false, motivo: 'Este usuário já existe.' };
    }

    if (pedidoExiste) {
      return { ok: false, motivo: 'Já existe uma solicitação pendente para este usuário.' };
    }

    const novaSolicitacao: Solicitacao = {
      id: Math.random().toString(36).slice(2),
      nome,
      login: loginStr,
      senha,
      role,
      status: 'pendente',
      criadoEm: new Date().toISOString(),
    };

    const novas = [...solicitacoes, novaSolicitacao];
    setSolicitacoes(novas);
    saveSolicitacoes(novas);

    return {
      ok: true,
      motivo:
        role === 'admin'
          ? 'Solicitação enviada! Aguarde o Admin principal liberar seu acesso.'
          : 'Solicitação enviada! Aguarde a aprovação do administrador.',
    };
  }, [usuarios, solicitacoes]);

  const aprovarSolicitacao = useCallback(async (id: string) => {
    const solicitacao = solicitacoes.find(s => s.id === id);
    if (!solicitacao) return;

    if (solicitacao.role === 'admin' && user?.login !== 'admin') {
      alert('Somente o Admin principal pode aprovar novos administradores.');
      return;
    }

    const novoUsuario: User = {
      id: Math.random().toString(36).slice(2),
      nome: solicitacao.nome,
      login: solicitacao.login,
      senha: solicitacao.senha,
      role: solicitacao.role,
      ativo: true,
      criadoEm: new Date().toISOString(),
    };

    const novosUsuarios = [...usuarios, novoUsuario];
    setUsuarios(novosUsuarios);
    saveUsuarios(novosUsuarios);

    const novasSolicitacoes = solicitacoes.map(s =>
      s.id === id
        ? { ...s, status: 'aprovado' as SolicitacaoStatus, avaliadoEm: new Date().toISOString() }
        : s
    );

    setSolicitacoes(novasSolicitacoes);
    saveSolicitacoes(novasSolicitacoes);
  }, [solicitacoes, usuarios, user]);

  const rejeitarSolicitacao = useCallback(async (id: string) => {
    const novas = solicitacoes.map(s =>
      s.id === id
        ? { ...s, status: 'rejeitado' as SolicitacaoStatus, avaliadoEm: new Date().toISOString() }
        : s
    );

    setSolicitacoes(novas);
    saveSolicitacoes(novas);
  }, [solicitacoes]);

  const excluirUsuario = useCallback(async (id: string) => {
    const novos = usuarios.filter(u => u.id !== id);
    setUsuarios(novos);
    saveUsuarios(novos);
  }, [usuarios]);

  const alterarSenha = useCallback(async (id: string, novaSenha: string) => {
    const novos = usuarios.map(u =>
      u.id === id ? { ...u
