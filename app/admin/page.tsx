// Contas — a listagem da plataforma (critério 8.9.2, spec 10.3).

import Link from 'next/link'
import { listarContas } from '@/lib/firebase/firestore'
import { SeloDePlano } from '@/components/platform/SeloDePlano'
import { TEXTOS } from '@/lib/copy'

export const metadata = { title: 'Contas · Admin', robots: { index: false, follow: false } }

export default async function AdminContasPage() {
  const contas = await listarContas()
  const earlyAdopters = contas.filter((c) => c.usuario.plano === 'early_adopter').length
  const ilimitadas = contas.filter((c) => c.usuario.plano === 'ilimitado').length
  const aberta = process.env.EARLY_ADOPTER_ABERTO === 'true'
  const maiorTrafego = Math.max(...contas.map((c) => c.visitasNoMes), 1)

  return (
    <div className="flex flex-col gap-4 px-5 py-5 md:px-7">
      {/* A faixa mostra o valor REAL da variável de ambiente, não um texto
          fixo: esquecer de ligar ou desligar a chave é o erro provável, e ver
          o valor na tela é o que faz alguém perceber (regra 11.11.3). */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-traco px-4 py-3.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" className="shrink-0">
          <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
        </svg>
        <div className="flex min-w-0 grow flex-col gap-0.5">
          <span className="text-sm font-semibold text-tinta">
            {aberta ? TEXTOS.adminAbertaTitulo : TEXTOS.adminFechadaTitulo}
          </span>
          <span className="text-[13px] text-tinta-fraca">
            {aberta ? TEXTOS.adminAbertaDetalhe : TEXTOS.adminFechadaDetalhe}
          </span>
        </div>
        <code className="shrink-0 font-mono text-xs text-tinta-apagada">
          EARLY_ADOPTER_ABERTO={aberta ? 'true' : 'false'}
        </code>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-[26px] font-bold tracking-tight text-tinta">{TEXTOS.adminTitulo}</h1>
        <p className="text-[13px] text-tinta-apagada">
          {contas.length} {contas.length === 1 ? 'conta' : 'contas'} · {earlyAdopters} early adopters · {ilimitadas} {ilimitadas === 1 ? 'ilimitada' : 'ilimitadas'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-3xl border-collapse text-left">
          <thead>
            <tr className="bg-superficie-2">
              <Th className="rounded-l-lg">Conta</Th>
              <Th>Endereço</Th>
              <Th>Plano</Th>
              <Th>Links</Th>
              <Th>Visitas do mês</Th>
              <Th className="rounded-r-lg text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {contas.map(({ usuario, links, publicado, visitasNoMes }) => (
              <tr key={usuario.id} className="border-b border-[#F0F0F0]">
                <Td>
                  <span className="flex items-center gap-2">
                    {usuario.bloqueado && (
                      <span className="rounded-full bg-perigo px-2 py-0.5 text-[10px] font-semibold text-white">Bloqueada</span>
                    )}
                    <span className="truncate">{usuario.email}</span>
                  </span>
                </Td>
                <Td className="text-tinta-fraca">
                  {usuario.handle ? `/${usuario.handle}` : <span className="text-tinta-desabilitada">sem endereço</span>}
                </Td>
                <Td><SeloDePlano plano={usuario.plano} /></Td>
                <Td className="tabular-nums">{links}</Td>
                <Td>
                  <span className="flex items-center gap-2.5">
                    <span className="block h-1 w-24 shrink-0 overflow-hidden rounded-full bg-ativo">
                      <span className="block h-1 bg-tinta" style={{ width: `${Math.round((visitasNoMes / maiorTrafego) * 100)}%` }} />
                    </span>
                    <span className="tabular-nums">
                      {visitasNoMes > 0 ? visitasNoMes.toLocaleString('pt-BR') : <span className="text-tinta-desabilitada">—</span>}
                    </span>
                  </span>
                </Td>
                <Td className="text-right">
                  <span className="flex items-center justify-end gap-2">
                    {!publicado && <span className="text-[11px] text-tinta-desabilitada">fora do ar</span>}
                    <Link href={`/admin/contas/${usuario.id}`} className="font-semibold text-tinta hover:underline">
                      Abrir
                    </Link>
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {contas.length === 0 && (
        <p className="py-8 text-center text-sm text-tinta-apagada">Nenhuma conta ainda.</p>
      )}
    </div>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2.5 text-xs font-semibold text-tinta-fraca ${className}`}>{children}</th>
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-3 text-[13px] text-tinta ${className}`}>{children}</td>
}
