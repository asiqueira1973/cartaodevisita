// Estrutura de planos (spec 11.11).
import { describe, expect, it } from 'vitest'
import {
  TETO_ABSOLUTO_DE_LINKS, isPlanoAtribuivelPorAdmin, isUnlimitedAccount,
  limitesDoPlano, planoInicial, reconciliarPlano,
} from '@/lib/planos'
import { isPlatformAdmin } from '@/lib/admins'

describe('plano inicial e a variável de ambiente (regra 11.11.3)', () => {
  it('nasce early adopter com a chave ligada', () => {
    expect(planoInicial('novo@exemplo.com', 'true')).toBe('early_adopter')
  })
  it('nasce gratuito com a chave desligada, ausente ou escrita errado', () => {
    for (const v of ['false', undefined, '', 'TRUE', '1', 'sim']) {
      expect(planoInicial('novo@exemplo.com', v)).toBe('gratuito')
    }
  })
  it('a allowlist vence a variável', () => {
    expect(planoInicial('alexandre@dablab.com.br', 'false')).toBe('ilimitado')
  })
})

describe('desligar a chave NÃO rebaixa ninguém (critério 8.10.3)', () => {
  it('conta early adopter existente continua early adopter', () => {
    // reconciliarPlano é o único caminho de mudança de plano automática, e ele
    // nem olha para EARLY_ADOPTER_ABERTO: a chave só age na criação.
    expect(reconciliarPlano('alguem@exemplo.com', 'early_adopter', null)).toBeNull()
  })
})

describe('allowlist de ilimitados (regra 11.11.4)', () => {
  it('reconhece as duas contas de casa, ignorando caixa e espaço', () => {
    expect(isUnlimitedAccount('alexandre.silva.siqueira@gmail.com')).toBe(true)
    expect(isUnlimitedAccount('  Alexandre@DabLab.com.BR ')).toBe(true)
    expect(isUnlimitedAccount('estranho@exemplo.com')).toBe(false)
    expect(isUnlimitedAccount(null)).toBe(false)
  })
  it('promove conta existente e guarda de onde ela veio', () => {
    expect(reconciliarPlano('alexandre@dablab.com.br', 'gratuito', null))
      .toEqual({ plano: 'ilimitado', plano_anterior: 'gratuito' })
  })
  it('sair da lista devolve ao plano anterior', () => {
    expect(reconciliarPlano('saiu@exemplo.com', 'ilimitado', 'early_adopter'))
      .toEqual({ plano: 'early_adopter', plano_anterior: null })
  })
  it('sem plano anterior guardado, cai em gratuito', () => {
    expect(reconciliarPlano('saiu@exemplo.com', 'ilimitado', null))
      .toEqual({ plano: 'gratuito', plano_anterior: null })
  })
  it('não escreve nada quando nada muda', () => {
    expect(reconciliarPlano('alexandre@dablab.com.br', 'ilimitado', null)).toBeNull()
    expect(reconciliarPlano('outro@exemplo.com', 'gratuito', null)).toBeNull()
  })
})

describe('o que cada plano libera (regra 11.11.2)', () => {
  it('gratuito limita links, visuais e cores, e leva a marca', () => {
    const g = limitesDoPlano('gratuito')
    expect(g.links).toBe(5)
    expect(g.templates).toHaveLength(2)
    expect(g.cores).toEqual(['azul', 'grafite'])
    expect(g.marcaNoRodape).toBe(true)
  })
  it('os demais planos liberam tudo e não levam a marca', () => {
    for (const plano of ['early_adopter', 'ilimitado', 'pago'] as const) {
      const l = limitesDoPlano(plano)
      expect(l.links).toBe(TETO_ABSOLUTO_DE_LINKS)
      expect(l.templates).toHaveLength(4)
      expect(l.cores).toHaveLength(8)
      expect(l.marcaNoRodape).toBe(false)
    }
  })
  it('nenhum plano passa do teto absoluto de 15 (regra 11.4)', () => {
    for (const plano of ['gratuito', 'early_adopter', 'ilimitado', 'pago'] as const) {
      expect(limitesDoPlano(plano).links).toBeLessThanOrEqual(TETO_ABSOLUTO_DE_LINKS)
    }
  })
})

describe('admin (regra 11.11.5 e spec 5.3)', () => {
  it('não pode atribuir `pago` — não há caminho de pagamento na v1', () => {
    expect(isPlanoAtribuivelPorAdmin('pago')).toBe(false)
    for (const p of ['gratuito', 'early_adopter', 'ilimitado'] as const) {
      expect(isPlanoAtribuivelPorAdmin(p)).toBe(true)
    }
  })
  it('a allowlist de admin reconhece as contas de casa', () => {
    expect(isPlatformAdmin('alexandre.silva.siqueira@gmail.com')).toBe(true)
    expect(isPlatformAdmin('estranho@exemplo.com')).toBe(false)
    expect(isPlatformAdmin(undefined)).toBe(false)
  })
})
