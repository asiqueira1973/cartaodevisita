// Normalização do nome de exibição (regra 11.12).
//
// Existe por um caso real: conta do Google criada a partir de documento oficial
// costuma vir com o nome INTEIRO EM CAIXA ALTA, e isso é frequente justamente no
// público da seção 1. No cartão, o nome é o elemento de 28 px do topo — em caixa
// alta ele parece um grito.

/**
 * Preposições e partículas que ficam minúsculas em nome próprio português
 * (regra 11.12). A primeira palavra é exceção: "Da Silva" começa maiúsculo.
 */
const PARTICULAS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e',
  'di', 'du', 'del', 'della', 'la', 'le', 'van', 'von', 'y',
])

/**
 * Converte para caixa de título **apenas** quando o nome vem todo em maiúsculas
 * (regra 11.12). Recebe o nome como veio do provedor; devolve o nome para
 * pré-preencher o cartão.
 *
 * Nome que já vem misturado NÃO é tocado, de propósito: mexer nele estragaria
 * "McSilva", "d'Ávila" e "LuizA" — e quem escreveu assim escreveu de propósito.
 * O campo continua editável; isto é só o palpite inicial.
 */
export function normalizeDisplayName(nome: string): string {
  const limpo = nome.trim().replace(/\s+/g, ' ')
  if (!limpo) return limpo

  // Só age quando NÃO há nenhuma minúscula — a detecção usa a comparação com a
  // própria versão maiúscula para funcionar com acento (Ç, Ã, É).
  const temMinuscula = limpo !== limpo.toLocaleUpperCase('pt-BR')
  if (temMinuscula) return limpo

  return limpo
    .split(' ')
    .map((palavra, indice) => {
      const minuscula = palavra.toLocaleLowerCase('pt-BR')
      if (indice > 0 && PARTICULAS.has(minuscula)) return minuscula
      // Hífen e apóstrofo separam partes que também levam maiúscula:
      // "JEAN-PIERRE" e "D'ÁVILA".
      return minuscula.replace(/(^|[-'’])([\p{L}])/gu, (_, sep, letra) => sep + letra.toLocaleUpperCase('pt-BR'))
    })
    .join(' ')
}

/** Primeiro nome já normalizado, para o rodapé do menu (spec 16.6). */
export function firstName(nome: string): string {
  return normalizeDisplayName(nome).split(' ')[0] ?? 'Você'
}
