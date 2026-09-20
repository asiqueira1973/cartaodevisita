// Escolha do endereço público (épico 8.1, critérios 8.1.4 a 8.1.8).
//
// ATENÇÃO AO CAMINHO: esta página serve `/conta/handle`, mas vive FORA de
// `app/conta/`, dentro do grupo de rota `(escolha)`. É de propósito.
//
// O layout `app/conta/layout.tsx` manda para cá toda conta sem handle
// (critério 8.1.4). Se esta página herdasse aquele layout, ela mandaria para si
// mesma e o primeiro login entraria em laço de redirecionamento. O grupo de rota
// quebra a herança sem mudar a URL. O ViraPágina teve exatamente esse bug, e a
// correção foi esta.

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { garantirUsuario, handleEstaTomado } from '@/lib/firebase/firestore'
import { suggestHandle } from '@/lib/handle'
import { HandleForm } from '@/components/account/HandleForm'
import { TEXTOS } from '@/lib/copy'

export const metadata = { title: 'Escolha seu endereço · Cartão de Visita' }

export default async function EscolherHandlePage() {
  const sessao = await auth()
  if (!sessao?.user?.email || !sessao.user.id) redirect('/entrar?voltar=/conta/handle')

  // A conta nasce aqui se ainda não existir — mesmo caminho de `requireDono`
  // (spec 6.2). É o primeiro acesso de verdade.
  const usuario = await garantirUsuario(
    sessao.user.id,
    sessao.user.email,
    sessao.user.name ?? sessao.user.email,
    sessao.user.image ?? null,
  )

  // Quem já tem endereço não passa por aqui de novo.
  if (usuario.handle) redirect('/conta')

  const sugestao = await suggestHandle(usuario.nome_google, handleEstaTomado)

  const urlBase = (process.env.NEXT_PUBLIC_URL_BASE ?? 'https://cartaodevisita.app.br')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-superficie px-6 py-16">
      <div className="flex w-full max-w-md flex-col gap-7">
        <div className="flex items-center gap-2.5">
          <span className="h-6 w-6 rounded-md bg-tinta" aria-hidden />
          <span className="text-base font-bold text-tinta">Cartão de Visita</span>
        </div>

        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-tinta">
          {TEXTOS.escolhaTitulo}
        </h1>

        <HandleForm sugestao={sugestao} urlBase={urlBase} />
      </div>
    </main>
  )
}
