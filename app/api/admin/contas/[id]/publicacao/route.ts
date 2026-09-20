// Despublicar cartão por denúncia (critério 8.9.3).
//
// PEGADINHA 18.4.1: requireAdminPlataforma() na PRIMEIRA LINHA — e ela devolve
// 404, nunca 403, para quem não é admin.

import { revalidateTag } from 'next/cache'
import { requireAdminPlataforma } from '@/lib/guards'
import { buscarContaParaAdmin, despublicarPorAdmin, registrarAcaoAdmin } from '@/lib/firebase/firestore'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const guarda = await requireAdminPlataforma()
  if (!guarda.ok) return guarda.resposta

  const { id } = await params
  const corpo = (await request.json().catch(() => ({}))) as { publicado?: boolean; detalhe?: string }

  // SÓ aceita `false`: o admin despublica, nunca publica cartão alheio
  // (regra 5.2). Publicar é ato do dono.
  if (corpo.publicado !== false) {
    return new Response(JSON.stringify({ erro: 'so_despublica' }), {
      status: 422, headers: { 'content-type': 'application/json' },
    })
  }

  const conta = await buscarContaParaAdmin(id)
  if (!conta) return new Response(null, { status: 404 })

  await despublicarPorAdmin(id)
  await registrarAcaoAdmin(guarda.dados.email, 'despublicou_cartao', id, corpo.detalhe?.trim() || null)
  if (conta.usuario.handle) revalidateTag(`cartao:${conta.usuario.handle}`)

  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } })
}
