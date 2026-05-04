export interface Abastecimento {
  id: number;
  ccNovo: string;
  diretoria: string;
  gerencia: string;
  areaLot: string;
  fornecedor: string;
  equipamento: string;
  area: string;
  semana: number;
  data: string;
  litros: number;
  valor: number;
}

export interface OrcamentoDiretoria {
  diretoria: string;
  orcamento: number;
  dataInicio?: string;  // YYYY-MM-DD
  dataFim?: string;     // YYYY-MM-DD
}

// ── Rateio de Centro de Custo ─────────────────────────────────────────────
export interface RateioCC {
  id: string;
  equipamento: string;
  gerencia: string;            // gerência principal (compatibilidade)
  descricao: string;
  parcelas: RateioParcela[];   // sempre deve somar 100%
  ativo: boolean;
  criadoEm: string;
}

export interface RateioParcela {
  ccNovo: string;              // ex: "42105500"
  descricaoCC: string;         // ex: "Mina A – Operações"
  percentual: number;          // 0-100, soma total = 100
  gerencia?: string;           // gerência vinculada a esta parcela específica
}

// Resultado calculado de um rateio sobre um abastecimento
export interface RateioResultado {
  abastecimentoId: number;
  equipamento: string;
  data: string;
  litrosTotal: number;
  valorTotal: number;
  parcelas: {
    ccNovo: string;
    descricaoCC: string;
    percentual: number;
    litros: number;
    valor: number;
  }[];
}

export interface ParametrosSistema {
  precoDiesel: number;
}

export type TabType = 'dashboard' | 'base_dados' | 'parametros' | 'preenchimento' | 'importacao' | 'orcamento' | 'exportacao' | 'rateio' | 'cadastro_equipamento' | 'usuarios';

// ── Cadastro de Equipamento ───────────────────────────────────────────────────
export interface Equipamento {
  id: string;
  equipamento: string;
  ccNovo: string[];       // pode ter mais de um CC
  gerencia: string;
  areaLot: string;
  area: string;
  fornecedor: string;
  placa: string;
  ativo: boolean;
  criadoEm: string;
}

// ── Estado persistente dos filtros do Dashboard ───────────────────────────────
export type FiltroKey =
  | 'semana' | 'diretoria' | 'gerencia' | 'areaLot'
  | 'equipamento' | 'ccNovo' | 'fornecedor' | 'area'
  | 'dia' | 'mes' | 'ano';

export type FiltroSelecoes = Record<FiltroKey, string[]>;

export const FILTROS_PADRAO_KEYS: FiltroKey[] = ['semana', 'diretoria', 'gerencia', 'areaLot', 'equipamento'];

export const FILTRO_SELECOES_VAZIO: FiltroSelecoes = {
  semana: [], diretoria: [], gerencia: [], areaLot: [],
  equipamento: [], ccNovo: [], fornecedor: [], area: [],
  dia: [], mes: [], ano: [],
};

export const DIRETORIAS = [
  'Operações',
  'Manutenção',
  'Logística',
  'Administrativo',
  'Segurança',
];

export const GERENCIAS: Record<string, string[]> = {
  'Operações': ['Mineração', 'Processamento', 'Britagem'],
  'Manutenção': ['Mecânica', 'Elétrica', 'Civil'],
  'Logística': ['Transporte', 'Armazenamento', 'Distribuição'],
  'Administrativo': ['RH', 'Financeiro', 'TI'],
  'Segurança': ['Patrimonial', 'Ambiental', 'Ocupacional'],
};

export const AREAS_LOT = [
  'Mina A',
  'Mina B',
  'Usina',
  'Pátio',
  'Escritório Central',
  'Base Logística',
  'Portaria',
];

export const FORNECEDORES = [
  'Posto Shell',
  'Posto Ipiranga',
  'Posto BR',
  'Posto Ale',
  'Auto Posto Central',
];

export const EQUIPAMENTOS = [
  'Caminhão CA-001',
  'Caminhão CA-002',
  'Caminhão CA-003',
  'Escavadeira EX-001',
  'Escavadeira EX-002',
  'Pá Carregadeira PC-001',
  'Pá Carregadeira PC-002',
  'Trator TR-001',
  'Trator TR-002',
  'Retroescavadeira RE-001',
  'Gerador GE-001',
  'Gerador GE-002',
  'Empilhadeira EM-001',
  'Pickup PK-001',
  'Pickup PK-002',
  'Pickup PK-003',
  'Ônibus ON-001',
  'Van VN-001',
  'Motoniveladora MN-001',
  'Rolo Compactador RC-001',
];

export const AREAS = [
  'Produção',
  'Manutenção',
  'Transporte',
  'Administrativo',
  'Segurança',
];
