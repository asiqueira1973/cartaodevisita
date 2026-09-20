// Selo de plano (spec 16.6).
//
// Três degraus de PESO, não três cores: cinza chapado, contornado, preenchido.
// O painel é monocromático, e um selo verde aqui seria a única cor da tela.

import type { PlanoConta } from '@/types/dominio'

const NOME: Record<PlanoConta, string> = {
  gratuito: 'Gratuito', early_adopter: 'Early adopter',
  ilimitado: 'Ilimitado', pago: 'Pago',
}

const ESTILO: Record<PlanoConta, string> = {
  gratuito: 'bg-superficie-2 text-tinta-fraca',
  early_adopter: 'border border-tinta text-tinta',
  ilimitado: 'bg-tinta text-white',
  pago: 'border border-dashed border-traco-forte text-tinta-desabilitada',
}

export function SeloDePlano({ plano }: { plano: PlanoConta }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${ESTILO[plano]}`}>
      {NOME[plano]}
    </span>
  )
}
