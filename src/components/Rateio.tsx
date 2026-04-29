import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitFork, Plus, Trash2, Edit3, Check, X, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, Info, Fuel, Copy,
  ArrowRight, ToggleLeft, ToggleRight, Calculator, Search
} from 'lucide-react';
import { Abastecimento, RateioCC, RateioParcela } from '../types';

interface CCNovoInputProps {
  value: string;
  onChange: (val: string) => void;
  sugestoes: string[];
  placeholder?: string;
  blockedValues?: string[];
  labelVazio?: string;
  labelDigite?: string;
}

function CCNovoInput({ value, onChange, sugestoes, placeholder = '42105500', blockedValues = [], labelVazio = 'Nenhum CC cadastrado na base', labelDigite = 'Digite um CC NOVO ou selecione abaixo' }: CCNovoInputProps) {
  const [aberto, setAberto] = useState(false);
  const [filtro, setFiltro] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setFiltro(value); }, [value]);

  const opcoesFiltradas = useMemo(() => {
    const termo = filtro.toLowerCase().trim();
    return sugestoes
      .filter(s => !blockedValues.includes(s))
      .filter(s => !termo || s.toLowerCase().includes(termo))
      .slice(0, 10);
  }, [sugestoes, filtro, blockedValues]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => { setFiltro(e.target.value); onChange(e.target.value); setAberto(true); };
  const handleSelect = (cc: string) => { onChange(cc); setFiltro(cc); setAberto(false); };
  const isFromBase = sugestoes.includes(value);

  return (
    <div ref={wrapperRef} className="relative">
      <div className={`flex items-center bg-white border rounded-lg transition-all ${aberto ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200 hover:border-slate-300'}`}>
        <input type="text" value={filtro} onChange={handleInput} onFocus={() => setAberto(true)} placeholder={placeholder}
          className="flex-1 px-2.5 py-2 text-sm font-mono bg-transparent outline-none rounded-lg" />
        {isFromBase && !aberto && (
          <span className="mr-1.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded font-medium shrink-0">✓ base</span>
        )}
        <button type="button" onMouseDown={e => { e.preventDefault(); setAberto(v => !v); }}
          className="pr-2 pl-1 text-slate-400 hover:text-blue-600 transition-colors" tabIndex={-1}>
          {aberto ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
      <AnimatePresence>
        {aberto && (
          <motion.div initial={{ opacity: 0, y: -4, scaleY: 0.95 }} animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }} transition={{ duration: 0.12 }}
            style={{ transformOrigin: 'top' }}
            className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50">
              <Search className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">
                {sugestoes.length === 0 ? labelVazio : `${opcoesFiltradas.length} encontrado${opcoesFiltradas.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            {opcoesFiltradas.length > 0 ? (
              <ul className="max-h-48 overflow-y-auto">
                {opcoesFiltradas.map(cc => (
                  <li key={cc}>
                    <button type="button" onMouseDown={e => { e.preventDefault(); handleSelect(cc); }}
                      className={`w-full text-left px-3 py-2.5 text-sm font-mono hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between gap-2 ${cc === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}`}>
                      <span>{cc}</span>
                      {cc === value && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-3 text-xs text-slate-400 text-center">
                {filtro ? <>Nenhum resultado para "<strong>{filtro}</strong>" — será usado como novo</> : labelDigite}
              </div>
            )}
            {filtro && !sugestoes.includes(filtro) && (
              <div className="border-t border-slate-100">
                <button type="button" onMouseDown={e => { e.preventDefault(); handleSelect(filtro); setAberto(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-blue-700 hover:bg-blue-50 flex items-center gap-2 transition-colors">
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  Usar <span className="font-mono font-semibold">"{filtro}"</span> como novo CC
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface RateioProps {
  dados: Abastecimento[];
  rateios: RateioCC[];
  precoDiesel: number;
  onSave: (rateios: RateioCC[]) => void;
}

const gerarId = () => Math.random().toString(36).slice(2, 10);
const somaPerc = (p: RateioParcela[]) => p.reduce((a, b) => a + b.percentual, 0);
const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface PercentualInputProps { value: number; onChange: (val: number) => void; }

function PercentualInput({ value, onChange }: PercentualInputProps) {
  const [texto, setTexto] = useState(value === 0 ? '' : String(value));
  useEffect(() => { setTexto(value === 0 ? '' : String(value)); }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/^0+(?=\d)/, '');
    setTexto(cleaned);
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num >= 0 && num <= 100) onChange(num);
    else if (cleaned === '' || cleaned === '0') onChange(0);
  };

  const handleBlur = () => {
    const num = parseFloat(texto);
    if (isNaN(num) || num < 0) { setTexto('0'); onChange(0); }
    else if (num > 100) { setTexto('100'); onChange(100); }
    else { const f = Number(num.toFixed(2)).toString(); setTexto(f); onChange(parseFloat(f)); }
  };

  return (
    <div className="relative">
      <input type="text" inputMode="decimal" value={texto} onChange={handleChange} onBlur={handleBlur} placeholder="0"
        className="w-full pl-2.5 pr-6 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">%</span>
    </div>
  );
}

interface EditorRateioProps {
  rateio: RateioCC;
  onSave: (r: RateioCC) => void;
  onCancel: () => void;
  equipamentosDisponiveis: string[];
  ccsCadastrados: string[];
  gerenciasDaBase: string[];
  ccsPorGerencia: Record<string, string[]>;
}

function EditorRateio({ rateio, onSave, onCancel, equipamentosDisponiveis, ccsCadastrados, gerenciasDaBase, ccsPorGerencia }: EditorRateioProps) {
  const [form, setForm] = useState<RateioCC>(JSON.parse(JSON.stringify(rateio)));
  const [erros, setErros] = useState<string[]>([]);

  const soma = somaPerc(form.parcelas);
  const somaOk = Math.abs(soma - 100) < 0.01;

  const addParcela = () => {
    if (form.parcelas.length >= 10) return;
    setForm(f => ({ ...f, parcelas: [...f.parcelas, { ccNovo: '', descricaoCC: '', percentual: Math.max(0, 100 - soma), gerencia: '' }] }));
  };

  const removeParcela = (i: number) => setForm(f => ({ ...f, parcelas: f.parcelas.filter((_, idx) => idx !== i) }));

  const updateParcela = (i: number, field: keyof RateioParcela, value: string | number) => {
    setForm(f => {
      const p = [...f.parcelas];
      p[i] = { ...p[i], [field]: field === 'percentual' ? Number(value) : value };
      if (field === 'gerencia') p[i].ccNovo = '';
      return { ...f, parcelas: p };
    });
  };

  const distribuirIgual = () => {
    const n = form.parcelas.length;
    if (n === 0) return;
    const base = Math.floor((100 / n) * 100) / 100;
    const last = 100 - base * (n - 1);
    setForm(f => ({ ...f, parcelas: f.parcelas.map((p, i) => ({ ...p, percentual: i === n - 1 ? Math.round(last * 100) / 100 : base })) }));
  };

  const validar = () => {
    const errs: string[] = [];
    if (!form.equipamento) errs.push('Equipamento é obrigatório.');
    if (form.parcelas.length < 2) errs.push('Adicione pelo menos 2 centros de custo.');
    form.parcelas.forEach((p, i) => {
      if (!p.gerencia?.trim()) errs.push(`Parcela ${i + 1}: Gerência é obrigatória.`);
      if (!p.ccNovo.trim())    errs.push(`Parcela ${i + 1}: CC NOVO é obrigatório.`);
      if (p.percentual <= 0)   errs.push(`Parcela ${i + 1}: percentual deve ser maior que 0.`);
    });
    if (!somaOk) errs.push(`A soma deve ser 100% (atual: ${soma.toFixed(2)}%).`);
    const ccs = form.parcelas.map(p => p.ccNovo.trim()).filter(Boolean);
    if (new Set(ccs).size !== ccs.length) errs.push('Existem CC NOVOs duplicados.');
    setErros(errs);
    return errs.length === 0;
  };

  const handleSave = () => {
    if (!validar()) return;
    const gerenciaPrincipal = form.parcelas[0]?.gerencia || '';
    onSave({ ...form, gerencia: gerenciaPrincipal });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block uppercase tracking-wide">
            Equipamento <span className="text-red-500">*</span>
          </label>
          <CCNovoInput value={form.equipamento} onChange={val => setForm(f => ({ ...f, equipamento: val }))}
            sugestoes={equipamentosDisponiveis} placeholder="Selecione ou digite o equipamento..." />
          {equipamentosDisponiveis.length === 0 && <p className="text-xs text-amber-600 mt-1">⚠️ Nenhum equipamento na base ainda</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block uppercase tracking-wide">Descrição do Rateio</label>
          <input type="text" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
            placeholder="Ex: Rateio Mina A / Mina B"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Gerências, Centros de Custo e Porcentagens</label>
            <p className="text-xs text-slate-400 mt-0.5">Cada linha pode ter uma gerência diferente com seu CC NOVO</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={distribuirIgual}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Calculator className="w-3 h-3" /> Dividir Igualmente
            </button>
            <button type="button" onClick={addParcela} disabled={form.parcelas.length >= 10}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors">
              <Plus className="w-3 h-3" /> Adicionar Gerência/CC
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {form.parcelas.map((parcela, i) => {
            const ccsDaGerencia = parcela.gerencia ? (ccsPorGerencia[parcela.gerencia] || []) : ccsCadastrados;
            const ccsBloqueados = form.parcelas.filter((_, idx) => idx !== i).map(p => p.ccNovo).filter(Boolean);
            return (
              <motion.div key={i} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-0.5 block font-medium">Gerência <span className="text-red-400">*</span></label>
                    <CCNovoInput value={parcela.gerencia || ''} onChange={val => updateParcela(i, 'gerencia', val)}
                      sugestoes={gerenciasDaBase} placeholder="Selecione ou digite a gerência..."
                      labelVazio="Nenhuma Gerência cadastrada" labelDigite="Digite uma Gerência ou selecione abaixo" />
                  </div>
                  <button type="button" onClick={() => removeParcela(i)} disabled={form.parcelas.length <= 2}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 rounded-lg transition-colors mt-4">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-12 gap-2 pl-8">
                  <div className="col-span-3">
                    <label className="text-xs text-slate-400 mb-0.5 block">
                      CC NOVO <span className="text-red-400">*</span>
                      {parcela.gerencia && ccsDaGerencia.length > 0 && <span className="ml-1 text-blue-500">({ccsDaGerencia.length} disponível/is)</span>}
                    </label>
                    <CCNovoInput value={parcela.ccNovo} onChange={val => updateParcela(i, 'ccNovo', val)}
                      sugestoes={ccsDaGerencia} blockedValues={ccsBloqueados}
                      placeholder={parcela.gerencia ? `CCs de ${parcela.gerencia}...` : 'Selecione a gerência primeiro'}
                      labelVazio={parcela.gerencia ? `Nenhum CC para "${parcela.gerencia}"` : 'Selecione uma gerência acima'}
                      labelDigite={parcela.gerencia ? `CCs da gerência ${parcela.gerencia}` : 'Selecione uma gerência acima'} />
                  </div>
                  <div className="col-span-6">
                    <label className="text-xs text-slate-400 mb-0.5 block">Descrição</label>
                    <input type="text" value={parcela.descricaoCC} onChange={e => updateParcela(i, 'descricaoCC', e.target.value)}
                      placeholder="Ex: Mina A – Operações"
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs text-slate-400 mb-0.5 block">% Rateio</label>
                    <PercentualInput value={parcela.percentual} onChange={val => updateParcela(i, 'percentual', val)} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 p-3 rounded-xl border bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Total das porcentagens</span>
            <span className={`text-sm font-bold ${somaOk ? 'text-emerald-600' : soma > 100 ? 'text-red-600' : 'text-amber-600'}`}>{soma.toFixed(2)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <motion.div animate={{ width: `${Math.min(soma, 100)}%` }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`h-2 rounded-full ${somaOk ? 'bg-emerald-500' : soma > 100 ? 'bg-red-500' : 'bg-amber-400'}`} />
          </div>
          {!somaOk && (
            <p className="text-xs mt-1.5 text-center font-medium">
              {soma < 100 ? <span className="text-amber-600">Faltam {(100 - soma).toFixed(2)}% para completar 100%</span>
                : <span className="text-red-600">Excesso de {(soma - 100).toFixed(2)}% — reduza alguma parcela</span>}
            </p>
          )}
        </div>
      </div>

      {erros.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-red-600" /><p className="text-sm font-semibold text-red-800">Corrija os erros:</p></div>
          <ul className="space-y-1">{erros.map((e, i) => <li key={i} className="text-sm text-red-700 flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />{e}</li>)}</ul>
        </motion.div>
      )}

      <div className="flex gap-3 pt-2 border-t border-slate-200">
        <button type="button" onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm">
          <Check className="w-4 h-4" /> Salvar Rateio
        </button>
        <button type="button" onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">
          <X className="w-4 h-4" /> Cancelar
        </button>
      </div>
    </div>
  );
}

interface CardRateioProps {
  rateio: RateioCC; dados: Abastecimento[]; precoDiesel: number;
  onEdit: () => void; onDelete: () => void; onToggle: () => void;
}

function CardRateio({ rateio, dados, precoDiesel, onEdit, onDelete, onToggle }: CardRateioProps) {
  const [expandido, setExpandido] = useState(false);
  const abs = useMemo(() => dados.filter(d => d.equipamento === rateio.equipamento), [dados, rateio.equipamento]);
  const totalLitros = abs.reduce((a, d) => a + d.litros, 0);
  const totalValor  = totalLitros * precoDiesel;

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border shadow-sm transition-all ${rateio.ativo ? 'border-blue-200' : 'border-slate-200 opacity-70'}`}>
      <div className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${rateio.ativo ? 'bg-blue-50' : 'bg-slate-100'}`}>
          <GitFork className={`w-5 h-5 ${rateio.ativo ? 'text-blue-600' : 'text-slate-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-800 text-sm truncate">{rateio.equipamento}</h3>
            {rateio.gerencia && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">{rateio.gerencia}</span>}
            {!rateio.ativo && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">Inativo</span>}
          </div>
          {rateio.descricao && <p className="text-xs text-slate-500 mt-0.5 truncate">{rateio.descricao}</p>}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {rateio.parcelas.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full font-mono">
                <span className="font-medium">{p.ccNovo}</span>
                <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                <span className={`font-bold ${i === 0 ? 'text-blue-600' : 'text-orange-600'}`}>{p.percentual}%</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onToggle} title={rateio.ativo ? 'Desativar' : 'Ativar'} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            {rateio.ativo ? <ToggleRight className="w-5 h-5 text-blue-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
          </button>
          <button onClick={onEdit} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
          <button onClick={() => setExpandido(v => !v)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {expandido && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-lg p-3 text-center"><p className="text-xs text-slate-500 mb-0.5">Abastecimentos</p><p className="text-lg font-bold text-slate-800">{abs.length}</p></div>
                <div className="bg-blue-50 rounded-lg p-3 text-center"><p className="text-xs text-blue-600 mb-0.5">Total Litros</p><p className="text-lg font-bold text-blue-800">{totalLitros.toLocaleString('pt-BR')} L</p></div>
                <div className="bg-orange-50 rounded-lg p-3 text-center"><p className="text-xs text-orange-600 mb-0.5">Total Valor</p><p className="text-sm font-bold text-orange-800">{formatCurrency(totalValor)}</p></div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">CC NOVO</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Descrição</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600">%</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Litros</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Valor (R$)</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {rateio.parcelas.map((p, i) => {
                      const lp = (totalLitros * p.percentual) / 100;
                      return (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5 font-mono text-slate-800 font-medium">{p.ccNovo}</td>
                          <td className="px-3 py-2.5 text-slate-600 text-xs">{p.descricaoCC || '—'}</td>
                          <td className="px-3 py-2.5 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{p.percentual}%</span></td>
                          <td className="px-3 py-2.5 text-right font-medium text-slate-700">{lp.toFixed(1)} L</td>
                          <td className="px-3 py-2.5 text-right font-semibold text-slate-800">{formatCurrency(lp * precoDiesel)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot><tr className="bg-slate-50 border-t border-slate-200">
                    <td colSpan={2} className="px-3 py-2 text-xs font-semibold text-slate-500">TOTAL</td>
                    <td className="px-3 py-2 text-center text-xs font-bold text-slate-700">100%</td>
                    <td className="px-3 py-2 text-right text-sm font-bold text-slate-800">{totalLitros.toFixed(1)} L</td>
                    <td className="px-3 py-2 text-right text-sm font-bold text-slate-800">{formatCurrency(totalValor)}</td>
                  </tr></tfoot>
                </table>
              </div>
              {abs.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Por Abastecimento</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {abs.map(ab => (
                      <div key={ab.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                          <span className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">#{ab.id}</span>
                          <span>{new Date(ab.data).toLocaleDateString('pt-BR')}</span>
                          <span>·</span><span className="font-medium text-slate-700">{ab.litros} L</span>
                          <span>·</span><span className="font-medium text-slate-700">{formatCurrency(ab.litros * precoDiesel)}</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {rateio.parcelas.map((p, i) => {
                            const l = (ab.litros * p.percentual) / 100;
                            return (
                              <div key={i} className={`flex-1 min-w-0 rounded-lg p-2 border ${i === 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                                <p className={`text-xs font-bold font-mono ${i === 0 ? 'text-blue-700' : 'text-orange-700'}`}>{p.ccNovo} · {p.percentual}%</p>
                                <p className="text-xs text-slate-600 mt-0.5">{l.toFixed(1)} L</p>
                                <p className="text-xs font-semibold text-slate-800">{formatCurrency(l * precoDiesel)}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  Nenhum abastecimento encontrado para este equipamento na base de dados.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Rateio({ dados, rateios, precoDiesel, onSave }: RateioProps) {
  const [modoEdicao, setModoEdicao]     = useState<'none' | 'novo' | string>('none');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [copiado, setCopiado]           = useState(false);

  const rateioVazio = (): RateioCC => ({
    id: gerarId(), equipamento: '', gerencia: '', descricao: '',
    parcelas: [
      { ccNovo: '', descricaoCC: '', percentual: 50 },
      { ccNovo: '', descricaoCC: '', percentual: 50 },
    ],
    ativo: true, criadoEm: new Date().toISOString(),
  });

  const rateioEmEdicao = useMemo(() => {
    if (modoEdicao === 'none' || modoEdicao === 'novo') return rateioVazio();
    return rateios.find(r => r.id === modoEdicao) || rateioVazio();
  }, [modoEdicao, rateios]);

  const handleSaveRateio = (r: RateioCC) => {
    onSave(modoEdicao === 'novo' ? [...rateios, r] : rateios.map(old => old.id === r.id ? r : old));
    setModoEdicao('none');
  };

  const equipamentosUsados = rateios.map(r => r.equipamento);
  const equipamentosDaBase = useMemo(() => [...new Set(dados.map(d => d.equipamento).filter(Boolean))].sort(), [dados]);
  const equipamentosDisponiveis = useMemo(
    () => modoEdicao === 'novo' ? equipamentosDaBase.filter(eq => !equipamentosUsados.includes(eq)) : equipamentosDaBase,
    [equipamentosDaBase, equipamentosUsados, modoEdicao]
  );

  const ccsCadastrados  = useMemo(() => [...new Set(dados.map(d => d.ccNovo).filter(Boolean))].sort(), [dados]);
  const gerenciasDaBase = useMemo(() => [...new Set(dados.map(d => d.gerencia).filter(Boolean))].sort(), [dados]);

  const ccsPorGerencia = useMemo(() => {
    const mapa: Record<string, string[]> = {};
    dados.forEach(d => {
      if (!d.gerencia || !d.ccNovo) return;
      if (!mapa[d.gerencia]) mapa[d.gerencia] = [];
      if (!mapa[d.gerencia].includes(d.ccNovo)) mapa[d.gerencia].push(d.ccNovo);
    });
    Object.keys(mapa).forEach(k => mapa[k].sort());
    return mapa;
  }, [dados]);

  const totalAtivos   = rateios.filter(r => r.ativo).length;
  const totalInativos = rateios.filter(r => !r.ativo).length;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><GitFork className="w-5 h-5 text-blue-600" /></div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Rateio de Centro de Custo</h2>
              <p className="text-sm text-slate-500">Divida o custo de um equipamento entre múltiplos CCs por porcentagem</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium text-xs">
                <CheckCircle2 className="w-3 h-3" />{totalAtivos} ativo{totalAtivos !== 1 ? 's' : ''}
              </span>
              {totalInativos > 0 && <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full font-medium text-xs">{totalInativos} inativo{totalInativos !== 1 ? 's' : ''}</span>}
            </div>
            {modoEdicao === 'none' && (
              <button onClick={() => setModoEdicao('novo')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm text-sm">
                <Plus className="w-4 h-4" /> Novo Rateio
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {rateios.length === 0 && modoEdicao === 'none' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-1">Como funciona o Rateio?</p>
            <p className="text-sm text-blue-700">Configure um rateio para cada equipamento compartilhado entre centros de custo. O sistema calculará automaticamente a divisão de litros e valores proporcionais a cada abastecimento registrado para aquele equipamento.</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {copiado && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" /> Rateio duplicado com sucesso!
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modoEdicao !== 'none' && (
          <motion.div key="editor" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl shadow-sm border border-blue-200 p-5">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                {modoEdicao === 'novo' ? <Plus className="w-4 h-4 text-blue-700" /> : <Edit3 className="w-4 h-4 text-blue-700" />}
              </div>
              <h3 className="font-semibold text-slate-800">{modoEdicao === 'novo' ? 'Novo Rateio' : 'Editando Rateio'}</h3>
            </div>
            <EditorRateio
              rateio={modoEdicao === 'novo' ? rateioVazio() : rateioEmEdicao}
              onSave={handleSaveRateio}
              onCancel={() => setModoEdicao('none')}
              equipamentosDisponiveis={equipamentosDisponiveis}
              ccsCadastrados={ccsCadastrados}
              gerenciasDaBase={gerenciasDaBase}
              ccsPorGerencia={ccsPorGerencia}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {rateios.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Rateios Configurados ({rateios.length})</p>
          {rateios.map(r => (
            <div key={r.id}>
              {confirmDelete === r.id ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm font-medium">Remover rateio de <strong>{r.equipamento}</strong>?</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { onSave(rateios.filter(x => x.id !== r.id)); setConfirmDelete(null); }} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">Remover</button>
                    <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition-colors">Cancelar</button>
                  </div>
                </motion.div>
              ) : (
                <div className="group relative">
                  <CardRateio rateio={r} dados={dados} precoDiesel={precoDiesel}
                    onEdit={() => setModoEdicao(r.id)}
                    onDelete={() => setConfirmDelete(r.id)}
                    onToggle={() => onSave(rateios.map(x => x.id === r.id ? { ...x, ativo: !x.ativo } : x))}
                  />
                  <button onClick={() => { const c: RateioCC = { ...JSON.parse(JSON.stringify(r)), id: gerarId(), criadoEm: new Date().toISOString(), descricao: r.descricao + ' (cópia)' }; onSave([...rateios, c]); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }}
                    title="Duplicar" className="absolute top-3 right-36 p-2 rounded-lg text-slate-300 hover:text-blue-500 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {rateios.filter(r => r.ativo).length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4"><Calculator className="w-4 h-4 text-blue-600" /><h3 className="font-semibold text-slate-800 text-sm">Resumo Geral de Rateio</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border border-slate-200 rounded-lg">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 rounded-l-lg">Equipamento</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600">Gerência</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600">CC NOVO</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-600">%</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600">Litros Rateados</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 rounded-r-lg">Valor Rateado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rateios.filter(r => r.ativo).flatMap(r => {
                  const absEquip = dados.filter(d => d.equipamento === r.equipamento);
                  const totalL = absEquip.reduce((a, d) => a + d.litros, 0);
                  const totalV = totalL * precoDiesel;
                  return r.parcelas.map((p, i) => ({
                    equipamento: r.equipamento,
                    gerencia: p.gerencia || r.gerencia || '—',
                    isFirst: i === 0, cc: p.ccNovo, desc: p.descricaoCC,
                    perc: p.percentual,
                    litros: (totalL * p.percentual) / 100,
                    valor:  (totalV * p.percentual) / 100,
                  }));
                }).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 text-slate-700 font-medium text-xs">
                      <div className="flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />{row.equipamento}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      {row.gerencia && row.gerencia !== '—'
                        ? <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium text-xs">{row.gerencia}</span>
                        : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-slate-800 font-medium">{row.cc}</span>
                      {row.desc && <span className="text-xs text-slate-400 ml-1">· {row.desc}</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{row.perc}%</span></td>
                    <td className="px-3 py-2.5 text-right font-medium text-slate-700">{row.litros.toFixed(1)} L</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-800">{formatCurrency(row.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
