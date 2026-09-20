// Ajustes (épico 8.8, spec 10.2).

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { buscarCartaoDoDono, garantirUsuario } from '@/lib/firebase/firestore'
import { Ajustes } from '@/components/account/Ajustes'
import { TEXTOS } from '@/lib/copy'

export const metadata = { title: 'Ajustes · Cartão de Visita' }

export default async function AjustesPage() {
  const sessao = await auth()
  if (!sessao?.user?.email || !sessao.user.id) redirect('/entrar?voltar=/conta/ajustes')

  const usuario = await garantirUsuario(
    sessao.user.id, sessao.user.email,
    sessao.user.name ?? sessao.user.email, sessao.user.image ?? null,
  )
  const cartao = await buscarCartaoDoDono(usuario.id)
  if (!cartao || !usuario.handle) redirect('/conta/handle')

  const urlBase = (process.env.NEXT_PUBLIC_URL_BASE ?? 'https://cartaodevisita.app.br')
    .replace(/^https?:\/\//, '').replace(/\/$/, '')

  return (
    <div className="flex flex-col gap-6 px-5 py-6 md:px-7">
      <h1 className="text-[26px] font-bold tracking-tight text-tinta">{TEXTOS.painelAjustes}</h1>
      <Ajustes
        handle={usuario.handle}
        email={usuario.email}
        plano={usuario.plano}
        permitirIndexacao={cartao.permitir_indexacao}
        urlBase={urlBase}
      />
    </div>
  )
}
