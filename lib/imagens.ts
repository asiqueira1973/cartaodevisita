// Validação de imagem no servidor (critério 8.2.5 e spec 20.5).
//
// O cliente redimensiona e o servidor valida — mas o servidor NUNCA confia no
// que o cliente diz. Extensão e `Content-Type` são texto que qualquer um
// escreve; o que identifica o arquivo são os primeiros bytes.

/** Assinaturas aceitas. Só JPEG e PNG entram (spec 7.9). */
const ASSINATURAS: { tipo: 'jpeg' | 'png'; bytes: number[] }[] = [
  { tipo: 'jpeg', bytes: [0xff, 0xd8, 0xff] },
  { tipo: 'png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
]

/** Teto do arquivo original, checado no cliente antes de enviar (critério 8.2.6). */
export const TETO_ORIGINAL_BYTES = 10 * 1024 * 1024

/** Teto da derivada de exibição, 600×600 (spec 7.5). */
export const TETO_EXIBICAO_BYTES = 400 * 1024

/** Teto da derivada do vCard, 300×300 (tabela 14.2). */
export const TETO_VCARD_BYTES = 80 * 1024

/**
 * Identifica o tipo real da imagem pelos magic bytes (critério 8.2.5).
 * Devolve `null` quando não é JPEG nem PNG — inclusive quando a extensão e o
 * `Content-Type` afirmam que é. Um SVG com `.jpg` no nome morre aqui, e é essa
 * a porta por onde entraria conteúdo ativo no Storage.
 */
export function detectarTipoDeImagem(dados: Uint8Array): 'jpeg' | 'png' | null {
  for (const { tipo, bytes } of ASSINATURAS) {
    if (dados.length < bytes.length) continue
    if (bytes.every((b, i) => dados[i] === b)) return tipo
  }
  return null
}

export type ErroDeImagem = 'formato' | 'tamanho'

/**
 * Valida uma derivada recebida do cliente (critérios 8.2.5 e 8.2.6).
 * Recebe os bytes e o teto. Devolve `null` quando está tudo certo, ou o motivo.
 */
export function validarDerivada(dados: Uint8Array, tetoBytes: number): ErroDeImagem | null {
  if (!detectarTipoDeImagem(dados)) return 'formato'
  if (dados.length > tetoBytes) return 'tamanho'
  return null
}
