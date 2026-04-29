import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileUp, CheckCircle, AlertTriangle, Table,
  ArrowRight, X, FileSpreadsheet
} from 'lucide-react';
import { Abastecimento } from '../types';

interface ImportacaoProps {
  onImport: (items: Omit<Abastecimento, 'id' | 'valor'>[]) => void;
}

export default function Importacao({ onImport }: ImportacaoProps) {
  const [texto, setTexto] = useState('');
  const [preview, setPreview] = useState<Omit<Abastecimento, 'id' | 'valor'>[]>([]);
  const [erros, setErros] = useState<string[]>([]);
  const [sucesso, setSucesso] = useState(false);
  const [modo, setModo] = useState<'colar' | 'preview'>('colar');

  const processarDados = () => {
    setErros([]);
    setPreview([]);

    if (!texto.trim()) {
      setErros(['Cole os dados para importar']);
      return;
    }

    const linhas = texto.trim().split('\n');
    const dadosProcessados: Omit<Abastecimento, 'id' | 'valor'>[] = [];
    const errs: string[] = [];

    linhas.forEach((linha, idx) => {
      const cols = linha.split('\t');
      if (cols.length < 10) {
        errs.push(`Linha ${idx + 1}: formato inválido (esperado pelo menos 10 colunas)`);
        return;
      }

      const ccNovo = cols[0]?.trim();
      const diretoria = cols[1]?.trim();
      const gerencia = cols[2]?.trim();
      const areaLot = cols[3]?.trim();
      const fornecedor = cols[4]?.trim();
      const equipamento = cols[5]?.trim();
      const area = cols[6]?.trim();
      const dataStr = cols[7]?.trim();
      const litrosStr = cols[8]?.trim();

      if (!ccNovo || !diretoria || !dataStr || !litrosStr) {
        errs.push(`Linha ${idx + 1}: campos obrigatórios ausentes`);
        return;
      }

      const litros = parseFloat(litrosStr.replace(',', '.'));
      if (isNaN(litros) || litros <= 0) {
        errs.push(`Linha ${idx + 1}: valor de litros inválido`);
        return;
      }

      const data = new Date(dataStr);
      if (isNaN(data.getTime())) {
        // Tentar formato DD/MM/YYYY
        const parts = dataStr.split('/');
        if (parts.length === 3) {
          const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          if (!isNaN(d.getTime())) {
            data.setTime(d.getTime());
          }
        }
      }

      const dia = data.getDate();
      const semana = dia <= 7 ? 1 : dia <= 14 ? 2 : dia <= 21 ? 3 : dia <= 28 ? 4 : 5;

      dadosProcessados.push({
        ccNovo,
        diretoria,
        gerencia: gerencia || '',
        areaLot: areaLot || '',
        fornecedor: fornecedor || '',
        equipamento: equipamento || '',
        area: area || '',
        semana,
        data: data.toISOString().split('T')[0],
        litros,
      });
    });

    if (errs.length > 0) {
      setErros(errs);
      return;
    }

    setPreview(dadosProcessados);
    setModo('preview');
  };

  const confirmarImportacao = () => {
    onImport(preview);
    setSucesso(true);
    setTimeout(() => setSucesso(false), 3000);
    setTexto('');
    setPreview([]);
    setModo('colar');
  };

  const exemploDados = `CC-OP-018	Operações	Mineração	Mina A	Posto Shell	Caminhão CA-001	Produção	${new Date().toISOString().split('T')[0]}	320
CC-MN-009	Manutenção	Mecânica	Pátio	Posto BR	Pá Carregadeira PC-001	Manutenção	${new Date().toISOString().split('T')[0]}	195
CC-LG-008	Logística	Transporte	Base Logística	Posto Ipiranga	Caminhão CA-003	Transporte	${new Date().toISOString().split('T')[0]}	350`;

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
            <p className="text-sm text-slate-500">Cole dados externos no formato tabulado</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {modo === 'colar' ? (
            <motion.div
              key="colar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Table className="w-4 h-4 text-slate-500" />
                  <h4 className="text-sm font-semibold text-slate-700">Formato Esperado</h4>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  Cole os dados separados por <strong>tabulação</strong> (copiados do Excel) com as colunas na ordem:
                </p>
                <code className="block bg-white border border-slate-200 rounded px-3 py-2 text-xs text-slate-700 font-mono">
                  CC NOVO | DIRETORIA | GERÊNCIA | ÁREA LOT. | FORNECEDOR | EQUIPAMENTO | ÁREA | DATA | LITROS
                </code>
                <button
                  onClick={() => setTexto(exemploDados)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
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
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-semibold text-red-800">Erros encontrados:</p>
                  </div>
                  <ul className="space-y-1 max-h-40 overflow-y-auto">
                    {erros.map((err, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                        <X className="w-3 h-3 mt-1 flex-shrink-0" />
                        {err}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              <button
                onClick={processarDados}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                <FileUp className="w-4 h-4" />
                Processar Dados
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {sucesso && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-800">
                    {preview.length} registro(s) importado(s) com sucesso!
                  </p>
                </motion.div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-800">Pré-visualização ({preview.length} registros)</h3>
                </div>
                <button
                  onClick={() => setModo('colar')}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Voltar
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">CC NOVO</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">DIRETORIA</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">GERÊNCIA</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">ÁREA LOT.</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">EQUIPAMENTO</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">DATA</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">LITROS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-700">{item.ccNovo}</td>
                        <td className="px-3 py-2 text-slate-600">{item.diretoria}</td>
                        <td className="px-3 py-2 text-slate-600">{item.gerencia}</td>
                        <td className="px-3 py-2 text-slate-600">{item.areaLot}</td>
                        <td className="px-3 py-2 text-slate-600">{item.equipamento}</td>
                        <td className="px-3 py-2 text-slate-600">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                        <td className="px-3 py-2 text-right text-slate-700 font-medium">{item.litros}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmarImportacao}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmar Importação
                </button>
                <button
                  onClick={() => setModo('colar')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
