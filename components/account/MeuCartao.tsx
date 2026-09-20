'use client'

// A tela "Meu cartão" inteira (épicos 8.2 e 8.7).
//
// Cabeçalho, abas, editor, pré-visualização e visitas compartilham o MESMO
// estado do cartão. Por isso tudo vive aqui: o botão de publicar precisa saber,
// em tempo real, se já existe nome e link (critério 8.7.2), e a prévia precisa
// refletir a edição (critério 8.2.1). Renderizar qualquer um deles no servidor
// os deixaria congelados no valor que tinham ao carregar a página — foi
// exatamente o bug do contador de links.

import { useState } from 'react'
import Link from 'next/link'
import { CardEditor } from '@/components/account/CardEditor'
import { PreviaLateral } from '@/components/account/PreviaLateral'
import { BotaoPublicar } from '@/components/account/BotaoPublicar'
import { Visitas } from '@/components/account/Visitas'
import { TEXTOS } from '@/lib/copy'
import type { Cartao, VisitaDiaria } from '@/types/dominio'

export function MeuCartao({
  cartaoInicial, comMarca, handle, urlBase, aba, visitas,
}: {
  cartaoInicial: Cartao
  comMarca: boolean
  handle: string
  urlBase: string
  aba: 'conteudo' | 'visitas'
  visitas: VisitaDiaria[]
}) {
  const [cartao, setCartao] = useState(cartaoInicial)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
        <div className="flex min-w-0 grow flex-col gap-1">
          <h1 className="text-[26px] font-bold tracking-tight text-tinta">{TEXTOS.painelMeuCartao}</h1>
          <div className="flex items-center gap-2">
            <span
              className={`h-1.75 w-1.75 shrink-0 rounded-full ${cartao.publicado ? 'bg-tinta' : 'bg-traco-forte'}`}
              aria-hidden
            />
            <span className="truncate text-[13px] text-tinta-fraca">
              {cartao.publicado ? `${TEXTOS.painelNoAr} ` : `${TEXTOS.painelForaDoAr} · `}
              {cartao.publicado ? (
                <a href={`/${handle}`} target="_blank" rel="noreferrer" className="font-semibold text-tinta underline underline-offset-2">
                  {urlBase}/{handle}
                </a>
              ) : (
                <span className="font-semibold text-tinta">{urlBase}/{handle}</span>
              )}
            </span>
          </div>
        </div>
        <BotaoPublicar cartao={cartao} onMudou={setCartao} />
      </div>

      {/* Abas por link, não por estado: assim funcionam sem JavaScript e a aba
          escolhida sobrevive ao recarregar (spec 16.6). */}
      <div className="flex gap-6 border-b border-traco">
        <Aba href="/conta" ativa={aba === 'conteudo'}>Conteúdo</Aba>
        <Aba href="/conta?aba=visitas" ativa={aba === 'visitas'}>Visitas</Aba>
      </div>

      {aba === 'visitas' ? (
        <Visitas dias={visitas} />
      ) : (
        <div className="flex flex-col gap-7 lg:flex-row lg:gap-8">
          <div className="min-w-0 grow">
            <CardEditor cartaoInicial={cartaoInicial} onMudou={setCartao} />
          </div>
          <PreviaLateral cartao={cartao} comMarca={comMarca} />
        </div>
      )}
    </div>
  )
}

function Aba({ href, ativa, children }: { href: string; ativa: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={ativa ? 'page' : undefined}
      className={`pb-3 text-sm ${ativa ? 'border-b-2 border-tinta font-semibold text-tinta' : 'font-medium text-tinta-apagada hover:text-tinta'}`}
    >
      {children}
    </Link>
  )
}
