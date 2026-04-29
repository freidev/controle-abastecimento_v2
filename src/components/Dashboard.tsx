import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Fuel, DollarSign, TrendingUp, TrendingDown, Droplets,
  Calendar, Filter, X, ChevronDown, ChevronUp, Search, Check,
  Plus, Settings2, GripVertical, Eye, EyeOff
} from 'lucide-react';
import {
  Abastecimento, OrcamentoDiretoria, RateioCC,
  FiltroKey, FiltroSelecoes, FILTROS_PADRAO_KEYS,
} from '../types';

interface FiltroConfig { key: FiltroKey; label: string; mono?: boolean; }

const TODOS_FILTROS: FiltroConfig[] = [
  { key: 'ano',         label: 'Ano'                     },
  { key: 'mes',         label: 'Mês'                     },
  { key: 'dia',         label: 'Dia'                     },
  { key: 'ccNovo',      label: 'CC Novo',     mono: true },
  { key: 'semana',      label: 'Semana'                  },
  { key: 'diretoria',   label: 'Diretoria'               },
  { key: 'gerencia',    label: 'Gerência'                },
  { key: 'areaLot',     label: 'Área Lotação'            },
  { key: 'equipamento', label: 'Equipamento'             },
  { key: 'fornecedor',  label: 'Fornecedor'              },
  { key: 'area',        label: 'Área'                    },
];

interface MultiSelectProps {
  label: string; opcoes: string[]; selecionados: string[];
  onChange: (vals: string[]) => void; onRemove?: () => void;
  mono?: boolean; placeholder?: string;
}

