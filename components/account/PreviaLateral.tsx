'use client'

// A coluna de pré-visualização do painel (épico 8.2 e 8.3).
//
// Extraída para não repetir o mesmo bloco em cada tela do painel. No celular
// ela fica ABAIXO do conteúdo; lado a lado só a partir de 1024 px (spec 17.2).

import { CardPreview } from '@/components/card/CardPreview'
import { CORES } from '@/lib/cores'
import type { Cartao } from '@/types/dominio'

const NOME_DO_TEMPLATE = {
  minimalista: 'minimalista', cartao: 'cartão', foto: 'foto', executivo: 'executivo',
} as const

export function PreviaLateral({ cartao, comMarca }: { cartao: Cartao; comMarca: boolean }) {
  return (
    <div className="flex shrink-0 flex-col gap-3 lg:w-75">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-tinta">Pré-visualização</span>
        <span className="text-xs text-tinta-apagada">
          {NOME_DO_TEMPLATE[cartao.template]} · {CORES[cartao.cor_destaque].rotulo.toLowerCase()}
        </span>
      </div>
      <div className="h-155 overflow-hidden rounded-2xl border border-traco">
        <CardPreview cartao={cartao} comMarca={comMarca} />
      </div>
    </div>
  )
}
