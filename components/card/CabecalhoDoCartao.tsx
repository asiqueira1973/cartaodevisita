// O cabeçalho do cartão (spec 16.3).
//
// DECISÃO de 20/09/2026: a v1 tem UMA aparência só. Os quatro templates da
// seção 16.3 foram implementados e removidos no mesmo dia — estão no commit
// 42e87dc, se voltarem (roadmap 28.10). Não há tela de Aparência, e `template`
// e `cor_destaque` ficam fixos no padrão.
//
// O arquivo continua existindo como costura: quando os templates voltarem, é
// aqui que eles entram, sem mexer em CardPublico nem em CardPreview.

import { iniciais } from '@/lib/cartao'
import type { TonsDaCor } from '@/lib/cores'
import type { Cartao } from '@/types/dominio'

/** Estilos que o cartão usa. Um só, por ora. */
export const ESTILOS = {
  raio: 'rounded-2xl',
  raioBotao: 'rounded-2xl',
  fundoPrincipal: (cor: TonsDaCor) => cor.fundo,
}

/**
 * Foto redonda, nome grande, tudo centralizado — o arranjo mais legível, e o
 * que serve a todo mundo enquanto não há escolha.
 */
export function CabecalhoDoCartao({ cartao, cor }: { cartao: Cartao; cor: TonsDaCor }) {
  const linha = [cartao.cargo, cartao.empresa].filter(Boolean).join(' · ')

  return (
    <div className="flex flex-col items-center">
      {cartao.foto_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cartao.foto_url} alt={cartao.nome_exibicao} className="h-26 w-26 shrink-0 rounded-full object-cover" />
      ) : (
        // Sem foto, as iniciais sobre a cor de destaque (critério 8.2.8). O
        // texto é branco sobre o tom `fundo`, que passa 4.5:1 por construção.
        <div
          className="flex h-26 w-26 shrink-0 items-center justify-center rounded-full text-[34px] font-bold text-white"
          style={{ backgroundColor: cor.fundo }}
          aria-hidden
        >
          {iniciais(cartao.nome_exibicao)}
        </div>
      )}

      <h1 className="mt-4 text-center text-[28px] font-bold leading-tight tracking-tight text-cartao-texto">
        {cartao.nome_exibicao}
      </h1>
      {linha && <p className="mt-1.5 text-center text-[15px] font-medium" style={{ color: cor.texto }}>{linha}</p>}
      {cartao.bio && <p className="mt-3 max-w-72 text-center text-[15px] leading-relaxed text-cartao-texto-2">{cartao.bio}</p>}
    </div>
  )
}
