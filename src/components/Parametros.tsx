import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Fuel, Info } from 'lucide-react';

interface ParametrosProps {
  precoDiesel: number;
  onChangePreco: (valor: number) => void;
}

export default function Parametros({ precoDiesel, onChangePreco }: ParametrosProps) {
  const [inputValue, setInputValue] = useState(precoDiesel.toString());

  useEffect(() => {
    setInputValue(precoDiesel.toString());
  }, [precoDiesel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw     = e.target.value;
    const cleaned = raw.replace(/^0+(?=\d)/, '');
    setInputValue(cleaned);
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > 0) onChangePreco(num);
  };

  const handleBlur = () => {
    const num = parseFloat(inputValue);
    if (isNaN(num) || num <= 0) {
      setInputValue(precoDiesel.toString());
    } else {
      setInputValue(num.toFixed(2));
      onChangePreco(num);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Parâmetros do Sistema</h2>
            <p className="text-sm text-slate-500">Configure as variáveis de controle do sistema</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Informação Importante</p>
              <p className="text-sm text-amber-700 mt-1">
                O valor do diesel é utilizado em todas as fórmulas de cálculo do sistema,
                incluindo KPIs do dashboard, valores na base de dados e comparações orçamentárias.
                Altere com cautela.
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <Fuel className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800 block">Valor do Diesel (R$/litro)</label>
                <span className="text-xs text-slate-500">preço_diesel</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={inputValue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-lg font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[5.50, 5.89, 6.20, 6.50, 6.80, 7.00].map(valor => (
                <button key={valor} onClick={() => { onChangePreco(valor); setInputValue(valor.toFixed(2)); }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    Math.abs(precoDiesel - valor) < 0.01
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  R$ {valor.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Impacto nas Fórmulas</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between py-2 border-b border-slate-200">
                <span>Fórmula do Valor Total:</span>
                <code className="bg-white px-2 py-1 rounded text-blue-700 font-mono text-xs">
                  SOMA(LITROS) × R$ {precoDiesel.toFixed(2)}
                </code>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-200">
                <span>Exemplo (1.000 L):</span>
                <span className="font-semibold text-slate-800">
                  {(1000 * precoDiesel).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Exemplo (10.000 L):</span>
                <span className="font-semibold text-slate-800">
                  {(10000 * precoDiesel).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
