// Permitir ou não que o cartão apareça em busca (spec 13.1 e 20.3).
//
// PEGADINHA 18.4.1: requireDono() na PRIMEIRA LINHA.
//
// O padrão é NÃO indexar. Um cartão de visitas tem telefone e e-mail expostos
// por natureza, e quem publica não necessariamente quer virar resultado de
// busca — quer um link para mandar para quem conheceu.

import { revalidateTag } from 'next/cache'
import { requireDono } from '@/lib/guards'
import { atualizarCartao } from '@/lib/firebase/firestore'
import { registrarEvento } from '@/lib/telemetria'
import { ERROS } from '@/lib/copy'

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json' } })
}

export async function PATCH(request: Request): Promise<Response> {
  const guarda = await requireDono()
  if (!guarda.ok) return guarda.resposta
  const { usuario, email } = guarda.dados

  const corpo = (await request.json().catch(() => ({}))) as { permitir?: boolean }
  if (typeof corpo.permitir !== 'boolean') return json({ erro: 'formato', mensagem: ERROS[16] }, 400)

  const cartao = await atualizarCartao(usuario.id, { permitir_indexacao: corpo.permitir })

  // As metatags mudam junto, então o cache da página precisa cair (spec 4.6.2).
  if (usuario.handle) revalidateTag(`cartao:${usuario.handle}`)

  await registrarEvento(
    'indexacao_alterada', email, 'Ajustes',
    'a pessoa mudou se o cartão pode aparecer em busca',
    { permitir: corpo.permitir },
  )

  return json({ cartao })
}
