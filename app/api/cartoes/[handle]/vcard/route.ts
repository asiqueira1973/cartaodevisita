// O arquivo .vcf — "Salvar nos contatos" (épico 8.6).
//
// É a função central do produto: se isto falhar, o cartão não serve para nada.
// Toda a precisão de formato está em `lib/vcard.ts` e nos testes da seção 14.2;
// esta rota só junta os dados, busca a foto e serve com os cabeçalhos certos.

import { lerCartaoPublicado } from '@/lib/cache'
import { registrarVisita } from '@/lib/firebase/firestore'
import { TETO_FOTO_BASE64, buildVCard, vcardFileName } from '@/lib/vcard'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> },
): Promise<Response> {
  const { handle } = await params
  const achado = await lerCartaoPublicado(handle)
  if (!achado) return new Response(null, { status: 404 })

  const { cartao, usuario } = achado
  const urlBase = (process.env.NEXT_PUBLIC_URL_BASE ?? 'https://cartaodevisita.app.br').replace(/\/$/, '')

  const vcf = buildVCard({
    cartao,
    handle,
    urlBase,
    fotoBase64: await buscarFotoEmBase64(cartao.foto_vcard_url),
  })

  // Conta o salvamento (critério 8.6.8). Falhar aqui não pode impedir o
  // download — o arquivo é o que importa.
  void registrarVisita(usuario.id, 'salvou_contato').catch(() => {})

  return new Response(vcf, {
    headers: {
      // charset explícito: sem ele alguns leitores assumem latin-1 e os
      // acentos chegam quebrados na agenda de quem recebeu (tabela 14.2).
      'content-type': 'text/vcard; charset=utf-8',
      'content-disposition': `attachment; filename="${vcardFileName(cartao.nome_exibicao, handle)}"`,
      'cache-control': 'no-store',
    },
  })
}

/**
 * Baixa a derivada do vCard e devolve em base64 (tabela 14.1).
 *
 * Devolve `null` em qualquer falha — e aí o .vcf sai SEM a propriedade PHOTO,
 * que é melhor do que um arquivo com foto truncada: o iOS descarta o contato
 * inteiro quando a imagem está corrompida.
 */
async function buscarFotoEmBase64(url: string | null): Promise<string | null> {
  if (!url) return null
  try {
    const resposta = await fetch(url, { cache: 'force-cache' })
    if (!resposta.ok) return null
    const base64 = Buffer.from(await resposta.arrayBuffer()).toString('base64')
    return base64.length > TETO_FOTO_BASE64 ? null : base64
  } catch {
    return null
  }
}
