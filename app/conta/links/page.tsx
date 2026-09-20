// Links (épico 8.3, spec 10.2).

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { buscarCartaoDoDono, garantirUsuario } from '@/lib/firebase/firestore'
import { limitesDoPlano } from '@/lib/planos'
import { LinksComPrevia } from '@/components/account/LinksComPrevia'

export const metadata = { title: 'Links · Cartão de Visita' }

export default async function LinksPage() {
  const sessao = await auth()
  if (!sessao?.user?.email || !sessao.user.id) redirect('/entrar?voltar=/conta/links')

  const usuario = await garantirUsuario(
    sessao.user.id, sessao.user.email,
    sessao.user.name ?? sessao.user.email, sessao.user.image ?? null,
  )
  const cartao = await buscarCartaoDoDono(usuario.id)
  if (!cartao) redirect('/conta/handle')

  const limites = limitesDoPlano(usuario.plano)

  return (
    <div className="flex flex-col gap-6 px-5 py-6 md:px-7">
      <div className="flex items-center gap-4">
        <h1 className="grow text-[26px] font-bold tracking-tight text-tinta">Links</h1>
        <span className="text-[13px] tabular-nums text-tinta-apagada">
          {cartao.links.length} de {limites.links}
        </span>
      </div>

      <LinksComPrevia
        cartaoInicial={cartao}
        comMarca={limites.marcaNoRodape}
        tetoDoPlano={limites.links}
      />
    </div>
  )
}
