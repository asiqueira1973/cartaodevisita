// Tela de entrada (spec 10.2, épico 8.1).
//
// Um botão só. Não há cadastro, não há senha e não há recuperação — quem perde
// a conta Google recupera com o Google (spec 6.4).

import { redirect } from 'next/navigation'
import { auth, signIn } from '@/lib/auth'
import { TEXTOS } from '@/lib/copy'

export const metadata = { title: 'Entrar · Cartão de Visita' }

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ voltar?: string }>
}) {
  const { voltar } = await searchParams
  const sessao = await auth()

  // Já logado não vê esta tela: vai direto para onde queria ir.
  if (sessao?.user?.email) redirect(destinoSeguro(voltar))

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-superficie px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex items-center gap-2.5">
          <span className="h-6 w-6 rounded-md bg-tinta" aria-hidden />
          <span className="text-base font-bold text-tinta">Cartão de Visita</span>
        </div>

        <h1 className="text-center text-2xl font-bold leading-tight tracking-tight text-tinta">
          {TEXTOS.loginTitulo}
        </h1>

        <form
          action={async () => {
            'use server'
            await signIn('google', { redirectTo: destinoSeguro(voltar) })
          }}
          className="w-full"
        >
          <button
            type="submit"
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-tinta px-6 text-[15px] font-semibold text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#fff" d="M21.6 12.2c0-.7-.1-1.3-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z" opacity=".9" />
              <path fill="#fff" d="M12 22c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" opacity=".7" />
              <path fill="#fff" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14z" opacity=".5" />
              <path fill="#fff" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1z" opacity=".8" />
            </svg>
            {TEXTOS.loginBotao}
          </button>
        </form>

        {/* A copy é literal (spec 15.4); os links são acrescentados sobre ela,
            sem reescrever o texto. */}
        <p className="text-center text-[13px] leading-relaxed text-tinta-fraca">
          Sem senha para lembrar. Ao entrar, você concorda com os{' '}
          <a href="/termos" className="font-semibold text-tinta underline underline-offset-2">termos</a> e a{' '}
          <a href="/privacidade" className="font-semibold text-tinta underline underline-offset-2">privacidade</a>.
        </p>
      </div>
    </main>
  )
}

/**
 * Limita o destino pós-login a caminhos internos (spec 20.5).
 * Sem isso, `?voltar=https://outro.site` transformaria o login num redirecionador
 * aberto — a forma clássica de usar o domínio de alguém para dar credibilidade a
 * um golpe.
 */
function destinoSeguro(voltar: string | undefined): string {
  if (!voltar) return '/conta'
  // Um caminho interno começa com `/` e nunca com `//`, que o navegador lê como
  // outro domínio.
  return /^\/(?!\/)/.test(voltar) ? voltar : '/conta'
}
