'use client'

// O botão de WhatsApp da página pública (princípio 0.3).
//
// É um `<a href>` de verdade: sem JavaScript ele abre o WhatsApp do mesmo
// jeito. O único acréscimo do JS é avisar o contador — e ele usa `sendBeacon`,
// que entrega em segundo plano sem segurar a navegação.
//
// Se o aviso falhar, o clique acontece igual. Contador não pode atrasar a ação
// que a página existe para provocar.

import type { ReactNode } from 'react'

export function BotaoWhatsapp({
  href, handle, cor, raio, children,
}: {
  href: string
  handle: string
  cor: string
  raio: string
  children: ReactNode
}) {
  function avisar() {
    try {
      const corpo = new Blob([JSON.stringify({ handle })], { type: 'application/json' })
      navigator.sendBeacon('/api/eventos/whatsapp', corpo)
    } catch {
      // Sem sendBeacon, sem contagem. O clique segue.
    }
  }

  return (
    <a
      href={href}
      onClick={avisar}
      className={`mt-6.5 flex min-h-14 w-full items-center justify-center gap-2.5 ${raio} px-5 text-base font-semibold text-white`}
      style={{ backgroundColor: cor }}
    >
      {children}
    </a>
  )
}
