// Meu cartão (épicos 8.2 e 8.7, spec 10.2).
//
// Busca os dados e entrega para a parte de cliente. Nenhuma chamada ao
// Firestore acontece no navegador (pegadinha 18.4.3).

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { buscarCartaoDoDono, garantirUsuario, visitasRecentes } from '@/lib/firebase/firestore'
import { limitesDoPlano } from '@/lib/planos'
import { MeuCartao } from '@/components/account/MeuCartao'

export const metadata = { title: 'Meu cartão · Cartão de Visita' }

export default async function MeuCartaoPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>
}) {
  const sessao = await auth()
  if (!sessao?.user?.email || !sessao.user.id) redirect('/entrar?voltar=/conta')

  const usuario = await garantirUsuario(
    sessao.user.id, sessao.user.email,
    sessao.user.name ?? sessao.user.email, sessao.user.image ?? null,
  )
  const cartao = await buscarCartaoDoDono(usuario.id)
  if (!cartao || !usuario.handle) redirect('/conta/handle')

  const { aba } = await searchParams
  const abaAtiva = aba === 'visitas' ? 'visitas' : 'conteudo'

  // As visitas só são lidas quando a aba está aberta: são até 30 documentos, e
  // a maioria das visitas ao painel é para editar, não para olhar número.
  const visitas = abaAtiva === 'visitas' ? await visitasRecentes(usuario.id, 30) : []

  const urlBase = (process.env.NEXT_PUBLIC_URL_BASE ?? 'https://cartaodevisita.app.br')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')

  return (
    <div className="px-5 py-6 md:px-7">
      <MeuCartao
        cartaoInicial={cartao}
        comMarca={limitesDoPlano(usuario.plano).marcaNoRodape}
        handle={usuario.handle}
        urlBase={urlBase}
        aba={abaAtiva}
        visitas={visitas}
      />
    </div>
  )
}
