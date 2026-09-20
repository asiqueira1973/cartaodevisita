// Exclusão da conta (spec 13.1 e 20.4).
//
// PEGADINHA 18.4.1: requireDono() na PRIMEIRA LINHA.
//
// Apaga na hora, sem fila e sem soft delete: é direito do titular, e "vamos
// apagar em 30 dias" não é apagar. O ÚNICO que sobrevive é `acoes_admin`, que
// é log de auditoria de atos da plataforma (spec 7.8).

import { revalidateTag } from 'next/cache'
import { requireDono } from '@/lib/guards'
import { excluirConta } from '@/lib/firebase/firestore'
import { apagarFotos } from '@/lib/firebase/storage'
import { registrarEvento } from '@/lib/telemetria'
import { ERROS } from '@/lib/copy'

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json' } })
}

export async function DELETE(request: Request): Promise<Response> {
  const guarda = await requireDono()
  if (!guarda.ok) return guarda.resposta
  const { usuario, email } = guarda.dados

  const corpo = (await request.json().catch(() => ({}))) as { confirmacao?: string }

  // Digitar o próprio endereço é a confirmação (critério 8.8.4). Um "tem
  // certeza?" com dois botões é clicado no automático; digitar, não.
  if (corpo.confirmacao?.trim().toLowerCase() !== usuario.handle) {
    return json({ erro: 'confirmacao', mensagem: ERROS[14] }, 422)
  }

  const diasDeVida = Math.round((Date.now() - usuario.criado_em.getTime()) / 86400000)

  // A telemetria vai ANTES de apagar: depois não há mais de onde tirar o
  // número, e um evento de saída sem dado nenhum não serve para nada.
  await registrarEvento(
    'conta_excluida', email, 'Ajustes', 'a pessoa excluiu a própria conta',
    { dias_de_vida: diasDeVida, chegou_a_publicar: !!usuario.handle },
  )

  // Os arquivos saem primeiro: se o documento sumisse antes, sobraria foto no
  // Storage sem nada apontando para ela, e ninguém saberia que existe.
  await apagarFotos(usuario.id)
  await excluirConta(usuario.id)

  if (usuario.handle) revalidateTag(`cartao:${usuario.handle}`)

  return json({ ok: true })
}
