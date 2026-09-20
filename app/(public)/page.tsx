// A home (spec 10.1 e 15.4).
//
// Estrutura herdada da home do ViraPágina, que já está validada: cabeçalho
// fino, bloco principal em duas colunas com a garantia AO LADO do botão, três
// cartões que derrubam objeções, e rodapé.
//
// Os três cartões não listam funcionalidade — cada um derruba uma objeção, e
// cada um corresponde a um princípio da seção 0 (spec 15.4.1). O do meio é o
// mais importante e por isso está no meio: é o único que nenhum concorrente
// copia sem refazer a arquitetura de URL.

import type { Metadata } from 'next'
import Link from 'next/link'
import { CabecalhoPublico, RodapePublico } from '@/components/marketing/Chrome'
import { TEXTOS } from '@/lib/copy'

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
              {/* Nove palavras em serifada grande. O título nomeia o RESULTADO,
                  não o objeto: o produto não é o cartão, é o contato salvo na
                  agenda da outra pessoa. */}
              <h1 className="font-display text-[40px] leading-[1.08] tracking-tight text-tinta sm:text-[52px]">
                {TEXTOS.homeTitulo}
              </h1>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-tinta-fraca sm:text-[17px]">
                {TEXTOS.homeSubtitulo}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/entrar"
                  className="flex min-h-13 items-center rounded-full bg-tinta px-7 text-[15px] font-semibold text-white"
                >
                  {TEXTOS.homeBotao}
                </Link>
                {/* A garantia fica AO LADO do botão, não embaixo: tira o medo
                    sem roubar peso da ação. */}
                <span className="text-[13px] text-tinta-apagada">{TEXTOS.homeGarantia}</span>
              </div>
            </div>

            <div className="w-full max-w-xs shrink-0 lg:w-72">
              <MockupDoCartao />
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-5xl gap-4 px-6 py-14 sm:grid-cols-3">
          <Objecao
            titulo="Sem app, dos dois lados"
            icone={
              <><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M11 18.5h2" /></>
            }
          >
            Quem recebe aponta a câmera ou encosta o celular, e seu cartão abre no
            navegador. Sem instalar nada, sem criar conta, sem login. Só uma das
            duas pessoas precisa ter conta aqui — você.
          </Objecao>

          <Objecao
            titulo="Seu QR nunca quebra"
            icone={
              <><path d="M10 13a4.5 4.5 0 0 0 6.6.5l2.6-2.6a4.6 4.6 0 0 0-6.5-6.5l-1.5 1.5" /><path d="M14 11a4.5 4.5 0 0 0-6.6-.5L4.8 13A4.6 4.6 0 0 0 11.3 19.6l1.5-1.5" /></>
            }
          >
            Mudou de endereço, de emprego ou de telefone? O QR que você imprimiu e
            a etiqueta que você gravou continuam levando ao seu cartão atualizado.
            Isso não é promessa: o endereço gravado nunca muda.
          </Objecao>

          <Objecao
            titulo="Quem recebe não é rastreado"
            icone={
              <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>
            }
          >
            Sem cookie, sem pixel, sem ferramenta de análise de terceiro. Você vê
            quantas visitas seu cartão teve; não vê quem entrou — e ninguém mais
            vê também.
          </Objecao>
        </section>
      </main>

      <RodapePublico />
    </div>
  )
}

function Objecao({
  titulo, icone, children,
}: { titulo: string; icone: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-traco bg-superficie p-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-superficie-2 text-tinta">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {icone}
        </svg>
      </span>
      <h2 className="text-[15px] font-bold text-tinta">{titulo}</h2>
      <p className="text-sm leading-relaxed text-tinta-fraca">{children}</p>
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
