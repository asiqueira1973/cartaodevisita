// Geração do QR code, sempre NO SERVIDOR (critério 8.5.2).
//
// PEGADINHA 18.4.4: o QR codifica SEMPRE a URL permanente, nunca o handle.
// É o princípio 0.4 — um QR impresso ou uma etiqueta gravada são objetos
// físicos, e o handle pode mudar. Não existe função aqui que receba handle.
//
// Gerar no servidor mantém a página pública sem biblioteca de QR no cliente,
// que é o que o alvo de 40 KB de JavaScript da seção 17.1 exige.

import QRCode from 'qrcode'

/**
 * Opções fixas do QR (critério 8.5.3).
 * Correção de erro M aguenta sujeira e reflexo sem inchar o código; a zona de
 * silêncio de 4 módulos é o mínimo da especificação do QR, e sem ela a câmera
 * falha quando o código encosta em outro elemento.
 */
const OPCOES = { errorCorrectionLevel: 'M', margin: 4 } as const

/**
 * Monta a URL permanente que vai dentro do QR (spec 4.3).
 * Recebe o id permanente — NUNCA o handle — e a base do domínio.
 */
export function urlDoQr(idPermanente: string, urlBase: string): string {
  return `${urlBase.replace(/\/$/, '')}/c/${idPermanente}`
}

/** SVG do QR, para embutir direto no HTML da página (critério 8.5.2). */
export async function qrComoSvg(idPermanente: string, urlBase: string): Promise<string> {
  return QRCode.toString(urlDoQr(idPermanente, urlBase), {
    ...OPCOES,
    type: 'svg',
    // Sem largura fixa no SVG: quem usa decide o tamanho pelo CSS, e o código
    // escala sem perda — que é a razão de ser SVG e não PNG na página.
    width: undefined,
  })
}

/** PNG de 1024×1024, para imprimir (critério 8.5.6). */
export async function qrComoPng(idPermanente: string, urlBase: string): Promise<Buffer> {
  return QRCode.toBuffer(urlDoQr(idPermanente, urlBase), {
    ...OPCOES,
    type: 'png',
    width: 1024,
  })
}

/** Nome do arquivo baixado (critério 8.5.6). */
export function nomeDoArquivoQr(handle: string): string {
  return `qr-${handle}.png`
}
