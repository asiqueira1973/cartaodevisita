// Normalização do nome de exibição (regra 11.12).
import { describe, expect, it } from 'vitest'
import { firstName, normalizeDisplayName } from '@/lib/display-name'

describe('nome em caixa alta (regra 11.12)', () => {
  it('converte para caixa de título — o caso que motivou a regra', () => {
    expect(normalizeDisplayName('ALEXANDRE SIQUEIRA')).toBe('Alexandre Siqueira')
  })
  it('mantém partículas minúsculas, menos na primeira palavra', () => {
    expect(normalizeDisplayName('MARIA DAS GRAÇAS DE SOUZA')).toBe('Maria das Graças de Souza')
    expect(normalizeDisplayName('DA SILVA NETO')).toBe('Da Silva Neto')
  })
  it('respeita acento na detecção e na conversão', () => {
    expect(normalizeDisplayName('JOSÉ ANTÔNIO GONÇALVES')).toBe('José Antônio Gonçalves')
  })
  it('capitaliza depois de hífen e apóstrofo', () => {
    expect(normalizeDisplayName('JEAN-PIERRE D’ÁVILA')).toBe('Jean-Pierre D’Ávila')
  })
})

describe('nome que já vem misturado não é tocado', () => {
  it('preserva grafia deliberada', () => {
    for (const nome of ['Daniela Saboya', 'McSilva Jr', 'd’Ávila', 'LuizA Pereira']) {
      expect(normalizeDisplayName(nome)).toBe(nome)
    }
  })
  it('só apara espaço sobrando', () => {
    expect(normalizeDisplayName('  Daniela   Saboya ')).toBe('Daniela Saboya')
  })
})

describe('primeiro nome para o rodapé do menu', () => {
  it('vem normalizado', () => {
    expect(firstName('ALEXANDRE SIQUEIRA')).toBe('Alexandre')
    expect(firstName('Daniela Saboya')).toBe('Daniela')
  })
})
