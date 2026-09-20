// Validação dos campos editáveis do cartão (spec 7.5 e regra 11.4).
//
// Roda nos dois lados: no cliente para o contador de caracteres, no servidor
// como autoridade. Nenhum limite aqui é inventado — todos vêm da regra 11.4.

/** Limites de caracteres, um por campo (regra 11.4). */
export const LIMITES = {
  nome_exibicao: 60,
  cargo: 60,
  empresa: 60,
  bio: 160,
  mensagem_whatsapp: 120,
  rotulo: 24,
} as const

export type CampoDeTexto = keyof typeof LIMITES

/** A partir de quanto do limite o contador aparece (critério 8.2.2). */
export const MOSTRAR_CONTADOR_A_PARTIR_DE = 0.8

/** Diz se o contador de caracteres deve aparecer (critério 8.2.2). */
export function deveMostrarContador(campo: CampoDeTexto, valor: string): boolean {
  return valor.length >= LIMITES[campo] * MOSTRAR_CONTADOR_A_PARTIR_DE
}

export type ErroDeCampo = 'obrigatorio' | 'longo'

/**
 * Valida um campo de texto do cartão (regra 11.4).
 * Devolve `null` quando está válido, ou o motivo.
 *
 * `nome_exibicao` é o único obrigatório: sem nome não há cartão, e publicar o
 * exige (critério 8.7.2). Os demais são opcionais e vazio vira nulo.
 */
export function validarCampo(campo: CampoDeTexto, valor: string): ErroDeCampo | null {
  const limpo = valor.trim()
  if (campo === 'nome_exibicao' && !limpo) return 'obrigatorio'
  if (limpo.length > LIMITES[campo]) return 'longo'
  return null
}

/**
 * Prepara um campo opcional para gravação (spec 7.5).
 * Texto vazio vira `null`, não string vazia: a nullability de cada campo é
 * decisão de negócio declarada na seção 7, e "" não é o mesmo que "não preenchi".
 */
export function paraGravar(valor: string | undefined | null): string | null {
  const limpo = (valor ?? '').trim()
  return limpo === '' ? null : limpo
}

/** Iniciais para o cartão sem foto (critério 8.2.8). */
export function iniciais(nomeExibicao: string): string {
  const partes = nomeExibicao.trim().split(/\s+/).filter(Boolean)
  if (!partes.length) return '?'
  const primeira = partes[0][0]
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toLocaleUpperCase('pt-BR')
}
