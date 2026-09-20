// Publicar e tirar do ar (spec 13.1, critério 8.7.2).
//
// PEGADINHA 18.4.1: requireDono() na PRIMEIRA LINHA.

import { revalidateTag } from 'next/cache'
import { requireDono } from '@/lib/guards'
import { atualizarCartao, buscarCartaoDoDono } from '@/lib/firebase/firestore'
import { motivoParaNaoPublicar } from '@/lib/publicacao'
import { registrarEvento } from '@/lib/telemetria'
import { ERROS } from '@/lib/copy'

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json' } })
}

export async function PATCH(request: Request): Promise<Response> {
  const guarda = await requireDono()
  if (!guarda.ok) return guarda.resposta
  const { usuario, email } = guarda.dados

  const corpo = (await request.json().catch(() => ({}))) as { publicado?: boolean }
  if (typeof corpo.publicado !== 'boolean') return json({ erro: 'formato', mensagem: ERROS[16] }, 400)

  const cartaoAtual = await buscarCartaoDoDono(usuario.id)
  if (!cartaoAtual) return json({ erro: 'sem_cartao', mensagem: ERROS[16] }, 404)

  // A MESMA função que desabilita o botão no cliente decide aqui (critério
  // 8.7.2). Duas implementações divergiriam, e a divergência apareceria como
  // botão habilitado que dá erro ao clicar.
  if (corpo.publicado && motivoParaNaoPublicar(cartaoAtual)) {
    return json({ erro: 'incompleto', mensagem: ERROS[13] }, 422)
  }

  const cartao = await atualizarCartao(usuario.id, { publicado: corpo.publicado })

  // Invalida o cache de leitura da página pública (spec 4.6.2). Sem isto,
  // publicar levaria até 60 segundos para valer — e o primeiro reflexo de quem
  // publica é abrir o próprio link para conferir.
  if (usuario.handle) revalidateTag(`cartao:${usuario.handle}`)

  if (corpo.publicado) {
    const minutos = Math.round((Date.now() - usuario.criado_em.getTime()) / 60000)
    await registrarEvento(
      'cartao_publicado', email, 'MeuCartao', 'a pessoa colocou o cartão no ar',
      {
        links: cartaoAtual.links.length,
        template: cartaoAtual.template,
        cor: cartaoAtual.cor_destaque,
        plano: usuario.plano,
        tem_foto: !!cartaoAtual.foto_url,
        tem_bio: !!cartaoAtual.bio,
        // Mede a promessa da home, "monte em cinco minutos" (spec 21.3.3).
        minutos_desde_criacao: minutos,
      },
    )
  } else {
    const dias = Math.round((Date.now() - cartaoAtual.atualizado_em.getTime()) / 86400000)
    await registrarEvento(
      'cartao_despublicado', email, 'MeuCartao', 'a pessoa tirou o cartão do ar',
      { dias_no_ar: dias },
    )
  }

  return json({ cartao })
}
