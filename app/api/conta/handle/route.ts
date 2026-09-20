// Escolha e troca do endereço público (spec 13.1, épico 8.1).
//
// PEGADINHA 18.4.1: requireDono() na PRIMEIRA LINHA de cada handler, antes de
// qualquer toque no Firestore.
//
// `exigirHandle: false` em todos eles, porque estas são justamente as rotas que
// rodam quando a conta ainda não tem handle (spec 6.5).

import { requireDono } from '@/lib/guards'
import { handleEstaTomado, reservarHandle, trocarHandle } from '@/lib/firebase/firestore'
import { isHandleFormatValid, isHandleSelectable } from '@/lib/handle'
import { registrarEvento } from '@/lib/telemetria'
import { ERROS } from '@/lib/copy'

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status, headers: { 'content-type': 'application/json' },
  })
}

/**
 * Diz se um endereço está disponível (spec 13.1).
 * Recebe `?valor=<handle>`. Devolve `{ disponivel: boolean }`.
 *
 * Handle RESERVADO e handle OCUPADO devolvem a MESMA resposta, de propósito:
 * uma mensagem diferente revelaria a existência da lista (critério 8.1.7).
 */
export async function GET(request: Request): Promise<Response> {
  const guarda = await requireDono(false)
  if (!guarda.ok) return guarda.resposta

  const valor = new URL(request.url).searchParams.get('valor')?.trim().toLowerCase() ?? ''
  if (!isHandleFormatValid(valor)) return json({ erro: 'formato', mensagem: ERROS[2] }, 400)
  if (!isHandleSelectable(valor)) return json({ disponivel: false })

  return json({ disponivel: !(await handleEstaTomado(valor)) })
}

/**
 * Reserva o endereço e o id permanente pela primeira vez (spec 13.1).
 *
 * Idempotente por construção (spec 13.4): repetir a chamada com o mesmo valor
 * pelo mesmo dono devolve 200 com o que já está reservado, não 409.
 */
export async function POST(request: Request): Promise<Response> {
  const guarda = await requireDono(false)
  if (!guarda.ok) return guarda.resposta
  const { usuario } = guarda.dados

  const corpo = (await request.json().catch(() => ({}))) as { valor?: string }
  const valor = corpo.valor?.trim().toLowerCase() ?? ''
  if (!isHandleFormatValid(valor)) return json({ erro: 'formato', mensagem: ERROS[2] }, 400)

  if (usuario.handle) {
    if (usuario.handle === valor) {
      return json({ handle: usuario.handle, id_permanente: usuario.id_permanente })
    }
    return json({ erro: 'ja_tem_handle', mensagem: ERROS[16] }, 422)
  }

  const reservado = await reservarHandle(usuario.id, valor)
  if (!reservado) return json({ erro: 'indisponivel', mensagem: ERROS[1] }, 409)

  await registrarEvento(
    'endereco_escolhido', usuario.email, 'EscolherEndereco',
    'a pessoa reservou o endereço público e ganhou o id permanente',
    { usou_sugestao: false },
  )

  return json(reservado)
}

/**
 * Troca o endereço (critério 8.8.1).
 * NÃO altera o `id_permanente` — é o princípio 0.4, e é o que mantém
 * funcionando todo QR impresso e toda etiqueta já gravada.
 */
export async function PATCH(request: Request): Promise<Response> {
  const guarda = await requireDono()
  if (!guarda.ok) return guarda.resposta
  const { usuario } = guarda.dados

  const corpo = (await request.json().catch(() => ({}))) as { valor?: string }
  const valor = corpo.valor?.trim().toLowerCase() ?? ''
  if (!isHandleFormatValid(valor)) return json({ erro: 'formato', mensagem: ERROS[2] }, 400)

  const trocado = await trocarHandle(usuario.id, valor)
  if (!trocado) return json({ erro: 'indisponivel', mensagem: ERROS[1] }, 409)

  const diasComOAnterior = Math.floor(
    (Date.now() - usuario.criado_em.getTime()) / (24 * 60 * 60 * 1000),
  )
  await registrarEvento(
    'endereco_trocado', usuario.email, 'Ajustes',
    'a pessoa trocou o endereço público; o id permanente não mudou',
    { dias_com_o_anterior: diasComOAnterior },
  )

  return json({ handle: trocado })
}
