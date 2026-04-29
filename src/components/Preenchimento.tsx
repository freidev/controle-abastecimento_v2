import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Plus, CheckCircle, Fuel, Calendar, MapPin,
  Building2, Wrench, Truck, Tag, StickyNote
} from 'lucide-react';
import { Abastecimento } from '../types';

interface PreenchimentoProps {
  onAdd: (item: Omit<Abastecimento, 'id' | 'valor'>) => void;
  nextId: number;
}

export default function Preenchimento({ onAdd, nextId }: PreenchimentoProps) {
  const [form, setForm] = useState({
    ccNovo: '', diretoria: '', gerencia: '', areaLot: '',
    fornecedor: '', equipamento: '', area: '',
    data: new Date().toISOString().split('T')[0],
    litros: '', obs: '',
  });
  const [sucesso, setSucesso] = useState(false);
  const [erros,   setErros  ] = useState<string[]>([]);

  const set = (campo: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [campo]: e.target.value }));

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

  const Campo = ({ icon, label, campo, placeholder, obrig = true }: {
    icon: React.ReactNode; label: string; campo: string;
    placeholder: string; obrig?: boolean;
  }) => (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
        {icon}{label} {obrig && <span className="text-red-500">*</span>}
      </label>
      <input type="text" value={form[campo as keyof typeof form]}
        onChange={set(campo)} placeholder={placeholder} className={inputCls} />
    </div>
  );

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
            <Campo icon={<Tag className="w-3.5 h-3.5 text-slate-400" />}
              label="CC Novo" campo="ccNovo" placeholder="Ex: CC-OP-018" />
            <Campo icon={<Building2 className="w-3.5 h-3.5 text-slate-400" />}
              label="Diretoria" campo="diretoria" placeholder="Ex: Operações, Manutenção..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Campo icon={<Building2 className="w-3.5 h-3.5 text-slate-400" />}
              label="Gerência" campo="gerencia" placeholder="Ex: Mineração, Mecânica, RH..." />
            <Campo icon={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
              label="Área de Lotação" campo="areaLot" placeholder="Ex: Mina A, Usina, Pátio..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Campo icon={<Truck className="w-3.5 h-3.5 text-slate-400" />}
              label="Fornecedor" campo="fornecedor" placeholder="Ex: Posto Shell, Posto BR..." />
            <Campo icon={<Wrench className="w-3.5 h-3.5 text-slate-400" />}
              label="Equipamento" campo="equipamento" placeholder="Ex: Caminhão CA-001..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Campo icon={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
              label="Área" campo="area" placeholder="Ex: Produção, Manutenção, Transporte..." />
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data <span className="text-red-500">*</span>
              </label>
              <input type="date" value={form.data} onChange={set('data')} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <Fuel className="w-3.5 h-3.5 text-slate-400" />
                Litros <span className="text-red-500">*</span>
              </label>
              <input type="number" step="0.01" min="0.01" value={form.litros}
                onChange={set('litros')} placeholder="Ex: 250.5" className={inputCls} />
            </div>
            <Campo icon={<StickyNote className="w-3.5 h-3.5 text-slate-400" />}
              label="Observações" campo="obs" placeholder="Observações opcionais..." obrig={false} />
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
