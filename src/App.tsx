import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Database, Settings, FilePlus, Upload, Wallet,
  Fuel, Menu, X, FileDown, GitFork, Loader2, Wifi, WifiOff
} from 'lucide-react';
import {
  Abastecimento, OrcamentoDiretoria, RateioCC, TabType,
  FiltroKey, FiltroSelecoes, FILTROS_PADRAO_KEYS, FILTRO_SELECOES_VAZIO,
} from './types';
import { dadosProcessados, orcamentoInicial, parametrosInicial } from './data/initialData';
import {
  buscarAbastecimentos, adicionarAbastecimento, deletarAbastecimento,
  limparAbastecimentos, atualizarAbastecimentos,
  buscarOrcamentos, salvarOrcamentos,
  buscarRateios, salvarRateios,
  buscarPreco, salvarPreco,
} from './lib/db';
import Dashboard     from './components/Dashboard';
import BaseDados     from './components/BaseDados';
import Parametros    from './components/Parametros';
import Preenchimento from './components/Preenchimento';
import Importacao    from './components/Importacao';
import Orcamento     from './components/Orcamento';
import Exportacao    from './components/Exportacao';
import Rateio        from './components/Rateio';

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'base_dados',   label: 'Base de Dados', icon: Database        },
  { id: 'orcamento',    label: 'Orçamento',     icon: Wallet          },
  { id: 'rateio',       label: 'Rateio CC',     icon: GitFork         },
  { id: 'preenchimento', label: 'Preenchimento', icon: FilePlus        },
  { id: 'importacao',   label: 'Importação',    icon: Upload          },
  { id: 'exportacao',   label: 'Exportação',    icon: FileDown        },
  { id: 'parametros',   label: 'Parâmetros',    icon: Settings        },
];