function MultiSelect({ label, opcoes, selecionados, onChange, onRemove, mono, placeholder }: MultiSelectProps) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca]   = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setAberto(false); setBusca(''); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const opcoesFiltradas = useMemo(() => opcoes.filter(o => o.toLowerCase().includes(busca.toLowerCase())), [opcoes, busca]);
  const toggle       = (val: string) => onChange(selecionados.includes(val) ? selecionados.filter(s => s !== val) : [...selecionados, val]);
  const toggleTodos  = () => onChange(selecionados.length === opcoes.length ? [] : [...opcoes]);
  const todosChecked   = selecionados.length === opcoes.length && opcoes.length > 0;
  const parcialChecked = selecionados.length > 0 && selecionados.length < opcoes.length;
  const btnLabel = selecionados.length === 0 ? (placeholder ?? 'Todos') : selecionados.length === 1 ? selecionados[0] : `${selecionados.length} selecionados`;
  const ativo = selecionados.length > 0;

  return (
    <div ref={ref} className="relative min-w-0">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
          {label}
          {ativo && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold leading-none">{selecionados.length}</span>}
        </label>
        {onRemove && <button onClick={onRemove} title="Remover filtro" className="text-slate-300 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>}
      </div>
      <button type="button" onClick={() => setAberto(v => !v)}
        className={`w-full flex items-center justify-between gap-1 px-3 py-2 rounded-lg border text-sm transition-all ${ativo ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'} ${aberto ? 'ring-2 ring-blue-500 border-blue-500' : ''} ${mono ? 'font-mono' : ''}`}>
        <span className="truncate text-left text-sm">{btnLabel}</span>
        {aberto ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />}
      </button>
      <AnimatePresence>
        {aberto && (
          <motion.div initial={{ opacity: 0, y: -4, scaleY: 0.95 }} animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }} transition={{ duration: 0.12 }}
            style={{ transformOrigin: 'top' }}
            className="absolute z-50 top-full mt-1 left-0 w-60 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            {opcoes.length > 6 && (
              <div className="p-2 border-b border-slate-100">
                <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-lg">
                  <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
                    placeholder={`Buscar ${label.toLowerCase()}...`}
                    className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder:text-slate-400" autoFocus />
                  {busca && <button onClick={() => setBusca('')}><X className="w-3 h-3 text-slate-400 hover:text-slate-600" /></button>}
                </div>
              </div>
            )}
            <div className="border-b border-slate-100">
              <button type="button" onMouseDown={e => { e.preventDefault(); toggleTodos(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 transition-colors">
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${todosChecked ? 'bg-blue-600 border-blue-600' : parcialChecked ? 'bg-blue-100 border-blue-400' : 'border-slate-300'}`}>
                  {todosChecked && <Check className="w-2.5 h-2.5 text-white" />}
                  {parcialChecked && <span className="w-1.5 h-0.5 bg-blue-600 rounded-full" />}
                </span>
                <span className="text-xs font-semibold text-slate-600">{todosChecked ? 'Desmarcar todos' : 'Selecionar todos'}</span>
                <span className="ml-auto text-xs text-slate-400">{opcoes.length}</span>
              </button>
            </div>
            <ul className="max-h-52 overflow-y-auto">
              {opcoesFiltradas.length > 0 ? opcoesFiltradas.map(opt => {
                const sel = selecionados.includes(opt);
                return (
                  <li key={opt}>
                    <button type="button" onMouseDown={e => { e.preventDefault(); toggle(opt); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${sel ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-slate-50'}`}>
                      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${sel ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                        {sel && <Check className="w-2.5 h-2.5 text-white" />}
                      </span>
                      <span className={`text-xs truncate ${mono ? 'font-mono' : ''} ${sel ? 'text-blue-700 font-semibold' : 'text-slate-700'}`}>{opt}</span>
                    </button>
                  </li>
                );
              }) : <li className="px-3 py-4 text-xs text-slate-400 text-center">Nenhum resultado para "{busca}"</li>}
            </ul>
            {selecionados.length > 0 && (
              <div className="border-t border-slate-100 p-2">
                <button type="button" onMouseDown={e => { e.preventDefault(); onChange([]); }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <X className="w-3 h-3" /> Limpar seleção ({selecionados.length})
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GerenciarFiltrosProps {
  filtrosAtivos: FiltroKey[]; onToggleFiltro: (key: FiltroKey) => void; onFechar: () => void;
}

function GerenciarFiltros({ filtrosAtivos, onToggleFiltro, onFechar }: GerenciarFiltrosProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onFechar(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onFechar]);

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 z-50 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2"><Settings2 className="w-4 h-4 text-blue-600" /><span className="text-sm font-semibold text-slate-800">Gerenciar Filtros</span></div>
        <button onClick={onFechar} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-3">
        <p className="text-xs text-slate-500 mb-3 px-1">Ative ou desative filtros que aparecerão no painel.</p>
        <div className="space-y-1">
          {TODOS_FILTROS.map(f => {
            const ativo = filtrosAtivos.includes(f.key);
            const unico = filtrosAtivos.length === 1 && ativo;
            return (
              <button key={f.key} type="button" onClick={() => !unico && onToggleFiltro(f.key)} disabled={unico}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${ativo ? 'bg-blue-50 border border-blue-200' : 'border border-slate-100 hover:bg-slate-50'} ${unico ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <GripVertical className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                <span className={`flex-1 text-sm text-left ${ativo ? 'text-blue-800 font-medium' : 'text-slate-600'}`}>{f.label}</span>
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${ativo ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                  {ativo ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {ativo ? 'Visível' : 'Oculto'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex gap-2">
        <button onClick={() => TODOS_FILTROS.forEach(f => !filtrosAtivos.includes(f.key) && onToggleFiltro(f.key))}
          className="flex-1 text-xs py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Mostrar todos
        </button>
        <button onClick={() => {
          const extras = filtrosAtivos.filter((k: FiltroKey) => !FILTROS_PADRAO_KEYS.includes(k));
          extras.forEach((k: FiltroKey) => onToggleFiltro(k));
          FILTROS_PADRAO_KEYS.forEach((k: FiltroKey) => !filtrosAtivos.includes(k) && onToggleFiltro(k));
        }} className="flex-1 text-xs py-1.5 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors">
          Padrão
        </button>
      </div>
    </motion.div>
  );
}

interface DashboardProps {
  dados: Abastecimento[]; orcamento: OrcamentoDiretoria[]; precoDiesel: number;
  rateios?: RateioCC[];
  filtrosAtivos: FiltroKey[]; setFiltrosAtivos: React.Dispatch<React.SetStateAction<FiltroKey[]>>;
  filtroSelecoes: FiltroSelecoes; setFiltroSelecoes: React.Dispatch<React.SetStateAction<FiltroSelecoes>>;
}

const COLORS_RATEIO = ['#1e40af','#f97316','#10b981','#8b5cf6','#ef4444','#06b6d4','#ec4899','#84cc16'];
const COLORS = ['#1e40af', '#f97316', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function Dashboard({
  dados, orcamento, precoDiesel, rateios = [],
  filtrosAtivos, setFiltrosAtivos, filtroSelecoes, setFiltroSelecoes,
}: DashboardProps) {

  const [gerenciarAberto, setGerenciarAberto] = useState(false);
  const selecoes = filtroSelecoes;

  const setSel = useCallback((key: FiltroKey, vals: string[]) => {
    setFiltroSelecoes(prev => ({ ...prev, [key]: vals }));
  }, [setFiltroSelecoes]);

  const toggleFiltro = useCallback((key: FiltroKey) => {
    setFiltrosAtivos(prev => {
      if (prev.includes(key)) { setFiltroSelecoes(s => ({ ...s, [key]: [] })); return prev.filter(k => k !== key); }
      return [...prev, key];
    });
  }, [setFiltrosAtivos, setFiltroSelecoes]);

  const opcoes = useMemo(() => {
    const MESES = ['01 - Janeiro','02 - Fevereiro','03 - Março','04 - Abril','05 - Maio','06 - Junho','07 - Julho','08 - Agosto','09 - Setembro','10 - Outubro','11 - Novembro','12 - Dezembro'];
    const anos  = [...new Set(dados.map(d => new Date(d.data).getFullYear().toString()))].sort((a,b) => Number(b) - Number(a));
    const meses = [...new Set(dados.map(d => MESES[new Date(d.data).getMonth()]))].sort();
    const dias  = [...new Set(dados.map(d => String(new Date(d.data).getDate()).padStart(2,'0')))].sort((a,b) => Number(a) - Number(b));
    return {
      ano: anos, mes: meses, dia: dias,
      semana:      ['1','2','3','4','5'],
      diretoria:   [...new Set(dados.map(d => d.diretoria))].sort(),
      gerencia:    [...new Set(dados.map(d => d.gerencia))].sort(),
      areaLot:     [...new Set(dados.map(d => d.areaLot))].sort(),
      equipamento: [...new Set(dados.map(d => d.equipamento))].sort(),
      ccNovo:      [...new Set(dados.map(d => d.ccNovo).filter(Boolean))].sort(),
      fornecedor:  [...new Set(dados.map(d => d.fornecedor))].sort(),
      area:        [...new Set(dados.map(d => d.area))].sort(),
    };
  }, [dados]);

  const dadosFiltrados = useMemo(() => {
    return dados.filter(d => {
      const dataObj = new Date(d.data);
      const MESES = ['01 - Janeiro','02 - Fevereiro','03 - Março','04 - Abril','05 - Maio','06 - Junho','07 - Julho','08 - Agosto','09 - Setembro','10 - Outubro','11 - Novembro','12 - Dezembro'];
      const anoStr = dataObj.getFullYear().toString();
      const mesStr = MESES[dataObj.getMonth()];
      const diaStr = String(dataObj.getDate()).padStart(2, '0');
      if (selecoes.ano.length         && !selecoes.ano.includes(anoStr))                  return false;
      if (selecoes.mes.length         && !selecoes.mes.includes(mesStr))                  return false;
      if (selecoes.dia.length         && !selecoes.dia.includes(diaStr))                  return false;
      if (selecoes.semana.length      && !selecoes.semana.includes(String(d.semana)))     return false;
      if (selecoes.diretoria.length   && !selecoes.diretoria.includes(d.diretoria))       return false;
      if (selecoes.gerencia.length    && !selecoes.gerencia.includes(d.gerencia))         return false;
      if (selecoes.areaLot.length     && !selecoes.areaLot.includes(d.areaLot))           return false;
      if (selecoes.equipamento.length && !selecoes.equipamento.includes(d.equipamento))   return false;
      if (selecoes.ccNovo.length      && !selecoes.ccNovo.includes(d.ccNovo))             return false;
      if (selecoes.fornecedor.length  && !selecoes.fornecedor.includes(d.fornecedor))     return false;
      if (selecoes.area.length        && !selecoes.area.includes(d.area))                 return false;
      return true;
    });
  }, [dados, selecoes]);

  const totalLitros        = useMemo(() => dadosFiltrados.reduce((acc, d) => acc + d.litros, 0), [dadosFiltrados]);
  const valorTotal         = totalLitros * precoDiesel;
  const mediaLitros        = dadosFiltrados.length > 0 ? totalLitros / dadosFiltrados.length : 0;
  const maiorAbastecimento = dadosFiltrados.length > 0 ? Math.max(...dadosFiltrados.map(d => d.litros)) : 0;

  const dadosPorData = useMemo(() => {
    const ag: Record<string, number> = {};
    dadosFiltrados.forEach(d => { ag[d.data] = (ag[d.data] || 0) + d.litros; });
    return Object.entries(ag).sort(([a],[b]) => a.localeCompare(b)).map(([data, litros]) => ({
      data: new Date(data).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' }),
      litros, valor: litros * precoDiesel,
    }));
  }, [dadosFiltrados, precoDiesel]);

  const dadosPorDiretoria = useMemo(() => {
    const ag: Record<string, number> = {};
    dadosFiltrados.forEach(d => { ag[d.diretoria] = (ag[d.diretoria] || 0) + d.litros * precoDiesel; });
    return Object.entries(ag).map(([diretoria, realizado]) => {
      const orc = orcamento.find(o => o.diretoria === diretoria);
      return { diretoria, orcamento: orc?.orcamento || 0, realizado };
    });
  }, [dadosFiltrados, orcamento, precoDiesel]);

  const dadosPorSemana = useMemo(() => {
    const ag: Record<number, number> = {};
    dadosFiltrados.forEach(d => { ag[d.semana] = (ag[d.semana] || 0) + d.litros; });
    return [1,2,3,4,5].map(s => ({ semana: `Sem ${s}`, litros: ag[s] || 0 }));
  }, [dadosFiltrados]);

  const dadosPorEquipamento = useMemo(() => {
    const ag: Record<string, { litros: number; gerencia: string; diretoria: string }> = {};
    dadosFiltrados.forEach(d => {
      if (!ag[d.equipamento]) ag[d.equipamento] = { litros: 0, gerencia: d.gerencia, diretoria: d.diretoria };
      ag[d.equipamento].litros += d.litros;
    });
    return Object.entries(ag).sort(([,a],[,b]) => b.litros - a.litros).slice(0, 10)
      .map(([equipamento, info]) => {
        const rateio = rateios.find(r => r.ativo && r.equipamento === equipamento);
        const base = { equipamento, litros: info.litros, gerencia: info.gerencia, diretoria: info.diretoria, temRateio: !!rateio };
        if (rateio) {
          const parcelas: Record<string, number> = {};
          rateio.parcelas.forEach(p => { parcelas[`cc_${p.ccNovo}`] = (info.litros * p.percentual) / 100; });
          return { ...base, litros: 0, ...parcelas, _parcelas: rateio.parcelas };
        }
        return { ...base, _parcelas: [] };
      });
  }, [dadosFiltrados, rateios]);

  const dadosPorAreaLot = useMemo(() => {
    const ag: Record<string, number> = {};
    dadosFiltrados.forEach(d => { ag[d.areaLot] = (ag[d.areaLot] || 0) + d.litros; });
    return Object.entries(ag).map(([name, value]) => ({ name, value }));
  }, [dadosFiltrados]);

  const totalSelecionados = Object.values(selecoes).reduce((a, v) => a + v.length, 0);
  const hasFiltros = totalSelecionados > 0;

  const limparTudo = useCallback(() => {
    setFiltroSelecoes({ semana:[], diretoria:[], gerencia:[], areaLot:[], equipamento:[], ccNovo:[], fornecedor:[], area:[], dia:[], mes:[], ano:[] });
  }, [setFiltroSelecoes]);

  const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });

  return (
    <div className="space-y-6">

      {/* Painel de Filtros */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-700" />
            <h3 className="font-semibold text-slate-800">Filtros Dinâmicos</h3>
            {hasFiltros && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{totalSelecionados} {totalSelecionados === 1 ? 'filtro' : 'filtros'} ativos</span>}
          </div>
          <div className="flex items-center gap-2">
            {hasFiltros && (
              <button onClick={limparTudo} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
                <X className="w-3.5 h-3.5" /> Limpar tudo
              </button>
            )}
            <div className="relative">
              <button onClick={() => setGerenciarAberto(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${gerenciarAberto ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'}`}>
                <Settings2 className="w-3.5 h-3.5" />
                Gerenciar filtros
                <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-bold">{filtrosAtivos.length}/{TODOS_FILTROS.length}</span>
              </button>
              <AnimatePresence>
                {gerenciarAberto && <GerenciarFiltros filtrosAtivos={filtrosAtivos} onToggleFiltro={toggleFiltro} onFechar={() => setGerenciarAberto(false)} />}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className={`grid gap-3 ${
          filtrosAtivos.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' :
          filtrosAtivos.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' :
          filtrosAtivos.length <= 6 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' :
          'grid-cols-2 md:grid-cols-4 lg:grid-cols-8'
        }`}>
          <AnimatePresence>
            {filtrosAtivos.map(key => {
              const cfg = TODOS_FILTROS.find(f => f.key === key)!;
              return (
                <motion.div key={key} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }}>
                  <MultiSelect
                    label={cfg.label}
                    opcoes={key === 'semana' ? ['1','2','3','4','5'] : opcoes[key]}
                    selecionados={selecoes[key]}
                    onChange={vals => setSel(key, vals)}
                    onRemove={() => toggleFiltro(key)}
                    mono={cfg.mono}
                    placeholder={key === 'semana' ? 'Todas' : undefined}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtrosAtivos.length < TODOS_FILTROS.length && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
              <label className="text-xs font-medium text-slate-400 mb-1 opacity-0 select-none">·</label>
              <button onClick={() => setGerenciarAberto(true)}
                className="flex items-center justify-center gap-1.5 h-[38px] px-3 border-2 border-dashed border-slate-200 rounded-lg text-xs text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all">
                <Plus className="w-3.5 h-3.5" /> Adicionar filtro
              </button>
            </motion.div>
          )}
        </div>

        {hasFiltros && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100">
            {(Object.entries(selecoes) as [FiltroKey, string[]][]).flatMap(([key, vals]) =>
              vals.map(val => {
                const cfg = TODOS_FILTROS.find(f => f.key === key)!;
                return (
                  <motion.span key={`${key}-${val}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-full">
                    <span className="text-blue-400 font-medium">{cfg.label}:</span>
                    <span className={`font-semibold ${cfg.mono ? 'font-mono' : ''}`}>{val}</span>
                    <button onClick={() => setSel(key, selecoes[key].filter(v => v !== val))} className="text-blue-400 hover:text-blue-700 transition-colors ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                );
              })
            )}
          </div>
        )}
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Mensal (Litros)', value: totalLitros.toLocaleString('pt-BR'), sub:`${dadosFiltrados.length} registros`, icon: Droplets, bg:'bg-blue-50', ic:'text-blue-600' },
          { label:'Valor Total (R$)', value: formatCurrency(valorTotal), sub:`Preço: R$ ${precoDiesel.toFixed(2)}/L`, icon: DollarSign, bg:'bg-orange-50', ic:'text-orange-600' },
          { label:'Média por Abastecimento', value:`${mediaLitros.toFixed(0)} L`, sub:`${formatCurrency(mediaLitros*precoDiesel)} em média`, icon: TrendingUp, bg:'bg-emerald-50', ic:'text-emerald-600' },
          { label:'Maior Abastecimento', value:`${maiorAbastecimento} L`, sub: formatCurrency(maiorAbastecimento*precoDiesel), icon: Fuel, bg:'bg-red-50', ic:'text-red-600' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{kpi.value}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
              </div>
              <div className={`w-12 h-12 ${kpi.bg} rounded-xl flex items-center justify-center`}>
                <kpi.icon className={`w-6 h-6 ${kpi.ic}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Consumo ao longo do tempo */}
        <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:0.2}} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4"><Calendar className="w-5 h-5 text-blue-700"/><h3 className="font-semibold text-slate-800">Consumo ao Longo do Tempo</h3></div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dadosPorData}>
              <defs><linearGradient id="gradLitros" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e40af" stopOpacity={0.3}/><stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
              <XAxis dataKey="data" tick={{fontSize:12}} stroke="#94a3b8"/>
              <YAxis tick={{fontSize:12}} stroke="#94a3b8"/>
              <Tooltip contentStyle={{borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'13px'}} formatter={v => [`${v} L`,'Litros']}/>
              <Area type="monotone" dataKey="litros" stroke="#1e40af" strokeWidth={2} fill="url(#gradLitros)"/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Orçado vs Realizado */}
        <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:0.25}} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4"><TrendingDown className="w-5 h-5 text-orange-600"/><h3 className="font-semibold text-slate-800">Orçado vs Realizado por Diretoria</h3></div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosPorDiretoria}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
              <XAxis dataKey="diretoria" tick={{fontSize:11}} stroke="#94a3b8"/>
              <YAxis tick={{fontSize:12}} stroke="#94a3b8"/>
              <Tooltip contentStyle={{borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'13px'}} formatter={v => [formatCurrency(Number(v)),'']}/>
              <Legend wrapperStyle={{fontSize:'13px'}}/>
              <Bar dataKey="orcamento" fill="#94a3b8" name="Orçado" radius={[4,4,0,0]}/>
              <Bar dataKey="realizado" fill="#1e40af" name="Realizado" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Consumo por Semana */}
        <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:0.3}} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4"><Calendar className="w-5 h-5 text-blue-700"/><h3 className="font-semibold text-slate-800">Consumo por Semana</h3></div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosPorSemana}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
              <XAxis dataKey="semana" tick={{fontSize:12}} stroke="#94a3b8"/>
              <YAxis tick={{fontSize:12}} stroke="#94a3b8"/>
              <Tooltip contentStyle={{borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'13px'}} formatter={v => [`${v} L`,'Litros']}/>
              <Bar dataKey="litros" fill="#1e40af" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pizza por Área Lotação */}
        <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:0.35}} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4"><Droplets className="w-5 h-5 text-blue-700"/><h3 className="font-semibold text-slate-800">Distribuição por Área de Lotação</h3></div>
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex-shrink-0 w-full lg:w-64">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={dadosPorAreaLot} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {dadosPorAreaLot.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius:'10px', border:'1px solid #e2e8f0', fontSize:'13px', padding:'8px 12px' }}
                    formatter={(v, name) => [`${Number(v).toLocaleString('pt-BR')} L`, String(name)]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 min-w-0">
              {(() => {
                const totalGeral = dadosPorAreaLot.reduce((a, d) => a + d.value, 0);
                const ordenado   = [...dadosPorAreaLot].sort((a, b) => b.value - a.value);
                return (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {ordenado.map(item => {
                      const idx  = dadosPorAreaLot.findIndex(d => d.name === item.name);
                      const cor  = COLORS[idx % COLORS.length];
                      const perc = totalGeral > 0 ? (item.value / totalGeral) * 100 : 0;
                      return (
                        <div key={item.name} className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cor }} />
                          <span className="text-xs text-slate-700 flex-1 truncate font-medium" title={item.name}>{item.name}</span>
                          <span className="text-xs text-slate-500 whitespace-nowrap">{item.value.toLocaleString('pt-BR')} L</span>
                          <span className="text-xs font-bold w-10 text-right" style={{ color: cor }}>{perc.toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Equipamentos */}
      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:0.4}} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4"><Fuel className="w-5 h-5 text-blue-700"/><h3 className="font-semibold text-slate-800">Top Equipamentos — Consumo (Litros)</h3></div>

        {dadosPorEquipamento.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Nenhum dado disponível</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(300, dadosPorEquipamento.length * 58)}>
            <BarChart data={dadosPorEquipamento} layout="vertical" margin={{ left: 8, right: 80, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:12}} stroke="#94a3b8" tickFormatter={v => `${v.toLocaleString('pt-BR')} L`}/>
              <YAxis dataKey="equipamento" type="category" width={180} stroke="#94a3b8"
                tick={(props: { x?: string | number; y?: string | number; payload?: { value: string } }) => {
                  const { x = 0, y = 0, payload } = props;
                  const item = dadosPorEquipamento.find(d => d.equipamento === payload?.value);
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={-6} y={-6} textAnchor="end" fontSize={11} fill="#334155" fontWeight={600}>{payload?.value}</text>
                      <text x={-6} y={8} textAnchor="end" fontSize={10} fill="#94a3b8">{item?.gerencia || ''}{item?.temRateio ? ' 🔀' : ''}</text>
                    </g>
                  );
                }}
              />
              <Tooltip contentStyle={{ borderRadius:'10px', border:'1px solid #e2e8f0', fontSize:'13px', padding:'10px 14px' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const item = dadosPorEquipamento.find(d => d.equipamento === label);
                  const payloadValido = payload.filter(p => Number(p.value) > 0);
                  const totalRateado  = payloadValido.reduce((acc, p) => acc + Number(p.value), 0);
                  const totalSemRateio = item?.litros || 0;
                  return (
                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg min-w-52">
                      <p className="font-semibold text-slate-800 mb-1">🚛 {label}</p>
                      <p className="text-xs text-slate-500 mb-2">📋 {item?.gerencia || '—'} · 🏢 {item?.diretoria || '—'}</p>
                      {item?.temRateio ? (
                        <>
                          <p className="text-xs font-semibold text-blue-600 mb-1.5">🔀 Rateio aplicado:</p>
                          {payloadValido.map((p, i) => {
                            const cc = String(p.dataKey).replace('cc_', '');
                            const parcela = (item as Record<string, unknown>)._parcelas as { ccNovo: string; percentual: number }[] | undefined;
                            const perc = parcela?.find(pc => pc.ccNovo === cc)?.percentual || 0;
                            return (
                              <div key={i} className="flex items-center justify-between gap-3 mb-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.fill as string }}/>
                                  <span className="text-xs font-mono text-slate-700">{cc}</span>
                                  <span className="text-xs text-slate-400">({perc}%)</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-800">{Number(p.value).toLocaleString('pt-BR')} L</span>
                              </div>
                            );
                          })}
                          <div className="border-t border-slate-100 mt-2 pt-2 flex justify-between">
                            <span className="text-xs font-semibold text-slate-600">Total</span>
                            <span className="text-xs font-bold text-slate-800">{totalRateado.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} L</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-600">Consumo total</span>
                          <span className="text-xs font-bold text-orange-600">{totalSemRateio.toLocaleString('pt-BR')} L</span>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              {(() => {
                const allCCs = new Set<string>();
                dadosPorEquipamento.forEach(item => {
                  if (item.temRateio && item._parcelas) (item._parcelas as { ccNovo: string }[]).forEach(p => allCCs.add(p.ccNovo));
                });
                if (allCCs.size === 0) {
                  return <Bar dataKey="litros" fill="#f97316" radius={[0,6,6,0]} label={{ position:'right', fontSize:11, fill:'#64748b', formatter: (v: unknown) => `${Number(v).toLocaleString('pt-BR')} L` }} />;
                }
                const ccList = [...allCCs];
                return (
                  <>
                    <Bar dataKey="litros" stackId="stack" fill="#f97316" radius={[0,0,0,0]}
                      label={{ position:'right', fontSize:11, fill:'#64748b', formatter: (v: unknown) => Number(v) > 0 ? `${Number(v).toLocaleString('pt-BR')} L` : '' }} />
                    {ccList.map((cc, i) => (
                      <Bar key={cc} dataKey={`cc_${cc}`} stackId="stack" name={cc} fill={COLORS_RATEIO[i % COLORS_RATEIO.length]}
                        radius={i === ccList.length - 1 ? [0,6,6,0] : [0,0,0,0]}
                        label={i === ccList.length - 1 ? { position: 'right', fontSize: 11, fill: '#64748b', formatter: (v: unknown) => Number(v) > 0 ? `${Number(v).toLocaleString('pt-BR')} L` : '' } : false}
                      />
                    ))}
                  </>
                );
              })()}
            </BarChart>
          </ResponsiveContainer>
        )}

        {dadosPorEquipamento.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Gerências representadas</p>
            <div className="flex flex-wrap gap-2">
              {[...new Set(dadosPorEquipamento.map(d => d.gerencia))].filter(Boolean).map(g => (
                <span key={g} className="px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-700 text-xs rounded-full font-medium">{g}</span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
