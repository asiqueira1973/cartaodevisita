'use client'

// Junta o editor e a pré-visualização, compartilhando o estado do cartão
// (épico 8.2, critério 8.2.1: a prévia reflete a edição em até 1 segundo).
//
// O estado vive aqui, e não dentro do editor, porque a prévia precisa dele —
// e não em contexto global, porque só estes dois o usam.

import { useState } from 'react'
import { CardEditor } from '@/components/account/CardEditor'
import { CardPreview } from '@/components/card/CardPreview'
import type { Cartao } from '@/types/dominio'

export function EditorComPrevia({
  cartaoInicial,
  comMarca,
  template,
  cor,
}: {
  cartaoInicial: Cartao
  comMarca: boolean
  template: string
  cor: string
}) {
  const [cartao, setCartao] = useState(cartaoInicial)

  return (
    // No celular a prévia fica ABAIXO do formulário; lado a lado só a partir de
    // 1024 px (spec 17.2). Desenhar para a tela grande e "adaptar" depois produz
    // formulário de duas colunas apertado no celular.
    <div className="flex flex-col gap-7 lg:flex-row lg:gap-8">
      <div className="min-w-0 grow">
        <CardEditor cartaoInicial={cartaoInicial} onMudou={setCartao} />
      </div>

      <div className="flex shrink-0 flex-col gap-3 lg:w-75">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-tinta">Pré-visualização</span>
          <span className="text-xs text-tinta-apagada">
            {template} · {cor}
          </span>
        </div>
        <div className="h-155 overflow-hidden rounded-2xl border border-traco">
          <CardPreview cartao={cartao} comMarca={comMarca} />
        </div>
      </div>
    </div>
  )
}
