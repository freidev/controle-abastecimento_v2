import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, TrendingUp, AlertTriangle, CheckCircle, Plus, Trash2,
  DollarSign, PieChart, Calendar, ChevronDown, ChevronUp, Info,
  Eraser, X
} from 'lucide-react';
import { OrcamentoDiretoria, Abastecimento } from '../types';

interface OrcamentoProps {
  orcamento: OrcamentoDiretoria[];
  onUpdate: (orcamento: OrcamentoDiretoria[]) => void;
  dadosRealizados: { diretoria: string; realizado: number }[];
  // dados brutos para filtrar por período
  dados?: Abastecimento[];
  precoDiesel?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const hoje      = new Date().toISOString().split('T')[0];
const primeiroDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString().split('T')[0];

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('pt-BR') : '—';

// ── Componente ────────────────────────────────────────────────────────────────
export default function Orcamento({
  orcamento, onUpdate, dadosRealizados, dados = [], precoDiesel = 0
}: OrcamentoProps) {

  // ── Estado do período global (aplica a todos que não têm período próprio) ──
  const [periodoGlobal, setPeriodoGlobal] = useState({
    inicio: primeiroDiaMes,
    fim:    hoje,
  });
  const [mostrarPeriodo,   setMostrarPeriodo  ] = useState(false);
  const [confirmLimparTudo, setConfirmLimparTudo] = useState(false);

  // ── Estado do formulário de novo orçamento ──
  const [novo, setNovo] = useState({
    diretoria:  '',
    orcamento:  '',   // string para evitar bug do input controlado
    dataInicio: primeiroDiaMes,
    dataFim:    hoje,
  });
  const [erroNovo, setErroNovo]   = useState('');

  // ── Estado de edição inline ──
  const [editando, setEditando]     = useState<number | null>(null);
  const [valorEdit, setValorEdit]   = useState('');
  const [inicioEdit, setInicioEdit] = useState('');
  const [fimEdit, setFimEdit]       = useState('');

  // ── Calcula o realizado de cada diretoria dentro do período configurado ──
  const realizadoPorDiretoriaComPeriodo = useMemo(() => {
    return orcamento.map(orc => {
      const inicio = orc.dataInicio || periodoGlobal.inicio;
      const fim    = orc.dataFim    || periodoGlobal.fim;

      // Se não há dados brutos, cai no fallback (dadosRealizados sem filtro)
      if (!dados.length || !precoDiesel) {
        const realizado = dadosRealizados.find(d => d.diretoria === orc.diretoria)?.realizado || 0;
        return { diretoria: orc.diretoria, realizado };
      }

      const realizado = dados
        .filter(d => {
          if (d.diretoria !== orc.diretoria) return false;
          if (d.data < inicio || d.data > fim) return false;
          return true;
        })
        .reduce((acc, d) => acc + d.litros * precoDiesel, 0);

      return { diretoria: orc.diretoria, realizado };
    });
  }, [orcamento, dados, precoDiesel, dadosRealizados, periodoGlobal]);

  // ── CRUD ──
  const handleAdd = () => {
    const nomeTrimado = novo.diretoria.trim();
    const valorNum    = parseFloat(novo.orcamento);

    if (!nomeTrimado) { setErroNovo('Informe o nome da diretoria.'); return; }
    if (isNaN(valorNum) || valorNum <= 0) { setErroNovo('Informe um valor de orçamento válido.'); return; }
    if (orcamento.find(o => o.diretoria.toLowerCase() === nomeTrimado.toLowerCase())) {
      setErroNovo('Essa diretoria já existe.'); return;
    }
    setErroNovo('');
    onUpdate([...orcamento, {
      diretoria:  nomeTrimado,
      orcamento:  valorNum,
      dataInicio: novo.dataInicio,
      dataFim:    novo.dataFim,
    }]);
    setNovo({ diretoria: '', orcamento: '', dataInicio: primeiroDiaMes, dataFim: hoje });
  };

  const handleDelete = (diretoria: string) =>
    onUpdate(orcamento.filter(o => o.diretoria !== diretoria));

  const handleEdit = (index: number) => {
    setEditando(index);
    setValorEdit(orcamento[index].orcamento.toString());
    setInicioEdit(orcamento[index].dataInicio || periodoGlobal.inicio);
    setFimEdit(orcamento[index].dataFim    || periodoGlobal.fim);
  };

  const handleSaveEdit = (index: number) => {
    const updated = [...orcamento];
    updated[index] = {
      ...updated[index],
      orcamento:  Number(valorEdit),
      dataInicio: inicioEdit,
      dataFim:    fimEdit,
    };
    onUpdate(updated);
    setEditando(null);
  };

  // ── KPIs globais ──
  const totalOrcado    = orcamento.reduce((a, o) => a + o.orcamento, 0);
  const totalRealizado = realizadoPorDiretoriaComPeriodo.reduce((a, d) => a + d.realizado, 0);

  const campo = 'px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
      >
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Orçamento por Diretoria</h2>
              <p className="text-sm text-slate-500">Gerencie orçamentos e períodos de vigência</p>
            </div>
          </div>

          {/* Botões do header */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Limpar tudo */}
            {orcamento.length > 0 && (
              <button
                onClick={() => setConfirmLimparTudo(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
              >
                <Eraser className="w-4 h-4" />
                Limpar tudo
              </button>
            )}

            {/* Período global */}
            <button
              onClick={() => setMostrarPeriodo(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                mostrarPeriodo
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Período Global
              {mostrarPeriodo
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />
              }
            </button>
          </div>
        </div>

        {/* ── Confirmação Limpar tudo ── */}
        <AnimatePresence>
          {confirmLimparTudo && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Remover todos os {orcamento.length} orçamentos?
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Esta ação não pode ser desfeita. Todos os orçamentos e períodos configurados serão apagados.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => { onUpdate([]); setConfirmLimparTudo(false); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  Sim, limpar tudo
                </button>
                <button
                  onClick={() => setConfirmLimparTudo(false)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium border border-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Período Global (colapsável) ── */}
        {mostrarPeriodo && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <div className="flex items-start gap-2 mb-3">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                O <strong>Período Global</strong> é usado como padrão para diretorias que não têm
                período próprio configurado. O realizado é calculado apenas para abastecimentos
                dentro do intervalo de datas.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-xs font-semibold text-blue-800 mb-1 block">Data Início</label>
                <input
                  type="date"
                  value={periodoGlobal.inicio}
                  onChange={e => setPeriodoGlobal(p => ({ ...p, inicio: e.target.value }))}
                  className={campo}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-blue-800 mb-1 block">Data Fim</label>
                <input
                  type="date"
                  value={periodoGlobal.fim}
                  onChange={e => setPeriodoGlobal(p => ({ ...p, fim: e.target.value }))}
                  className={campo}
                />
              </div>
              <div className="text-sm text-blue-700 font-medium">
                {fmtDate(periodoGlobal.inicio)} → {fmtDate(periodoGlobal.fim)}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── KPIs ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total Orçado</span>
            </div>
            <p className="text-xl font-bold text-blue-900">{fmt(totalOrcado)}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Total Realizado</span>
            </div>
            <p className="text-xl font-bold text-orange-900">{fmt(totalRealizado)}</p>
          </div>
          <div className={`rounded-lg p-4 ${totalRealizado > totalOrcado ? 'bg-red-50' : 'bg-emerald-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <PieChart className={`w-4 h-4 ${totalRealizado > totalOrcado ? 'text-red-600' : 'text-emerald-600'}`} />
              <span className={`text-sm font-medium ${totalRealizado > totalOrcado ? 'text-red-800' : 'text-emerald-800'}`}>
                Situação
              </span>
            </div>
            <p className={`text-xl font-bold ${totalRealizado > totalOrcado ? 'text-red-900' : 'text-emerald-900'}`}>
              {totalRealizado > totalOrcado ? 'Ultrapassado' : 'Dentro do Orçamento'}
            </p>
            <p className="text-xs mt-1 text-slate-500">
              {totalOrcado > 0 ? ((totalRealizado / totalOrcado) * 100).toFixed(1) : '0'}% executado
            </p>
          </div>
        </div>

        {/* ── Tabela ── */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Diretoria</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Período</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Orçamento (R$)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Realizado (R$)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">% Exec.</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orcamento.map((item, index) => {
                const real        = realizadoPorDiretoriaComPeriodo.find(d => d.diretoria === item.diretoria)?.realizado || 0;
                const percentual  = item.orcamento > 0 ? (real / item.orcamento) * 100 : 0;
                const ultrapassou = real > item.orcamento;
                const inicio      = item.dataInicio || periodoGlobal.inicio;
                const fim         = item.dataFim    || periodoGlobal.fim;
                const emEdicao    = editando === index;

                return (
                  <>
                    {/* ── Linha normal de visualização ── */}
                    <motion.tr
                      key={item.diretoria}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`transition-colors ${emEdicao ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      {/* Diretoria */}
                      <td className="px-4 py-3 font-medium text-slate-800">{item.diretoria}</td>

                      {/* Período */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-lg font-mono">
                            {fmtDate(inicio)}
                          </span>
                          <span className="text-slate-400 text-xs">→</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-lg font-mono">
                            {fmtDate(fim)}
                          </span>
                          {!item.dataInicio && (
                            <span className="text-xs text-blue-500 italic">(global)</span>
                          )}
                        </div>
                      </td>

                      {/* Orçamento */}
                      <td className="px-4 py-3 text-right text-slate-700">{fmt(item.orcamento)}</td>

                      {/* Realizado */}
                      <td className="px-4 py-3 text-right text-slate-700">{fmt(real)}</td>

                      {/* % */}
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${ultrapassou ? 'text-red-600' : 'text-slate-700'}`}>
                          {percentual.toFixed(1)}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        {ultrapassou ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            <AlertTriangle className="w-3 h-3" /> Ultrapassado
                          </span>
                        ) : percentual > 80 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            <AlertTriangle className="w-3 h-3" /> Atenção
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                            <CheckCircle className="w-3 h-3" /> OK
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {emEdicao ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(index)}
                                className="px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors font-semibold"
                              >
                                ✓ Salvar
                              </button>
                              <button
                                onClick={() => setEditando(null)}
                                className="px-2.5 py-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors font-medium"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEdit(index)}
                              className="px-2.5 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors font-medium"
                            >
                              ✏️ Editar
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(item.diretoria)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* ── Painel de edição expandido (aparece abaixo da linha) ── */}
                    {emEdicao && (
                      <tr key={`edit-${item.diretoria}`} className="bg-blue-50 border-b border-blue-200">
                        <td colSpan={7} className="px-4 py-4">
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm"
                          >
                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
                              ✏️ Editando: {item.diretoria}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {/* Orçamento */}
                              <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">Orçamento (R$)</label>
                                <input
                                  type="number"
                                  value={valorEdit}
                                  onChange={e => setValorEdit(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && handleSaveEdit(index)}
                                  autoFocus
                                  className="w-full px-3 py-2.5 bg-slate-50 border border-blue-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                              </div>
                              {/* Data Início */}
                              <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">Data Início</label>
                                <input
                                  type="date"
                                  value={inicioEdit}
                                  onChange={e => setInicioEdit(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-slate-50 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                              </div>
                              {/* Data Fim */}
                              <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">Data Fim</label>
                                <input
                                  type="date"
                                  value={fimEdit}
                                  onChange={e => setFimEdit(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-slate-50 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4 pt-3 border-t border-blue-100">
                              <button
                                onClick={() => handleSaveEdit(index)}
                                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                              >
                                <CheckCircle className="w-4 h-4" /> Salvar Alterações
                              </button>
                              <button
                                onClick={() => setEditando(null)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {orcamento.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Nenhum orçamento cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Adicionar novo ── */}
        <div className="bg-slate-50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            Adicionar Nova Diretoria
          </h4>

          {/* Erro */}
          {erroNovo && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {erroNovo}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Diretoria */}
            <div className="lg:col-span-1">
              <label className="text-xs text-slate-500 mb-1 block">Diretoria *</label>
              <input
                type="text"
                placeholder="Ex: Operações"
                value={novo.diretoria}
                onChange={e => { setNovo(n => ({ ...n, diretoria: e.target.value })); setErroNovo(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Orçamento */}
            <div className="lg:col-span-1">
              <label className="text-xs text-slate-500 mb-1 block">Orçamento (R$) *</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ex: 85000"
                value={novo.orcamento}
                onChange={e => { setNovo(n => ({ ...n, orcamento: e.target.value.replace(/[^0-9.,]/g, '') })); setErroNovo(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Data Início */}
            <div className="lg:col-span-1">
              <label className="text-xs text-slate-500 mb-1 block">Data Início</label>
              <input
                type="date"
                value={novo.dataInicio}
                onChange={e => setNovo(n => ({ ...n, dataInicio: e.target.value }))}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Data Fim */}
            <div className="lg:col-span-1">
              <label className="text-xs text-slate-500 mb-1 block">Data Fim</label>
              <input
                type="date"
                value={novo.dataFim}
                onChange={e => setNovo(n => ({ ...n, dataFim: e.target.value }))}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Botão — nunca fica disabled, valida no click */}
            <div className="lg:col-span-1 flex items-end">
              <button
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
