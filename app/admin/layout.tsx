// Casca do painel da plataforma (spec 10.3).
//
// PEGADINHA 18.4.2: responde 404 para quem não é admin, INCLUSIVE para quem
// não está logado. Redirecionar para o login confirmaria que a rota existe.
//
// É por isso que `/admin/*` NÃO passa pelo middleware — ver o comentário em
// `middleware.ts`.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isPlatformAdmin } from '@/lib/admins'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sessao = await auth()
  if (!isPlatformAdmin(sessao?.user?.email)) notFound()

  return (
    <div className="flex min-h-screen bg-superficie">
      <nav aria-label="Plataforma" className="hidden w-62 shrink-0 flex-col border-r border-traco bg-superficie-2 px-3 py-4.5 md:flex">
        <div className="flex items-center gap-2.5 px-2 pb-5">
          <span className="h-5.5 w-5.5 rounded-md bg-tinta" aria-hidden />
          <span className="grow text-[15px] font-bold text-tinta">Cartão de Visita</span>
          <span className="rounded-full bg-ativo px-2 py-0.5 text-[10px] font-semibold text-tinta-fraca">Admin</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <Link href="/conta" className="flex min-h-9.5 items-center gap-2.5 rounded-[9px] px-2.5 text-sm font-medium text-tinta-media hover:bg-ativo/50">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><circle cx="8" cy="11" r="2" /><path d="M14 10h4M14 14h4" /></svg>
            Meu cartão
          </Link>
          <Link href="/admin" aria-current="page" className="flex min-h-9.5 items-center gap-2.5 rounded-[9px] bg-ativo px-2.5 text-sm font-semibold text-tinta">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="3.5" /><path d="M22 20v-2a4 4 0 0 0-3-3.9" /></svg>
            Contas
          </Link>
        </div>

        <div className="grow" />
        <div className="flex items-center gap-2.5 border-t border-traco px-2 pt-3.5">
          <span className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-tinta text-[9px] font-bold text-white">DL</span>
          <span className="grow truncate text-[13px] font-semibold text-tinta">Dab Lab</span>
        </div>
      </nav>

      <main className="min-w-0 grow">{children}</main>
    </div>
  )
}
