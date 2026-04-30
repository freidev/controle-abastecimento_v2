import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Plus, CheckCircle, Fuel, Calendar, MapPin,
  Building2, Wrench, Truck, Tag, StickyNote,
  ChevronDown, ChevronUp, Search, X, Check
} from 'lucide-react';
import { Abastecimento } from '../types';

interface PreenchimentoProps {
  onAdd: (item: Omit<Abastecimento, 'id' | 'valor'>) => void;
  nextId: number;
  dados?: Abastecimento[];
}

interface ComboBoxProps {
  value: string;
  onChange: (v: string) => void;
  opcoes: string[];
  placeholder?: string;
  icon?: React.ReactNode;
  label: string;
  obrig?: boolean;
}

function ComboBox({ value, onChange, opcoes, placeholder, icon, label, obrig = true }: ComboBoxProps) {
  const [aberto, setAberto] = useState(false);
  const [texto,  setTexto ] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setTexto(value); }, [value]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtradas = useMemo(() =>
    opcoes.filter(o => !texto || o.toLowerCase().includes(texto.toLowerCase())).slice(0, 12),
    [opcoes, texto]
  );

  const isFromBase = opcoes.includes(value);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTexto(e.target.value);
    onChange(e.target.value);
    setAberto(true);
  };

  const handleSelect = (v: string) => { setTexto(v); onChange(v); setAberto(false); };
  const handleClear  = () => { setTexto(''); onChange(''); };

  return (
    <div ref={ref} className="relative">
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
        {icon}{label} {obrig && <span className="text-red-500">*</span>}
      </label>

      <div className={`flex items-center bg-slate-50 border rounded-lg transition-all ${
        aberto ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200 hover:border-slate-300'
      }`}>
        <input
          type="text"
          value={texto}
          onChange={handleInput}
          onFocus={() => setAberto(true)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-slate-400"
        />
        {isFromBase && !aberto && value && (
          <span className="mr-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded font-medium shrink-0">
            ✓ base
          </span>
        )}
        {texto && (
          <button type="button" onMouseDown={e => { e.preventDefault(); handleClear(); }}
            className="px-1 text-slate-300 hover:text-slate-500 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <button type="button" onMouseDown={e => { e.preventDefault(); setAberto(v => !v); }}
          className="pr-2.5 pl-1 text-slate-400 hover:text-blue-600 transition-colors" tabIndex={-1}>
          {aberto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

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
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border-b border-slate-100">
              <Search className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">
                {opcoes.length === 0
                  ? 'Nenhum registro na base ainda'
                  : `${filtradas.length} opção(ões) da base`}
              </span>
            </div>

            {filtradas.length > 0 ? (
              <ul className="max-h-48 overflow-y-auto">
                {filtradas.map(op => (
                  <li key={op}>
                    <button type="button" onMouseDown={e => { e.preventDefault(); handleSelect(op); }}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between gap-2 ${
                        op === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                      }`}>
                      {op}
                      {op === value && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-3 text-xs text-slate-400 text-center">
                {texto
                  ? <span>Nenhum resultado para "<strong>{texto}</strong>" — será salvo como novo</span>
                  : 'Digite ou selecione abaixo'}
              </div>
            )}

            {texto && !opcoes.includes(texto) && (
              <div className="border-t border-slate-100">
                <button type="button" onMouseDown={e => { e.preventDefault(); handleSelect(texto); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-blue-700 hover:bg-blue-50 flex items-center gap-2 transition-colors">
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  Usar "<span className="font-semibold">{texto}</span>" como novo valor
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Preenchimento({ onAdd, nextId, dados = [] }: PreenchimentoProps) {
  const [form, setForm] = useState({
    ccNovo: '', diretoria: '', gerencia: '', areaLot: '',
    fornecedor: '', equipamento: '', area: '',
    data: new Date().toISOString().split('T')[0],
    litros: '', obs: '',
  });
  const [sucesso, setSucesso] = useState(false);
  const [erros,   setErros  ] = useState<string[]>([]);

  const opcoes = useMemo(() => ({
    ccNovo:      [...new Set(dados.map(d => d.ccNovo).filter(Boolean))].sort(),
    diretoria:   [...new Set(dados.map(d => d.diretoria).filter(Boolean))].sort(),
    gerencia:    [...new Set(dados.map(d => d.gerencia).filter(Boolean))].sort(),
    areaLot:     [...new Set(dados.map(d => d.areaLot).filter(Boolean))].sort(),
    fornecedor:  [...new Set(dados.map(d => d.fornecedor).filter(Boolean))].sort(),
    equipamento: [...new Set(dados.map(d => d.equipamento).filter(Boolean))].sort(),
    area:        [...new Set(dados.map(d => d.area).filter(Boolean))].sort(),
  }), [dados]);

  const set = (campo: string) => (val: string) =>
    setForm(f => ({ ...f, [campo]: val }));

  const validar = (): boolean => {
    const errs: string[] = [];
    if (!form.ccNovo.trim())                      errs.push('CC Novo é obrigatório');
    if (!form.diretoria.trim())                   errs.push('Diretoria é obrigatória');
    if (!form.gerencia.trim())                    errs.push('Gerência é obrigatória');
    if (!form.areaLot.trim())                     errs.push('Área de Lotação é obrigatória');
    if (!form.fornecedor.trim())                  errs.push('Fornecedor é obrigatório');
    if (!form.equipamento.trim())                 errs.push('Equipamento é obrigatório');
    if (!form.area.trim())                        errs.push('Área é obrigatória');
    if (!form.data)                               errs.push('Data é obrigatória');
    if (!form.litros || Number(form.litros) <= 0) errs.push('Litros deve ser maior que zero');
    setErros(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    const dia        = new Date(form.data).getDate();
    const semanaAuto = dia <= 7 ? 1 : dia <= 14 ? 2 : dia <= 21 ? 3 : dia <= 28 ? 4 : 5;
    onAdd({
      ccNovo: form.ccNovo.trim(), diretoria: form.diretoria.trim(),
      gerencia: form.gerencia.trim(), areaLot: form.areaLot.trim(),
      fornecedor: form.fornecedor.trim(), equipamento: form.equipamento.trim(),
      area: form.area.trim(), semana: semanaAuto,
      data: form.data, litros: Number(form.litros),
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

  const inputCls = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400';

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Preenchimento de Abastecimento</h2>
            <p className="text-sm text-slate-500">
              Próximo ID: <span className="font-mono font-medium text-blue-700">{nextId}</span>
              {dados.length > 0 && (
                <span className="ml-2 text-xs text-emerald-600">
                  💡 Digite ou escolha da base ({dados.length} registros)
                </span>
              )}
            </p>
          </div>
        </div>

        <AnimatePresence>
          {sucesso && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-5 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-medium text-emerald-800">Abastecimento registrado com sucesso!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {erros.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-800 mb-2">Corrija os seguintes erros:</p>
            <ul className="space-y-1">
              {erros.map((err, i) => (
                <li key={i} className="text-sm text-red-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{err}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ComboBox value={form.ccNovo} onChange={set('ccNovo')} opcoes={opcoes.ccNovo}
              label="CC Novo" placeholder="Ex: CC-OP-018"
              icon={<Tag className="w-3.5 h-3.5 text-slate-400" />} />
            <ComboBox value={form.diretoria} onChange={set('diretoria')} opcoes={opcoes.diretoria}
              label="Diretoria" placeholder="Ex: Operações, Manutenção..."
              icon={<Building2 className="w-3.5 h-3.5 text-slate-400" />} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ComboBox value={form.gerencia} onChange={set('gerencia')} opcoes={opcoes.gerencia}
              label="Gerência" placeholder="Ex: Mineração, Mecânica, RH..."
              icon={<Building2 className="w-3.5 h-3.5 text-slate-400" />} />
            <ComboBox value={form.areaLot} onChange={set('areaLot')} opcoes={opcoes.areaLot}
              label="Área de Lotação" placeholder="Ex: Mina A, Usina, Pátio..."
              icon={<MapPin className="w-3.5 h-3.5 text-slate-400" />} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ComboBox value={form.fornecedor} onChange={set('fornecedor')} opcoes={opcoes.fornecedor}
              label="Fornecedor" placeholder="Ex: Posto Shell, Posto BR..."
              icon={<Truck className="w-3.5 h-3.5 text-slate-400" />} />
            <ComboBox value={form.equipamento} onChange={set('equipamento')} opcoes={opcoes.equipamento}
              label="Equipamento" placeholder="Ex: Caminhão CA-001..."
              icon={<Wrench className="w-3.5 h-3.5 text-slate-400" />} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ComboBox value={form.area} onChange={set('area')} opcoes={opcoes.area}
              label="Área" placeholder="Ex: Produção, Manutenção..."
              icon={<MapPin className="w-3.5 h-3.5 text-slate-400" />} />
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data <span className="text-red-500">*</span>
              </label>
              <input type="date" value={form.data}
                onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <Fuel className="w-3.5 h-3.5 text-slate-400" />
                Litros <span className="text-red-500">*</span>
              </label>
              <input type="number" step="0.01" min="0.01"
                value={form.litros}
                onChange={e => setForm(f => ({ ...f, litros: e.target.value }))}
                placeholder="Ex: 250.5"
                className={inputCls} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <StickyNote className="w-3.5 h-3.5 text-slate-400" />
                Observações
              </label>
              <input type="text" value={form.obs}
                onChange={e => setForm(f => ({ ...f, obs: e.target.value }))}
                placeholder="Observações opcionais..."
                className={inputCls} />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button type="submit"
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm">
              <Save className="w-4 h-4" />
              Salvar na Base de Dados
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
