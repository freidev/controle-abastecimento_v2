import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Trash2, ArrowUpDown, FileSpreadsheet, AlertTriangle,
  ChevronLeft, ChevronRight, X, Eraser, Edit3, Save,
  Filter, ChevronDown, ChevronUp, SlidersHorizontal,
  Wrench, Car, CheckCircle
} from 'lucide-react';
import { Abastecimento, Equipamento, DIRETORIAS, AREAS_LOT, FORNECEDORES, EQUIPAMENTOS, AREAS } from '../types';

interface BaseDadosProps {
  dados: Abastecimento[];
  precoDiesel: number;
  onDelete: (id: number) => void;
  onClearAll: () => void;
  onEdit: (item: Abastecimento) => void;
  equipamentosCad?: Equipamento[];
  onSaveEquipamentos?: (equips: Equipamento[]) => void;
}

type SortField = keyof Abastecimento;
type SortDirection = 'asc' | 'desc';

// ── Filtros ──────────────────────────────────────────────────────────────────
interface Filtros {
  ccNovo:     string;
  diretoria:  string;
  gerencia:   string;
  areaLot:    string;
  fornecedor: string;
  area:       string;
  semana:     string;
  dataInicio: string;
  dataFim:    string;
}

const FILTROS_VAZIOS: Filtros = {
  ccNovo: '', diretoria: '', gerencia: '', areaLot: '',
  fornecedor: '', area: '', semana: '', dataInicio: '', dataFim: '',
};

