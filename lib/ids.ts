// Id permanente: o endereço que vai para QR code e etiqueta NFC (spec 11.3).
//
// Este id NUNCA muda em conta viva — é o princípio 0.4 em forma de código.
// Não existe função para trocá-lo, e não deve existir.

import { randomInt, randomUUID } from 'node:crypto'

/**
 * Alfabeto de 31 caracteres (regra 11.3).
 * Ficam de fora 0, 1, l, i e o — os que confundem quem transcreve à mão ou lê
 * de um cartão impresso.
 */
const ALFABETO = '23456789abcdefghjkmnpqrstuvwxyz'
const COMPRIMENTO = 8

/** Formato do id permanente (regra 11.3). */
const FORMATO_ID = /^[23456789abcdefghjkmnpqrstuvwxyz]{8}$/

/** Diz se uma string tem o formato de id permanente (regra 11.3). */
export function isPermanentIdValid(id: string): boolean {
  return FORMATO_ID.test(id)
}

/**
 * Sorteia um id permanente (regra 11.3).
 * Usa `randomInt` do crypto, e não Math.random: o id aparece em objeto físico e
 * ser adivinhável facilitaria enumerar contas (spec 20.3).
 */
export function generatePermanentId(): string {
  let id = ''
  for (let i = 0; i < COMPRIMENTO; i++) id += ALFABETO[randomInt(ALFABETO.length)]
  return id
}

/**
 * Sorteia um id permanente que ainda não existe (spec 7.11).
 * Recebe a função que tenta gravar e devolve se conseguiu. Tenta 5 vezes; na
 * sexta, lança — com 31^8 ≈ 852 bilhões de combinações, cinco colisões seguidas
 * significam defeito no sorteio, não azar, e falhar alto é melhor que insistir.
 */
export async function reservePermanentId(
  tentarGravar: (id: string) => Promise<boolean>,
): Promise<string> {
  for (let tentativa = 1; tentativa <= 5; tentativa++) {
    const id = generatePermanentId()
    if (await tentarGravar(id)) return id
  }
  throw new Error('Não consegui gerar um id permanente livre em 5 tentativas')
}

/** Gera o UUID v4 que identifica um evento de telemetria (spec 21.3.2). */
export function generateEventId(): string {
  return randomUUID()
}
