'use client'

// Junta a lista de links e a pré-visualização (épico 8.3, critério 8.3.5:
// a ordem escolhida aparece na prévia).

import { useState } from 'react'
import { LinkList } from '@/components/account/LinkList'
import { PreviaLateral } from '@/components/account/PreviaLateral'
import { TEXTOS } from '@/lib/copy'
import type { Cartao } from '@/types/dominio'

export function LinksComPrevia({
  cartaoInicial,
  comMarca,
  tetoDoPlano,
}: {
  cartaoInicial: Cartao
  comMarca: boolean
  tetoDoPlano: number
}) {
  const [cartao, setCartao] = useState(cartaoInicial)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h1 className="grow text-[26px] font-bold tracking-tight text-tinta">{TEXTOS.painelLinks}</h1>
        {/* O contador acompanha o estado do cliente — renderizado no servidor
            ele congelaria no valor que tinha ao carregar a página. */}
        <span className="text-[13px] tabular-nums text-tinta-apagada">
          {cartao.links.length} de {tetoDoPlano}
        </span>
      </div>

      <div className="flex flex-col gap-7 lg:flex-row lg:gap-8">
        <div className="min-w-0 grow">
          <LinkList cartaoInicial={cartaoInicial} tetoDoPlano={tetoDoPlano} onMudou={setCartao} />
        </div>
        <PreviaLateral cartao={cartao} comMarca={comMarca} />
      </div>
    </div>
  )
}
