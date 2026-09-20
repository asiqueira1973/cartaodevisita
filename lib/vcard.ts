// Geração do arquivo .vcf (spec 14).
//
// Este é o entregável mais frágil do produto: o arquivo é interpretado pelo
// sistema operacional de OUTRA pessoa, e um detalhe errado vira uma tela de erro
// sem explicação. Cada regra abaixo cita a linha da tabela 14.2 que a exige.
//
// Versão 3.0, e não 4.0, por compatibilidade com Android antigo (spec 14.1).

import type { Cartao, TipoLink } from '@/types/dominio'
import { buildLinkUrl } from '@/lib/links'

/** Quebra de linha exigida pela RFC 2426 (tabela 14.2). */
const CRLF = '\r\n'

/** Limite de dobra, em OCTETOS — não em caracteres (tabela 14.2). */
const LIMITE_OCTETOS = 75

/** Teto da foto já em base64, para o arquivo final ficar abaixo de 120 KB (tabela 14.2). */
export const TETO_FOTO_BASE64 = 110 * 1024

/**
 * Escapa texto livre de vCard (tabela 14.2).
 * Bio com vírgula sem escape quebra o parsing do campo no leitor.
 * A ordem importa: a contrabarra tem de ser escapada primeiro, senão as barras
 * inseridas pelos escapes seguintes seriam escapadas de novo.
 */
export function escapeVCardText(texto: string): string {
  return texto
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\;')
    .replace(/,/g, '\\,')
}

/**
 * Dobra uma linha em 75 octetos, com continuação iniciada por UM espaço
 * (RFC 2426, tabela 14.2).
 *
 * A contagem é em octetos porque nome com acento ocupa 2 bytes em UTF-8 —
 * contar caractere dobraria no lugar errado e corromperia o arquivo. É a linha
 * da foto que estoura o limite, e sem dobrar o iOS descarta a imagem em silêncio.
 */
export function foldLine(linha: string): string {
  const bytes = new TextEncoder().encode(linha)
  if (bytes.length <= LIMITE_OCTETOS) return linha

  const decoder = new TextDecoder()
  const pedacos: string[] = []
  let inicio = 0

  while (inicio < bytes.length) {
    // A primeira linha cabe em 75; as seguintes perdem 1 octeto para o espaço.
    const limite = pedacos.length === 0 ? LIMITE_OCTETOS : LIMITE_OCTETOS - 1
    let fim = Math.min(inicio + limite, bytes.length)

    // Nunca cortar no meio de uma sequência UTF-8: os bytes de continuação são
    // 10xxxxxx, então recua-se até o início do caractere.
    while (fim > inicio && fim < bytes.length && (bytes[fim] & 0xc0) === 0x80) fim--

    pedacos.push(decoder.decode(bytes.subarray(inicio, fim)))
    inicio = fim
  }

  return pedacos.map((p, i) => (i === 0 ? p : ` ${p}`)).join(CRLF)
}

/**
 * Quebra o nome de exibição em sobrenome e nome, no ÚLTIMO espaço (tabela 14.1).
 * Nome de uma palavra só fica com sobrenome vazio — caso de borda de 22.3.
 */
export function splitName(nomeExibicao: string): { nome: string; sobrenome: string } {
  const partes = nomeExibicao.trim().split(/\s+/)
  if (partes.length === 1) return { nome: partes[0], sobrenome: '' }
  const sobrenome = partes.pop() as string
  return { nome: partes.join(' '), sobrenome }
}

/**
 * Normaliza o nome do arquivo .vcf (spec 14.3).
 * "Alexandre Siqueira" vira "alexandre-siqueira.vcf". Resultado vazio cai no handle.
 */
export function vcardFileName(nomeExibicao: string, handle: string): string {
  const base = nomeExibicao
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${base || handle}.vcf`
}

/** Tipos de link que viram uma propriedade URL no vCard (tabela 14.1). */
const TIPOS_COMO_URL: readonly TipoLink[] = [
  'instagram', 'linkedin', 'site', 'youtube', 'tiktok',
  'facebook', 'x', 'github', 'behance', 'spotify', 'outro',
]

export interface EntradaVCard {
  cartao: Cartao
  handle: string
  urlBase: string
  /** Foto já em base64, sem prefixo data:. Nula quando o cartão não tem foto. */
  fotoBase64: string | null
}

/**
 * Monta o conteúdo do .vcf (spec 14.1 e 14.2).
 * Devolve o arquivo inteiro, em UTF-8 sem BOM, com CRLF e linhas já dobradas.
 *
 * O link `pix` NÃO entra: chave PIX não tem propriedade vCard correspondente, e
 * enfiá-la em NOTE poluiria o campo (spec 14.1). Ela vive só na página.
 */
export function buildVCard({ cartao, handle, urlBase, fotoBase64 }: EntradaVCard): string {
  const { nome, sobrenome } = splitName(cartao.nome_exibicao)
  const linhas: string[] = ['BEGIN:VCARD', 'VERSION:3.0']

  linhas.push(`N:${escapeVCardText(sobrenome)};${escapeVCardText(nome)};;;`)
  linhas.push(`FN:${escapeVCardText(cartao.nome_exibicao)}`)

  if (cartao.empresa) linhas.push(`ORG:${escapeVCardText(cartao.empresa)}`)
  if (cartao.cargo) linhas.push(`TITLE:${escapeVCardText(cartao.cargo)}`)

  const porTipo = (tipo: TipoLink) => cartao.links.find((l) => l.tipo === tipo)

  const whatsapp = porTipo('whatsapp')
  if (whatsapp) linhas.push(`TEL;TYPE=CELL,VOICE:${whatsapp.valor}`)

  const telefone = porTipo('telefone')
  if (telefone) linhas.push(`TEL;TYPE=WORK,VOICE:${telefone.valor}`)

  const email = porTipo('email')
  if (email) linhas.push(`EMAIL;TYPE=INTERNET:${email.valor}`)

  linhas.push(`URL:${urlBase}/${handle}`)

  for (const link of [...cartao.links].sort((a, b) => a.ordem - b.ordem)) {
    if (!TIPOS_COMO_URL.includes(link.tipo)) continue
    const url = buildLinkUrl(link.tipo, link.valor)
    if (url) linhas.push(`URL;TYPE=${link.tipo}:${url}`)
  }

  const endereco = porTipo('endereco')
  if (endereco) linhas.push(`ADR;TYPE=WORK:;;${escapeVCardText(endereco.valor)};;;;`)

  if (cartao.bio) linhas.push(`NOTE:${escapeVCardText(cartao.bio)}`)

  // Sem foto, o .vcf sai SEM a propriedade PHOTO — e não com uma vazia,
  // que alguns leitores tratam como imagem corrompida (critério 8.6.5).
  if (fotoBase64) linhas.push(`PHOTO;ENCODING=b;TYPE=JPEG:${fotoBase64}`)

  linhas.push(`REV:${cartao.atualizado_em.toISOString().replace(/\.\d{3}Z$/, 'Z')}`)
  linhas.push('END:VCARD')

  return linhas.map(foldLine).join(CRLF) + CRLF
}