export default function BaseDados({ dados, precoDiesel, onDelete, onClearAll, onEdit, equipamentosCad = [] }: BaseDadosProps) {
  const [abaInterna, setAbaInterna] = useState<'abastecimentos' | 'equipamentos'>('abastecimentos');
  const [busca,          setBusca         ] = useState('');
  const [sortField,      setSortField     ] = useState<SortField>('id');
  const [sortDirection,  setSortDirection ] = useState<SortDirection>('desc');
  const [pagina,         setPagina        ] = useState(1);
  const [confirmDelete,  setConfirmDelete ] = useState<number | null>(null);
  const [confirmClearAll,setConfirmClearAll] = useState(false);
  const [editandoId,     setEditandoId   ] = useState<number | null>(null);
  const [formEdit,       setFormEdit      ] = useState<Partial<Abastecimento>>({});
  const [filtros,        setFiltros       ] = useState<Filtros>(FILTROS_VAZIOS);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const itensPorPagina = 15;

  // ── Opções únicas para os selects dos filtros ──────────────────────────────
  const opcoes = useMemo(() => ({
    ccNovo:     [...new Set(dados.map(d => d.ccNovo).filter(Boolean))].sort(),
    diretoria:  [...new Set(dados.map(d => d.diretoria).filter(Boolean))].sort(),
    gerencia:   [...new Set(dados.map(d => d.gerencia).filter(Boolean))].sort(),
    areaLot:    [...new Set(dados.map(d => d.areaLot).filter(Boolean))].sort(),
    fornecedor: [...new Set(dados.map(d => d.fornecedor).filter(Boolean))].sort(),
    area:       [...new Set(dados.map(d => d.area).filter(Boolean))].sort(),
    semana:     ['1', '2', '3', '4', '5'],
  }), [dados]);

  const setFiltro = (campo: keyof Filtros) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFiltros(f => ({ ...f, [campo]: e.target.value }));
    setPagina(1);
  };

  const limparFiltros = () => { setFiltros(FILTROS_VAZIOS); setPagina(1); };

  const totalFiltrosAtivos = Object.values(filtros).filter(Boolean).length;
  const hasFiltros = totalFiltrosAtivos > 0;

  // ── Dados filtrados + ordenados ────────────────────────────────────────────
  const dadosFiltrados = useMemo(() => {
    let lista = dados.filter(d => {
      // Busca geral
      if (busca && !Object.values(d).some(v => String(v).toLowerCase().includes(busca.toLowerCase()))) return false;
      // Filtros específicos
      if (filtros.ccNovo     && d.ccNovo     !== filtros.ccNovo)    return false;
      if (filtros.diretoria  && d.diretoria  !== filtros.diretoria) return false;
      if (filtros.gerencia   && d.gerencia   !== filtros.gerencia)  return false;
      if (filtros.areaLot    && d.areaLot    !== filtros.areaLot)   return false;
      if (filtros.fornecedor && d.fornecedor !== filtros.fornecedor) return false;
      if (filtros.area       && d.area       !== filtros.area)       return false;
      if (filtros.semana     && String(d.semana) !== filtros.semana) return false;
      if (filtros.dataInicio && d.data < filtros.dataInicio)         return false;
      if (filtros.dataFim    && d.data > filtros.dataFim)            return false;
      return true;
    });

    lista.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number')
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      return sortDirection === 'asc'
        ? String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase())
        : String(bVal).toLowerCase().localeCompare(String(aVal).toLowerCase());
    });
    return lista;
  }, [dados, busca, filtros, sortField, sortDirection]);

  const totalPaginas  = Math.ceil(dadosFiltrados.length / itensPorPagina);
  const dadosPaginados = dadosFiltrados.slice((pagina - 1) * itensPorPagina, pagina * itensPorPagina);

  const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400" />;
    return <ArrowUpDown className={`w-3 h-3 ${sortDirection === 'asc' ? 'text-blue-600' : 'text-orange-600'}`} />;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(p => p === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  // ── Edição ──────────────────────────────────────────────────────────────────
  const iniciarEdicao = (item: Abastecimento) => {
    setEditandoId(item.id);
    setFormEdit({ ...item });
    setConfirmDelete(null);
  };
  const cancelarEdicao = () => { setEditandoId(null); setFormEdit({}); };
  const salvarEdicao = () => {
    if (!editandoId || !formEdit) return;
    const dia    = new Date(formEdit.data || '').getDate();
    const semana = dia <= 7 ? 1 : dia <= 14 ? 2 : dia <= 21 ? 3 : dia <= 28 ? 4 : 5;
    onEdit({ ...formEdit as Abastecimento, semana, valor: (formEdit.litros || 0) * precoDiesel });
    setEditandoId(null);
    setFormEdit({});
  };

  const inputCls  = 'w-full px-2 py-1 bg-white border border-blue-300 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none';
  const selectCls = 'w-full px-2 py-1 bg-white border border-blue-300 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none';
  const selectFiltro = 'w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all';

  // ── Pesquisa de equipamentos cadastrados ──────────────────────────────────
  const [buscaEquip, setBuscaEquip] = useState('');
  const equipsFiltrados = useMemo(() =>
    equipamentosCad.filter(e =>
      !buscaEquip || [e.equipamento, e.placa, e.gerencia, ...e.ccNovo]
        .some(v => v?.toLowerCase().includes(buscaEquip.toLowerCase()))
    ),
    [equipamentosCad, buscaEquip]
  );

  return (
    <div className="space-y-4">

      {/* ── Abas internas ── */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
        <button onClick={() => setAbaInterna('abastecimentos')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            abaInterna === 'abastecimentos' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'
          }`}>
          <FileSpreadsheet className="w-4 h-4" />
          Abastecimentos
          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full">{dados.length}</span>
        </button>
        <button onClick={() => setAbaInterna('equipamentos')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            abaInterna === 'equipamentos' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'
          }`}>
          <Wrench className="w-4 h-4" />
          Equipamentos Cadastrados
          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full">{equipamentosCad.length}</span>
        </button>
      </div>

      {/* ── ABA: EQUIPAMENTOS CADASTRADOS ── */}
      {abaInterna === 'equipamentos' && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-4">

          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-700" />
                <h2 className="text-lg font-semibold text-slate-800">Equipamentos Cadastrados</h2>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  {equipamentosCad.length} equipamento(s)
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Buscar equipamento, placa..."
                  value={buscaEquip} onChange={e => setBuscaEquip(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
            </div>
          </div>

          {equipamentosCad.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Nenhum equipamento cadastrado</p>
              <p className="text-slate-400 text-sm mt-1">
                Acesse a aba <strong>"Equipamentos"</strong> no menu para cadastrar
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Equipamento</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Placa</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">CC NOVO</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Gerência</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Área Lot.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Área</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Fornecedor</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {equipsFiltrados.map((eq, idx) => (
                      <motion.tr key={eq.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`hover:bg-slate-50 transition-colors ${!eq.ativo ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Wrench className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                            <span className="font-medium text-slate-800 text-xs">{eq.equipamento}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {eq.placa ? (
                            <div className="flex items-center gap-1">
                              <Car className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-mono text-xs font-semibold text-slate-700">{eq.placa}</span>
                            </div>
                          ) : <span className="text-slate-400 text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {eq.ccNovo.map((cc, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-mono">{cc}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{eq.gerencia || '—'}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{eq.areaLot || '—'}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{eq.area || '—'}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{eq.fornecedor || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            eq.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {eq.ativo ? <CheckCircle className="w-3 h-3" /> : null}
                            {eq.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {equipsFiltrados.length === 0 && buscaEquip && (
                <div className="px-4 py-8 text-center text-slate-400 text-sm">
                  Nenhum equipamento encontrado para "<strong>{buscaEquip}</strong>"
                </div>
              )}

              {/* Legenda */}
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Estes equipamentos são usados no <strong>Preenchimento</strong> — ao digitar a placa, os campos são preenchidos automaticamente.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── ABA: ABASTECIMENTOS (conteúdo original) ── */}
      {abaInterna === 'abastecimentos' && (<>

      {/* ── Header: título + busca + filtros + limpar ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Título */}
          <div className="flex items-center gap-2 flex-wrap">
            <FileSpreadsheet className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-semibold text-slate-800">Base de Dados - Abastecimentos</h2>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              {dadosFiltrados.length} / {dados.length} registros
            </span>
          </div>

          {/* Busca + botões */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar em todos os campos..."
                value={busca}
                onChange={e => { setBusca(e.target.value); setPagina(1); }}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Botão filtros */}
            <button
              onClick={() => setMostrarFiltros(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                mostrarFiltros || hasFiltros
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
              {hasFiltros && (
                <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-bold">
                  {totalFiltrosAtivos}
                </span>
              )}
              {mostrarFiltros ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Limpar tudo */}
            {dados.length > 0 && (
              <button onClick={() => setConfirmClearAll(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors">
                <Eraser className="w-4 h-4" />
                Limpar tudo
              </button>
            )}
          </div>
        </div>

        {/* ── Painel de Filtros ── */}
        <AnimatePresence>
          {mostrarFiltros && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Filtros Avançados</span>
                  </div>
                  {hasFiltros && (
                    <button onClick={limparFiltros}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                      <X className="w-3 h-3" /> Limpar filtros ({totalFiltrosAtivos})
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">

                  {/* CC NOVO */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">CC NOVO</label>
                    <select value={filtros.ccNovo} onChange={setFiltro('ccNovo')} className={selectFiltro}>
                      <option value="">Todos</option>
                      {opcoes.ccNovo.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  {/* Diretoria */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Diretoria</label>
                    <select value={filtros.diretoria} onChange={setFiltro('diretoria')} className={selectFiltro}>
                      <option value="">Todas</option>
                      {opcoes.diretoria.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  {/* Gerência */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Gerência</label>
                    <select value={filtros.gerencia} onChange={setFiltro('gerencia')} className={selectFiltro}>
                      <option value="">Todas</option>
                      {opcoes.gerencia.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  {/* Área Lotação */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Área Lot.</label>
                    <select value={filtros.areaLot} onChange={setFiltro('areaLot')} className={selectFiltro}>
                      <option value="">Todas</option>
                      {opcoes.areaLot.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  {/* Fornecedor */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Fornecedor</label>
                    <select value={filtros.fornecedor} onChange={setFiltro('fornecedor')} className={selectFiltro}>
                      <option value="">Todos</option>
                      {opcoes.fornecedor.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  {/* Área */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Área</label>
                    <select value={filtros.area} onChange={setFiltro('area')} className={selectFiltro}>
                      <option value="">Todas</option>
                      {opcoes.area.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  {/* Semana */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Semana</label>
                    <select value={filtros.semana} onChange={setFiltro('semana')} className={selectFiltro}>
                      <option value="">Todas</option>
                      {opcoes.semana.map(v => <option key={v} value={v}>Semana {v}</option>)}
                    </select>
                  </div>

                  {/* Data Início */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Data Início</label>
                    <input type="date" value={filtros.dataInicio} onChange={setFiltro('dataInicio')}
                      className={selectFiltro} />
                  </div>

                  {/* Data Fim */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Data Fim</label>
                    <input type="date" value={filtros.dataFim} onChange={setFiltro('dataFim')}
                      className={selectFiltro} />
                  </div>

                </div>

                {/* Chips dos filtros ativos */}
                {hasFiltros && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                    {Object.entries(filtros).map(([key, val]) => {
                      if (!val) return null;
                      const labels: Record<string, string> = {
                        ccNovo: 'CC NOVO', diretoria: 'Diretoria', gerencia: 'Gerência',
                        areaLot: 'Área Lot.', fornecedor: 'Fornecedor', area: 'Área',
                        semana: 'Semana', dataInicio: 'De', dataFim: 'Até',
                      };
                      const display = key === 'semana' ? `Sem. ${val}`
                        : key.startsWith('data') ? new Date(val).toLocaleDateString('pt-BR')
                        : val;
                      return (
                        <span key={key} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-full">
                          <span className="text-blue-400 font-medium">{labels[key]}:</span>
                          <span className="font-semibold">{display}</span>
                          <button onClick={() => { setFiltros(f => ({ ...f, [key]: '' })); setPagina(1); }}
                            className="text-blue-400 hover:text-blue-700 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmação limpar tudo */}
        <AnimatePresence>
          {confirmClearAll && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Apagar todos os {dados.length} registros?</p>
                  <p className="text-xs text-red-600 mt-0.5">Esta ação não pode ser desfeita.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { onClearAll(); setConfirmClearAll(false); setBusca(''); limparFiltros(); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  <Eraser className="w-3.5 h-3.5" /> Sim, apagar tudo
                </button>
                <button onClick={() => setConfirmClearAll(false)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium border border-slate-200 rounded-lg transition-colors">
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Tabela ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  { key: 'id'          as SortField, label: 'ID',          width: 'w-12' },
                  { key: 'ccNovo'      as SortField, label: 'CC NOVO',     width: 'w-24' },
                  { key: 'diretoria'   as SortField, label: 'DIRETORIA',   width: 'w-28' },
                  { key: 'gerencia'    as SortField, label: 'GERÊNCIA',    width: 'w-28' },
                  { key: 'areaLot'     as SortField, label: 'ÁREA LOT.',   width: 'w-28' },
                  { key: 'fornecedor'  as SortField, label: 'FORNECEDOR',  width: 'w-32' },
                  { key: 'equipamento' as SortField, label: 'EQUIPAMENTO', width: 'w-36' },
                  { key: 'area'        as SortField, label: 'ÁREA',        width: 'w-24' },
                  { key: 'semana'      as SortField, label: 'SEM',         width: 'w-12' },
                  { key: 'data'        as SortField, label: 'DATA',        width: 'w-24' },
                  { key: 'litros'      as SortField, label: 'LITROS',      width: 'w-20' },
                  { key: 'valor'       as SortField, label: 'VALOR (R$)',  width: 'w-28' },
                ].map(col => (
                  <th key={col.key} className={`${col.width} px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors`}
                    onClick={() => handleSort(col.key)}>
                    <div className="flex items-center gap-1">{col.label}<SortIcon field={col.key} /></div>
                  </th>
                ))}
                <th className="w-24 px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">AÇÃO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dadosPaginados.map((item, index) => {
                const emEdicao = editandoId === item.id;
                return (
                  <>
                    <motion.tr key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`transition-colors ${emEdicao ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                      <td className="px-3 py-2.5 text-slate-700 font-medium">{item.id}</td>
                      <td className="px-3 py-2.5 text-slate-600 font-mono text-xs">{item.ccNovo}</td>
                      <td className="px-3 py-2.5 text-slate-600">{item.diretoria}</td>
                      <td className="px-3 py-2.5 text-slate-600">{item.gerencia}</td>
                      <td className="px-3 py-2.5 text-slate-600">{item.areaLot}</td>
                      <td className="px-3 py-2.5 text-slate-600">{item.fornecedor}</td>
                      <td className="px-3 py-2.5 text-slate-600">{item.equipamento}</td>
                      <td className="px-3 py-2.5 text-slate-600">{item.area}</td>
                      <td className="px-3 py-2.5 text-slate-600 text-center">{item.semana}</td>
                      <td className="px-3 py-2.5 text-slate-600">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                      <td className="px-3 py-2.5 text-slate-700 font-medium">{item.litros}</td>
                      <td className="px-3 py-2.5 text-slate-700 font-medium">{formatCurrency(item.litros * precoDiesel)}</td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => iniciarEdicao(item)}
                            className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {confirmDelete === item.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => { onDelete(item.id); setConfirmDelete(null); }}
                                className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors">
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setConfirmDelete(null)}
                                className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDelete(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>

                    {/* Painel de edição */}
                    {emEdicao && (
                      <tr key={`edit-${item.id}`} className="bg-blue-50 border-b border-blue-200">
                        <td colSpan={13} className="px-4 py-4">
                          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                              <Edit3 className="w-3.5 h-3.5" /> Editando registro #{item.id}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              <div>
                                <label className="text-xs text-slate-500 mb-1 block">CC Novo</label>
                                <input type="text" value={formEdit.ccNovo || ''} onChange={e => setFormEdit(f => ({ ...f, ccNovo: e.target.value }))} className={inputCls} />
                              </div>
                              <div>
                                <label className="text-xs text-slate-500 mb-1 block">Diretoria</label>
                                <select value={formEdit.diretoria || ''} onChange={e => setFormEdit(f => ({ ...f, diretoria: e.target.value }))} className={selectCls}>
                                  <option value="">Selecione...</option>
                                  {DIRETORIAS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-slate-500 mb-1 block">Gerência</label>
                                <input type="text" value={formEdit.gerencia || ''} onChange={e => setFormEdit(f => ({ ...f, gerencia: e.target.value }))} className={inputCls} />
                              </div>
                              <div>
                                <label className="text-xs text-slate-500 mb-1 block">Área Lotação</label>
                                <select value={formEdit.areaLot || ''} onChange={e => setFormEdit(f => ({ ...f, areaLot: e.target.value }))} className={selectCls}>
                                  <option value="">Selecione...</option>
                                  {AREAS_LOT.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-slate-500 mb-1 block">Fornecedor</label>
                                <select value={formEdit.fornecedor || ''} onChange={e => setFormEdit(f => ({ ...f, fornecedor: e.target.value }))} className={selectCls}>
                                  <option value="">Selecione...</option>
                                  {FORNECEDORES.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-slate-500 mb-1 block">Equipamento</label>
                                <select value={formEdit.equipamento || ''} onChange={e => setFormEdit(f => ({ ...f, equipamento: e.target.value }))} className={selectCls}>
                                  <option value="">Selecione...</option>
                                  {EQUIPAMENTOS.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-slate-500 mb-1 block">Área</label>
                                <select value={formEdit.area || ''} onChange={e => setFormEdit(f => ({ ...f, area: e.target.value }))} className={selectCls}>
                                  <option value="">Selecione...</option>
                                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-slate-500 mb-1 block">Data</label>
                                <input type="date" value={formEdit.data || ''} onChange={e => setFormEdit(f => ({ ...f, data: e.target.value }))} className={inputCls} />
                              </div>
                              <div>
                                <label className="text-xs text-slate-500 mb-1 block">Litros</label>
                                <input type="number" step="0.01" value={formEdit.litros || ''} onChange={e => setFormEdit(f => ({ ...f, litros: Number(e.target.value) }))} className={inputCls} />
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4 pt-3 border-t border-blue-100">
                              <button onClick={salvarEdicao}
                                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                                <Save className="w-4 h-4" /> Salvar Alterações
                              </button>
                              <button onClick={cancelarEdicao}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                                <X className="w-4 h-4" /> Cancelar
                              </button>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {dadosPaginados.length === 0 && (
                <tr>
                  <td colSpan={13} className="px-3 py-12 text-center text-slate-400">
                    {hasFiltros ? (
                      <div className="space-y-2">
                        <p>Nenhum registro encontrado com os filtros aplicados.</p>
                        <button onClick={limparFiltros} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Limpar filtros
                        </button>
                      </div>
                    ) : 'Nenhum registro encontrado'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-500">
              Mostrando {(pagina - 1) * itensPorPagina + 1} a {Math.min(pagina * itensPorPagina, dadosFiltrados.length)} de {dadosFiltrados.length} registros
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
                className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPaginas, 7) }, (_, i) => {
                const p = totalPaginas <= 7 ? i + 1
                  : pagina <= 4 ? i + 1
                  : pagina >= totalPaginas - 3 ? totalPaginas - 6 + i
                  : pagina - 3 + i;
                return (
                  <button key={p} onClick={() => setPagina(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === pagina ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}
                className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
      </>)}  {/* fim abaInterna === 'abastecimentos' */}

    </div>
  );
}
