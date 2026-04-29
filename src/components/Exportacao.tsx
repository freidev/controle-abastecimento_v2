import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  Download, FileSpreadsheet, Filter, CheckSquare, Square,
  ChevronDown, ChevronUp, Layers, Table2, BarChart3,
  Calendar, Building2, Wrench, MapPin, CheckCircle2,
  AlertCircle, FileDown
} from 'lucide-react';
import { Abastecimento, OrcamentoDiretoria } from '../types';

interface ExportacaoProps {
  dados: Abastecimento[];
  orcamento: OrcamentoDiretoria[];
  precoDiesel: number;
}

type FormatoExport = 'completo' | 'resumo_diretoria' | 'resumo_semana' | 'resumo_equipamento' | 'orcamento';

interface OpcaoExport {
  id: FormatoExport;
  label: string;
  descricao: string;
  icon: React.ElementType;
  colunas: string[];
}

const opcoes: OpcaoExport[] = [
  {
    id: 'completo',
    label: 'Base Completa',
    descricao: 'Todos os registros com todas as colunas da tabela tb_abastecimento',
    icon: Table2,
    colunas: ['ID', 'CC NOVO', 'DIRETORIA', 'GERÊNCIA', 'ÁREA LOT.', 'FORNECEDOR', 'EQUIPAMENTO', 'ÁREA', 'SEMANA', 'DATA', 'LITROS', 'VALOR (R$)'],
  },
  {
    id: 'resumo_diretoria',
    label: 'Resumo por Diretoria',
    descricao: 'Totais de litros e valor agrupados por diretoria',
    icon: Building2,
    colunas: ['DIRETORIA', 'QTD. REGISTROS', 'TOTAL LITROS', 'TOTAL VALOR (R$)', 'MÉDIA LITROS'],
  },
  {
    id: 'resumo_semana',
    label: 'Resumo por Semana',
    descricao: 'Totais de consumo agrupados por semana do mês',
    icon: Calendar,
    colunas: ['SEMANA', 'QTD. REGISTROS', 'TOTAL LITROS', 'TOTAL VALOR (R$)', 'MÉDIA LITROS'],
  },
  {
    id: 'resumo_equipamento',
    label: 'Resumo por Equipamento',
    descricao: 'Consumo total por equipamento, ordenado do maior para o menor',
    icon: Wrench,
    colunas: ['EQUIPAMENTO', 'QTD. ABASTECIMENTOS', 'TOTAL LITROS', 'TOTAL VALOR (R$)', 'MÉDIA LITROS'],
  },
  {
    id: 'orcamento',
    label: 'Orçado vs Realizado',
    descricao: 'Comparativo entre orçamento e realizado por diretoria com % de execução',
    icon: BarChart3,
    colunas: ['DIRETORIA', 'ORÇAMENTO (R$)', 'REALIZADO (R$)', 'SALDO (R$)', '% EXECUÇÃO', 'STATUS'],
  },
];

