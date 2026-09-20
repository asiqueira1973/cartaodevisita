'use client'

// Menu lateral do painel (spec 16.6).
//
// Monocromático: item ativo com fundo #ECECEC e texto preto, NUNCA colorido.
// Lista plana, sem títulos de grupo, sem marcador e sem barra lateral. No
// celular vira barra inferior com os mesmos destinos.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { sair } from '@/app/conta/actions'

interface Destino {
  href: string
  rotulo: string
  icone: React.ReactNode
}

const traco = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const DESTINOS: Destino[] = [
  { href: '/conta', rotulo: 'Meu cartão', icone: (
    <svg width="17" height="17" viewBox="0 0 24 24" {...traco}><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><circle cx="8" cy="11" r="2" /><path d="M14 10h4M14 14h4" /></svg>
  ) },
  { href: '/conta/links', rotulo: 'Links', icone: (
    <svg width="17" height="17" viewBox="0 0 24 24" {...traco}><path d="M10 13a4.5 4.5 0 0 0 6.6.5l2.6-2.6a4.6 4.6 0 0 0-6.5-6.5l-1.5 1.5" /><path d="M14 11a4.5 4.5 0 0 0-6.6-.5L4.8 13A4.6 4.6 0 0 0 11.3 19.6l1.5-1.5" /></svg>
  ) },
  { href: '/conta/aparencia', rotulo: 'Aparência', icone: (
    <svg width="17" height="17" viewBox="0 0 24 24" {...traco}><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 0 0 18" /><circle cx="15.5" cy="9" r="1.2" /></svg>
  ) },
  { href: '/conta/compartilhar', rotulo: 'Compartilhar', icone: (
    <svg width="17" height="17" viewBox="0 0 24 24" {...traco}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>
  ) },
  { href: '/conta/ajustes', rotulo: 'Ajustes', icone: (
    <svg width="17" height="17" viewBox="0 0 24 24" {...traco}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8 2 2 0 1 1-2.8 2.8 1.6 1.6 0 0 0-2.7 1.1 2 2 0 1 1-4 0 1.6 1.6 0 0 0-2.7-1.1 2 2 0 1 1-2.8-2.8A1.6 1.6 0 0 0 3 12.9a2 2 0 1 1 0-4" /></svg>
  ) },
]

/**
 * Desenha o menu lateral (desktop) e a barra inferior (celular).
 *
 * É componente de cliente só para saber qual item marcar como ativo — o
 * `usePathname` não existe em componente de servidor. Ele não toca em dado
 * nenhum (pegadinha 18.4.3); a ação de sair vem de `app/conta/actions.ts`.
 */
export function Sidebar({ nome }: { nome: string }) {
  const caminho = usePathname()

  // Um item ativo por vez (spec 16.6). `/conta` só casa exato, senão ele ficaria
  // ativo junto com todos os filhos.
  const ativo = (href: string) => (href === '/conta' ? caminho === href : caminho.startsWith(href))

  return (
    <>
      <nav aria-label="Painel" className="hidden w-62 shrink-0 flex-col border-r border-traco bg-superficie-2 px-3 py-4.5 md:flex">
        <div className="flex items-center gap-2.5 px-2 pb-5">
          <span className="h-5.5 w-5.5 rounded-md bg-tinta" aria-hidden />
          <span className="text-[15px] font-bold text-tinta">Cartão de Visita</span>
        </div>

        <div className="flex flex-col gap-0.5">
          {DESTINOS.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              aria-current={ativo(d.href) ? 'page' : undefined}
              className={`flex min-h-9.5 items-center gap-2.5 rounded-[9px] px-2.5 ${
                ativo(d.href)
                  ? 'bg-ativo font-semibold text-tinta'
                  : 'font-medium text-tinta-media hover:bg-ativo/50'
              }`}
            >
              <span className={ativo(d.href) ? 'text-tinta' : 'text-tinta-fraca'}>{d.icone}</span>
              <span className="text-sm">{d.rotulo}</span>
            </Link>
          ))}
        </div>

        <div className="grow" />

        <form action={sair} className="flex items-center gap-2.5 border-t border-traco px-2 pt-3.5">
          <span className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-tinta text-[10px] font-bold text-white">
            {iniciais(nome)}
          </span>
          <span className="grow truncate text-[13px] font-semibold text-tinta">{nome}</span>
          <button type="submit" aria-label="Sair" className="cursor-pointer text-tinta-apagada hover:text-tinta">
            <svg width="15" height="15" viewBox="0 0 24 24" {...traco}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
          </button>
        </form>
      </nav>

      <nav aria-label="Painel" className="fixed inset-x-0 bottom-0 z-10 flex border-t border-traco bg-superficie px-1 pt-2 pb-[env(safe-area-inset-bottom)] md:hidden">
        {DESTINOS.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            aria-current={ativo(d.href) ? 'page' : undefined}
            className={`flex grow flex-col items-center gap-1 pb-2 pt-1.5 ${
              ativo(d.href) ? 'text-tinta' : 'text-tinta-apagada'
            }`}
          >
            {d.icone}
            <span className={`text-[10px] ${ativo(d.href) ? 'font-bold' : 'font-medium'}`}>{d.rotulo}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}

/** Duas letras para o avatar do rodapé, a partir do nome. */
function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  const primeira = partes[0]?.[0] ?? '?'
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}
