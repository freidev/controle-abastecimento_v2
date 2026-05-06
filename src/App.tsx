import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Database, Settings, FilePlus, Upload, Wallet,
  Menu, X, FileDown, GitFork, Loader2, Wifi, WifiOff, Wrench, LogOut, Users, History
} from 'lucide-react';
import {
  Abastecimento, OrcamentoDiretoria, RateioCC, TabType, Equipamento,
  FiltroKey, FiltroSelecoes, FILTROS_PADRAO_KEYS, FILTRO_SELECOES_VAZIO,
} from './types';
import { parametrosInicial } from './data/initialData';
import {
  buscarAbastecimentos, adicionarAbastecimento, deletarAbastecimento,
  limparAbastecimentos, atualizarAbastecimentos,
  buscarOrcamentos, salvarOrcamentos,
  buscarRateios, salvarRateios,
  buscarPreco, salvarPreco,
} from './lib/db';
import Dashboard              from './components/Dashboard';
import BaseDados              from './components/BaseDados';
import Parametros             from './components/Parametros';
import Preenchimento          from './components/Preenchimento';
import Importacao             from './components/Importacao';
import Orcamento              from './components/Orcamento';
import Exportacao             from './components/Exportacao';
import Rateio                 from './components/Rateio';
import CadastroEquipamento    from './components/CadastroEquipamento';
import GerenciarUsuarios      from './components/GerenciarUsuarios';
import Historico              from './components/Historico';
import LogoStratos            from './components/LogoStratos';
import Login                  from './components/Login';
import { useAuth }            from './contexts/AuthContext';

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard',             label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'base_dados',           label: 'Base de Dados',   icon: Database        },
  { id: 'orcamento',            label: 'Orçamento',       icon: Wallet          },
  { id: 'rateio',               label: 'Rateio CC',       icon: GitFork         },
  { id: 'cadastro_equipamento', label: 'Equipamentos',    icon: Wrench          },
  { id: 'historico',            label: 'Histórico',       icon: History         },
  { id: 'preenchimento',        label: 'Preenchimento',   icon: FilePlus        },
  { id: 'importacao',           label: 'Importação',      icon: Upload          },
  { id: 'exportacao',           label: 'Exportação',      icon: FileDown        },
  { id: 'parametros',           label: 'Parâmetros',      icon: Settings        },
  { id: 'usuarios',             label: 'Usuários',        icon: Users           },
];

