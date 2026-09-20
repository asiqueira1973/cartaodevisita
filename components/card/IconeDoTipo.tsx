// Ícone de cada tipo de link (spec 16.4).
//
// Traço fino, `currentColor`, sem emoji (regra de craft do design). Tipo sem
// ícone próprio cai no genérico de elo — é melhor do que inventar um desenho
// ruim para cada rede.

import type { TipoLink } from '@/types/dominio'

const traco = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const DESENHOS: Partial<Record<TipoLink, React.ReactNode>> = {
  whatsapp: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z" />,
  telefone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.8 2.1z" />,
  email: <><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M3 7l9 6 9-6" /></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" /></>,
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7.5 10.5v6M7.5 7.5v.01M11.5 16.5v-6M11.5 13a2.5 2.5 0 0 1 5 0v3.5" /></>,
  site: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  pix: <><path d="M12 3l9 9-9 9-9-9z" /><path d="M8.5 12h7" /></>,
  endereco: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="2.8" /></>,
  youtube: <><rect x="2.5" y="5.5" width="19" height="13" rx="3.5" /><path d="M10.5 9.5l5 2.5-5 2.5z" /></>,
  github: <path d="M9 19c-4 1.3-4-2-6-2.5m12 4.5v-3.4c0-1 .1-1.4-.5-2 2.3-.3 4.5-1.2 4.5-5a3.9 3.9 0 0 0-1.1-2.7 3.6 3.6 0 0 0-.1-2.7s-.9-.3-2.9 1.1a10 10 0 0 0-5 0C7.9 4.9 7 5.2 7 5.2a3.6 3.6 0 0 0-.1 2.7A3.9 3.9 0 0 0 5.8 10.6c0 3.8 2.2 4.7 4.5 5-.6.6-.6 1.2-.5 2V21" />,
  spotify: <><circle cx="12" cy="12" r="9" /><path d="M7.5 9.5c3-1 6.5-.7 9 .8M8 13c2.3-.7 5-.5 7 .7M8.5 16.2c1.8-.5 3.8-.4 5.4.5" /></>,
}

const GENERICO = (
  <>
    <path d="M10 13a4.5 4.5 0 0 0 6.6.5l2.6-2.6a4.6 4.6 0 0 0-6.5-6.5l-1.5 1.5" />
    <path d="M14 11a4.5 4.5 0 0 0-6.6-.5L4.8 13A4.6 4.6 0 0 0 11.3 19.6l1.5-1.5" />
  </>
)

export function IconeDoTipo({ tipo, tamanho = 19 }: { tipo: TipoLink; tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" {...traco} aria-hidden="true">
      {DESENHOS[tipo] ?? GENERICO}
    </svg>
  )
}
