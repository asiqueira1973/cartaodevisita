// Compartilhar (épico 8.5, spec 10.2).

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { buscarCartaoDoDono, garantirUsuario } from '@/lib/firebase/firestore'
import { qrComoSvg, urlDoQr } from '@/lib/qr'
import { Compartilhar } from '@/components/account/Compartilhar'
import { TEXTOS } from '@/lib/copy'

export const metadata = { title: 'Compartilhar · Cartão de Visita' }

export default async function CompartilharPage() {
  const sessao = await auth()
  if (!sessao?.user?.email || !sessao.user.id) redirect('/entrar?voltar=/conta/compartilhar')

  const usuario = await garantirUsuario(
    sessao.user.id, sessao.user.email,
    sessao.user.name ?? sessao.user.email, sessao.user.image ?? null,
  )
  const cartao = await buscarCartaoDoDono(usuario.id)
  if (!cartao || !usuario.handle || !usuario.id_permanente) redirect('/conta/handle')

  const urlBaseCompleta = process.env.NEXT_PUBLIC_URL_BASE ?? 'https://cartaodevisita.app.br'

  return (
    <div className="flex flex-col gap-6 px-5 py-6 md:px-7">
      <h1 className="text-[26px] font-bold tracking-tight text-tinta">{TEXTOS.painelCompartilhar}</h1>
      <Compartilhar
        handle={usuario.handle}
        urlBase={urlBaseCompleta.replace(/^https?:\/\//, '').replace(/\/$/, '')}
        urlPermanente={urlDoQr(usuario.id_permanente, urlBaseCompleta)}
        qrSvg={await qrComoSvg(usuario.id_permanente, urlBaseCompleta)}
        publicado={cartao.publicado}
      />
    </div>
  )
}
