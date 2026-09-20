// Planos de conta: allowlist de ilimitados e limites por plano (spec 11.11).
//
// Como `lib/admins.ts`, este arquivo NÃO tem imports de runtime, para não criar
// ciclo — só um `import type`, que desaparece na compilação.

import type { PlanoConta, TemplateCartao, CorDestaque } from '@/types/dominio'

/**
 * Contas que nascem e permanecem `ilimitado` (spec 11.11.4).
 * Verificada a cada login. Entrar aqui promove a conta no próximo acesso; sair
 * daqui devolve a conta ao `plano_anterior`.
 */
const ILIMITADOS = [
  'alexandre.silva.siqueira@gmail.com',
  'alexandre@dablab.com.br',
] as const

/** Teto absoluto de links, em qualquer plano (spec 11.4). */
export const TETO_ABSOLUTO_DE_LINKS = 15

/** O que cada plano libera (spec 11.11.2). */
export interface LimitesDoPlano {
  links: number
  templates: readonly TemplateCartao[]
  cores: readonly CorDestaque[]
  /** Verdadeiro quando a página pública mostra a marca no rodapé. */
  marcaNoRodape: boolean
}

const TODOS_OS_TEMPLATES: readonly TemplateCartao[] = ['minimalista', 'cartao', 'foto', 'executivo']
const TODAS_AS_CORES: readonly CorDestaque[] = ['azul', 'verde', 'roxo', 'vermelho', 'laranja', 'rosa', 'grafite', 'dourado']

const LIMITES_PAGOS: LimitesDoPlano = {
  links: TETO_ABSOLUTO_DE_LINKS,
  templates: TODOS_OS_TEMPLATES,
  cores: TODAS_AS_CORES,
  marcaNoRodape: false,
}

const LIMITES: Record<PlanoConta, LimitesDoPlano> = {
  gratuito: {
    links: 5,
    templates: ['minimalista', 'cartao'],
    cores: ['azul', 'grafite'],
    marcaNoRodape: true,
  },
  // Early adopter, ilimitado e pago compartilham exatamente os mesmos limites.
  // O que os separa é COMO se chega neles (spec 11.11.1), não o que liberam.
  early_adopter: LIMITES_PAGOS,
  ilimitado: LIMITES_PAGOS,
  pago: LIMITES_PAGOS,
}

/** Devolve os limites de um plano (spec 11.11.2). */
export function limitesDoPlano(plano: PlanoConta): LimitesDoPlano {
  return LIMITES[plano]
}

/** Diz se um e-mail está na allowlist de ilimitados (spec 11.11.4). */
export function isUnlimitedAccount(email: string | null | undefined): boolean {
  if (!email) return false
  const normalizado = email.trim().toLowerCase()
  return ILIMITADOS.some((conta) => conta === normalizado)
}

/**
 * Decide com que plano uma conta NOVA nasce (spec 11.11.1 e 11.11.3).
 * Recebe o e-mail e o valor cru da variável de ambiente. Devolve o plano.
 * Qualquer valor que não seja exatamente "true" é lido como falso, de propósito:
 * variável ausente, vazia ou escrita errado não pode abrir early adopter sem querer.
 */
export function planoInicial(email: string, earlyAdopterAberto: string | undefined): PlanoConta {
  if (isUnlimitedAccount(email)) return 'ilimitado'
  return earlyAdopterAberto === 'true' ? 'early_adopter' : 'gratuito'
}

/**
 * Reconcilia o plano de uma conta EXISTENTE contra a allowlist, a cada login
 * (spec 11.11.4). Devolve o plano e o plano_anterior que devem ficar gravados,
 * ou `null` quando nada muda — o chamador só escreve se vier resultado.
 */
export function reconciliarPlano(
  email: string,
  planoAtual: PlanoConta,
  planoAnterior: PlanoConta | null,
): { plano: PlanoConta; plano_anterior: PlanoConta | null } | null {
  const naLista = isUnlimitedAccount(email)

  // Entrou na lista: promove e guarda de onde veio, para poder voltar depois.
  if (naLista && planoAtual !== 'ilimitado') {
    return { plano: 'ilimitado', plano_anterior: planoAtual }
  }

  // Saiu da lista: volta ao que era. Sem valor guardado, cai em gratuito.
  if (!naLista && planoAtual === 'ilimitado') {
    return { plano: planoAnterior ?? 'gratuito', plano_anterior: null }
  }

  return null
}

/**
 * Diz se um plano pode ser atribuído pelo admin (spec 11.11.5).
 * `pago` é recusado porque não há caminho de pagamento na v1 (spec 28.2).
 */
export function isPlanoAtribuivelPorAdmin(plano: PlanoConta): boolean {
  return plano !== 'pago'
}
