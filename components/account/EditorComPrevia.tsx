'use client'

// Junta o editor e a pré-visualização, compartilhando o estado do cartão
// (épico 8.2, critério 8.2.1: a prévia reflete a edição em até 1 segundo).
//
// O estado vive aqui, e não dentro do editor, porque a prévia precisa dele —
// e não em contexto global, porque só estes dois o usam.

import { useState } from 'react'
import { CardEditor } from '@/components/account/CardEditor'
import { PreviaLateral } from '@/components/account/PreviaLateral'
import type { Cartao } from '@/types/dominio'

export function EditorComPrevia({
  cartaoInicial,
  comMarca,
}: {
  cartaoInicial: Cartao
  comMarca: boolean
}) {
  const [cartao, setCartao] = useState(cartaoInicial)

  return (
    <div className="flex flex-col gap-7 lg:flex-row lg:gap-8">
      <div className="min-w-0 grow">
        <CardEditor cartaoInicial={cartaoInicial} onMudou={setCartao} />
      </div>
      <PreviaLateral cartao={cartao} comMarca={comMarca} />
    </div>
  )
}
