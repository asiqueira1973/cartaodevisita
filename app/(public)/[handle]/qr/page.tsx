// QR em tela cheia (critério 8.5.4).
//
// O momento que esta tela serve: a pessoa termina o serviço, abre isto e vira o
// celular para o cliente apontar a câmera (cenário 1.3). Por isso ela é branco
// puro, sem nada além do código e do endereço em texto pequeno.

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { lerCartaoPublicado } from '@/lib/cache'
import { qrComoSvg } from '@/lib/qr'
import { ManterTelaAcesa } from '@/components/card/ManterTelaAcesa'

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  return { title: `QR · ${handle}`, robots: { index: false, follow: false } }
}

export default async function QrTelaCheiaPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const achado = await lerCartaoPublicado(handle)
  if (!achado?.usuario.id_permanente) notFound()

  const urlBase = (process.env.NEXT_PUBLIC_URL_BASE ?? 'https://cartaodevisita.app.br').replace(/\/$/, '')
  const svg = await qrComoSvg(achado.usuario.id_permanente, urlBase)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-white px-3 py-6">
      <ManterTelaAcesa />

      <div className="flex w-full">
        <Link
          href={`/${handle}`}
          aria-label="Voltar para o cartão"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-cartao-traco"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      </div>

      <div className="flex flex-col items-center gap-5">
        {/* O endereço vem ACIMA do código, não abaixo: esta tela é fotografada,
            e num print o que está no topo é o que se lê primeiro. Quem tem mais
            de um cartão precisa saber qual é qual na galeria. */}
        <p className="text-center text-[17px] font-bold tracking-tight text-cartao-texto">
          {urlBase.replace(/^https?:\/\//, '')}/{handle}
        </p>

        {/* O critério 8.5.4 fala do CÓDIGO ocupando 70% da menor dimensão, e o
            código é menor que o contêiner: a zona de silêncio de 4 módulos
            exigida por 8.5.3 come as bordas. Num código de 33 módulos ela
            consome ~20%, então o contêiner precisa de ~87% para o código
            chegar aos 70%. Daí o 92vw com padding reduzido nesta tela. */}
        <div
          className="[&>svg]:h-full [&>svg]:w-full"
          style={{ width: 'min(92vw, 72vh)', height: 'min(92vw, 72vh)' }}
          role="img"
          aria-label={`QR code do cartão de ${achado.cartao.nome_exibicao}`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      <div className="h-11" />
    </main>
  )
}
