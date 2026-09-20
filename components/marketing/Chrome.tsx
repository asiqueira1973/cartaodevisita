// Cabeçalho e rodapé das páginas de marketing e dos documentos legais.
//
// A página do CARTÃO não usa nada disto — ela é a peça do dono e não leva
// navegação do produto (spec 16.1). Isto aqui é a casca do site.

import Link from 'next/link'
import { RESPONSAVEL, TEXTOS } from '@/lib/copy'

export function CabecalhoPublico() {
  return (
    <header className="border-b border-traco bg-superficie">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="h-5.5 w-5.5 rounded-md bg-tinta" aria-hidden />
          <span className="text-[15px] font-bold text-tinta">Cartão de Visita</span>
        </Link>
        <span className="grow" />
        <Link href="/entrar" className="text-sm font-semibold text-tinta hover:underline">
          {TEXTOS.loginBotao.replace('Entrar com o Google', 'Entrar')}
        </Link>
      </div>
    </header>
  )
}

export function RodapePublico() {
  return (
    <footer className="border-t border-traco bg-superficie">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-6 py-6 text-[13px] text-tinta-apagada">
        <span className="grow">Cartão de Visita — {RESPONSAVEL.nome}</span>
        <Link href="/termos" className="hover:text-tinta">Termos</Link>
        <Link href="/privacidade" className="hover:text-tinta">Privacidade</Link>
        <a href={`mailto:${RESPONSAVEL.email}`} className="hover:text-tinta">{RESPONSAVEL.email}</a>
      </div>
    </footer>
  )
}
