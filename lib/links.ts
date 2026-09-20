// Normalização e montagem de URL por tipo de link (spec 11.5).
//
// O que a pessoa digita NÃO é o que fica guardado. `normalizeLinkValue` produz o
// que vai para `cartoes.links[].valor`; `buildLinkUrl` produz o href da página
// pública. As duas são a implementação literal da tabela 11.5.

import type { LinkCartao, TipoLink } from '@/types/dominio'
import { LIMITES } from '@/lib/cartao'
import { TETO_ABSOLUTO_DE_LINKS } from '@/lib/planos'

/** Rótulos padrão, usados quando `rotulo` é nulo (spec 15.3). */
export const ROTULOS_PADRAO: Record<TipoLink, string> = {
  whatsapp: 'Chamar no WhatsApp',
  telefone: 'Ligar',
  email: 'Enviar e-mail',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  site: 'Site',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  x: 'X',
  github: 'GitHub',
  behance: 'Behance',
  spotify: 'Spotify',
  pix: 'Copiar chave PIX',
  endereco: 'Ver no mapa',
  outro: 'Abrir link',
}

/** Tipos que só podem aparecer uma vez por cartão (regra 11.4). */
export const TIPOS_UNICOS: readonly TipoLink[] = ['whatsapp', 'pix']

/** Esquemas aceitos em texto livre. Tudo fora daqui é recusado (spec 20.5). */
const ESQUEMAS_PERMITIDOS = ['http:', 'https:']

export class LinkInvalidoError extends Error {}

/**
 * Normaliza telefone brasileiro para E.164 (regra 11.5).
 * Aceita "(11) 98765-4321", "11987654321" e "+5511987654321".
 *
 * Telefone com 8 dígitos depois do DDD é aceito COMO ESTÁ: fixo de 8 dígitos
 * existe, e inserir o nono quebraria o número. Não há autocorreção aqui.
 */
export function normalizePhone(entrada: string): string {
  const cru = entrada.trim()
  const temDdi = cru.startsWith('+')
  const digitos = cru.replace(/\D/g, '')

  if (temDdi) {
    if (!/^[1-9]\d{7,14}$/.test(digitos)) throw new LinkInvalidoError('telefone')
    return `+${digitos}`
  }

  // Sem DDI, assume Brasil: 10 dígitos (fixo) ou 11 (celular), com DDD.
  if (!/^\d{10,11}$/.test(digitos)) throw new LinkInvalidoError('telefone')
  return `+55${digitos}`
}

/** Normaliza e-mail: minúsculas, sem espaço nas pontas (regra 11.5). */
export function normalizeEmail(entrada: string): string {
  const email = entrada.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new LinkInvalidoError('email')
  return email
}

/**
 * Extrai o nome de usuário de uma rede (regra 11.5).
 * Aceita "@fulano", "fulano" e "instagram.com/fulano" — os três guardam "fulano".
 */
