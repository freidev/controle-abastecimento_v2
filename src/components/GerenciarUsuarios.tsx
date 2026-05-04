import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CheckCircle, X, Clock, Shield, User,
  Trash2, Bell, Key, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function GerenciarUsuarios() {
  const { usuarios, solicitacoes, aprovarSolicitacao, rejeitarSolicitacao, excluirUsuario, alterarSenha, user } = useAuth();
  const [aba, setAba] = useState<'solicitacoes' | 'usuarios'>('solicitacoes');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editandoSenha, setEditandoSenha] = useState<string | null>(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [senhaOk, setSenhaOk] = useState('');

  const pendentes  = solicitacoes.filter(s => s.status === 'pendente');
  const avaliadas  = solicitacoes.filter(s => s.status !== 'pendente');

  const handleAlterarSenha = (id: string) => {
    if (novaSenha.length < 4) return;
    alterarSenha(id, novaSenha);
    setSenhaOk('Senha alterada com sucesso!');
    setTimeout(() => { setSenhaOk(''); setEditandoSenha(null); setNovaSenha(''); }, 2000);
  };

  const fmt = (d: string) => new Date(d).toLocaleString('pt-BR');

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-800">Gerenciar Usuários</h2>
            <p className="text-sm text-slate-500">Aprove solicitações e gerencie contas</p>
          </div>
          {pendentes.length > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
              <Bell className="w-4 h-4" />
              {pendentes.length} pendente{pendentes.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </motion.div>

      {/* Abas */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
        <button onClick={() => setAba('solicitacoes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            aba === 'solicitacoes' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'
          }`}>
          <Clock className="w-4 h-4" />
          Solicitações
          {pendentes.length > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full font-bold">{pendentes.length}</span>
          )}
        </button>
        <button onClick={() => setAba('usuarios')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            aba === 'usuarios' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'
          }`}>
          <Users className="w-4 h-4" />
          Usuários ({usuarios.length})
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ── ABA: SOLICITAÇÕES ── */}
        {aba === 'solicitacoes' && (
          <motion.div key="sol" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* Pendentes */}
            {pendentes.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide px-1">⏳ Aguardando aprovação</p>
                {pendentes.map(s => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white border-2 border-amber-200 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{s.nome}</p>
                          <p className="text-sm text-slate-500 font-mono">@{s.login}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                              {s.role === 'admin' ? '🛡️ Admin' : '👤 Operador'}
                            </span>
                            <span className="text-xs text-slate-400">{fmt(s.criadoEm)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-col lg:flex-row">
                        <button onClick={() => aprovarSolicitacao(s.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">
                          <CheckCircle className="w-4 h-4" /> Aprovar
                        </button>
                        <button onClick={() => rejeitarSolicitacao(s.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-medium rounded-xl transition-colors">
                          <X className="w-4 h-4" /> Rejeitar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Nenhuma solicitação pendente</p>
                <p className="text-slate-400 text-sm mt-1">Todas as solicitações foram avaliadas</p>
              </div>
            )}

            {/* Avaliadas */}
            {avaliadas.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Histórico</p>
                {avaliadas.map(s => (
                  <div key={s.id} className={`bg-white border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    s.status === 'aprovado' ? 'border-emerald-200' : 'border-red-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        s.status === 'aprovado' ? 'bg-emerald-100' : 'bg-red-100'
                      }`}>
                        {s.status === 'aprovado' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-red-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.nome} <span className="font-mono text-slate-400">@{s.login}</span></p>
                        <p className="text-xs text-slate-400">{s.status === 'aprovado' ? '✅ Aprovado' : '❌ Rejeitado'} em {s.avaliadoEm ? fmt(s.avaliadoEm) : '—'}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full self-start sm:self-auto">
                      {s.role === 'admin' ? 'Admin' : 'Operador'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── ABA: USUÁRIOS ── */}
        {aba === 'usuarios' && (
          <motion.div key="usr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {usuarios.map(u => (
                <div key={u.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        u.role === 'admin' ? 'bg-blue-100' : 'bg-emerald-100'
                      }`}>
                        {u.role === 'admin' ? <Shield className="w-5 h-5 text-blue-600" /> : <User className="w-5 h-5 text-emerald-600" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{u.nome}</p>
                        <p className="text-xs text-slate-500 font-mono">@{u.login}</p>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {u.role === 'admin' ? '🛡️ Admin' : '👤 Operador'}
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    {u.id !== user?.id && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Alterar senha */}
                        <button onClick={() => { setEditandoSenha(u.id === editandoSenha ? null : u.id); setNovaSenha(''); setSenhaOk(''); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium transition-colors">
                          <Key className="w-3.5 h-3.5" /> Senha
                        </button>

                        {/* Excluir */}
                        {confirmDelete === u.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => { excluirUsuario(u.id); setConfirmDelete(null); }}
                              className="px-2.5 py-1.5 bg-red-600 text-white text-xs rounded-lg font-medium hover:bg-red-700">
                              Confirmar
                            </button>
                            <button onClick={() => setConfirmDelete(null)}
                              className="px-2.5 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-lg font-medium hover:bg-slate-200">
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(u.id)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                    {u.id === user?.id && (
                      <span className="text-xs text-slate-400 italic">Você</span>
                    )}
                  </div>

                  {/* Alterar senha inline */}
                  <AnimatePresence>
                    {editandoSenha === u.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-slate-100 overflow-hidden">
                        {senhaOk ? (
                          <div className="flex items-center gap-2 text-emerald-600 text-sm">
                            <CheckCircle className="w-4 h-4" />{senhaOk}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input type={mostrarSenha ? 'text' : 'password'} value={novaSenha}
                                onChange={e => setNovaSenha(e.target.value)}
                                placeholder="Nova senha (mín. 4 caracteres)"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                              <button type="button" onClick={() => setMostrarSenha(v => !v)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                                {mostrarSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <button onClick={() => handleAlterarSenha(u.id)} disabled={novaSenha.length < 4}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                              Salvar
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
