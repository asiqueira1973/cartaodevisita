// A home (spec 10.1 e 15.4).
//
// Estrutura: bloco principal, ONDE você usa, PARA QUEM é, e o fechamento.
//
// A versão anterior tinha três cartões que derrubavam objeções técnicas — "sem
// app dos dois lados", "seu QR nunca quebra", "quem recebe não é rastreado".
// Saíram em 22/09/2026: eram resposta para pergunta que ninguém faz. Quem chega
// aqui não está preocupado com rastreamento; está tentando entender para que
// serve. No lugar entraram lugares concretos onde a etiqueta vive e as pessoas
// que usam.

import type { Metadata } from 'next'
import Link from 'next/link'
import { CabecalhoPublico, RodapePublico } from '@/components/marketing/Chrome'
import { ONDE_USAR, PARA_QUEM, TEXTOS } from '@/lib/copy'

export const metadata: Metadata = {
  title: 'Cartão de Visita — seu contato na agenda de quem você acabou de conhecer',
  description: TEXTOS.homeSubtitulo,
}

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-superficie">
      <CabecalhoPublico />

      <main className="grow">
        <section className="bg-superficie-2">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-12 px-6 py-16 lg:flex-row lg:gap-16 lg:py-24">
            <div className="flex min-w-0 grow flex-col items-start">
              <h1 className="font-display text-[40px] leading-[1.08] tracking-tight text-tinta sm:text-[52px]">
                {TEXTOS.homeTitulo}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-tinta-fraca sm:text-[17px]">
                {TEXTOS.homeSubtitulo}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/entrar"
                  className="flex min-h-13 items-center rounded-full bg-tinta px-7 text-[15px] font-semibold text-white"
                >
                  {TEXTOS.homeBotao}
                </Link>
                <span className="text-[13px] text-tinta-apagada">{TEXTOS.homeGarantia}</span>
              </div>
            </div>

            <div className="w-full max-w-xs shrink-0 lg:w-72">
              <MockupDoCartao />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="font-display text-[30px] leading-tight tracking-tight text-tinta sm:text-[36px]">
            Onde a etiqueta vive
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-tinta-fraca">
            Você cola uma vez, em algo que já carrega todo dia. Quem encosta o
            celular abre seu cartão na hora.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ONDE_USAR.map((caso) => (
              <div key={caso.titulo} className="rounded-2xl border border-traco bg-superficie p-6">
                <h3 className="text-[16px] font-bold text-tinta">{caso.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-tinta-fraca">{caso.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-superficie-2">
          <div className="mx-auto w-full max-w-5xl px-6 py-16">
            <h2 className="font-display text-[30px] leading-tight tracking-tight text-tinta sm:text-[36px]">
              Para quem é
            </h2>

            <div className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
              {PARA_QUEM.map((publico) => (
                <div key={publico.titulo} className="flex flex-col gap-2 border-t border-traco-forte pt-4">
                  <h3 className="text-[15px] font-bold text-tinta">{publico.titulo}</h3>
                  <p className="text-sm leading-relaxed text-tinta-fraca">{publico.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 py-16 text-center">
          <p className="mx-auto max-w-xl text-[17px] leading-relaxed text-tinta">
            {TEXTOS.homeFechamento}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/entrar"
              className="flex min-h-13 items-center rounded-full bg-tinta px-7 text-[15px] font-semibold text-white"
            >
              {TEXTOS.homeBotao}
            </Link>
            <span className="text-[13px] text-tinta-apagada">{TEXTOS.homeGarantia}</span>
          </div>
        </section>
      </main>

      <RodapePublico />
    </div>
  )
}

/**
 * O produto, não um ícone abstrato: um cartão dentro de um celular.
 * Desenhado em marcação para não custar imagem nem requisição — a home é a
 * primeira coisa que alguém carrega.
 */
function MockupDoCartao() {
  return (
    <div className="mx-auto w-full max-w-64 rounded-[2rem] border-8 border-tinta bg-white p-5 shadow-xl">
      <div className="flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DBEAFE] text-xl font-bold text-[#1D4ED8]" aria-hidden>
          HP
        </div>
        <p className="mt-3 text-center text-base font-bold text-cartao-texto">Helena Prado</p>
        <p className="mt-0.5 text-xs font-medium text-[#1E40AF]">Psicanalista</p>
        <div className="mt-4 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-[#1D4ED8] text-[11px] font-semibold text-white">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z" />
          </svg>
          Chamar no WhatsApp
        </div>
        <div className="mt-1.5 flex w-full flex-col gap-1.5">
          <div className="h-7 rounded-lg border border-cartao-traco" />
          <div className="h-7 rounded-lg border border-cartao-traco" />
        </div>
        <div className="mt-2.5 h-8 w-full rounded-lg bg-cartao-fundo-2" />
      </div>
    </div>
  )
}
