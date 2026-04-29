import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Plus, CheckCircle, Fuel, Calendar, MapPin,
  Building2, Wrench, Truck, Tag, StickyNote,
  ChevronDown, ChevronUp, Search, X
} from 'lucide-react';
import {
  Abastecimento, DIRETORIAS, AREAS_LOT,
  FORNECEDORES, EQUIPAMENTOS, AREAS
} from '../types';

interface PreenchimentoProps {
  onAdd: (item: Omit<Abastecimento, 'id' | 'valor'>) => void;
  nextId: number;
}

// ─── Campo híbrido: digita OU escolhe da lista ────────────────────────────────
interface ComboBoxProps {
  value: string;
  onChange: (val: string) => void;
  opcoes: string[];
  placeholder?: string;
  icon?: React.ReactNode;
}

function ComboBox({ value, onChange, opcoes, placeholder = 'Digite ou selecione...', icon }: ComboBoxProps) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca]   = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sincroniza quando o value muda externamente (ex: reset)
  useEffect(() => { setBusca(value); }, [value]);

  const opcoesFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return opcoes;
    return opcoes.filter(o => o.toLowerCase().includes(termo));
  }, [opcoes, busca]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBusca(val);
    onChange(val);          // atualiza o form em tempo real
    setAberto(true);
  };

  const handleSelect = (opcao: string) => {
    setBusca(opcao);
    onChange(opcao);
    setAberto(false);
  };

  const handleClear = () => {
    setBusca('');
    onChange('');
    setAberto(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* Input */}
      <div className={`flex items-center bg-slate-50 border rounded-lg transition-all ${
        aberto ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200 hover:border-slate-300'
      }`}>
        {icon && (
          <span className="pl-3 text-slate-400 flex-shrink-0">{icon}</span>
        )}
        <input
          type="text"
          value={busca}
          onChange={handleInput}
          onFocus={() => setAberto(true)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2.5 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400"
        />
        {/* Botão limpar */}
        {busca && (
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); handleClear(); }}
            className="px-1 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {/* Botão abrir lista */}
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); setAberto(v => !v); }}
          className="pr-2.5 pl-1 text-slate-400 hover:text-blue-600 transition-colors"
          tabIndex={-1}
        >
          {aberto
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Dropdown de sugestões */}
      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{ transformOrigin: 'top' }}
            className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Cabeçalho */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border-b border-slate-100">
              <Search className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">
                {opcoesFiltradas.length} opção(ões) — ou digite livremente
              </span>
            </div>

            {opcoesFiltradas.length > 0 ? (
              <ul className="max-h-48 overflow-y-auto">
                {opcoesFiltradas.map(op => (
                  <li key={op}>
                    <button
                      type="button"
                      onMouseDown={e => { e.preventDefault(); handleSelect(op); }}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between ${
                        op === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      {op}
                      {op === value && <CheckCircle className="w-3.5 h-3.5 text-blue-500" />}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-3 text-xs text-slate-400 text-center">
                {busca
                  ? <span>Nenhuma opção para "<strong>{busca}</strong>" — será salvo como digitado</span>
                  : 'Nenhuma opção disponível'
                }
              </div>
            )}

            {/* Rodapé: usar valor digitado */}
            {busca && !opcoes.includes(busca) && (
              <div className="border-t border-slate-100">
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); handleSelect(busca); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-blue-700 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Usar "<span className="font-semibold">{busca}</span>" como valor livre
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Formulário principal ─────────────────────────────────────────────────────
export default function Preenchimento({ onAdd, nextId }: PreenchimentoProps) {
  const [form, setForm] = useState({
    ccNovo:      '',
    diretoria:   '',
    gerencia:    '',
    areaLot:     '',
    fornecedor:  '',
    equipamento: '',
    area:        '',
    data:        new Date().toISOString().split('T')[0],
    litros:      '',
    obs:         '',
  });
  const [sucesso, setSucesso] = useState(false);
  const [erros,   setErros  ] = useState<string[]>([]);

  const set = (campo: string) => (val: string) =>
    setForm(f => ({ ...f, [campo]: val }));

  const validar = (): boolean => {
    const errs: string[] = [];
    if (!form.ccNovo.trim())                       errs.push('CC Novo é obrigatório');
    if (!form.diretoria.trim())                    errs.push('Diretoria é obrigatória');
    if (!form.gerencia.trim())                     errs.push('Gerência é obrigatória');
    if (!form.areaLot.trim())                      errs.push('Área de Lotação é obrigatória');
    if (!form.fornecedor.trim())                   errs.push('Fornecedor é obrigatório');
    if (!form.equipamento.trim())                  errs.push('Equipamento é obrigatório');
    if (!form.area.trim())                         errs.push('Área é obrigatória');
    if (!form.data)                                errs.push('Data é obrigatória');
    if (!form.litros || Number(form.litros) <= 0)  errs.push('Litros deve ser maior que zero');
    setErros(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    const dia        = new Date(form.data).getDate();
    const semanaAuto = dia <= 7 ? 1 : dia <= 14 ? 2 : dia <= 21 ? 3 : dia <= 28 ? 4 : 5;

    onAdd({
      ccNovo:      form.ccNovo.trim(),
      diretoria:   form.diretoria.trim(),
      gerencia:    form.gerencia.trim(),
      areaLot:     form.areaLot.trim(),
      fornecedor:  form.fornecedor.trim(),
      equipamento: form.equipamento.trim(),
      area:        form.area.trim(),
      semana:      semanaAuto,
      data:        form.data,
      litros:      Number(form.litros),
    });

    setSucesso(true);
    setTimeout(() => setSucesso(false), 3000);

    setForm({
      ccNovo: '', diretoria: '', gerencia: '', areaLot: '',
      fornecedor: '', equipamento: '', area: '',
      data: new Date().toISOString().split('T')[0],
      litros: '', obs: '',
    });
  };

  const inputCls = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all';
  const label    = (icon: React.ReactNode, text: string, obrig = true) => (
    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
      {icon}
      {text} {obrig && <span className="text-red-500">*</span>}
    </label>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Preenchimento de Abastecimento</h2>
            <p className="text-sm text-slate-500">
              Próximo ID: <span className="font-mono font-medium text-blue-700">{nextId}</span>
              <span className="ml-3 text-xs text-slate-400">💡 Digite livremente ou escolha da lista em cada campo</span>
            </p>
          </div>
        </div>

        {/* Sucesso */}
        <AnimatePresence>
          {sucesso && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-5 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-medium text-emerald-800">Abastecimento registrado com sucesso!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Erros */}
        {erros.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p className="text-sm font-semibold text-red-800 mb-2">Corrija os seguintes erros:</p>
            <ul className="space-y-1">
              {erros.map((err, i) => (
                <li key={i} className="text-sm text-red-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  {err}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Linha 1: CC Novo + Diretoria ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              {label(<Tag className="w-3.5 h-3.5 text-slate-400" />, 'CC Novo')}
              <input
                type="text"
                value={form.ccNovo}
                onChange={e => set('ccNovo')(e.target.value)}
                placeholder="Ex: CC-OP-018"
                className={inputCls}
              />
            </div>
            <div>
              {label(<Building2 className="w-3.5 h-3.5 text-slate-400" />, 'Diretoria')}
              <ComboBox
                value={form.diretoria}
                onChange={set('diretoria')}
                opcoes={DIRETORIAS}
                placeholder="Digite ou selecione..."
              />
            </div>
          </div>

          {/* ── Linha 2: Gerência + Área de Lotação ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              {label(<Building2 className="w-3.5 h-3.5 text-slate-400" />, 'Gerência')}
              <input
                type="text"
                value={form.gerencia}
                onChange={e => set('gerencia')(e.target.value)}
                placeholder="Ex: Mineração, Mecânica, RH..."
                className={inputCls}
              />
            </div>
            <div>
              {label(<MapPin className="w-3.5 h-3.5 text-slate-400" />, 'Área de Lotação')}
              <ComboBox
                value={form.areaLot}
                onChange={set('areaLot')}
                opcoes={AREAS_LOT}
                placeholder="Digite ou selecione..."
              />
            </div>
          </div>

          {/* ── Linha 3: Fornecedor + Equipamento ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              {label(<Truck className="w-3.5 h-3.5 text-slate-400" />, 'Fornecedor')}
              <ComboBox
                value={form.fornecedor}
                onChange={set('fornecedor')}
                opcoes={FORNECEDORES}
                placeholder="Digite ou selecione..."
              />
            </div>
            <div>
              {label(<Wrench className="w-3.5 h-3.5 text-slate-400" />, 'Equipamento')}
              <ComboBox
                value={form.equipamento}
                onChange={set('equipamento')}
                opcoes={EQUIPAMENTOS}
                placeholder="Digite ou selecione..."
              />
            </div>
          </div>

          {/* ── Linha 4: Área + Data ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              {label(<MapPin className="w-3.5 h-3.5 text-slate-400" />, 'Área')}
              <ComboBox
                value={form.area}
                onChange={set('area')}
                opcoes={AREAS}
                placeholder="Digite ou selecione..."
              />
            </div>
            <div>
              {label(<Calendar className="w-3.5 h-3.5 text-slate-400" />, 'Data')}
              <input
                type="date"
                value={form.data}
                onChange={e => set('data')(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* ── Linha 5: Litros + Observações ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              {label(<Fuel className="w-3.5 h-3.5 text-slate-400" />, 'Litros')}
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.litros}
                onChange={e => set('litros')(e.target.value)}
                placeholder="Ex: 250.5"
                className={inputCls}
              />
            </div>
            <div>
              {label(<StickyNote className="w-3.5 h-3.5 text-slate-400" />, 'Observações', false)}
              <input
                type="text"
                value={form.obs}
                onChange={e => set('obs')(e.target.value)}
                placeholder="Observações opcionais..."
                className={inputCls}
              />
            </div>
          </div>

          {/* Botão */}
          <div className="pt-4 border-t border-slate-200">
            <button
              type="submit"
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Salvar na Base de Dados
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
