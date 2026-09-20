'use client'

// Junta a lista de links e a pré-visualização (épico 8.3, critério 8.3.5:
// a ordem escolhida aparece na prévia).

import { useState } from 'react'
import { LinkList } from '@/components/account/LinkList'
import { PreviaLateral } from '@/components/account/PreviaLateral'
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
    <div className="flex flex-col gap-7 lg:flex-row lg:gap-8">
      <div className="min-w-0 grow">
        <LinkList cartaoInicial={cartaoInicial} tetoDoPlano={tetoDoPlano} onMudou={setCartao} />
      </div>
      <PreviaLateral cartao={cartao} comMarca={comMarca} />
    </div>
  )
}
