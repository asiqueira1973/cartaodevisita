// Meu cartão — o editor (épico 8.2, spec 10.2).
//
// Componente de servidor: busca o cartão e entrega para a parte de cliente, que
// cuida da edição. Nenhuma chamada ao Firestore acontece no navegador
// (pegadinha 18.4.3).

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { buscarCartaoDoDono, garantirUsuario } from '@/lib/firebase/firestore'
import { limitesDoPlano } from '@/lib/planos'
import { CORES } from '@/lib/cores'
import { EditorComPrevia } from '@/components/account/EditorComPrevia'

export const metadata = { title: 'Meu cartão · Cartão de Visita' }

const NOME_DO_TEMPLATE = {
  minimalista: 'minimalista',
  cartao: 'cartão',
  foto: 'foto',
  executivo: 'executivo',
} as const

export default async function MeuCartaoPage() {
  const sessao = await auth()
  if (!sessao?.user?.email || !sessao.user.id) redirect('/entrar?voltar=/conta')

  const usuario = await garantirUsuario(
    sessao.user.id, sessao.user.email,
    sessao.user.name ?? sessao.user.email, sessao.user.image ?? null,
  )
  const cartao = await buscarCartaoDoDono(usuario.id)
  if (!cartao) redirect('/conta/handle')

  const urlBase = (process.env.NEXT_PUBLIC_URL_BASE ?? 'https://cartaodevisita.app.br').replace(/\/$/, '')

  return (
    <div className="flex flex-col gap-6 px-5 py-6 md:px-7">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex min-w-0 grow flex-col gap-1">
          <h1 className="text-[26px] font-bold tracking-tight text-tinta">Meu cartão</h1>
          <div className="flex items-center gap-2">
            <span
              className={`h-1.75 w-1.75 shrink-0 rounded-full ${cartao.publicado ? 'bg-tinta' : 'bg-traco-forte'}`}
              aria-hidden
            />
            <span className="truncate text-[13px] text-tinta-fraca">
              {cartao.publicado ? 'No ar em ' : 'Fora do ar · '}
              <span className="font-semibold text-tinta">{urlBase.replace(/^https?:\/\//, '')}/{usuario.handle}</span>
            </span>
          </div>
        </div>
      </div>

      <EditorComPrevia
        cartaoInicial={cartao}
        comMarca={limitesDoPlano(usuario.plano).marcaNoRodape}
        template={NOME_DO_TEMPLATE[cartao.template]}
        cor={CORES[cartao.cor_destaque].rotulo.toLowerCase()}
      />
    </div>
  )
}
