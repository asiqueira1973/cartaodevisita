'use client'

// Publicar e tirar do ar (critério 8.7.2).
//
// Quando falta alguma coisa, o botão fica DESABILITADO COM O MOTIVO AO LADO —
// nunca habilitado com erro depois do clique, e nunca com o motivo escondido
// num tooltip (padrão de 16.6). A pessoa precisa saber o que fazer antes de
// tentar.

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motivoParaNaoPublicar } from '@/lib/publicacao'
import { ERROS, TEXTOS } from '@/lib/copy'
import type { Cartao } from '@/types/dominio'

export function BotaoPublicar({
  cartao,
  onMudou,
}: {
  cartao: Cartao
  onMudou: (cartao: Cartao) => void
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, iniciar] = useTransition()
  const router = useRouter()

  const impedimento = motivoParaNaoPublicar(cartao)
  const podePublicar = !impedimento

  function alternar() {
    setErro(null)
    iniciar(async () => {
      const r = await fetch('/api/conta/cartao/publicacao', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ publicado: !cartao.publicado }),
      })
      const dados = (await r.json().catch(() => ({}))) as { cartao?: Cartao; mensagem?: string }
      if (!r.ok) {
        setErro(dados.mensagem ?? ERROS[16])
        return
      }
      if (dados.cartao) onMudou(dados.cartao)
      // Atualiza o estado do servidor — o selo de "No ar" vive lá.
      router.refresh()
    })
  }

  if (cartao.publicado) {
    return (
      <button
        type="button"
        onClick={alternar}
        disabled={enviando}
        className="min-h-10 shrink-0 cursor-pointer rounded-full border border-traco-forte px-5 text-sm font-semibold text-tinta disabled:cursor-wait"
      >
        {enviando ? 'Tirando…' : TEXTOS.despublicar}
      </button>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-3">
      {/* O motivo fica AO LADO, visível, não num tooltip. */}
      {impedimento && (
        <span className="max-w-56 text-right text-xs leading-snug text-tinta-fraca">
          {ERROS[13]}
        </span>
      )}
      {erro && <span className="max-w-56 text-right text-xs leading-snug text-perigo">{erro}</span>}
      <button
        type="button"
        onClick={alternar}
        disabled={!podePublicar || enviando}
        className="min-h-10 cursor-pointer rounded-full bg-tinta px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-ativo disabled:text-tinta-desabilitada"
      >
        {enviando ? 'Publicando…' : TEXTOS.publicar}
      </button>
    </div>
  )
}
