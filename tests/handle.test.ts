// Formato, normalização e sugestão de endereço (spec 11.1 e 11.2).
import { describe, expect, it } from 'vitest'
import {
  HANDLES_RESERVADOS, isHandleFormatValid, isHandleReserved,
  isHandleSelectable, normalizeToHandle, suggestHandle,
} from '@/lib/handle'

describe('formato do handle (regra 11.1)', () => {
  it('aceita 3 e 30 caracteres, os extremos da regra', () => {
    expect(isHandleFormatValid('abc')).toBe(true)
    expect(isHandleFormatValid('a'.repeat(30))).toBe(true)
  })
  it('recusa fora dos extremos', () => {
    expect(isHandleFormatValid('ab')).toBe(false)
    expect(isHandleFormatValid('a'.repeat(31))).toBe(false)
  })
  it('recusa hífen nas pontas', () => {
    expect(isHandleFormatValid('-daniela')).toBe(false)
    expect(isHandleFormatValid('daniela-')).toBe(false)
    expect(isHandleFormatValid('dani-ela')).toBe(true)
  })
  it('recusa maiúscula, acento e espaço', () => {
    expect(isHandleFormatValid('Daniela')).toBe(false)
    expect(isHandleFormatValid('danièla')).toBe(false)
    expect(isHandleFormatValid('dani ela')).toBe(false)
  })
})

describe('handles reservados (regra 11.2)', () => {
  it('reserva o prefixo da rota permanente', () => {
    // `c` é o mais importante da lista: é o prefixo de /c/<id> (spec 4.3).
    expect(isHandleReserved('c')).toBe(true)
  })
  it('reserva toda a lista', () => {
    for (const reservado of HANDLES_RESERVADOS) expect(isHandleReserved(reservado)).toBe(true)
  })
  it('não é selecionável mesmo com formato válido', () => {
    expect(isHandleFormatValid('admin')).toBe(true)
    expect(isHandleSelectable('admin')).toBe(false)
  })
})

describe('normalização (regra 11.1)', () => {
  it('tira acento, baixa a caixa e troca espaço por hífen', () => {
    expect(normalizeToHandle('Daniela Saboya')).toBe('daniela-saboya')
    expect(normalizeToHandle('José Antônio Gonçalves')).toBe('jose-antonio-goncalves')
  })
  it('remove pontuação sem deixar hífen duplicado nem nas pontas', () => {
    expect(normalizeToHandle('Dr. Marcos (Cardoso)')).toBe('dr-marcos-cardoso')
  })
  it('corta em 30 caracteres', () => {
    expect(normalizeToHandle('a'.repeat(50)).length).toBe(30)
  })
})

describe('sugestão (critério 8.1.5)', () => {
  it('usa a base quando está livre', async () => {
    expect(await suggestHandle('Daniela Saboya', async () => false)).toBe('daniela-saboya')
  })
  it('acrescenta sufixo quando a base está tomada', async () => {
    const tomados = new Set(['daniela-saboya'])
    expect(await suggestHandle('Daniela Saboya', async (c) => tomados.has(c))).toBe('daniela-saboya-2')
  })
  it('devolve vazio quando esgota os sufixos', async () => {
    expect(await suggestHandle('Daniela Saboya', async () => true)).toBe('')
  })
  it('devolve vazio quando o nome não gera 3 caracteres', async () => {
    expect(await suggestHandle('Jô', async () => false)).toBe('')
  })
})
