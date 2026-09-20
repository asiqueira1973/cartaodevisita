// O redirecionador permanente (spec 4.3, critério 8.4.3).
//
// Esta rota é o princípio 0.4 em forma executável. Ela é o endereço que vai
// gravado na etiqueta NFC e impresso no QR — e é por existir que trocar de
// handle NÃO mata o cartão físico de ninguém.
//
// Responde 308 (Permanent Redirect), e não 301: o 308 preserva o método e é o
// que os navegadores tratam como permanente sem reescrever a requisição.
//
// Responde 404 nas mesmas condições da página pública: id inexistente, conta
// bloqueada ou cartão despublicado — indistinguíveis entre si (pegadinha 18.4.2).

import { resolverIdPermanente } from '@/lib/firebase/firestore'
import { isPermanentIdValid } from '@/lib/ids'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params

  // Formato inválido nem chega ao banco: economiza uma leitura e fecha a porta
  // para quem tenta varrer ids.
  if (!isPermanentIdValid(id)) return new Response(null, { status: 404 })

  const handle = await resolverIdPermanente(id)
  if (!handle) return new Response(null, { status: 404 })

  // O `?qr` diz à página que a visita chegou pelo endereço permanente — QR ou
  // etiqueta NFC (regra 11.8). Sem ele a origem se perderia no salto, e contar
  // dos dois lados faria a mesma visita entrar duas vezes no total.
  return new Response(null, { status: 308, headers: { location: `/${handle}?qr` } })
}
