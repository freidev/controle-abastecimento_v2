import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Plus, CheckCircle, Fuel, Calendar, MapPin,
  Building2, Wrench, Truck, Tag, StickyNote,
  ChevronDown, ChevronUp, Search, X, Check, Zap, Car
} from 'lucide-react';
import { Abastecimento, Equipamento } from '../types';

interface PreenchimentoProps {
  onAdd: (item: Omit<Abastecimento, 'id' | 'valor'>) => void;
  nextId: number;
  dados?: Abastecimento[];
  equipamentosCad?: Equipamento[]; // equipamentos cadastrados para auto-preenchimento por placa
}

// ─── ComboBox genérico ────────────────────────────────────────────────────────
interface ComboBoxProps {
  value: string;
  onChange: (v: string) => void;
  opcoes: string[];
  placeholder?: string;
  icon?: React.ReactNode;
  label: string;
  obrig?: boolean;
  destaque?: boolean; // borda colorida quando preenchido automaticamente
}

function ComboBox({ value, onChange, opcoes, placeholder, icon, label, obrig = true, destaque }: ComboBoxProps) {
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
    opcoes.filter(o => !texto || o.toLowerCase().includes(texto.toLowerCase())).slice(0, 15),
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
        {destaque && value && (
          <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3" /> auto
          </span>
        )}
      </label>

      <div className={`flex items-center bg-slate-50 border rounded-lg transition-all ${
        aberto
          ? 'ring-2 ring-blue-500 border-blue-500'
          : destaque && value
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-slate-200 hover:border-slate-300'
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
                {opcoes.length === 0 ? 'Nenhum registro na base' : `${filtradas.length} opção(ões) da base`}
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
                {texto ? <span>Nenhum resultado — será salvo como novo</span> : 'Digite ou selecione'}
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

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Preenchimento({ onAdd, nextId, dados = [], equipamentosCad = [] }: PreenchimentoProps) {
  const [form, setForm] = useState({
    ccNovo: '', diretoria: '', gerencia: '', areaLot: '',
    fornecedor: '', equipamento: '', area: '', placa: '',
    data: new Date().toISOString().split('T')[0],
    litros: '', obs: '',
  });
  const [sucesso, setSucesso]     = useState(false);
  const [erros,   setErros  ]     = useState<string[]>([]);
  const [autoPreenchidos, setAutoPreenchidos] = useState<Set<string>>(new Set());

  // ── Mapa: placa → equipamento cadastrado ─────────────────────────────────
  const mapaPorPlaca = useMemo(() => {
    const mapa: Record<string, Equipamento> = {};
    equipamentosCad.filter(e => e.ativo && e.placa).forEach(e => {
      mapa[e.placa.toUpperCase()] = e;
    });
    return mapa;
  }, [equipamentosCad]);

  // ── Quando digita a placa → auto-preenche pelo cadastro ──────────────────
  const handlePlacaChange = (placa: string) => {
    const placaUpper = placa.toUpperCase();
    setForm(f => ({ ...f, placa: placaUpper }));
    const equip = mapaPorPlaca[placaUpper];
    if (equip) {
      const ccAuto = equip.ccNovo.length === 1 ? equip.ccNovo[0] : '';
      setForm(f => ({
        ...f,
        placa:       placaUpper,
        equipamento: equip.equipamento,
        gerencia:    equip.gerencia    || f.gerencia,
        areaLot:     equip.areaLot     || f.areaLot,
        area:        equip.area        || f.area,
        fornecedor:  equip.fornecedor  || f.fornecedor,
        ccNovo:      ccAuto,
      }));
      const campos = new Set(['equipamento','gerencia','areaLot','area','fornecedor']);
      if (ccAuto) campos.add('ccNovo');
      setAutoPreenchidos(campos);
    } else {
      // Limpa auto-preenchidos se placa não encontrada
      if (autoPreenchidos.size > 0) setAutoPreenchidos(new Set());
    }
  };

  // ── Mapa: equipamento → última ocorrência na base ───────────────────────────
  const mapaEquipamento = useMemo(() => {
    const mapa: Record<string, Abastecimento> = {};
    // Percorre do mais antigo para o mais recente — o mais recente fica salvo
    [...dados].sort((a,b) => a.data.localeCompare(b.data)).forEach(d => {
      if (d.equipamento) mapa[d.equipamento] = d;
    });
    return mapa;
  }, [dados]);

  // ── CCs vinculados a cada equipamento (pode ter mais de um) ─────────────────
  const ccsPorEquipamento = useMemo(() => {
    const mapa: Record<string, string[]> = {};
    dados.forEach(d => {
      if (!d.equipamento || !d.ccNovo) return;
      if (!mapa[d.equipamento]) mapa[d.equipamento] = [];
      if (!mapa[d.equipamento].includes(d.ccNovo)) mapa[d.equipamento].push(d.ccNovo);
    });
    Object.values(mapa).forEach(arr => arr.sort());
    return mapa;
  }, [dados]);

  // ── Quando muda o equipamento → auto-preenche os demais campos ──────────────
  const handleEquipamentoChange = (equip: string) => {
    const ultimo = mapaEquipamento[equip];
    if (ultimo) {
      const ccsDispo = ccsPorEquipamento[equip] || [];
      // Se só tem 1 CC vinculado, preenche direto; senão deixa vazio para o usuário escolher
      const ccAuto = ccsDispo.length === 1 ? ccsDispo[0] : '';

      setForm(f => ({
        ...f,
        equipamento: equip,
        diretoria:   ultimo.diretoria  || f.diretoria,
        gerencia:    ultimo.gerencia   || f.gerencia,
        areaLot:     ultimo.areaLot    || f.areaLot,
        area:        ultimo.area       || f.area,
        fornecedor:  ultimo.fornecedor || f.fornecedor,
        ccNovo:      ccAuto,
      }));

      const campos = new Set(['diretoria','gerencia','areaLot','area','fornecedor']);
      if (ccAuto) campos.add('ccNovo');
      setAutoPreenchidos(campos);
    } else {
      setForm(f => ({ ...f, equipamento: equip }));
      setAutoPreenchidos(new Set());
    }
  };

  // ── Opções únicas da base ────────────────────────────────────────────────────
  const opcoes = useMemo(() => ({
    ccNovo:      [...new Set(dados.map(d => d.ccNovo).filter(Boolean))].sort(),
    diretoria:   [...new Set(dados.map(d => d.diretoria).filter(Boolean))].sort(),
    gerencia:    [...new Set(dados.map(d => d.gerencia).filter(Boolean))].sort(),
    areaLot:     [...new Set(dados.map(d => d.areaLot).filter(Boolean))].sort(),
    fornecedor:  [...new Set(dados.map(d => d.fornecedor).filter(Boolean))].sort(),
    equipamento: [...new Set(dados.map(d => d.equipamento).filter(Boolean))].sort(),
    area:        [...new Set(dados.map(d => d.area).filter(Boolean))].sort(),
  }), [dados]);

  // ── CCs disponíveis para o equipamento selecionado ──────────────────────────
  const ccsDoCEquipamento = useMemo(() =>
    form.equipamento ? (ccsPorEquipamento[form.equipamento] || opcoes.ccNovo) : opcoes.ccNovo,
    [form.equipamento, ccsPorEquipamento, opcoes.ccNovo]
  );

  const set = (campo: string) => (val: string) => {
    setForm(f => ({ ...f, [campo]: val }));
    // Remove o destaque "auto" ao editar manualmente
    setAutoPreenchidos(prev => { const n = new Set(prev); n.delete(campo); return n; });
  };

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
      fornecedor: '', equipamento: '', area: '', placa: '',
      data: new Date().toISOString().split('T')[0],
      litros: '', obs: '',
    });
    setAutoPreenchidos(new Set());
  };

  const inputCls = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400';

  // Quantos CCs tem o equipamento selecionado
  const qtdCCsEquip = form.equipamento ? (ccsPorEquipamento[form.equipamento]?.length || 0) : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

        {/* Header */}
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
                  ⚡ Selecione o equipamento para preencher automaticamente
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Sucesso */}
        <AnimatePresence>
          {sucesso && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-5 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-medium text-emerald-800">Abastecimento registrado com sucesso!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Erros */}
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

          {/* ── PLACA + EQUIPAMENTO — preenche automaticamente ── */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                Digite a Placa OU selecione o Equipamento para preenchimento automático
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Campo Placa — auto-preenche pelo cadastro */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                  <Car className="w-3.5 h-3.5 text-slate-400" />
                  Placa
                  {mapaPorPlaca[form.placa] && (
                    <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" /> encontrado!
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={form.placa}
                  onChange={e => handlePlacaChange(e.target.value)}
                  placeholder="Ex: ABC-1234"
                  maxLength={10}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm font-mono outline-none transition-all ${
                    mapaPorPlaca[form.placa]
                      ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-300'
                      : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {equipamentosCad.filter(e => e.ativo && e.placa).length > 0 && (
                  <p className="text-xs text-blue-500 mt-1">
                    {equipamentosCad.filter(e => e.ativo && e.placa).length} equipamento(s) com placa cadastrada
                  </p>
                )}
              </div>

              {/* Campo Equipamento */}
              <div>
                <ComboBox
                  value={form.equipamento}
                  onChange={handleEquipamentoChange}
                  opcoes={opcoes.equipamento}
                  label="Equipamento"
                  placeholder="Ex: Caminhão CA-001..."
                  icon={<Wrench className="w-3.5 h-3.5 text-slate-400" />}
                />
              </div>
            </div>

            {form.equipamento && qtdCCsEquip > 0 && (
              <p className="text-xs text-blue-600 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {qtdCCsEquip === 1
                  ? `1 CC vinculado — preenchido automaticamente`
                  : `${qtdCCsEquip} CCs vinculados — escolha o CC NOVO abaixo`
                }
              </p>
            )}
          </div>

          {/* ── LINHA 1: CC Novo + Diretoria ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CC Novo — lista filtrada pelos CCs do equipamento */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                CC Novo <span className="text-red-500">*</span>
                {autoPreenchidos.has('ccNovo') && form.ccNovo && (
                  <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> auto
                  </span>
                )}
                {form.equipamento && qtdCCsEquip > 1 && (
                  <span className="ml-1 text-xs text-orange-600 font-normal">
                    ({qtdCCsEquip} opções)
                  </span>
                )}
              </label>
              <ComboBox
                value={form.ccNovo}
                onChange={set('ccNovo')}
                opcoes={ccsDoCEquipamento}
                placeholder={form.equipamento ? 'Selecione o CC...' : 'Ex: CC-OP-018'}
                icon={<Tag className="w-3.5 h-3.5 text-slate-400" />}
                label=""
                obrig={false}
                destaque={autoPreenchidos.has('ccNovo')}
              />
            </div>

            <ComboBox
              value={form.diretoria} onChange={set('diretoria')}
              opcoes={opcoes.diretoria}
              label="Diretoria" placeholder="Ex: Operações, Manutenção..."
              icon={<Building2 className="w-3.5 h-3.5 text-slate-400" />}
              destaque={autoPreenchidos.has('diretoria')}
            />
          </div>

          {/* ── LINHA 2: Gerência + Área de Lotação ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ComboBox
              value={form.gerencia} onChange={set('gerencia')}
              opcoes={opcoes.gerencia}
              label="Gerência" placeholder="Ex: Mineração, Mecânica..."
              icon={<Building2 className="w-3.5 h-3.5 text-slate-400" />}
              destaque={autoPreenchidos.has('gerencia')}
            />
            <ComboBox
              value={form.areaLot} onChange={set('areaLot')}
              opcoes={opcoes.areaLot}
              label="Área de Lotação" placeholder="Ex: Mina A, Usina..."
              icon={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
              destaque={autoPreenchidos.has('areaLot')}
            />
          </div>

          {/* ── LINHA 3: Fornecedor + Área ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ComboBox
              value={form.fornecedor} onChange={set('fornecedor')}
              opcoes={opcoes.fornecedor}
              label="Fornecedor" placeholder="Ex: Posto Shell, Posto BR..."
              icon={<Truck className="w-3.5 h-3.5 text-slate-400" />}
              destaque={autoPreenchidos.has('fornecedor')}
            />
            <ComboBox
              value={form.area} onChange={set('area')}
              opcoes={opcoes.area}
              label="Área" placeholder="Ex: Produção, Manutenção..."
              icon={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
              destaque={autoPreenchidos.has('area')}
            />
          </div>

          {/* ── LINHA 4: Data + Litros ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data <span className="text-red-500">*</span>
              </label>
              <input type="date" value={form.data}
                onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                className={inputCls} />
            </div>
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
          </div>

          {/* ── Observações ── */}
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

          {/* Botão */}
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
