// Uma conta, no painel da plataforma (spec 10.3).

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isPlatformAdmin } from '@/lib/admins'
import { buscarContaParaAdmin, visitasRecentes } from '@/lib/firebase/firestore'
import { somarVisitas } from '@/lib/publicacao'
import { SeloDePlano } from '@/components/platform/SeloDePlano'
import { AcoesDaConta } from '@/components/platform/AcoesDaConta'
import { TEXTOS } from '@/lib/copy'

export const metadata = { title: 'Conta · Admin', robots: { index: false, follow: false } }

const NOME_DA_ACAO: Record<string, string> = {
  despublicou_cartao: 'Tirou do ar',
  alterou_handle: 'Trocou o endereço',
  alterou_plano: 'Alterou o plano',
  bloqueou_conta: 'Bloqueou a conta',
  desbloqueou_conta: 'Desbloqueou a conta',
}

export default async function ContaDoAdminPage({ params }: { params: Promise<{ id: string }> }) {
  // Mesma guarda do layout, repetida aqui de propósito: ver app/admin/page.tsx.
  const sessao = await auth()
  if (!isPlatformAdmin(sessao?.user?.email)) notFound()

  const { id } = await params
  const conta = await buscarContaParaAdmin(id)
  if (!conta) notFound()

  const { usuario, cartao, acoes } = conta
  const visitas = somarVisitas(await visitasRecentes(id, 30))

  return (
    <div className="flex flex-col gap-6 px-5 py-5 md:px-7">
      <Link href="/admin" className="flex w-fit items-center gap-1.5 text-[13px] font-semibold text-tinta-fraca hover:text-tinta">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        Contas
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="grow text-[22px] font-bold tracking-tight text-tinta">{usuario.email}</h1>
        <SeloDePlano plano={usuario.plano} />
        {usuario.bloqueado && (
          <span className="rounded-full bg-perigo px-2.5 py-1 text-[11px] font-semibold text-white">Bloqueada</span>
        )}
      </div>

      <dl className="flex max-w-xl flex-col divide-y divide-traco rounded-xl border border-traco">
        <Linha rotulo="Endereço">
          {usuario.handle
            ? <Link href={`/${usuario.handle}`} target="_blank" className="font-semibold text-tinta hover:underline">/{usuario.handle}</Link>
            : <span className="text-tinta-desabilitada">sem endereço</span>}
        </Linha>
        <Linha rotulo="Endereço permanente">
          <span className="font-mono">{usuario.id_permanente ? `/c/${usuario.id_permanente}` : '—'}</span>
        </Linha>
        <Linha rotulo="Cartão">{cartao?.publicado ? 'No ar' : 'Fora do ar'}</Linha>
        <Linha rotulo="Links">{cartao?.links.length ?? 0}</Linha>
        <Linha rotulo="Visitas em 30 dias">{visitas.total.toLocaleString('pt-BR')}</Linha>
        <Linha rotulo="Criada em">{usuario.criado_em.toLocaleDateString('pt-BR')}</Linha>
      </dl>

      <AcoesDaConta
        usuarioId={usuario.id}
        handle={usuario.handle}
        plano={usuario.plano}
        bloqueado={usuario.bloqueado}
        publicado={cartao?.publicado ?? false}
      />

      <section className="flex max-w-xl flex-col gap-3">
        <h2 className="text-sm font-bold text-tinta">{TEXTOS.adminHistorico}</h2>
        {acoes.length === 0 ? (
          <p className="text-[13px] text-tinta-apagada">Nenhuma ação de moderação nesta conta.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-traco rounded-xl border border-traco">
            {acoes.map((acao) => (
              <li key={acao.id} className="flex flex-col gap-1 px-4 py-3">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-semibold text-tinta">{NOME_DA_ACAO[acao.acao] ?? acao.acao}</span>
                  <span className="shrink-0 text-xs text-tinta-apagada">
                    {acao.criado_em.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </span>
                {acao.detalhe && <span className="text-[13px] text-tinta-fraca">{acao.detalhe}</span>}
                <span className="text-xs text-tinta-apagada">{acao.admin_email}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-[13px] font-semibold text-tinta">{rotulo}</dt>
      <dd className="truncate text-[13px] text-tinta-fraca">{children}</dd>
    </div>
  )
}
