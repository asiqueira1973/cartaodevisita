// Telemetria do painel (spec 21.3) — sobretudo a regra 5: só forma, nunca conteúdo.
import { describe, expect, it } from 'vitest'
import { sanitizarPropriedades } from '@/lib/telemetria'

describe('propriedades de evento (regra 21.3.1, item 5)', () => {
  it('deixa passar número, booleano, nulo e valor de enum', () => {
    expect(sanitizarPropriedades({ links: 4, tem_foto: true, plano: 'gratuito', dias: null }))
      .toEqual({ links: 4, tem_foto: true, plano: 'gratuito', dias: null })
  })
  it('barra texto longo — é assim que bio e endereço vazariam', () => {
    const bio = 'Atendimento online e presencial na Zona Sul, para adultos e adolescentes.'
    expect(sanitizarPropriedades({ bio })).toEqual({})
  })
  it('barra objeto e array, que poderiam levar o cartão inteiro', () => {
    const sujas = { links: [{ tipo: 'whatsapp', valor: '+5511999999999' }], cartao: { bio: 'x' } }
    expect(sanitizarPropriedades(sujas as never)).toEqual({})
  })
})
