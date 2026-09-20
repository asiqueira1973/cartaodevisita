// PNG do QR, para imprimir (critério 8.5.6).
//
// Rota pública: o QR de um cartão publicado não é segredo — ele está impresso
// no cartão de papel de quem o distribui.

import { lerCartaoPublicado } from '@/lib/cache'
import { nomeDoArquivoQr, qrComoPng } from '@/lib/qr'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> },
): Promise<Response> {
  const { handle } = await params
  const achado = await lerCartaoPublicado(handle)
  // Mesmas condições de 404 da página (pegadinha 18.4.2).
  if (!achado?.usuario.id_permanente) return new Response(null, { status: 404 })

  const urlBase = process.env.NEXT_PUBLIC_URL_BASE ?? 'https://cartaodevisita.app.br'
  const png = await qrComoPng(achado.usuario.id_permanente, urlBase)

  return new Response(new Uint8Array(png), {
    headers: {
      'content-type': 'image/png',
      'content-disposition': `attachment; filename="${nomeDoArquivoQr(handle)}"`,
      // Um ano: o conteúdo do QR nunca muda (princípio 0.4).
      'cache-control': 'public, max-age=31536000, immutable',
    },
  })
}
