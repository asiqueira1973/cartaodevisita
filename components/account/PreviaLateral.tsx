'use client'

// A coluna de pré-visualização do painel (épico 8.2 e 8.3).
//
// Extraída para não repetir o mesmo bloco em cada tela do painel. No celular
// ela fica ABAIXO do conteúdo; lado a lado só a partir de 1024 px (spec 17.2).
//
// Mostrava "minimalista · azul" ao lado do título. Saiu em 20/09/2026: com uma
// aparência só (roadmap 28.10), informar qual é ela não diz nada — é ruído que
// sugere uma escolha que não existe. Volta junto com a tela de Aparência.

import { CardPreview } from '@/components/card/CardPreview'
import type { Cartao } from '@/types/dominio'

export function PreviaLateral({ cartao, comMarca }: { cartao: Cartao; comMarca: boolean }) {
  return (
    <div className="flex shrink-0 flex-col gap-3 lg:w-75">
      <span className="text-[13px] font-semibold text-tinta">Pré-visualização</span>
      <div className="h-155 overflow-hidden rounded-2xl border border-traco">
        <CardPreview cartao={cartao} comMarca={comMarca} />
      </div>
    </div>
  )
}
