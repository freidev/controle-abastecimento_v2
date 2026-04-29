import { supabase } from './supabase';
import { Abastecimento, OrcamentoDiretoria, RateioCC } from '../types';

// ─── ABASTECIMENTOS ───────────────────────────────────────────────────────────

export async function buscarAbastecimentos(): Promise<Abastecimento[]> {
  const { data, error } = await supabase
    .from('abastecimentos')
    .select('*')
    .order('id', { ascending: false });

  if (error) { console.error('Erro ao buscar abastecimentos:', error); return []; }

  return (data || []).map(row => ({
    id:          row.id,
    ccNovo:      row.cc_novo      || '',
    diretoria:   row.diretoria    || '',
    gerencia:    row.gerencia     || '',
    areaLot:     row.area_lot     || '',
    fornecedor:  row.fornecedor   || '',
    equipamento: row.equipamento  || '',
    area:        row.area         || '',
    semana:      row.semana       || 1,
    data:        row.data         || '',
    litros:      row.litros       || 0,
    valor:       row.valor        || 0,
  }));
}

export async function adicionarAbastecimento(item: Abastecimento): Promise<boolean> {
  const { error } = await supabase.from('abastecimentos').insert({
    id:          item.id,
    cc_novo:     item.ccNovo,
    diretoria:   item.diretoria,
    gerencia:    item.gerencia,
    area_lot:    item.areaLot,
    fornecedor:  item.fornecedor,
    equipamento: item.equipamento,
    area:        item.area,
    semana:      item.semana,
    data:        item.data,
    litros:      item.litros,
    valor:       item.valor,
  });
  if (error) { console.error('Erro ao adicionar abastecimento:', error); return false; }
  return true;
}

export async function deletarAbastecimento(id: number): Promise<boolean> {
  const { error } = await supabase.from('abastecimentos').delete().eq('id', id);
  if (error) { console.error('Erro ao deletar abastecimento:', error); return false; }
  return true;
}

export async function limparAbastecimentos(): Promise<boolean> {
  const { error } = await supabase.from('abastecimentos').delete().neq('id', -1);
  if (error) { console.error('Erro ao limpar abastecimentos:', error); return false; }
  return true;
}

export async function atualizarAbastecimentos(items: Abastecimento[]): Promise<boolean> {
  await limparAbastecimentos();
  if (items.length === 0) return true;
  const rows = items.map(item => ({
    id:          item.id,
    cc_novo:     item.ccNovo,
    diretoria:   item.diretoria,
    gerencia:    item.gerencia,
    area_lot:    item.areaLot,
    fornecedor:  item.fornecedor,
    equipamento: item.equipamento,
    area:        item.area,
    semana:      item.semana,
    data:        item.data,
    litros:      item.litros,
    valor:       item.valor,
  }));
  const { error } = await supabase.from('abastecimentos').insert(rows);
  if (error) { console.error('Erro ao atualizar abastecimentos:', error); return false; }
  return true;
}

// ─── ORÇAMENTOS ───────────────────────────────────────────────────────────────

export async function buscarOrcamentos(): Promise<OrcamentoDiretoria[]> {
  const { data, error } = await supabase
    .from('orcamentos')
    .select('*')
    .order('diretoria');

  if (error) { console.error('Erro ao buscar orçamentos:', error); return []; }

  return (data || []).map(row => ({
    diretoria:  row.diretoria,
    orcamento:  row.orcamento,
    dataInicio: row.data_inicio || undefined,
    dataFim:    row.data_fim    || undefined,
  }));
}

export async function salvarOrcamentos(items: OrcamentoDiretoria[]): Promise<boolean> {
  await supabase.from('orcamentos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (items.length === 0) return true;
  const rows = items.map(item => ({
    diretoria:   item.diretoria,
    orcamento:   item.orcamento,
    data_inicio: item.dataInicio || null,
    data_fim:    item.dataFim    || null,
  }));
  const { error } = await supabase.from('orcamentos').insert(rows);
  if (error) { console.error('Erro ao salvar orçamentos:', error); return false; }
  return true;
}

// ─── RATEIOS ──────────────────────────────────────────────────────────────────

export async function buscarRateios(): Promise<RateioCC[]> {
  const { data, error } = await supabase
    .from('rateios')
    .select('*')
    .order('criado_em');

  if (error) { console.error('Erro ao buscar rateios:', error); return []; }

  return (data || []).map(row => ({
    id:          row.id,
    equipamento: row.equipamento,
    gerencia:    row.gerencia  || '',
    descricao:   row.descricao || '',
    parcelas:    row.parcelas  || [],
    ativo:       row.ativo,
    criadoEm:    row.criado_em,
  }));
}

export async function salvarRateios(items: RateioCC[]): Promise<boolean> {
  await supabase.from('rateios').delete().neq('id', '');
  if (items.length === 0) return true;
  const rows = items.map(item => ({
    id:          item.id,
    equipamento: item.equipamento,
    gerencia:    item.gerencia || '',
    descricao:   item.descricao,
    parcelas:    item.parcelas,
    ativo:       item.ativo,
    criado_em:   item.criadoEm,
  }));
  const { error } = await supabase.from('rateios').insert(rows);
  if (error) { console.error('Erro ao salvar rateios:', error); return false; }
  return true;
}

// ─── PARÂMETROS ───────────────────────────────────────────────────────────────

export async function buscarPreco(): Promise<number> {
  const { data, error } = await supabase
    .from('parametros')
    .select('preco_diesel')
    .eq('id', 1)
    .single();
  if (error) { console.error('Erro ao buscar preço:', error); return 5.89; }
  return data?.preco_diesel || 5.89;
}

export async function salvarPreco(preco: number): Promise<boolean> {
  const { error } = await supabase
    .from('parametros')
    .upsert({ id: 1, preco_diesel: preco });
  if (error) { console.error('Erro ao salvar preço:', error); return false; }
  return true;
}
