import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Trash2, ArrowUpDown, FileSpreadsheet, AlertTriangle,
  ChevronLeft, ChevronRight, X, Eraser
} from 'lucide-react';
import { Abastecimento } from '../types';

interface BaseDadosProps {
  dados: Abastecimento[];
  precoDiesel: number;
  onDelete: (id: number) => void;
  onClearAll: () => void;
}

type SortField = keyof Abastecimento;
type SortDirection = 'asc' | 'desc';

export default function BaseDados({ dados, precoDiesel, onDelete, onClearAll }: BaseDadosProps) {
  const [busca, setBusca] = useState('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [pagina, setPagina] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const itensPorPagina = 15;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const dadosFiltrados = useMemo(() => {
    let filtrados = dados.filter(d =>
      Object.values(d).some(v =>
        String(v).toLowerCase().includes(busca.toLowerCase())
      )
    );

    filtrados.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    return filtrados;
  }, [dados, busca, sortField, sortDirection]);

  const totalPaginas = Math.ceil(dadosFiltrados.length / itensPorPagina);
  const dadosPaginados = dadosFiltrados.slice((pagina - 1) * itensPorPagina, pagina * itensPorPagina);

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400" />;
    return <ArrowUpDown className={`w-3 h-3 ${sortDirection === 'asc' ? 'text-blue-600' : 'text-orange-600'}`} />;
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Título + contador */}
          <div className="flex items-center gap-2 flex-wrap">
            <FileSpreadsheet className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-semibold text-slate-800">Base de Dados - Abastecimentos</h2>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              {dados.length} registros
            </span>
          </div>

          {/* Busca + Limpar tudo */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar em todos os campos..."
                value={busca}
                onChange={e => { setBusca(e.target.value); setPagina(1); }}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full sm:w-72 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Botão Limpar tudo */}
            {dados.length > 0 && (
              <button
                onClick={() => setConfirmClearAll(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
              >
                <Eraser className="w-4 h-4" />
                Limpar tudo
              </button>
            )}
          </div>
        </div>

        {/* Modal de confirmação Limpar tudo */}
        <AnimatePresence>
          {confirmClearAll && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Apagar todos os {dados.length} registros?</p>
                  <p className="text-xs text-red-600 mt-0.5">Esta ação não pode ser desfeita. Todos os dados da base serão removidos permanentemente.</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    onClearAll();
                    setConfirmClearAll(false);
                    setBusca('');
                    setPagina(1);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  Sim, apagar tudo
                </button>
                <button
                  onClick={() => setConfirmClearAll(false)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium border border-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  { key: 'id' as SortField, label: 'ID', width: 'w-14' },
                  { key: 'ccNovo' as SortField, label: 'CC NOVO', width: 'w-24' },
                  { key: 'diretoria' as SortField, label: 'DIRETORIA', width: 'w-28' },
                  { key: 'gerencia' as SortField, label: 'GERÊNCIA', width: 'w-28' },
                  { key: 'areaLot' as SortField, label: 'ÁREA LOT.', width: 'w-32' },
                  { key: 'fornecedor' as SortField, label: 'FORNECEDOR', width: 'w-32' },
                  { key: 'equipamento' as SortField, label: 'EQUIPAMENTO', width: 'w-36' },
                  { key: 'area' as SortField, label: 'ÁREA', width: 'w-24' },
                  { key: 'semana' as SortField, label: 'SEM', width: 'w-14' },
                  { key: 'data' as SortField, label: 'DATA', width: 'w-24' },
                  { key: 'litros' as SortField, label: 'LITROS', width: 'w-20' },
                  { key: 'valor' as SortField, label: 'VALOR (R$)', width: 'w-28' },
                ].map(col => (
                  <th
                    key={col.key}
                    className={`${col.width} px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors`}
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon field={col.key} />
                    </div>
                  </th>
                ))}
                <th className="w-16 px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  AÇÃO
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dadosPaginados.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-3 py-2.5 text-slate-700 font-medium">{item.id}</td>
                  <td className="px-3 py-2.5 text-slate-600">{item.ccNovo}</td>
                  <td className="px-3 py-2.5 text-slate-600">{item.diretoria}</td>
                  <td className="px-3 py-2.5 text-slate-600">{item.gerencia}</td>
                  <td className="px-3 py-2.5 text-slate-600">{item.areaLot}</td>
                  <td className="px-3 py-2.5 text-slate-600">{item.fornecedor}</td>
                  <td className="px-3 py-2.5 text-slate-600">{item.equipamento}</td>
                  <td className="px-3 py-2.5 text-slate-600">{item.area}</td>
                  <td className="px-3 py-2.5 text-slate-600 text-center">{item.semana}</td>
                  <td className="px-3 py-2.5 text-slate-600">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                  <td className="px-3 py-2.5 text-slate-700 font-medium">{item.litros}</td>
                  <td className="px-3 py-2.5 text-slate-700 font-medium">
                    {formatCurrency(item.litros * precoDiesel)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {confirmDelete === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { onDelete(item.id); setConfirmDelete(null); }}
                          className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          title="Confirmar exclusão"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
              {dadosPaginados.length === 0 && (
                <tr>
                  <td colSpan={13} className="px-3 py-12 text-center text-slate-400">
                    Nenhum registro encontrado
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
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPagina(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === pagina
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
