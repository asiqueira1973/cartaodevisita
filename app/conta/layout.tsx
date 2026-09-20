// Casca do painel do dono (spec 10.2 e 16.6).
//
// CRITÉRIO 8.1.4: com `handle` nulo, qualquer rota sob `/conta` que não seja
// `/conta/handle` redireciona para `/conta/handle`.
//
// A tela de escolha NÃO herda este layout — ela vive em `app/(escolha)/`,
// justamente para este redirecionamento não virar laço. Ver o comentário lá.

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { garantirUsuario } from '@/lib/firebase/firestore'
import { firstName } from '@/lib/display-name'
import { Sidebar } from '@/components/account/Sidebar'

export default async function ContaLayout({ children }: { children: React.ReactNode }) {
  const sessao = await auth()

  // O middleware já barrou quem não tem sessão; esta é a segunda barreira, para
  // o caso de o matcher mudar sem alguém perceber (spec 6.5).
  if (!sessao?.user?.email || !sessao.user.id) redirect('/entrar?voltar=/conta')

  const usuario = await garantirUsuario(
    sessao.user.id,
    sessao.user.email,
    sessao.user.name ?? sessao.user.email,
    sessao.user.image ?? null,
  )

  if (!usuario.handle) redirect('/conta/handle')

  const primeiroNome = firstName(usuario.nome_google)

  return (
    <div className="flex min-h-screen bg-superficie">
      <Sidebar nome={primeiroNome} />
      {/* O padding inferior no celular abre espaço para a barra de navegação. */}
      <main className="min-w-0 grow pb-24 md:pb-0">{children}</main>
    </div>
  )
}
