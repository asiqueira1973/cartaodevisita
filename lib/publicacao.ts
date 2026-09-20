// Condições para publicar o cartão (critério 8.7.2).
//
// Pura e testável: a mesma função decide se o botão fica habilitado no cliente
// e se a rota aceita no servidor. Duas implementações divergiriam, e a
// divergência apareceria como botão habilitado que dá erro ao clicar.

import type { Cartao } from '@/types/dominio'

/** Por que não dá para publicar, ou `null` quando dá. */
export type MotivoParaNaoPublicar = 'sem_nome' | 'sem_link'

/**
 * Diz se o cartão pode ir ao ar (regra 11.4 e critério 8.7.2).
 *
 * Nome e ao menos um link são o mínimo para o cartão servir para alguma coisa:
 * sem nome ninguém sabe quem é, e sem link não há o que fazer com a página.
 */
export function motivoParaNaoPublicar(cartao: Cartao): MotivoParaNaoPublicar | null {
  if (!cartao.nome_exibicao.trim()) return 'sem_nome'
  if (cartao.links.length === 0) return 'sem_link'
  return null
}

/** Soma as visitas de um período, campo a campo (critério 8.7.7). */
export interface ResumoDeVisitas {
  total: number
  por_link: number
  por_codigo: number
  salvou_contato: number
  abriu_whatsapp: number
}

export function somarVisitas(
  dias: { total?: number; por_link?: number; por_codigo?: number; salvou_contato?: number; abriu_whatsapp?: number }[],
): ResumoDeVisitas {
  // `?? 0` em cada campo porque documento antigo, criado antes da correção que
  // inicializa os contadores, pode não ter todos — e `undefined` numa soma
  // produz NaN, que aparece na tela como "NaN visitas".
  return dias.reduce<ResumoDeVisitas>(
    (soma, dia) => ({
      total: soma.total + (dia.total ?? 0),
      por_link: soma.por_link + (dia.por_link ?? 0),
      por_codigo: soma.por_codigo + (dia.por_codigo ?? 0),
      salvou_contato: soma.salvou_contato + (dia.salvou_contato ?? 0),
      abriu_whatsapp: soma.abriu_whatsapp + (dia.abriu_whatsapp ?? 0),
    }),
    { total: 0, por_link: 0, por_codigo: 0, salvou_contato: 0, abriu_whatsapp: 0 },
  )
}

/**
 * Monta a série diária completa dos últimos N dias (critério 8.7.7).
 *
 * Dia sem visita precisa aparecer com zero, senão o gráfico "pula" as datas
 * vazias e sugere um tráfego contínuo que não existe.
 */
export function serieDiaria(
  dias: { data: string; total?: number }[],
  quantidade: number,
  hoje: Date,
): { data: string; total: number }[] {
  const porData = new Map(dias.map((d) => [d.data, d.total ?? 0]))
  const serie: { data: string; total: number }[] = []

  for (let i = quantidade - 1; i >= 0; i--) {
    const dia = new Date(hoje)
    dia.setUTCDate(dia.getUTCDate() - i)
    const chave = dia.toISOString().slice(0, 10)
    serie.push({ data: chave, total: porData.get(chave) ?? 0 })
  }
  return serie
}
