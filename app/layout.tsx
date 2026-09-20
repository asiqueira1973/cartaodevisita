// Casca da aplicação (spec 16.4).
// Carrega as duas famílias da seção 16.4: Instrument Serif só no display,
// Plus Jakarta Sans em todo o resto.
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cartão de Visita',
  description: 'Seu contato na agenda de quem você acabou de conhecer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