export default function App() {
  const [activeTab, setActiveTab]   = useState<TabType>('dashboard');
  const [dados, setDados]           = useState<Abastecimento[]>([]);
  const [orcamento, setOrcamento]   = useState<OrcamentoDiretoria[]>([]);
  const [rateios, setRateios]       = useState<RateioCC[]>([]);
  const [parametros, setParametros] = useState(parametrosInicial);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [online, setOnline]         = useState(true);
  const [sincronizando, setSincronizando] = useState(false);

  const [filtrosAtivos, setFiltrosAtivos]   = useState<FiltroKey[]>(FILTROS_PADRAO_KEYS);
  const [filtroSelecoes, setFiltroSelecoes] = useState<FiltroSelecoes>(FILTRO_SELECOES_VAZIO);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const [abs, orcs, rats, preco] = await Promise.all([
          buscarAbastecimentos(),
          buscarOrcamentos(),
          buscarRateios(),
          buscarPreco(),
        ]);

        const jaInicializado = localStorage.getItem('supabase_inicializado');

        if (!jaInicializado) {
          const dadosParaUsar = abs.length > 0 ? abs : dadosProcessados;
          const orcsParaUsar  = orcs.length > 0 ? orcs : orcamentoInicial;
          setDados(dadosParaUsar);
          setOrcamento(orcsParaUsar);
          if (abs.length === 0) await atualizarAbastecimentos(dadosProcessados);
          if (orcs.length === 0) await salvarOrcamentos(orcamentoInicial);
          localStorage.setItem('supabase_inicializado', 'true');
        } else {
          setDados(abs);
          setOrcamento(orcs);
        }

        setRateios(rats);
        setParametros({ precoDiesel: preco });
        setOnline(true);
      } catch {
        setDados([]);
        setOrcamento([]);
        setOnline(false);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  const comSync = async (fn: () => Promise<void>) => {
    setSincronizando(true);
    try { await fn(); } finally { setSincronizando(false); }
  };

  const nextId = useMemo(() =>
    dados.length > 0 ? Math.max(...dados.map(d => d.id)) + 1 : 1
  , [dados]);

  const handleAdd = useCallback(async (item: Omit<Abastecimento, 'id' | 'valor'>) => {
    const novo: Abastecimento = { ...item, id: nextId, valor: item.litros * parametros.precoDiesel };
    setDados(prev => [novo, ...prev]);
    await comSync(() => adicionarAbastecimento(novo).then(() => {}));
  }, [nextId, parametros.precoDiesel]);

  const handleImport = useCallback(async (items: Omit<Abastecimento, 'id' | 'valor'>[]) => {
    let id = nextId;
    const novos: Abastecimento[] = items.map(item => ({ ...item, id: id++, valor: item.litros * parametros.precoDiesel }));
    setDados(prev => [...novos, ...prev]);
    await comSync(async () => { for (const n of novos) await adicionarAbastecimento(n); });
  }, [nextId, parametros.precoDiesel]);

  const handleDelete = useCallback(async (id: number) => {
    setDados(prev => prev.filter(d => d.id !== id));
    await comSync(() => deletarAbastecimento(id).then(() => {}));
  }, []);

  const handleClearAll = useCallback(async () => {
    setDados([]);
    await comSync(() => limparAbastecimentos().then(() => {}));
  }, []);

  const handleChangePreco = useCallback(async (valor: number) => {
    setParametros(prev => ({ ...prev, precoDiesel: valor }));
    setDados(prev => prev.map(d => ({ ...d, valor: d.litros * valor })));
    await comSync(() => salvarPreco(valor).then(() => {}));
  }, []);

  const handleUpdateOrcamento = useCallback(async (novoOrc: OrcamentoDiretoria[]) => {
    setOrcamento(novoOrc);
    await comSync(() => salvarOrcamentos(novoOrc).then(() => {}));
  }, []);

  const handleUpdateRateios = useCallback(async (novosRateios: RateioCC[]) => {
    setRateios(novosRateios);
    await comSync(() => salvarRateios(novosRateios).then(() => {}));
  }, []);

  const dadosRealizados = useMemo(() => {
    const ag: Record<string, number> = {};
    dados.forEach(d => { ag[d.diretoria] = (ag[d.diretoria] || 0) + d.litros * parametros.precoDiesel; });
    return Object.entries(ag).map(([diretoria, realizado]) => ({ diretoria, realizado }));
  }, [dados, parametros.precoDiesel]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard dados={dados} orcamento={orcamento} precoDiesel={parametros.precoDiesel} filtrosAtivos={filtrosAtivos} setFiltrosAtivos={setFiltrosAtivos} filtroSelecoes={filtroSelecoes} setFiltroSelecoes={setFiltroSelecoes} />;
      case 'base_dados':
        return <BaseDados dados={dados} precoDiesel={parametros.precoDiesel} onDelete={handleDelete} onClearAll={handleClearAll} />;
      case 'orcamento':
        return <Orcamento orcamento={orcamento} onUpdate={handleUpdateOrcamento} dadosRealizados={dadosRealizados} dados={dados} precoDiesel={parametros.precoDiesel} />;
      case 'preenchimento':
        return <Preenchimento onAdd={handleAdd} nextId={nextId} />;
      case 'importacao':
        return <Importacao onImport={handleImport} />;
      case 'exportacao':
        return <Exportacao dados={dados} orcamento={orcamento} precoDiesel={parametros.precoDiesel} />;
      case 'rateio':
        return <Rateio dados={dados} rateios={rateios} precoDiesel={parametros.precoDiesel} onSave={handleUpdateRateios} />;
      case 'parametros':
        return <Parametros precoDiesel={parametros.precoDiesel} onChangePreco={handleChangePreco} />;
      default: return null;
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-5">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Fuel className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-800">Controle de Abastecimento</h1>
            <p className="text-sm text-slate-500 mt-1">Conectando ao banco de dados...</p>
          </div>
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <Fuel className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 leading-tight">Controle de Abastecimento</h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-500">Sistema Corporativo de Gestão de Combustível</p>
                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${online ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {sincronizando ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : online ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                    {sincronizando ? 'Salvando...' : online ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            </div>
            <nav className="hidden lg:flex items-center gap-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
                    <Icon className="w-4 h-4" />{tab.label}
                  </button>
                );
              })}
            </nav>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-slate-200 overflow-hidden bg-white">
              <div className="px-4 py-3 space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                      <Icon className="w-4 h-4" />{tab.label}
                    </button>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <p>Controle de Abastecimento v1.0 — Sistema Corporativo</p>
            <p>Preço Diesel: R$ {parametros.precoDiesel.toFixed(2)}/L · {dados.length} registros · <span className={online ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>{online ? '🟢 Supabase conectado' : '🔴 Offline'}</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
