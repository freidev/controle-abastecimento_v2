import { Abastecimento, OrcamentoDiretoria } from '../types';

function gerarData(diasAtras: number): string {
  const data = new Date();
  data.setDate(data.getDate() - diasAtras);
  return data.toISOString().split('T')[0];
}

function getSemana(dataStr: string): number {
  const data = new Date(dataStr);
  const dia = data.getDate();
  if (dia <= 7) return 1;
  if (dia <= 14) return 2;
  if (dia <= 21) return 3;
  if (dia <= 28) return 4;
  return 5;
}

export const dadosIniciais: Abastecimento[] = [
  { id: 1, ccNovo: 'CC-OP-001', diretoria: 'Operações', gerencia: 'Mineração', areaLot: 'Mina A', fornecedor: 'Posto Shell', equipamento: 'Caminhão CA-001', area: 'Produção', semana: 1, data: gerarData(45), litros: 320, valor: 0 },
  { id: 2, ccNovo: 'CC-OP-002', diretoria: 'Operações', gerencia: 'Mineração', areaLot: 'Mina A', fornecedor: 'Posto Shell', equipamento: 'Caminhão CA-002', area: 'Produção', semana: 1, data: gerarData(44), litros: 285, valor: 0 },
  { id: 3, ccNovo: 'CC-OP-003', diretoria: 'Operações', gerencia: 'Processamento', areaLot: 'Usina', fornecedor: 'Posto Ipiranga', equipamento: 'Escavadeira EX-001', area: 'Produção', semana: 1, data: gerarData(43), litros: 410, valor: 0 },
  { id: 4, ccNovo: 'CC-MN-001', diretoria: 'Manutenção', gerencia: 'Mecânica', areaLot: 'Pátio', fornecedor: 'Posto BR', equipamento: 'Pá Carregadeira PC-001', area: 'Manutenção', semana: 1, data: gerarData(42), litros: 195, valor: 0 },
  { id: 5, ccNovo: 'CC-LG-001', diretoria: 'Logística', gerencia: 'Transporte', areaLot: 'Base Logística', fornecedor: 'Posto Ale', equipamento: 'Caminhão CA-003', area: 'Transporte', semana: 1, data: gerarData(41), litros: 350, valor: 0 },
  { id: 6, ccNovo: 'CC-AD-001', diretoria: 'Administrativo', gerencia: 'RH', areaLot: 'Escritório Central', fornecedor: 'Auto Posto Central', equipamento: 'Pickup PK-001', area: 'Administrativo', semana: 1, data: gerarData(40), litros: 45, valor: 0 },
  { id: 7, ccNovo: 'CC-SG-001', diretoria: 'Segurança', gerencia: 'Patrimonial', areaLot: 'Portaria', fornecedor: 'Posto Shell', equipamento: 'Pickup PK-002', area: 'Segurança', semana: 2, data: gerarData(39), litros: 52, valor: 0 },
  { id: 8, ccNovo: 'CC-OP-004', diretoria: 'Operações', gerencia: 'Britagem', areaLot: 'Mina B', fornecedor: 'Posto Ipiranga', equipamento: 'Trator TR-001', area: 'Produção', semana: 2, data: gerarData(38), litros: 275, valor: 0 },
  { id: 9, ccNovo: 'CC-OP-005', diretoria: 'Operações', gerencia: 'Mineração', areaLot: 'Mina A', fornecedor: 'Posto BR', equipamento: 'Caminhão CA-001', area: 'Produção', semana: 2, data: gerarData(37), litros: 310, valor: 0 },
  { id: 10, ccNovo: 'CC-MN-002', diretoria: 'Manutenção', gerencia: 'Elétrica', areaLot: 'Usina', fornecedor: 'Posto Ale', equipamento: 'Gerador GE-001', area: 'Manutenção', semana: 2, data: gerarData(36), litros: 180, valor: 0 },
  { id: 11, ccNovo: 'CC-LG-002', diretoria: 'Logística', gerencia: 'Armazenamento', areaLot: 'Pátio', fornecedor: 'Auto Posto Central', equipamento: 'Empilhadeira EM-001', area: 'Transporte', semana: 2, data: gerarData(35), litros: 65, valor: 0 },
  { id: 12, ccNovo: 'CC-AD-002', diretoria: 'Administrativo', gerencia: 'Financeiro', areaLot: 'Escritório Central', fornecedor: 'Posto Shell', equipamento: 'Pickup PK-003', area: 'Administrativo', semana: 3, data: gerarData(34), litros: 38, valor: 0 },
  { id: 13, ccNovo: 'CC-SG-002', diretoria: 'Segurança', gerencia: 'Ambiental', areaLot: 'Mina A', fornecedor: 'Posto Ipiranga', equipamento: 'Van VN-001', area: 'Segurança', semana: 3, data: gerarData(33), litros: 48, valor: 0 },
  { id: 14, ccNovo: 'CC-OP-006', diretoria: 'Operações', gerencia: 'Processamento', areaLot: 'Usina', fornecedor: 'Posto BR', equipamento: 'Escavadeira EX-002', area: 'Produção', semana: 3, data: gerarData(32), litros: 395, valor: 0 },
  { id: 15, ccNovo: 'CC-OP-007', diretoria: 'Operações', gerencia: 'Mineração', areaLot: 'Mina A', fornecedor: 'Posto Ale', equipamento: 'Caminhão CA-002', area: 'Produção', semana: 3, data: gerarData(31), litros: 290, valor: 0 },
  { id: 16, ccNovo: 'CC-MN-003', diretoria: 'Manutenção', gerencia: 'Civil', areaLot: 'Mina B', fornecedor: 'Auto Posto Central', equipamento: 'Retroescavadeira RE-001', area: 'Manutenção', semana: 3, data: gerarData(30), litros: 220, valor: 0 },
  { id: 17, ccNovo: 'CC-LG-003', diretoria: 'Logística', gerencia: 'Distribuição', areaLot: 'Base Logística', fornecedor: 'Posto Shell', equipamento: 'Caminhão CA-003', area: 'Transporte', semana: 3, data: gerarData(29), litros: 340, valor: 0 },
  { id: 18, ccNovo: 'CC-AD-003', diretoria: 'Administrativo', gerencia: 'TI', areaLot: 'Escritório Central', fornecedor: 'Posto Ipiranga', equipamento: 'Pickup PK-001', area: 'Administrativo', semana: 4, data: gerarData(28), litros: 42, valor: 0 },
  { id: 19, ccNovo: 'CC-SG-003', diretoria: 'Segurança', gerencia: 'Ocupacional', areaLot: 'Usina', fornecedor: 'Posto BR', equipamento: 'Ônibus ON-001', area: 'Segurança', semana: 4, data: gerarData(27), litros: 185, valor: 0 },
  { id: 20, ccNovo: 'CC-OP-008', diretoria: 'Operações', gerencia: 'Britagem', areaLot: 'Mina B', fornecedor: 'Posto Ale', equipamento: 'Trator TR-002', area: 'Produção', semana: 4, data: gerarData(26), litros: 260, valor: 0 },
  { id: 21, ccNovo: 'CC-OP-009', diretoria: 'Operações', gerencia: 'Mineração', areaLot: 'Mina A', fornecedor: 'Auto Posto Central', equipamento: 'Caminhão CA-001', area: 'Produção', semana: 4, data: gerarData(25), litros: 325, valor: 0 },
  { id: 22, ccNovo: 'CC-MN-004', diretoria: 'Manutenção', gerencia: 'Mecânica', areaLot: 'Pátio', fornecedor: 'Posto Shell', equipamento: 'Pá Carregadeira PC-002', area: 'Manutenção', semana: 4, data: gerarData(24), litros: 205, valor: 0 },
  { id: 23, ccNovo: 'CC-LG-004', diretoria: 'Logística', gerencia: 'Transporte', areaLot: 'Base Logística', fornecedor: 'Posto Ipiranga', equipamento: 'Caminhão CA-003', area: 'Transporte', semana: 4, data: gerarData(23), litros: 355, valor: 0 },
  { id: 24, ccNovo: 'CC-AD-004', diretoria: 'Administrativo', gerencia: 'RH', areaLot: 'Escritório Central', fornecedor: 'Posto BR', equipamento: 'Pickup PK-002', area: 'Administrativo', semana: 5, data: gerarData(22), litros: 50, valor: 0 },
  { id: 25, ccNovo: 'CC-SG-004', diretoria: 'Segurança', gerencia: 'Patrimonial', areaLot: 'Portaria', fornecedor: 'Posto Ale', equipamento: 'Pickup PK-003', area: 'Segurança', semana: 5, data: gerarData(21), litros: 46, valor: 0 },
  { id: 26, ccNovo: 'CC-OP-010', diretoria: 'Operações', gerencia: 'Processamento', areaLot: 'Usina', fornecedor: 'Auto Posto Central', equipamento: 'Escavadeira EX-001', area: 'Produção', semana: 5, data: gerarData(20), litros: 420, valor: 0 },
  { id: 27, ccNovo: 'CC-OP-011', diretoria: 'Operações', gerencia: 'Mineração', areaLot: 'Mina A', fornecedor: 'Posto Shell', equipamento: 'Caminhão CA-002', area: 'Produção', semana: 5, data: gerarData(19), litros: 295, valor: 0 },
  { id: 28, ccNovo: 'CC-MN-005', diretoria: 'Manutenção', gerencia: 'Elétrica', areaLot: 'Usina', fornecedor: 'Posto Ipiranga', equipamento: 'Gerador GE-002', area: 'Manutenção', semana: 5, data: gerarData(18), litros: 175, valor: 0 },
  { id: 29, ccNovo: 'CC-LG-005', diretoria: 'Logística', gerencia: 'Armazenamento', areaLot: 'Pátio', fornecedor: 'Posto BR', equipamento: 'Empilhadeira EM-001', area: 'Transporte', semana: 1, data: gerarData(17), litros: 70, valor: 0 },
  { id: 30, ccNovo: 'CC-AD-005', diretoria: 'Administrativo', gerencia: 'Financeiro', areaLot: 'Escritório Central', fornecedor: 'Posto Ale', equipamento: 'Pickup PK-001', area: 'Administrativo', semana: 1, data: gerarData(16), litros: 40, valor: 0 },
  { id: 31, ccNovo: 'CC-SG-005', diretoria: 'Segurança', gerencia: 'Ambiental', areaLot: 'Mina B', fornecedor: 'Auto Posto Central', equipamento: 'Van VN-001', area: 'Segurança', semana: 1, data: gerarData(15), litros: 52, valor: 0 },
  { id: 32, ccNovo: 'CC-OP-012', diretoria: 'Operações', gerencia: 'Britagem', areaLot: 'Mina B', fornecedor: 'Posto Shell', equipamento: 'Trator TR-001', area: 'Produção', semana: 2, data: gerarData(14), litros: 270, valor: 0 },
  { id: 33, ccNovo: 'CC-OP-013', diretoria: 'Operações', gerencia: 'Mineração', areaLot: 'Mina A', fornecedor: 'Posto Ipiranga', equipamento: 'Caminhão CA-001', area: 'Produção', semana: 2, data: gerarData(13), litros: 315, valor: 0 },
  { id: 34, ccNovo: 'CC-MN-006', diretoria: 'Manutenção', gerencia: 'Civil', areaLot: 'Mina A', fornecedor: 'Posto BR', equipamento: 'Motoniveladora MN-001', area: 'Manutenção', semana: 2, data: gerarData(12), litros: 240, valor: 0 },
  { id: 35, ccNovo: 'CC-LG-006', diretoria: 'Logística', gerencia: 'Distribuição', areaLot: 'Base Logística', fornecedor: 'Posto Ale', equipamento: 'Caminhão CA-003', area: 'Transporte', semana: 2, data: gerarData(11), litros: 360, valor: 0 },
  { id: 36, ccNovo: 'CC-AD-006', diretoria: 'Administrativo', gerencia: 'TI', areaLot: 'Escritório Central', fornecedor: 'Auto Posto Central', equipamento: 'Pickup PK-002', area: 'Administrativo', semana: 3, data: gerarData(10), litros: 44, valor: 0 },
  { id: 37, ccNovo: 'CC-SG-006', diretoria: 'Segurança', gerencia: 'Ocupacional', areaLot: 'Usina', fornecedor: 'Posto Shell', equipamento: 'Ônibus ON-001', area: 'Segurança', semana: 3, data: gerarData(9), litros: 190, valor: 0 },
  { id: 38, ccNovo: 'CC-OP-014', diretoria: 'Operações', gerencia: 'Processamento', areaLot: 'Usina', fornecedor: 'Posto Ipiranga', equipamento: 'Escavadeira EX-002', area: 'Produção', semana: 3, data: gerarData(8), litros: 400, valor: 0 },
  { id: 39, ccNovo: 'CC-OP-015', diretoria: 'Operações', gerencia: 'Mineração', areaLot: 'Mina A', fornecedor: 'Posto BR', equipamento: 'Caminhão CA-002', area: 'Produção', semana: 3, data: gerarData(7), litros: 300, valor: 0 },
  { id: 40, ccNovo: 'CC-MN-007', diretoria: 'Manutenção', gerencia: 'Mecânica', areaLot: 'Pátio', fornecedor: 'Posto Ale', equipamento: 'Rolo Compactador RC-001', area: 'Manutenção', semana: 4, data: gerarData(6), litros: 210, valor: 0 },
  { id: 41, ccNovo: 'CC-LG-007', diretoria: 'Logística', gerencia: 'Transporte', areaLot: 'Base Logística', fornecedor: 'Auto Posto Central', equipamento: 'Caminhão CA-003', area: 'Transporte', semana: 4, data: gerarData(5), litros: 345, valor: 0 },
  { id: 42, ccNovo: 'CC-AD-007', diretoria: 'Administrativo', gerencia: 'RH', areaLot: 'Escritório Central', fornecedor: 'Posto Shell', equipamento: 'Pickup PK-003', area: 'Administrativo', semana: 4, data: gerarData(4), litros: 48, valor: 0 },
  { id: 43, ccNovo: 'CC-SG-007', diretoria: 'Segurança', gerencia: 'Patrimonial', areaLot: 'Portaria', fornecedor: 'Posto Ipiranga', equipamento: 'Pickup PK-001', area: 'Segurança', semana: 5, data: gerarData(3), litros: 55, valor: 0 },
  { id: 44, ccNovo: 'CC-OP-016', diretoria: 'Operações', gerencia: 'Britagem', areaLot: 'Mina B', fornecedor: 'Posto BR', equipamento: 'Trator TR-002', area: 'Produção', semana: 5, data: gerarData(2), litros: 265, valor: 0 },
  { id: 45, ccNovo: 'CC-OP-017', diretoria: 'Operações', gerencia: 'Mineração', areaLot: 'Mina A', fornecedor: 'Posto Ale', equipamento: 'Caminhão CA-001', area: 'Produção', semana: 5, data: gerarData(1), litros: 330, valor: 0 },
  { id: 46, ccNovo: 'CC-MN-008', diretoria: 'Manutenção', gerencia: 'Elétrica', areaLot: 'Usina', fornecedor: 'Auto Posto Central', equipamento: 'Gerador GE-001', area: 'Manutenção', semana: 5, data: gerarData(0), litros: 185, valor: 0 },
];

export const dadosProcessados = dadosIniciais.map(d => ({
  ...d,
  semana: getSemana(d.data),
}));

export const orcamentoInicial: OrcamentoDiretoria[] = [
  { diretoria: 'Operações',      orcamento: 85000 },
  { diretoria: 'Manutenção',     orcamento: 42000 },
  { diretoria: 'Logística',      orcamento: 38000 },
  { diretoria: 'Administrativo', orcamento: 12000 },
  { diretoria: 'Segurança',      orcamento: 18000 },
];

export const parametrosInicial = {
  precoDiesel: 5.89,
};
