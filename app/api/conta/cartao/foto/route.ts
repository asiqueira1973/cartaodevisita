// Envio e remoção da foto do cartão (spec 13.1, critérios 8.2.3 a 8.2.7).
//
// PEGADINHA 18.4.1: requireDono() na PRIMEIRA LINHA.
//
// O redimensionamento acontece NO NAVEGADOR (assunção 24.12): esta rota recebe
// as duas derivadas já prontas e só valida. Isso mantém a rota barata e evita
// processar imagem em função serverless.

import { requireDono } from '@/lib/guards'
import { atualizarCartao } from '@/lib/firebase/firestore'
import { apagarFotos, salvarFotos } from '@/lib/firebase/storage'
import { TETO_EXIBICAO_BYTES, TETO_VCARD_BYTES, validarDerivada } from '@/lib/imagens'
import { registrarEvento } from '@/lib/telemetria'
import { ERROS } from '@/lib/copy'

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json' } })
}

/** Recebe as duas derivadas, valida os magic bytes e grava (critério 8.2.3). */
export async function POST(request: Request): Promise<Response> {
  const guarda = await requireDono()
  if (!guarda.ok) return guarda.resposta
  const { usuario, email } = guarda.dados

  const formulario = await request.formData().catch(() => null)
  const exibicao = formulario?.get('exibicao')
  const vcard = formulario?.get('vcard')

  // As duas vêm juntas ou nenhuma vem (máquina de estado 12.3).
  if (!(exibicao instanceof File) || !(vcard instanceof File)) {
    return json({ erro: 'incompleto', mensagem: ERROS[10] }, 400)
  }

  const bytesExibicao = new Uint8Array(await exibicao.arrayBuffer())
  const bytesVcard = new Uint8Array(await vcard.arrayBuffer())

  for (const [dados, teto] of [
    [bytesExibicao, TETO_EXIBICAO_BYTES],
    [bytesVcard, TETO_VCARD_BYTES],
  ] as const) {
    const erro = validarDerivada(dados, teto)
    // Magic bytes, não extensão nem Content-Type — os dois últimos são texto
    // que qualquer um escreve (critério 8.2.5).
    if (erro === 'formato') return json({ erro: 'formato', mensagem: ERROS[8] }, 400)
    if (erro === 'tamanho') return json({ erro: 'tamanho', mensagem: ERROS[7] }, 413)
  }

  const urls = await salvarFotos(usuario.id, bytesExibicao, bytesVcard)
  const cartao = await atualizarCartao(usuario.id, urls)

  await registrarEvento(
    'foto_enviada', email, 'MeuCartao', 'a pessoa trocou a foto do cartão',
    { kb_exibicao: Math.round(bytesExibicao.length / 1024), kb_vcard: Math.round(bytesVcard.length / 1024) },
  )

  return json({ cartao })
}

/** Remove a foto: apaga os dois arquivos e zera os dois campos (critério 8.2.7). */
export async function DELETE(): Promise<Response> {
  const guarda = await requireDono()
  if (!guarda.ok) return guarda.resposta
  const { usuario } = guarda.dados

  await apagarFotos(usuario.id)
  const cartao = await atualizarCartao(usuario.id, { foto_url: null, foto_vcard_url: null })
  return json({ cartao })
}