export default function App() {
  const { user, podeAcessar } = useAuth();

  // Se não estiver logado, mostra a tela de Login
  if (!user) return <Login />;

  // CORREÇÃO: Define a aba inicial baseada no perfil (Operador vai direto para Preenchimento)
  const getInitialTab = () => {
    if (user.role === 'operador') return 'preenchimento';
    return 'dashboard';
  };

  const [activeTab, setActiveTab]   = useState<TabType>(getInitialTab());
  const [dados, setDados]           = useState<Abastecimento[]>([]);
  const [orcamento, setOrcamento]   = useState<OrcamentoDiretoria[]>([]);
  const [rateios, setRateios]       = useState<RateioCC[]>([]);
  const [equipamentosCad, setEquipamentosCad] = useState<Equipamento[]>([]);
  const [parametros, setParametros] = useState(parametrosInicial);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [online, setOnline]         = useState(true);
  const [sincronizando, setSincronizando] = useState(false);

  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltroKey[]>(FILTROS_PADRAO_KEYS);
  const [filtroSelecoes, setFiltroSelecoes] = useState<FiltroSelecoes>(FILTRO_SELECOES_VAZIO);

  const setFiltrosAtivosComSalvar = useCallback((action: React.SetStateAction<FiltroKey[]>) => {
    setFiltrosAtivos(prev => {
      const proximo = typeof action === 'function' ? action(prev) : action;
      try { localStorage.setItem('dashboard_filtros_ativos', JSON.stringify(proximo)); } catch { /* ignora */ }
      return proximo;
    });
  }, []);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const [abs, orcs, rats, preco] = await Promise.all([
          buscarAbastecimentos(), buscarOrcamentos(), buscarRateios(), buscarPreco(),
        ]);
        setDados(abs); setOrcamento(orcs); setRateios(rats);
        setParametros({ precoDiesel: preco });
        setOnline(true);
      } catch {
        setDados([]); setOrcamento([]); setOnline(false);
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

  // CORREÇÃO: Garante que o nome do usuário logado é salvo corretamente
  const handleAdd = useCallback(async (item: Omit<Abastecimento, 'id' | 'valor'>) => {
    const novo: Abastecimento = {
      ...item,
      id: nextId,
      valor: item.litros * parametros.precoDiesel,
      usuario_responsavel: user?.nome || 'Sistema',
      data_hora_registro: new Date().toISOString()
    };
    setDados(prev => [novo, ...prev]);
    await comSync(() => adicionarAbastecimento(novo).then(() => {}));
  }, [nextId, parametros.precoDiesel, user]);

  const handleImport = useCallback(async (items: Omit<Abastecimento, 'id' | 'valor'>[]) => {
    let id = nextId;
    const novos: Abastecimento[] = items.map(item => ({
      ...item,
      id: id++,
      valor: item.litros * parametros.precoDiesel,
      usuario_responsavel: user?.nome || 'Sistema',
      data_hora_registro: new Date().toISOString()
    }));
    setDados(prev => [...novos, ...prev]);
    await comSync(async () => { for (const n of novos) await adicionarAbastecimento(n); });
  }, [nextId, parametros.precoDiesel, user]);

  const handleDelete = useCallback(async (id: number) => {
    setDados(prev => prev.filter(d => d.id !== id));
    await comSync(() => deletarAbastecimento(id).then(() => {}));
  }, []);

  const handleClearAll = useCallback(async () => {
    setDados([]);
    await comSync(() => limparAbastecimentos().then(() => {}));
  }, []);

  const handleEdit = useCallback(async (itemAtualizado: Abastecimento) => {
    setDados(prev => prev.map(d => d.id === itemAtualizado.id ? itemAtualizado : d));
    await comSync(async () => {
      const { supabase } = await import('./lib/supabase');
      await supabase.from('abastecimentos').update({
        cc_novo: itemAtualizado.ccNovo, diretoria: itemAtualizado.diretoria,
        gerencia: itemAtualizado.gerencia, area_lot: itemAtualizado.areaLot,
        fornecedor: itemAtualizado.fornecedor, equipamento: itemAtualizado.equipamento,
        area: itemAtualizado.area, semana: itemAtualizado.semana,
        data: itemAtualizado.data, litros: itemAtualizado.litros, valor: itemAtualizado.valor,
      }).eq('id', itemAtualizado.id);
    });
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
    dados.forEach(d => {
      ag[d.diretoria] = (ag[d.diretoria] || 0) + d.litros * parametros.precoDiesel;
    });
    return Object.entries(ag).map(([diretoria, realizado]) => ({ diretoria, realizado }));
  }, [dados, parametros.precoDiesel]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            dados={dados} orcamento={orcamento}
            precoDiesel={parametros.precoDiesel} rateios={rateios}
            filtrosAtivos={filtrosAtivos}
            setFiltrosAtivos={setFiltrosAtivosComSalvar}
            filtroSelecoes={filtroSelecoes}
            setFiltroSelecoes={setFiltroSelecoes}
          />
        );
      case 'base_dados':
        return (
          <BaseDados
            dados={dados}
            precoDiesel={parametros.precoDiesel}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
            onEdit={handleEdit}
            equipamentosCad={equipamentosCad}
            onSaveEquipamentos={setEquipamentosCad}
          />
        );
      case 'orcamento':
        return (
          <Orcamento
            orcamento={orcamento}
            onUpdate={handleUpdateOrcamento}
            dadosRealizados={dadosRealizados}
            dados={dados}
            precoDiesel={parametros.precoDiesel}
          />
        );
      case 'preenchimento':
        return <Preenchimento onAdd={handleAdd} nextId={nextId} dados={dados} equipamentosCad={equipamentosCad} />;
      case 'importacao':
        return <Importacao onImport={handleImport} />;
      case 'exportacao':
        return <Exportacao dados={dados} orcamento={orcamento} precoDiesel={parametros.precoDiesel} />;
      case 'rateio':
        return <Rateio dados={dados} rateios={rateios} precoDiesel={parametros.precoDiesel} onSave={handleUpdateRateios} />;
      case 'cadastro_equipamento':
        return <CadastroEquipamento equipamentos={equipamentosCad} onSave={setEquipamentosCad} dados={dados} />;
      case 'usuarios':
        return <GerenciarUsuarios />;
      case 'historico':
        return <Historico />;
      case 'parametros':
        return <Parametros precoDiesel={parametros.precoDiesel} onChangePreco={handleChangePreco} />;
      default: return null;
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1C2340' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-5">
          <LogoStratos height={60} />
          <div className="text-center">
            <h1 className="text-xl font-bold" style={{ color: '#1C2340' }}>Controle de Abastecimento</h1>
            <p className="text-sm text-slate-500 mt-1">Conectando ao banco de dados...</p>
          </div>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8B1E2B' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-50 shadow-sm" style={{ background: '#1C2340', borderBottom: '1px solid #2A3356' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 overflow-hidden">

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-white rounded-lg px-2 py-1 flex items-center flex-shrink-0">
                <LogoStratos height={28} soloIcone />
              </div>
              <div className={`hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
                online ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'
              }`}>
                {sincronizando ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : online ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                <span>{sincronizando ? 'Salvando...' : online ? 'Online' : 'Offline'}</span>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-0.5 flex-1 overflow-x-auto min-w-0 scrollbar-none">
              {tabs.filter(t => podeAcessar(t.id)).map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                    style={isActive ? { background: '#8B1E2B' } : {}}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />{tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
              <div className="hidden xl:flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 max-w-[160px]">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${user?.role === 'admin' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                <span className="text-xs font-medium text-slate-200 truncate">{user?.nome}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${
                  user?.role === 'admin' ? 'bg-rose-900 text-rose-300' : 'bg-emerald-900 text-emerald-300'
                }`}>
                  {user?.role === 'admin' ? 'Admin' : 'Op'}
                </span>
              </div>
              <button onClick={() => window.location.reload()} title="Sair"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap border border-white/10 flex-shrink-0">
                <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">Sair</span>
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden"
              style={{ background: '#1C2340', borderTop: '1px solid #2A3356' }}
            >
              <div className="px-4 py-3 space-y-1">
                {tabs.filter(t => podeAcessar(t.id)).map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-200 hover:text-white hover:bg-white/10"
                      style={activeTab === tab.id ? { background: '#8B1E2B', color: 'white' } : {}}
                    >
                      <Icon className="w-4 h-4" />{tab.label}
                    </button>
                  );
                })}
                <div className="pt-2 mt-2 border-t border-white/10">
                   <button onClick={() => window.location.reload()} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-white/10">
                     <LogOut className="w-4 h-4" /> Sair da conta
                   </button>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <p>Controle de Abastecimento v1.0 — Sistema Corporativo</p>
            <p>
              Preço Diesel: R$ {parametros.precoDiesel.toFixed(2)}/L · {dados.length} registros ·{' '}
              <span className={online ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>
                {online ? '🟢 Supabase conectado' : '🔴 Offline'}
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
