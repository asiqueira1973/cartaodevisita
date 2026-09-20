// Trocar o endereço de uma conta, para conflito de marca (critério 8.9.4).

import { revalidateTag } from 'next/cache'
import { requireAdminPlataforma } from '@/lib/guards'
import { buscarContaParaAdmin, registrarAcaoAdmin, trocarHandle } from '@/lib/firebase/firestore'
import { isHandleFormatValid } from '@/lib/handle'
import { ERROS } from '@/lib/copy'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const guarda = await requireAdminPlataforma()
  if (!guarda.ok) return guarda.resposta

  const { id } = await params
  const corpo = (await request.json().catch(() => ({}))) as { valor?: string; detalhe?: string }
  const valor = corpo.valor?.trim().toLowerCase() ?? ''

  if (!isHandleFormatValid(valor)) {
    return new Response(JSON.stringify({ erro: 'formato', mensagem: ERROS[2] }), {
      status: 400, headers: { 'content-type': 'application/json' },
    })
  }

  const conta = await buscarContaParaAdmin(id)
  if (!conta) return new Response(null, { status: 404 })
  const anterior = conta.usuario.handle

  const novo = await trocarHandle(id, valor)
  if (!novo) {
    return new Response(JSON.stringify({ erro: 'indisponivel', mensagem: ERROS[1] }), {
      status: 409, headers: { 'content-type': 'application/json' },
    })
  }

  // O valor ANTERIOR vai no detalhe (critério 8.9.4): sem ele o log registra
  // que algo mudou sem registrar de quê para quê, e não serve para nada.
  await registrarAcaoAdmin(
    guarda.dados.email, 'alterou_handle', id,
    `${anterior ?? '(sem endereço)'} → ${novo}${corpo.detalhe?.trim() ? ` · ${corpo.detalhe.trim()}` : ''}`,
  )

  if (anterior) revalidateTag(`cartao:${anterior}`)
  revalidateTag(`cartao:${novo}`)

  return new Response(JSON.stringify({ handle: novo }), { headers: { 'content-type': 'application/json' } })
}
