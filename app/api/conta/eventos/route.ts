// Eventos do painel que nascem de um clique (spec 21.3.3).
//
// PEGADINHA 18.4.1: requireDono() na PRIMEIRA LINHA.
//
// Existe porque copiar um link e baixar um PNG acontecem no navegador, e a
// telemetria tem de sair do SERVIDOR (regra 21.3.1, item 2) — a chave nunca vai
// ao cliente.

import { requireDono } from '@/lib/guards'
import { registrarEvento, type NomeEvento, type TelaTelemetria } from '@/lib/telemetria'

/**
 * Só estes eventos podem ser disparados pelo cliente, e com estas telas fixas.
 * Sem a lista, um cliente poderia forjar qualquer evento do catálogo e sujar a
 * medição — inclusive `cartao_publicado`, que decide produto.
 */
const PERMITIDOS: Record<string, { evento: NomeEvento; tela: TelaTelemetria; descricao: string }> = {
  link_copiado: { evento: 'link_copiado', tela: 'Compartilhar', descricao: 'a pessoa copiou o link do cartão' },
  qr_baixado: { evento: 'qr_baixado', tela: 'Compartilhar', descricao: 'a pessoa baixou o PNG do QR code' },
  endereco_nfc_copiado: { evento: 'endereco_nfc_copiado', tela: 'Compartilhar', descricao: 'a pessoa copiou a URL permanente para gravar numa etiqueta' },
}

export async function POST(request: Request): Promise<Response> {
  const guarda = await requireDono()
  if (!guarda.ok) return guarda.resposta

  const corpo = (await request.json().catch(() => ({}))) as { nome?: string }
  const permitido = corpo.nome ? PERMITIDOS[corpo.nome] : undefined
  if (!permitido) return new Response(null, { status: 204 })

  await registrarEvento(permitido.evento, guarda.dados.email, permitido.tela, permitido.descricao)
  return new Response(null, { status: 204 })
}
