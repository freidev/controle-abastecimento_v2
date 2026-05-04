import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench, Plus, Trash2, Edit3, Save, X, Check,
  Search, ChevronDown, ChevronUp, Tag,
  AlertTriangle, CheckCircle, Car
} from 'lucide-react';
import { Equipamento, Abastecimento } from '../types';

interface CadastroEquipamentoProps {
  equipamentos: Equipamento[];
  onSave: (equipamentos: Equipamento[]) => void;
  dados?: Abastecimento[]; // base de dados para sugestões
}

// ─── ComboBox ────────────────────────────────────────────────────────────────
interface ComboBoxProps {
  value: string;
  onChange: (v: string) => void;
  opcoes: string[];
  placeholder?: string;
  label: string;
  obrig?: boolean;
}

function ComboBox({ value, onChange, opcoes, placeholder, label, obrig = false }: ComboBoxProps) {
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

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => { setTexto(e.target.value); onChange(e.target.value); setAberto(true); };
  const handleSelect = (v: string) => { setTexto(v); onChange(v); setAberto(false); };

  const cls = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all';

  return (
    <div ref={ref} className="relative">
      <label className="text-xs font-medium text-slate-600 mb-1 block">
        {label} {obrig && <span className="text-red-500">*</span>}
      </label>
      <div className={`flex items-center bg-slate-50 border rounded-lg transition-all ${aberto ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200 hover:border-slate-300'}`}>
        <input type="text" value={texto} onChange={handleInput} onFocus={() => setAberto(true)}
          placeholder={placeholder} className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-slate-400" />
        {texto && <button type="button" onMouseDown={e => { e.preventDefault(); setTexto(''); onChange(''); }} className="px-1 text-slate-300 hover:text-slate-500"><X className="w-3.5 h-3.5" /></button>}
        <button type="button" onMouseDown={e => { e.preventDefault(); setAberto(v => !v); }} className="pr-2.5 pl-1 text-slate-400 hover:text-blue-600" tabIndex={-1}>
          {aberto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      <AnimatePresence>
        {aberto && (
          <motion.div initial={{ opacity: 0, y: -4, scaleY: 0.95 }} animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }} transition={{ duration: 0.12 }}
            style={{ transformOrigin: 'top' }}
            className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border-b border-slate-100">
              <Search className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">{opcoes.length === 0 ? 'Nenhum dado na base' : `${filtradas.length} opção(ões)`}</span>
            </div>
            {filtradas.length > 0 ? (
              <ul className="max-h-40 overflow-y-auto">
                {filtradas.map(op => (
                  <li key={op}>
                    <button type="button" onMouseDown={e => { e.preventDefault(); handleSelect(op); }}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between ${op === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}`}>
                      {op}{op === value && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-3 text-xs text-slate-400 text-center">
                {texto ? 'Nenhum resultado — será salvo como novo' : 'Digite ou selecione'}
              </div>
            )}
            {texto && !opcoes.includes(texto) && (
              <div className="border-t border-slate-100">
                <button type="button" onMouseDown={e => { e.preventDefault(); handleSelect(texto); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-blue-700 hover:bg-blue-50 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" />Usar "<strong>{texto}</strong>" como novo valor
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Input simples sem dropdown para campos que não precisam */}
      {opcoes.length === 0 && !aberto && (
        <input type="text" value={texto} onChange={e => { setTexto(e.target.value); onChange(e.target.value); }}
          placeholder={placeholder} className={cls + ' mt-1 hidden'} />
      )}
    </div>
  );
}

const gerarId = () => Math.random().toString(36).slice(2, 10);

const EQUIP_VAZIO = (): Omit<Equipamento, 'id' | 'criadoEm'> => ({
  equipamento: '', ccNovo: [''], gerencia: '', areaLot: '', area: '', fornecedor: '', placa: '', ativo: true,
});

export default function CadastroEquipamento({ equipamentos, onSave, dados = [] }: CadastroEquipamentoProps) {
  const [mostraForm, setMostraForm]     = useState(false);
  const [editandoId, setEditandoId]     = useState<string | null>(null);
  const [form, setForm]                 = useState(EQUIP_VAZIO());
  const [erros, setErros]               = useState<string[]>([]);
  const [sucesso, setSucesso]           = useState('');
  const [busca, setBusca]               = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Opções da base de dados
  const opcoes = useMemo(() => ({
    equipamento: [...new Set(dados.map(d => d.equipamento).filter(Boolean))].sort(),
    ccNovo:      [...new Set(dados.map(d => d.ccNovo).filter(Boolean))].sort(),
    gerencia:    [...new Set(dados.map(d => d.gerencia).filter(Boolean))].sort(),
    areaLot:     [...new Set(dados.map(d => d.areaLot).filter(Boolean))].sort(),
    area:        [...new Set(dados.map(d => d.area).filter(Boolean))].sort(),
    fornecedor:  [...new Set(dados.map(d => d.fornecedor).filter(Boolean))].sort(),
  }), [dados]);

  const validar = () => {
    const errs: string[] = [];
    if (!form.equipamento.trim()) errs.push('Equipamento é obrigatório.');
    if (form.ccNovo.every(cc => !cc.trim())) errs.push('Pelo menos 1 CC NOVO é obrigatório.');
    if (!form.gerencia.trim())  errs.push('Gerência é obrigatória.');
    if (!form.areaLot.trim())   errs.push('Área de Lotação é obrigatória.');
    if (!form.area.trim())      errs.push('Área é obrigatória.');
    if (!form.fornecedor.trim()) errs.push('Fornecedor é obrigatório.');
    setErros(errs);
    return errs.length === 0;
  };

  const handleSalvar = () => {
    if (!validar()) return;
    const ccsFiltrados = form.ccNovo.filter(cc => cc.trim());
    const novo: Equipamento = {
      ...form,
      ccNovo: ccsFiltrados,
      id: editandoId || gerarId(),
      criadoEm: editandoId
        ? equipamentos.find(e => e.id === editandoId)?.criadoEm || new Date().toISOString()
        : new Date().toISOString(),
    };
    if (editandoId) {
      onSave(equipamentos.map(e => e.id === editandoId ? novo : e));
      setSucesso('Equipamento atualizado com sucesso!');
    } else {
      onSave([...equipamentos, novo]);
      setSucesso('Equipamento cadastrado com sucesso!');
    }
    setTimeout(() => setSucesso(''), 3000);
    setForm(EQUIP_VAZIO());
    setEditandoId(null);
    setMostraForm(false);
    setErros([]);
  };

  const handleEditar = (eq: Equipamento) => {
    setForm({ equipamento: eq.equipamento, ccNovo: eq.ccNovo.length > 0 ? eq.ccNovo : [''], gerencia: eq.gerencia, areaLot: eq.areaLot, area: eq.area, fornecedor: eq.fornecedor, placa: eq.placa, ativo: eq.ativo });
    setEditandoId(eq.id);
    setMostraForm(true);
    setErros([]);
  };

  const handleCancelar = () => { setForm(EQUIP_VAZIO()); setEditandoId(null); setMostraForm(false); setErros([]); };

  const handleDelete = (id: string) => { onSave(equipamentos.filter(e => e.id !== id)); setConfirmDelete(null); };

  const handleToggleAtivo = (id: string) => onSave(equipamentos.map(e => e.id === id ? { ...e, ativo: !e.ativo } : e));

  // CCs do formulário
  const addCC  = () => setForm(f => ({ ...f, ccNovo: [...f.ccNovo, ''] }));
  const removeCC = (i: number) => setForm(f => ({ ...f, ccNovo: f.ccNovo.filter((_, idx) => idx !== i) }));
  const updateCC = (i: number, val: string) => setForm(f => { const cc = [...f.ccNovo]; cc[i] = val; return { ...f, ccNovo: cc }; });

  const equipamentosFiltrados = equipamentos.filter(e =>
    !busca || [e.equipamento, e.placa, e.gerencia, ...e.ccNovo].some(v => v?.toLowerCase().includes(busca.toLowerCase()))
  );

  const inputCls = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400';

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Cadastro de Equipamentos</h2>
              <p className="text-sm text-slate-500">{equipamentos.length} equipamento(s) cadastrado(s)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Buscar equipamento..." value={busca}
                onChange={e => setBusca(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-56 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            {!mostraForm && (
              <button onClick={() => { setForm(EQUIP_VAZIO()); setEditandoId(null); setMostraForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm text-sm">
                <Plus className="w-4 h-4" /> Novo Equipamento
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Sucesso */}
      <AnimatePresence>
        {sucesso && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-800">{sucesso}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulário */}
      <AnimatePresence>
        {mostraForm && (
          <motion.div key="form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl shadow-sm border border-blue-200 p-5">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                {editandoId ? <Edit3 className="w-4 h-4 text-blue-700" /> : <Plus className="w-4 h-4 text-blue-700" />}
              </div>
              <h3 className="font-semibold text-slate-800">{editandoId ? 'Editando Equipamento' : 'Novo Equipamento'}</h3>
            </div>

            {erros.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-red-600" /><p className="text-sm font-semibold text-red-800">Corrija os erros:</p></div>
                <ul className="space-y-1">{erros.map((e, i) => <li key={i} className="text-sm text-red-700 flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />{e}</li>)}</ul>
              </motion.div>
            )}

            <div className="space-y-4">

              {/* Linha 1: Equipamento + Placa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ComboBox value={form.equipamento} onChange={v => setForm(f => ({ ...f, equipamento: v }))}
                  opcoes={opcoes.equipamento} label="Equipamento" obrig placeholder="Ex: Caminhão CA-001..." />
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-slate-400 inline" /> Placa
                  </label>
                  <input type="text" value={form.placa}
                    onChange={e => setForm(f => ({ ...f, placa: e.target.value.toUpperCase() }))}
                    placeholder="Ex: ABC-1234" className={inputCls} maxLength={10} />
                </div>
              </div>

              {/* CC NOVO — múltiplos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 inline" /> CC NOVO <span className="text-red-500">*</span>
                    <span className="text-slate-400 font-normal ml-1">(pode ter mais de um)</span>
                  </label>
                  <button type="button" onClick={addCC}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    <Plus className="w-3.5 h-3.5" /> Adicionar CC
                  </button>
                </div>
                <div className="space-y-2">
                  {form.ccNovo.map((cc, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <ComboBox value={cc} onChange={v => updateCC(i, v)}
                        opcoes={opcoes.ccNovo} label="" placeholder="Ex: 42105500"
                        obrig={false} />
                      {form.ccNovo.length > 1 && (
                        <button type="button" onClick={() => removeCC(i)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Linha 2: Gerência + Área Lotação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ComboBox value={form.gerencia} onChange={v => setForm(f => ({ ...f, gerencia: v }))}
                  opcoes={opcoes.gerencia} label="Gerência" obrig placeholder="Ex: Mineração, Mecânica..." />
                <ComboBox value={form.areaLot} onChange={v => setForm(f => ({ ...f, areaLot: v }))}
                  opcoes={opcoes.areaLot} label="Área de Lotação" obrig placeholder="Ex: Mina A, Usina..." />
              </div>

              {/* Linha 3: Área + Fornecedor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ComboBox value={form.area} onChange={v => setForm(f => ({ ...f, area: v }))}
                  opcoes={opcoes.area} label="Área" obrig placeholder="Ex: Produção, Manutenção..." />
                <ComboBox value={form.fornecedor} onChange={v => setForm(f => ({ ...f, fornecedor: v }))}
                  opcoes={opcoes.fornecedor} label="Fornecedor" obrig placeholder="Ex: Posto Shell..." />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={handleSalvar}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm">
                  <Save className="w-4 h-4" /> {editandoId ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
                </button>
                <button type="button" onClick={handleCancelar}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">
                  <X className="w-4 h-4" /> Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de equipamentos */}
      {equipamentos.length > 0 ? (
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Fornecedor</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipamentosFiltrados.map((eq, idx) => (
                  <>
                    <motion.tr key={eq.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                      className={`hover:bg-slate-50 transition-colors ${!eq.ativo ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span className="font-medium text-slate-800 text-xs">{eq.equipamento}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{eq.placa || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {eq.ccNovo.map((cc, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-mono">{cc}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{eq.gerencia}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{eq.areaLot}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{eq.fornecedor}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleToggleAtivo(eq.id)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${eq.ativo ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                          {eq.ativo ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEditar(eq)}
                            className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {confirmDelete === eq.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(eq.id)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"><AlertTriangle className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setConfirmDelete(null)} className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDelete(eq.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {equipamentosFiltrados.length === 0 && busca && (
            <div className="px-4 py-8 text-center text-slate-400 text-sm">
              Nenhum equipamento encontrado para "<strong>{busca}</strong>"
            </div>
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium mb-1">Nenhum equipamento cadastrado</p>
          <p className="text-slate-400 text-sm mb-4">Clique em "Novo Equipamento" para começar</p>
          <button onClick={() => setMostraForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors mx-auto text-sm">
            <Plus className="w-4 h-4" /> Novo Equipamento
          </button>
        </motion.div>
      )}
    </div>
  );
}