export default function Exportacao({ dados, orcamento, precoDiesel }: ExportacaoProps) {
  const [formatoSelecionado, setFormatoSelecionado] = useState<FormatoExport>('completo');
  const [filtroAtivo, setFiltroAtivo] = useState(false);

  // Filtros
  const [filtroDiretoria, setFiltroDiretoria] = useState<string[]>([]);
  const [filtroSemana, setFiltroSemana] = useState<number[]>([]);
  const [filtroAreaLot, setFiltroAreaLot] = useState<string[]>([]);
  const [filtroEquipamento, setFiltroEquipamento] = useState<string[]>([]);

  const [nomeArquivo, setNomeArquivo] = useState('controle_abastecimento');
  const [exportando, setExportando] = useState(false);
  const [exportadoOk, setExportadoOk] = useState(false);
  const [colunasVisiveis, setColunasVisiveis] = useState<string[]>(opcoes[0].colunas);
  const [showColunas, setShowColunas] = useState(false);

  const diretorias   = useMemo(() => [...new Set(dados.map(d => d.diretoria))].sort(), [dados]);
  const semanas      = [1, 2, 3, 4, 5];
  const areasLot     = useMemo(() => [...new Set(dados.map(d => d.areaLot))].sort(), [dados]);
  const equipamentos = useMemo(() => [...new Set(dados.map(d => d.equipamento))].sort(), [dados]);

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const toggleArr = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  // Quando muda o formato, sincroniza colunas visíveis
  const handleFormatoChange = (f: FormatoExport) => {
    setFormatoSelecionado(f);
    const op = opcoes.find(o => o.id === f)!;
    setColunasVisiveis(op.colunas);
  };

  const dadosFiltrados = useMemo(() => {
    return dados.filter(d => {
      if (filtroDiretoria.length  && !filtroDiretoria.includes(d.diretoria))   return false;
      if (filtroSemana.length     && !filtroSemana.includes(d.semana))          return false;
      if (filtroAreaLot.length    && !filtroAreaLot.includes(d.areaLot))        return false;
      if (filtroEquipamento.length && !filtroEquipamento.includes(d.equipamento)) return false;
      return true;
    });
  }, [dados, filtroDiretoria, filtroSemana, filtroAreaLot, filtroEquipamento]);

  // ─── Geração das planilhas ───────────────────────────────────────────────
  const gerarDadosExport = (): { planilha: Record<string, unknown>[]; nomePlanilha: string }[] => {
    const todasPlanilhas: { planilha: Record<string, unknown>[]; nomePlanilha: string }[] = [];

    const todasColunas = opcoes.find(o => o.id === formatoSelecionado)!.colunas;
    const colsAtivas   = formatoSelecionado === 'completo' ? colunasVisiveis : todasColunas;

    if (formatoSelecionado === 'completo') {
      const header = todasColunas.filter(c => colsAtivas.includes(c));
      const rows = dadosFiltrados.map(d => {
        const obj: Record<string, unknown> = {
          'ID': d.id,
          'CC NOVO': d.ccNovo,
          'DIRETORIA': d.diretoria,
          'GERÊNCIA': d.gerencia,
          'ÁREA LOT.': d.areaLot,
          'FORNECEDOR': d.fornecedor,
          'EQUIPAMENTO': d.equipamento,
          'ÁREA': d.area,
          'SEMANA': d.semana,
          'DATA': new Date(d.data).toLocaleDateString('pt-BR'),
          'LITROS': d.litros,
          'VALOR (R$)': d.litros * precoDiesel,
        };
        const filtered: Record<string, unknown> = {};
        header.forEach(k => { filtered[k] = obj[k]; });
        return filtered;
      });
      todasPlanilhas.push({ planilha: rows, nomePlanilha: 'BASE_DADOS' });
    }

    if (formatoSelecionado === 'resumo_diretoria') {
      const ag: Record<string, { count: number; litros: number; valor: number }> = {};
      dadosFiltrados.forEach(d => {
        if (!ag[d.diretoria]) ag[d.diretoria] = { count: 0, litros: 0, valor: 0 };
        ag[d.diretoria].count++;
        ag[d.diretoria].litros += d.litros;
        ag[d.diretoria].valor  += d.litros * precoDiesel;
      });
      const rows: Record<string, unknown>[] = Object.entries(ag).sort().map(([dir, v]) => ({
        'DIRETORIA': dir,
        'QTD. REGISTROS': v.count,
        'TOTAL LITROS': v.litros,
        'TOTAL VALOR (R$)': v.valor,
        'MÉDIA LITROS': parseFloat((v.litros / v.count).toFixed(2)),
      }));
      todasPlanilhas.push({ planilha: rows, nomePlanilha: 'RESUMO_DIRETORIA' });
    }

    if (formatoSelecionado === 'resumo_semana') {
      const ag: Record<number, { count: number; litros: number; valor: number }> = {};
      dadosFiltrados.forEach(d => {
        if (!ag[d.semana]) ag[d.semana] = { count: 0, litros: 0, valor: 0 };
        ag[d.semana].count++;
        ag[d.semana].litros += d.litros;
        ag[d.semana].valor  += d.litros * precoDiesel;
      });
      const rows: Record<string, unknown>[] = [1,2,3,4,5].map(s => ({
        'SEMANA': `Semana ${s}`,
        'QTD. REGISTROS': ag[s]?.count || 0,
        'TOTAL LITROS': ag[s]?.litros || 0,
        'TOTAL VALOR (R$)': ag[s]?.valor || 0,
        'MÉDIA LITROS': ag[s] ? parseFloat((ag[s].litros / ag[s].count).toFixed(2)) : 0,
      }));
      todasPlanilhas.push({ planilha: rows, nomePlanilha: 'RESUMO_SEMANA' });
    }

    if (formatoSelecionado === 'resumo_equipamento') {
      const ag: Record<string, { count: number; litros: number; valor: number }> = {};
      dadosFiltrados.forEach(d => {
        if (!ag[d.equipamento]) ag[d.equipamento] = { count: 0, litros: 0, valor: 0 };
        ag[d.equipamento].count++;
        ag[d.equipamento].litros += d.litros;
        ag[d.equipamento].valor  += d.litros * precoDiesel;
      });
      const rows: Record<string, unknown>[] = Object.entries(ag)
        .sort(([,a],[,b]) => b.litros - a.litros)
        .map(([eq, v]) => ({
          'EQUIPAMENTO': eq,
          'QTD. ABASTECIMENTOS': v.count,
          'TOTAL LITROS': v.litros,
          'TOTAL VALOR (R$)': v.valor,
          'MÉDIA LITROS': parseFloat((v.litros / v.count).toFixed(2)),
        }));
      todasPlanilhas.push({ planilha: rows, nomePlanilha: 'RESUMO_EQUIPAMENTO' });
    }

    if (formatoSelecionado === 'orcamento') {
      const agReal: Record<string, number> = {};
      dadosFiltrados.forEach(d => {
        agReal[d.diretoria] = (agReal[d.diretoria] || 0) + d.litros * precoDiesel;
      });
      const rows: Record<string, unknown>[] = orcamento.map(o => {
        const real = agReal[o.diretoria] || 0;
        const saldo = o.orcamento - real;
        const perc  = o.orcamento > 0 ? (real / o.orcamento) * 100 : 0;
        return {
          'DIRETORIA': o.diretoria,
          'ORÇAMENTO (R$)': o.orcamento,
          'REALIZADO (R$)': parseFloat(real.toFixed(2)),
          'SALDO (R$)': parseFloat(saldo.toFixed(2)),
          '% EXECUÇÃO': parseFloat(perc.toFixed(1)),
          'STATUS': real > o.orcamento ? 'ULTRAPASSADO' : perc > 80 ? 'ATENÇÃO' : 'OK',
        };
      });
      todasPlanilhas.push({ planilha: rows, nomePlanilha: 'ORCAMENTO_VS_REALIZADO' });
    }

    return todasPlanilhas;
  };

  const exportarExcel = async () => {
    setExportando(true);
    await new Promise(r => setTimeout(r, 600));

    try {
      const workbook = XLSX.utils.book_new();
      const planilhas = gerarDadosExport();

      planilhas.forEach(({ planilha, nomePlanilha }) => {
        const ws = XLSX.utils.json_to_sheet(planilha);

        // Larguras automáticas
        const colWidths = Object.keys(planilha[0] || {}).map(k => ({
          wch: Math.max(k.length, 18)
        }));
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(workbook, ws, nomePlanilha);
      });

      // Aba de metadados
      const metaData: Record<string, unknown>[] = [
        { 'CAMPO': 'Sistema', 'VALOR': 'Controle de Abastecimento' },
        { 'CAMPO': 'Data de Exportação', 'VALOR': new Date().toLocaleString('pt-BR') },
        { 'CAMPO': 'Total de Registros', 'VALOR': dadosFiltrados.length },
        { 'CAMPO': 'Preço do Diesel (R$/L)', 'VALOR': precoDiesel },
        { 'CAMPO': 'Total Litros', 'VALOR': dadosFiltrados.reduce((a, d) => a + d.litros, 0) },
        { 'CAMPO': 'Total Valor (R$)', 'VALOR': parseFloat((dadosFiltrados.reduce((a, d) => a + d.litros, 0) * precoDiesel).toFixed(2)) },
        { 'CAMPO': 'Filtros Aplicados', 'VALOR': [
          filtroDiretoria.length   ? `Diretoria: ${filtroDiretoria.join(', ')}`   : '',
          filtroSemana.length      ? `Semana: ${filtroSemana.join(', ')}`          : '',
          filtroAreaLot.length     ? `Área Lot.: ${filtroAreaLot.join(', ')}`      : '',
          filtroEquipamento.length ? `Equip.: ${filtroEquipamento.join(', ')}`     : '',
        ].filter(Boolean).join(' | ') || 'Nenhum' },
      ];
      const wsMeta = XLSX.utils.json_to_sheet(metaData);
      wsMeta['!cols'] = [{ wch: 25 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(workbook, wsMeta, 'INFORMACOES');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const dataHoje = new Date().toISOString().split('T')[0];
      saveAs(blob, `${nomeArquivo}_${dataHoje}.xlsx`);

      setExportadoOk(true);
      setTimeout(() => setExportadoOk(false), 3500);
    } catch (err) {
      console.error('Erro ao exportar:', err);
    } finally {
      setExportando(false);
    }
  };

  const limparFiltros = () => {
    setFiltroDiretoria([]);
    setFiltroSemana([]);
    setFiltroAreaLot([]);
    setFiltroEquipamento([]);
  };

  const totalLitros = dadosFiltrados.reduce((a, d) => a + d.litros, 0);
  const totalValor  = totalLitros * precoDiesel;
  const hasFiltros  = filtroDiretoria.length || filtroSemana.length || filtroAreaLot.length || filtroEquipamento.length;

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <FileDown className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Exportação de Dados</h2>
            <p className="text-sm text-slate-500">
              Gere arquivos <span className="font-medium text-emerald-700">.xlsx</span> prontos para Excel com filtros e formatos personalizados
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── COLUNA ESQUERDA: formato + filtros + nome ── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Formato */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-slate-800 text-sm">Formato de Exportação</h3>
            </div>
            <div className="space-y-2">
              {opcoes.map(op => {
                const Icon = op.icon;
                const ativo = formatoSelecionado === op.id;
                return (
                  <button
                    key={op.id}
                    onClick={() => handleFormatoChange(op.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${
                      ativo
                        ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-300'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${ativo ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div>
                        <p className={`text-sm font-medium ${ativo ? 'text-blue-800' : 'text-slate-700'}`}>
                          {op.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-tight">{op.descricao}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Nome do arquivo */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
          >
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Nome do Arquivo</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nomeArquivo}
                onChange={e => setNomeArquivo(e.target.value.replace(/[^a-zA-Z0-9_\-]/g, '_'))}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-2 rounded-lg whitespace-nowrap">.xlsx</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Será salvo como: <span className="font-mono">{nomeArquivo}_{new Date().toISOString().split('T')[0]}.xlsx</span>
            </p>
          </motion.div>
        </div>

        {/* ── COLUNA DIREITA: Filtros + Colunas + Preview + Botão ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Filtros */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setFiltroAtivo(v => !v)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filtros de Exportação
                {hasFiltros ? (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {Number(!!filtroDiretoria.length) + Number(!!filtroSemana.length) + Number(!!filtroAreaLot.length) + Number(!!filtroEquipamento.length)} ativo(s)
                  </span>
                ) : null}
                {filtroAtivo ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
              </button>
              {hasFiltros && (
                <button onClick={limparFiltros} className="text-xs text-red-500 hover:text-red-700 font-medium">
                  Limpar tudo
                </button>
              )}
            </div>

            {filtroAtivo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-2 border-t border-slate-100"
              >
                {/* Diretoria */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Diretoria
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {diretorias.map(d => {
                      const sel = filtroDiretoria.includes(d);
                      return (
                        <button
                          key={d}
                          onClick={() => setFiltroDiretoria(prev => toggleArr(prev, d))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            sel ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          {sel ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Semana */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Semana
                  </p>
                  <div className="flex gap-2">
                    {semanas.map(s => {
                      const sel = filtroSemana.includes(s);
                      return (
                        <button
                          key={s}
                          onClick={() => setFiltroSemana(prev => toggleArr(prev, s))}
                          className={`w-10 h-10 rounded-lg text-sm font-semibold border transition-all ${
                            sel ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Área Lot. */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Área de Lotação
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {areasLot.map(a => {
                      const sel = filtroAreaLot.includes(a);
                      return (
                        <button
                          key={a}
                          onClick={() => setFiltroAreaLot(prev => toggleArr(prev, a))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            sel ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          {sel ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                          {a}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Equipamento */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
                    <Wrench className="w-3 h-3" /> Equipamento
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                    {equipamentos.map(eq => {
                      const sel = filtroEquipamento.includes(eq);
                      return (
                        <button
                          key={eq}
                          onClick={() => setFiltroEquipamento(prev => toggleArr(prev, eq))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            sel ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          {sel ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                          {eq}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Seleção de Colunas (só aparece no modo completo) */}
          {formatoSelecionado === 'completo' && (
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
            >
              <button
                onClick={() => setShowColunas(v => !v)}
                className="flex items-center gap-2 w-full text-sm font-semibold text-slate-700 hover:text-blue-700 transition-colors"
              >
                <Table2 className="w-4 h-4" />
                Selecionar Colunas para Exportar
                <span className="ml-auto text-xs text-slate-400 font-normal">
                  {colunasVisiveis.length}/{opcoes[0].colunas.length} selecionadas
                </span>
                {showColunas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showColunas && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-slate-100"
                >
                  <div className="flex justify-between mb-3">
                    <button
                      onClick={() => setColunasVisiveis(opcoes[0].colunas)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Selecionar todas
                    </button>
                    <button
                      onClick={() => setColunasVisiveis([])}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Limpar seleção
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {opcoes[0].colunas.map(col => {
                      const sel = colunasVisiveis.includes(col);
                      return (
                        <button
                          key={col}
                          onClick={() => setColunasVisiveis(prev => toggleArr(prev, col))}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                            sel ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {sel
                            ? <CheckSquare className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            : <Square className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          }
                          {col}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Preview da exportação */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-slate-800 text-sm">Resumo da Exportação</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-blue-800">{dadosFiltrados.length}</p>
                <p className="text-xs text-blue-600 mt-0.5">Registros</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-emerald-800">{totalLitros.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-emerald-600 mt-0.5">Litros</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-base font-bold text-orange-800">{formatCurrency(totalValor)}</p>
                <p className="text-xs text-orange-600 mt-0.5">Valor Total</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-slate-800">
                  {formatoSelecionado === 'completo' ? colunasVisiveis.length : opcoes.find(o => o.id === formatoSelecionado)!.colunas.length}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Colunas</p>
              </div>
            </div>

            {/* Colunas que serão exportadas */}
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Colunas na planilha</p>
              <div className="flex flex-wrap gap-1.5">
                {(formatoSelecionado === 'completo' ? colunasVisiveis : opcoes.find(o => o.id === formatoSelecionado)!.colunas).map(col => (
                  <span key={col} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-md font-mono">
                    {col}
                  </span>
                ))}
                {formatoSelecionado === 'completo' && colunasVisiveis.length === 0 && (
                  <span className="text-xs text-red-500">Selecione pelo menos uma coluna</span>
                )}
              </div>
            </div>

            {/* Abas do arquivo */}
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Abas que serão criadas no .xlsx</p>
              <div className="flex flex-wrap gap-2">
                {gerarDadosExport().map(({ nomePlanilha }) => (
                  <span key={nomePlanilha} className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-md">
                    <FileSpreadsheet className="w-3 h-3" />
                    {nomePlanilha}
                  </span>
                ))}
                <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-200 text-slate-600 text-xs font-medium rounded-md">
                  <FileSpreadsheet className="w-3 h-3" />
                  INFORMACOES
                </span>
              </div>
            </div>
          </motion.div>

          {/* Botão exportar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {exportadoOk ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 w-full py-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-semibold"
              >
                <CheckCircle2 className="w-5 h-5" />
                Arquivo exportado com sucesso!
              </motion.div>
            ) : (
              <button
                onClick={exportarExcel}
                disabled={exportando || (formatoSelecionado === 'completo' && colunasVisiveis.length === 0) || dadosFiltrados.length === 0}
                className="flex items-center justify-center gap-3 w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md text-base"
              >
                {exportando ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Gerando arquivo Excel...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Exportar para Excel (.xlsx)
                  </>
                )}
              </button>
            )}

            {dadosFiltrados.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 mt-3 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">Nenhum dado encontrado com os filtros aplicados.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
