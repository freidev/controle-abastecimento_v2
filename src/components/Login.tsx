import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Lock, User, AlertCircle,
  UserPlus, ArrowLeft, CheckCircle, Clock, Shield
} from 'lucide-react';
import LogoStratos from './LogoStratos';
import { useAuth, UserRole } from '../contexts/AuthContext';

type Tela = 'login' | 'cadastro';

export default function Login() {
  const { login, registrar } = useAuth();
  const [tela, setTela] = useState<Tela>('login');

  // ── Login ──────────────────────────────────────────────────────────────────
  const [loginStr, setLoginStr]         = useState('');
  const [senha, setSenha]               = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erroLogin, setErroLogin]       = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginStr.trim() || !senha) { setErroLogin('Preencha o usuário e a senha.'); return; }
    setLoadingLogin(true); setErroLogin('');
    await new Promise(r => setTimeout(r, 500));
    const resultado = login(loginStr.trim(), senha);
    if (!resultado.ok) setErroLogin(resultado.motivo || 'Erro ao entrar.');
    setLoadingLogin(false);
  };

  // ── Cadastro ───────────────────────────────────────────────────────────────
  const [cadNome, setCadNome]             = useState('');
  const [cadLogin, setCadLogin]           = useState('');
  const [cadSenha, setCadSenha]           = useState('');
  const [cadConfirma, setCadConfirma]     = useState('');
  const [cadRole, setCadRole]             = useState<UserRole>('operador');
  const [mostrarCadSenha, setMostrarCadSenha] = useState(false);
  const [erroCad, setErroCad]             = useState('');
  const [sucessoCad, setSucessoCad]       = useState('');
  const [loadingCad, setLoadingCad]       = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroCad(''); setSucessoCad('');
    if (!cadNome.trim())   { setErroCad('Informe seu nome.'); return; }
    if (!cadLogin.trim())  { setErroCad('Informe um nome de usuário.'); return; }
    if (cadSenha.length < 4) { setErroCad('A senha deve ter pelo menos 4 caracteres.'); return; }
    if (cadSenha !== cadConfirma) { setErroCad('As senhas não coincidem.'); return; }
    setLoadingCad(true);
    await new Promise(r => setTimeout(r, 500));
    const resultado = registrar(cadNome.trim(), cadLogin.trim(), cadSenha, cadRole);
    if (resultado.ok) {
      setSucessoCad(resultado.motivo);
      setCadNome(''); setCadLogin(''); setCadSenha(''); setCadConfirma('');
    } else {
      setErroCad(resultado.motivo);
    }
    setLoadingCad(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1C2340 0%, #2A3356 50%, #1C2340 100%)' }}>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm sm:max-w-md"
      >
        {/* Logo Stratos — imagem real com fundo branco */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-white rounded-2xl px-6 py-3 shadow-lg inline-flex items-center justify-center">
              <LogoStratos height={56} />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
            Controle de Abastecimento
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Sistema Corporativo de Gestão de Combustível
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          <AnimatePresence mode="wait">

            {/* ── TELA DE LOGIN ── */}
            {tela === 'login' && (
              <motion.div key="login"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="p-6 sm:p-8"
              >
                <h2 className="text-lg font-semibold text-slate-800 mb-5 text-center">Entrar no Sistema</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Usuário</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" value={loginStr}
                        onChange={e => { setLoginStr(e.target.value); setErroLogin(''); }}
                        placeholder="Digite seu usuário" autoComplete="username"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type={mostrarSenha ? 'text' : 'password'} value={senha}
                        onChange={e => { setSenha(e.target.value); setErroLogin(''); }}
                        placeholder="Digite sua senha" autoComplete="current-password"
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                      <button type="button" onClick={() => setMostrarSenha(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {erroLogin && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />{erroLogin}
                    </motion.div>
                  )}

                  <button type="submit" disabled={loadingLogin}
                    className="w-full flex items-center justify-center gap-2 py-3 text-white font-semibold rounded-xl transition-all shadow-sm"
                    style={{ background: loadingLogin ? '#c0525f' : '#8B1E2B' }}
                    onMouseEnter={e => !loadingLogin && (e.currentTarget.style.background = '#6B1520')}
                    onMouseLeave={e => !loadingLogin && (e.currentTarget.style.background = '#8B1E2B')}
                  >
                    {loadingLogin ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : 'Entrar'}
                  </button>
                </form>

                {/* Link para cadastro */}
                <div className="mt-5 pt-5 border-t border-slate-100 text-center">
                  <p className="text-sm text-slate-500 mb-3">Não tem uma conta?</p>
                  <button onClick={() => { setTela('cadastro'); setErroLogin(''); }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 border-2 font-medium rounded-xl transition-all text-sm"
                    style={{ borderColor: '#8B1E2B', color: '#8B1E2B' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fdf2f2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <UserPlus className="w-4 h-4" /> Criar conta
                  </button>
                </div>

                {/* Perfis */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-3 text-center border" style={{ background: '#fdf2f2', borderColor: '#f5c6cb' }}>
                    <Shield className="w-4 h-4 mx-auto mb-1" style={{ color: '#8B1E2B' }} />
                    <p className="text-xs font-semibold" style={{ color: '#8B1E2B' }}>Administrador</p>
                    <p className="text-xs text-slate-400 mt-0.5">Acesso completo</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <User className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-600">Operador</p>
                    <p className="text-xs text-slate-400 mt-0.5">Só Preenchimento</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TELA DE CADASTRO ── */}
            {tela === 'cadastro' && (
              <motion.div key="cadastro"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-5">
                  <button onClick={() => { setTela('login'); setErroCad(''); setSucessoCad(''); }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-lg font-semibold text-slate-800">Criar Conta</h2>
                </div>

                {/* Sucesso */}
                {sucessoCad && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-800">Sucesso!</p>
                        <p className="text-sm text-emerald-700 mt-0.5">{sucessoCad}</p>
                        {cadRole === 'operador' && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600">
                            <Clock className="w-3.5 h-3.5" />
                            Aguardando aprovação do administrador
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={() => setTela('login')}
                      className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Ir para o Login
                    </button>
                  </motion.div>
                )}

                {!sucessoCad && (
                  <form onSubmit={handleCadastro} className="space-y-3.5">

                    {/* Tipo de perfil */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Tipo de Perfil</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setCadRole('admin')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            cadRole === 'admin'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}>
                          <Shield className="w-4 h-4" /> Administrador
                        </button>
                        <button type="button" onClick={() => setCadRole('operador')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            cadRole === 'operador'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}>
                          <User className="w-4 h-4" /> Operador
                        </button>
                      </div>
                      {cadRole === 'operador' && (
                        <div className="flex items-center gap-1.5 mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <p className="text-xs text-amber-700">Requer aprovação do administrador antes de fazer login</p>
                        </div>
                      )}
                    </div>

                    {/* Nome */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nome completo</label>
                      <input type="text" value={cadNome} onChange={e => { setCadNome(e.target.value); setErroCad(''); }}
                        placeholder="Seu nome completo"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>

                    {/* Usuário */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">Usuário</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" value={cadLogin} onChange={e => { setCadLogin(e.target.value.replace(/\s/g, '')); setErroCad(''); }}
                          placeholder="Nome de usuário (sem espaços)"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                      </div>
                    </div>

                    {/* Senha */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type={mostrarCadSenha ? 'text' : 'password'} value={cadSenha}
                          onChange={e => { setCadSenha(e.target.value); setErroCad(''); }}
                          placeholder="Mínimo 4 caracteres"
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                        <button type="button" onClick={() => setMostrarCadSenha(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                          {mostrarCadSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirmar senha */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">Confirmar senha</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type={mostrarCadSenha ? 'text' : 'password'} value={cadConfirma}
                          onChange={e => { setCadConfirma(e.target.value); setErroCad(''); }}
                          placeholder="Repita a senha"
                          className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                            cadConfirma && cadSenha !== cadConfirma ? 'border-red-300 bg-red-50' : 'border-slate-200'
                          }`} />
                        {cadConfirma && cadSenha === cadConfirma && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                    </div>

                    {/* Erro */}
                    {erroCad && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />{erroCad}
                      </motion.div>
                    )}

                    <button type="submit" disabled={loadingCad}
                      className="w-full flex items-center justify-center gap-2 py-3 text-white font-semibold rounded-xl transition-all shadow-sm mt-1"
                      style={{ background: loadingCad ? '#c0525f' : '#8B1E2B' }}>
                      {loadingCad ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <><UserPlus className="w-4 h-4" /> Criar conta</>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <p className="text-center text-slate-400 text-xs mt-4">
          Controle de Abastecimento v1.0 — Sistema Corporativo
        </p>
      </motion.div>
    </div>
  );
}
