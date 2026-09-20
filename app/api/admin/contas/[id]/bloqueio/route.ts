// Bloquear e desbloquear conta (critério 8.9.5).
//
// Conta bloqueada responde 404 na página pública — indistinguível de conta
// inexistente (pegadinha 18.4.2).

import { revalidateTag } from 'next/cache'
import { requireAdminPlataforma } from '@/lib/guards'
import { buscarContaParaAdmin, definirBloqueio, registrarAcaoAdmin } from '@/lib/firebase/firestore'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const guarda = await requireAdminPlataforma()
  if (!guarda.ok) return guarda.resposta

  const { id } = await params
  const corpo = (await request.json().catch(() => ({}))) as { bloqueado?: boolean; detalhe?: string }
  if (typeof corpo.bloqueado !== 'boolean') return new Response(null, { status: 400 })

  const conta = await buscarContaParaAdmin(id)
  if (!conta) return new Response(null, { status: 404 })

  await definirBloqueio(id, corpo.bloqueado)
  await registrarAcaoAdmin(
    guarda.dados.email,
    corpo.bloqueado ? 'bloqueou_conta' : 'desbloqueou_conta',
    id,
    corpo.detalhe?.trim() || null,
  )
  if (conta.usuario.handle) revalidateTag(`cartao:${conta.usuario.handle}`)

  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } })
}
