'use client'

// Botão de copiar a chave PIX (regra 11.5).
//
// PIX não abre link nenhum — não há esquema de URL para chave PIX, e por isso
// ele é o ÚNICO elemento da página pública que precisa de JavaScript.
//
// Degrada em silêncio: sem JS, a chave continua visível e selecionável, então
// a pessoa copia à mão. O princípio 0.2 continua valendo.

import { useState } from 'react'

export function CopiarChavePix({
  chave, rotulo, cor,
}: { chave: string; rotulo: string; cor: string }) {
  const [copiada, setCopiada] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(chave)
      setCopiada(true)
      setTimeout(() => setCopiada(false), 2000)
    } catch {
      // Sem permissão de área de transferência, a chave no rodapé resolve.
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copiar()}
      className="flex min-h-13 w-full cursor-pointer flex-col items-start justify-center gap-0.5 rounded-2xl border border-cartao-traco px-4 text-left"
    >
      <span className="flex w-full items-center gap-3">
        <span style={{ color: cor }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3l9 9-9 9-9-9z" /><path d="M8.5 12h7" />
          </svg>
        </span>
        <span className="grow text-[15px] font-semibold text-cartao-texto">
          {copiada ? 'Chave copiada.' : rotulo}
        </span>
      </span>
      <span className="pl-8 text-[12px] text-cartao-texto-3">{chave}</span>
    </button>
  )
}
