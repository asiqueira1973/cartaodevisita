// Id permanente (spec 11.3) — o endereço que vai para QR e etiqueta NFC.
import { describe, expect, it, vi } from 'vitest'
import { generatePermanentId, isPermanentIdValid, reservePermanentId } from '@/lib/ids'

describe('formato do id permanente (regra 11.3)', () => {
  it('gera 8 caracteres do alfabeto', () => {
    for (let i = 0; i < 500; i++) expect(isPermanentIdValid(generatePermanentId())).toBe(true)
  })
  it('nunca usa 0, 1, l, i ou o — os que confundem quem transcreve', () => {
    const ambiguos = /[01lio]/
    for (let i = 0; i < 500; i++) expect(ambiguos.test(generatePermanentId())).toBe(false)
  })
  it('recusa comprimento e caracteres fora da regra', () => {
    expect(isPermanentIdValid('abc')).toBe(false)
    expect(isPermanentIdValid('k7f3q9ab0')).toBe(false)
    expect(isPermanentIdValid('k7f3q9a0')).toBe(false)
    expect(isPermanentIdValid('K7F3Q9AB')).toBe(false)
  })
})

describe('reserva com colisão (spec 7.11)', () => {
  it('devolve na primeira tentativa que grava', async () => {
    const gravar = vi.fn().mockResolvedValue(true)
    expect(isPermanentIdValid(await reservePermanentId(gravar))).toBe(true)
    expect(gravar).toHaveBeenCalledTimes(1)
  })
  it('insiste até cinco vezes', async () => {
    const gravar = vi.fn()
      .mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValue(true)
    await reservePermanentId(gravar)
    expect(gravar).toHaveBeenCalledTimes(3)
  })
  it('falha alto na sexta — cinco colisões são defeito, não azar', async () => {
    const gravar = vi.fn().mockResolvedValue(false)
    await expect(reservePermanentId(gravar)).rejects.toThrow()
    expect(gravar).toHaveBeenCalledTimes(5)
  })
})
