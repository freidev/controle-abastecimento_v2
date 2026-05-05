import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { History, User, Clock, Tag, Wrench, Fuel, Calendar } from 'lucide-react';

interface RegistroHistorico {
  id: number;
  cc_novo: string;
  equipamento: string;
  litros: number;
  valor: number;
  usuario_responsavel: string;
  data_hora_registro: string;
  data_abastecimento: string;
}

export default function Historico() {
  const [registros, setRegistros] = useState<RegistroHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroUsuario, setFiltroUsuario] = useState('');

  useEffect(() => {
    fetchHistorico();
  }, []);

  const fetchHistorico = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('abastecimentos')
      .select('id, cc_novo, equipamento, litros, valor, usuario_responsavel, data_hora_registro, data')
      .order('data_hora_registro', { ascending: false });

    if (data && !error) {
      setRegistros(data.map(r => ({
        id: r.id,
        cc_novo: r.cc_novo || 'N/A',
        equipamento: r.equipamento || 'N/A',
        litros: r.litros || 0,
        valor: r.valor || 0,
        usuario_responsavel: r.usuario_responsavel || 'Sistema',
        data_hora_registro: r.data_hora_registro,
        data_abastecimento: r.data,
      })));
    }
    setLoading(false);
  };

  const registrosFiltrados = filtroUsuario
    ? registros.filter(r => r.usuario_responsavel.toLowerCase().includes(filtroUsuario.toLowerCase()))
    : registros;

  const formatData = (dataISO: string) => {
    if (!dataISO) return '—';
    const d = new Date(dataISO);
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Histórico de Preenchimentos</h2>
              <p className="text-sm text-slate-500">Registro completo de todos os abastecimentos realizados</p>
            </div>
          </div>
          
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Filtrar por operador..." value={filtroUsuario}
              onChange={e => setFiltroUsuario(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
        </div>
      </motion.div>

      {/* Tabela */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando histórico...</div>
        ) : registrosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            Nenhum registro encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Operador</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Data/Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">CC Novo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Equipamento</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Litros</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Valor (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrosFiltrados.map((reg, idx) => (
                  <motion.tr key={reg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                          {reg.usuario_responsavel.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800 text-xs">{reg.usuario_responsavel}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatData(reg.data_hora_registro)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{reg.cc_novo}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Wrench className="w-3.5 h-3.5 text-slate-400" />
                        {reg.equipamento}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-slate-700">{reg.litros}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {formatCurrency(reg.valor)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