function normalizeUsername(entrada: string, dominio: string): string {
  let valor = entrada.trim()

  // Se veio como URL, fica só o primeiro segmento do caminho.
  const comoUrl = valor.replace(/^https?:\/\//, '')
  if (comoUrl.toLowerCase().startsWith(dominio)) {
    valor = comoUrl.slice(dominio.length).replace(/^\//, '').split(/[/?#]/)[0]
  }

  valor = valor.replace(/^@/, '').replace(/\/+$/, '')
  if (!/^[A-Za-z0-9._-]{1,60}$/.test(valor)) throw new LinkInvalidoError('usuario')
  return valor
}

/**
 * Normaliza URL livre, forçando https quando falta esquema (regra 11.5).
 * Recusa `javascript:`, `data:` e qualquer outro esquema — esta é a única
 * entrada de texto livre que vira atributo href, e é por onde um XSS entraria
 * (spec 20.5).
 */
export function normalizeUrl(entrada: string): string {
  const texto = entrada.trim()
  if (!texto) throw new LinkInvalidoError('url')

  const comEsquema = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(texto) ? texto : `https://${texto}`

  let url: URL
  try {
    url = new URL(comEsquema)
  } catch {
    throw new LinkInvalidoError('url')
  }

  if (!ESQUEMAS_PERMITIDOS.includes(url.protocol)) throw new LinkInvalidoError('url')
  if (!url.hostname.includes('.')) throw new LinkInvalidoError('url')
  return url.toString()
}

/** Normaliza o valor digitado conforme o tipo (regra 11.5). */
export function normalizeLinkValue(tipo: TipoLink, entrada: string): string {
  switch (tipo) {
    case 'whatsapp':
    case 'telefone':
      return normalizePhone(entrada)
    case 'email':
      return normalizeEmail(entrada)
    case 'instagram':
      return normalizeUsername(entrada, 'instagram.com')
    case 'linkedin':
      return normalizeUsername(entrada.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//i, ''), 'linkedin.com')
    case 'tiktok':
      return normalizeUsername(entrada, 'tiktok.com')
    case 'x':
      return normalizeUsername(entrada, 'x.com')
    case 'github':
      return normalizeUsername(entrada, 'github.com')
    case 'pix': {
      // A chave PIX não é validada por formato: pode ser CPF, e-mail, telefone
      // ou chave aleatória. Só se apara o espaço das pontas.
      const chave = entrada.trim()
      if (!chave) throw new LinkInvalidoError('pix')
      return chave
    }
    case 'endereco': {
      const endereco = entrada.trim()
      if (!endereco || endereco.length > 120) throw new LinkInvalidoError('endereco')
      return endereco
    }
    default:
      return normalizeUrl(entrada)
  }
}

/**
 * Monta o href final da página pública (regra 11.5).
 * Devolve `null` para `pix`, que não abre link nenhum — é botão de copiar.
 *
 * `mensagemWhatsapp` nulo cai na mensagem padrão da seção 15.
 */
export function buildLinkUrl(
  tipo: TipoLink,
  valor: string,
  mensagemWhatsapp?: string | null,
): string | null {
  switch (tipo) {
    case 'whatsapp': {
      // wa.me quer o E.164 sem o "+".
      const numero = valor.replace(/^\+/, '')
      const texto = encodeURIComponent(mensagemWhatsapp ?? 'Olá! Vi seu cartão e gostaria de falar com você.')
      return `https://wa.me/${numero}?text=${texto}`
    }
    case 'telefone': return `tel:${valor}`
    case 'email': return `mailto:${valor}`
    case 'instagram': return `https://instagram.com/${valor}`
    case 'linkedin': return `https://linkedin.com/in/${valor}`
    case 'tiktok': return `https://tiktok.com/@${valor}`
    case 'x': return `https://x.com/${valor}`
    case 'github': return `https://github.com/${valor}`
    case 'endereco': return `https://maps.google.com/?q=${encodeURIComponent(valor)}`
    case 'pix': return null
    default: return valor
  }
}

/** Todos os tipos aceitos, na ordem em que aparecem no seletor (spec 7.7). */
export const TIPOS: readonly TipoLink[] = [
  'whatsapp', 'telefone', 'email', 'instagram', 'linkedin', 'site',
  'youtube', 'tiktok', 'facebook', 'x', 'github', 'behance',
  'spotify', 'pix', 'endereco', 'outro',
]

export type ErroDeLista =
  | 'whatsapp_duplicado'
  | 'pix_duplicado'
  | 'acima_do_plano'
  | 'acima_do_teto'
  | 'tipo_invalido'
  | 'rotulo_longo'

/**
 * Valida a lista INTEIRA de links (regra 11.4 e 11.11.2).
 *
 * A validação é da lista e não de cada item porque as regras que importam são
 * sobre o conjunto: quantos cabem, e quais tipos só podem aparecer uma vez.
 * Por isso a rota é um PUT da lista toda (spec 13.1) e não um POST por item.
 *
 * Recebe os links e o teto do plano. Devolve `null` quando está válida.
 */
export function validarListaDeLinks(
  links: LinkCartao[],
  tetoDoPlano: number,
): ErroDeLista | null {
  // O teto absoluto vem primeiro: nenhum plano passa de 15 (regra 11.4), e
  // confundir os dois limites daria a mensagem errada para a pessoa.
  if (links.length > TETO_ABSOLUTO_DE_LINKS) return 'acima_do_teto'
  if (links.length > tetoDoPlano) return 'acima_do_plano'

  for (const link of links) {
    if (!TIPOS.includes(link.tipo)) return 'tipo_invalido'
    if (link.rotulo !== null && link.rotulo.length > LIMITES.rotulo) return 'rotulo_longo'
  }

  for (const tipo of TIPOS_UNICOS) {
    if (links.filter((l) => l.tipo === tipo).length > 1) {
      return tipo === 'whatsapp' ? 'whatsapp_duplicado' : 'pix_duplicado'
    }
  }

  return null
}

/**
 * Renumera `ordem` a partir de 0, na ordem em que os itens estão no array
 * (critério 8.3.5).
 *
 * A ordem gravada sempre reflete a posição no array — o cliente manda a lista
 * já reordenada, e o servidor não confia no campo `ordem` que veio.
 */
export function renumerar(links: LinkCartao[]): LinkCartao[] {
  return links.map((link, indice) => ({ ...link, ordem: indice }))
}
