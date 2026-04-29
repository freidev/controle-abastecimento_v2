import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import {
  Upload, FileUp, CheckCircle, AlertTriangle, Table,
  ArrowRight, X, FileSpreadsheet, FolderOpen, FileText,
  MousePointerClick
} from 'lucide-react';
import { Abastecimento } from '../types';

interface ImportacaoProps {
  onImport: (items: Omit<Abastecimento, 'id' | 'valor'>[]) => void;
}

function parseLinha(cols: string[], idx: number): Omit<Abastecimento, 'id' | 'valor'> | string {
  if (cols.length < 9) return `Linha ${idx + 1}: formato inválido (esperado 9 colunas)`;

  const ccNovo      = cols[0]?.trim();
  const diretoria   = cols[1]?.trim();
  const gerencia    = cols[2]?.trim();
  const areaLot     = cols[3]?.trim();
  const fornecedor  = cols[4]?.trim();
  const equipamento = cols[5]?.trim();
  const area        = cols[6]?.trim();
  const dataStr     = cols[7]?.trim();
  const litrosStr   = cols[8]?.trim();

  if (!ccNovo || !diretoria || !dataStr || !litrosStr)
    return `Linha ${idx + 1}: campos obrigatórios ausentes`;

  const litros = parseFloat(litrosStr.replace(',', '.'));
  if (isNaN(litros) || litros <= 0)
    return `Linha ${idx + 1}: valor de litros inválido`;

  let dataFinal = dataStr;
  if (dataStr.includes('/')) {
    const p = dataStr.split('/');
    if (p.length === 3) dataFinal = `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;
  }
  const dataObj = new Date(dataFinal);
  if (isNaN(dataObj.getTime())) return `Linha ${idx + 1}: data inválida ("${dataStr}")`;

  const dia    = dataObj.getDate();
  const semana = dia <= 7 ? 1 : dia <= 14 ? 2 : dia <= 21 ? 3 : dia <= 28 ? 4 : 5;

  return { ccNovo, diretoria, gerencia, areaLot, fornecedor, equipamento, area, semana, data: dataFinal, litros };
}

export default function Importacao({ onImport }: ImportacaoProps) {
  const [aba, setAba] = useState<'arquivo' | 'colar'>('arquivo');
  const [texto, setTexto] = useState('');
  const [preview, setPreview] = useState<Omit<Abastecimento, 'id' | 'valor'>[]>([]);
  const [erros, setErros]     = useState<string[]>([]);
  const [sucesso, setSucesso] = useState(false);
  const [modo, setModo]       = useState<'input' | 'preview'>('input');
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [arrastando, setArrastando]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processarArquivo = (file: File) => {
    setErros([]);
    setNomeArquivo(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data  = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb    = XLSX.read(data, { type: 'array', cellDates: true });
        const ws    = wb.Sheets[wb.SheetNames[0]];
        const rows  = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });

        const primeiraLinha = rows[0]?.map(c => String(c).toLowerCase().trim()) || [];
        const temCabecalho  = primeiraLinha.some(c =>
          ['cc', 'diretoria', 'gerencia', 'gerência', 'fornecedor', 'equipamento', 'litros'].includes(c)
        );
        const dadosLinhas = temCabecalho ? rows.slice(1) : rows;

        const resultado: Omit<Abastecimento, 'id' | 'valor'>[] = [];
        const errs: string[] = [];

        dadosLinhas.forEach((row, i) => {
          if (!row || row.every(c => String(c).trim() === '')) return;
          const cols = row.map((c: unknown) => {
            if (c instanceof Date) return c.toISOString().split('T')[0];
            return String(c ?? '');
          });
          const result = parseLinha(cols, i);
          if (typeof result === 'string') errs.push(result);
          else resultado.push(result);
        });

        if (errs.length > 0) { setErros(errs); return; }
        setPreview(resultado);
        setModo('preview');
      } catch {
        setErros(['Erro ao ler o arquivo. Verifique se é um arquivo Excel (.xlsx, .xls) ou CSV válido.']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processarTexto = () => {
    setErros([]);
    setPreview([]);
    if (!texto.trim()) { setErros(['Cole os dados para importar']); return; }

    const linhas    = texto.trim().split('\n');
    const resultado: Omit<Abastecimento, 'id' | 'valor'>[] = [];
    const errs: string[] = [];

    linhas.forEach((linha, i) => {
      if (!linha.trim()) return;
      const cols   = linha.split('\t');
      const result = parseLinha(cols, i);
      if (typeof result === 'string') errs.push(result);
      else resultado.push(result);
    });

    if (errs.length > 0) { setErros(errs); return; }
    setPreview(resultado);
    setModo('preview');
  };

  const confirmar = () => {
    onImport(preview);
    setSucesso(true);
    setTimeout(() => setSucesso(false), 3500);
    setTexto('');
    setPreview([]);
    setNomeArquivo('');
    setModo('input');
  };

  const cancelar = () => {
    setPreview([]);
    setErros([]);
    setNomeArquivo('');
    setModo('input');
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastando(false);
    const file = e.dataTransfer.files[0];
    if (file) processarArquivo(file);
  };

  const exemploDados = `CC-OP-018\tOperações\tMineração\tMina A\tPosto Shell\tCaminhão CA-001\tProdução\t${new Date().toISOString().split('T')[0]}\t320
CC-MN-009\tManutenção\tMecânica\tPátio\tPosto BR\tPá Carregadeira PC-001\tManutenção\t${new Date().toISOString().split('T')[0]}\t195`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Upload className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Importação de Dados</h2>
            <p className="text-sm text-slate-500">Importe direto do Excel ou cole dados tabulados</p>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6">
          <button
            onClick={() => { setAba('arquivo'); setModo('input'); setErros([]); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              aba === 'arquivo' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            📂 Importar Arquivo Excel
          </button>
          <button
            onClick={() => { setAba('colar'); setModo('input'); setErros([]); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              aba === 'colar' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MousePointerClick className="w-4 h-4" />
            📋 Colar do Excel
          </button>
        </div>

        <AnimatePresence mode="wait">

          {aba === 'arquivo' && modo === 'input' && (
            <motion.div key="arquivo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div
                onDragOver={e => { e.preventDefault(); setArrastando(true); }}
                onDragLeave={() => setArrastando(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  arrastando ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${arrastando ? 'bg-blue-100' : 'bg-slate-100'}`}>
                  <FileSpreadsheet className={`w-8 h-8 ${arrastando ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-slate-700">
                    {arrastando ? 'Solte o arquivo aqui!' : 'Arraste o arquivo ou clique para selecionar'}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">Suporta .xlsx, .xls e .csv</p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                  onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                >
                  <FolderOpen className="w-4 h-4" />
                  Selecionar arquivo Excel
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) processarArquivo(f); }}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2 mb-3">
                  <FileText className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-amber-800">Como preparar seu arquivo Excel</p>
                </div>
                <p className="text-sm text-amber-700 mb-3">O arquivo deve ter as colunas nessa ordem:</p>
                <code className="block bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-mono">
                  CC NOVO | DIRETORIA | GERÊNCIA | ÁREA LOT. | FORNECEDOR | EQUIPAMENTO | ÁREA | DATA | LITROS
                </code>
                <p className="text-xs text-amber-600 mt-2">
                  📅 A data pode estar no formato <strong>DD/MM/AAAA</strong> ou <strong>AAAA-MM-DD</strong>
                </p>
              </div>

              {erros.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-semibold text-red-800">Erros encontrados:</p>
                  </div>
                  <ul className="space-y-1 max-h-40 overflow-y-auto">
                    {erros.map((err, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                        <X className="w-3 h-3 mt-1 flex-shrink-0" />{err}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          )}

          {aba === 'colar' && modo === 'input' && (
            <motion.div key="colar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Table className="w-4 h-4 text-slate-500" />
                  <h4 className="text-sm font-semibold text-slate-700">Formato Esperado</h4>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  Cole os dados separados por <strong>tabulação</strong> (copiados diretamente do Excel):
                </p>
                <code className="block bg-white border border-slate-200 rounded px-3 py-2 text-xs text-slate-700 font-mono">
                  CC NOVO | DIRETORIA | GERÊNCIA | ÁREA LOT. | FORNECEDOR | EQUIPAMENTO | ÁREA | DATA | LITROS
                </code>
                <button onClick={() => setTexto(exemploDados)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Inserir dados de exemplo
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Dados para Importar</label>
                <textarea
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                  placeholder={`Cole aqui os dados do Excel...\nExemplo:\nCC-OP-018\tOperações\tMineração\tMina A\tPosto Shell\tCaminhão CA-001\tProdução\t2024-01-15\t320`}
                  rows={10}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                />
              </div>

              {erros.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-semibold text-red-800">Erros encontrados:</p>
                  </div>
                  <ul className="space-y-1 max-h-40 overflow-y-auto">
                    {erros.map((err, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                        <X className="w-3 h-3 mt-1 flex-shrink-0" />{err}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              <button onClick={processarTexto}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm">
                <FileUp className="w-4 h-4" />
                Processar Dados
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {modo === 'preview' && (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {sucesso && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-800">{preview.length} registro(s) importado(s) com sucesso!</p>
                </motion.div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-800">
                    Pré-visualização
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{preview.length} registros</span>
                  </h3>
                  {nomeArquivo && (
                    <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">📄 {nomeArquivo}</span>
                  )}
                </div>
                <button onClick={cancelar} className="text-sm text-slate-500 hover:text-slate-700">Voltar</button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['CC NOVO','DIRETORIA','GERÊNCIA','ÁREA LOT.','EQUIPAMENTO','DATA','LITROS'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.slice(0, 20).map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-700 font-mono text-xs">{item.ccNovo}</td>
                        <td className="px-3 py-2 text-slate-600">{item.diretoria}</td>
                        <td className="px-3 py-2 text-slate-600">{item.gerencia}</td>
                        <td className="px-3 py-2 text-slate-600">{item.areaLot}</td>
                        <td className="px-3 py-2 text-slate-600">{item.equipamento}</td>
                        <td className="px-3 py-2 text-slate-600">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                        <td className="px-3 py-2 text-right text-slate-700 font-medium">{item.litros}</td>
                      </tr>
                    ))}
                    {preview.length > 20 && (
                      <tr>
                        <td colSpan={7} className="px-3 py-2 text-center text-xs text-slate-400">
                          ... e mais {preview.length - 20} registros
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <button onClick={confirmar}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm">
                  <CheckCircle className="w-4 h-4" />
                  Confirmar Importação ({preview.length} registros)
                </button>
                <button onClick={cancelar}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">
                  <X className="w-4 h-4" /> Cancelar
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
