// O cabeçalho do cartão, que é o que muda entre os quatro templates (spec 16.3).
//
// Só o CABEÇALHO varia — foto, nome, cargo e bio. Botões, links, salvar-contato
// e QR são idênticos nos quatro, de propósito: o que muda é hierarquia e
// proporção, não o que o cartão oferece. Nenhum template esconde campo.
//
// O botão de WhatsApp continua sendo o elemento mais pesado em todos eles. Isso
// não é opção do template — é o princípio 0.3.

import { iniciais } from '@/lib/cartao'
import type { TonsDaCor } from '@/lib/cores'
import type { Cartao } from '@/types/dominio'

interface Props {
  cartao: Cartao
  cor: TonsDaCor
}

/** Estilos que o template impõe ao resto do cartão (spec 16.4). */
export interface EstiloDoTemplate {
  /** Raio dos botões e caixas. O `executivo` é o único anguloso. */
  raio: string
  /** Raio do botão principal. */
  raioBotao: string
  /** Fundo do botão de WhatsApp: a cor de destaque, ou preto no `executivo`. */
  fundoPrincipal: (cor: TonsDaCor) => string
}

export const ESTILOS: Record<Cartao['template'], EstiloDoTemplate> = {
  minimalista: { raio: 'rounded-2xl', raioBotao: 'rounded-2xl', fundoPrincipal: (c) => c.fundo },
  cartao: { raio: 'rounded-2xl', raioBotao: 'rounded-2xl', fundoPrincipal: (c) => c.fundo },
  foto: { raio: 'rounded-2xl', raioBotao: 'rounded-2xl', fundoPrincipal: (c) => c.fundo },
  // O `executivo` troca o arredondado por canto reto e a cor por preto: é a
  // aposta sóbria da paleta, para quem acha cor pouco séria.
  executivo: { raio: 'rounded-sm', raioBotao: 'rounded-sm', fundoPrincipal: () => '#18181B' },
}

export function CabecalhoDoCartao({ cartao, cor }: Props) {
  switch (cartao.template) {
    case 'cartao': return <Cartao cartao={cartao} cor={cor} />
    case 'foto': return <Foto cartao={cartao} cor={cor} />
    case 'executivo': return <Executivo cartao={cartao} cor={cor} />
    default: return <Minimalista cartao={cartao} cor={cor} />
  }
}

function linhaDeCargo(cartao: Cartao) {
  return [cartao.cargo, cartao.empresa].filter(Boolean).join(' · ')
}

/** Foto redonda, nome grande, tudo centralizado. O mais legível. */
function Minimalista({ cartao, cor }: Props) {
  const linha = linhaDeCargo(cartao)
  return (
    <div className="flex flex-col items-center">
      <Retrato cartao={cartao} cor={cor} lado="h-26 w-26" texto="text-[34px]" />
      <h1 className="mt-4 text-center text-[28px] font-bold leading-tight tracking-tight text-cartao-texto">
        {cartao.nome_exibicao}
      </h1>
      {linha && <p className="mt-1.5 text-center text-[15px] font-medium" style={{ color: cor.texto }}>{linha}</p>}
      {cartao.bio && <p className="mt-3 max-w-72 text-center text-[15px] leading-relaxed text-cartao-texto-2">{cartao.bio}</p>}
    </div>
  )
}

/** A área de cima imita um cartão de papel, na proporção 85×55 mm. */
function Cartao({ cartao, cor }: Props) {
  const linha = linhaDeCargo(cartao)
  return (
    <div className="flex flex-col">
      <div
        className="flex flex-col justify-between rounded-2xl p-5"
        // 55/85 é a proporção do cartão de visitas físico (spec 16.3).
        style={{ backgroundColor: cor.fundo, aspectRatio: '85 / 55' }}
      >
        <div className="flex items-center gap-3.5">
          <Retrato cartao={cartao} cor={cor} lado="h-15 w-15" texto="text-[22px]" emCima />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="truncate text-[22px] font-bold leading-tight tracking-tight text-white">
              {cartao.nome_exibicao}
            </h1>
            {linha && <p className="truncate text-[13px] font-medium text-white/80">{linha}</p>}
          </div>
        </div>
        {cartao.bio && <p className="line-clamp-2 text-[13px] leading-snug text-white/85">{cartao.bio}</p>}
      </div>
    </div>
  )
}

/** Foto de largura inteira, com o nome sobreposto num degradê. */
function Foto({ cartao, cor }: Props) {
  const linha = linhaDeCargo(cartao)
  return (
    <div className="relative -mx-6 -mt-12 mb-1 overflow-hidden">
      <div className="relative aspect-square w-full" style={{ backgroundColor: cor.suave }}>
        {cartao.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cartao.foto_url} alt={cartao.nome_exibicao} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[88px] font-bold" style={{ color: cor.fundo }} aria-hidden>
            {iniciais(cartao.nome_exibicao)}
          </div>
        )}
        {/* O degradê existe para o nome branco ficar legível sobre qualquer
            foto — sem ele, retrato de fundo claro apaga o texto. */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-6">
          <h1 className="text-[30px] font-bold leading-tight tracking-tight text-white">{cartao.nome_exibicao}</h1>
          {linha && <p className="text-[15px] font-semibold text-white/85">{linha}</p>}
        </div>
      </div>
      {cartao.bio && (
        <p className="px-6 pt-5 text-[15px] leading-relaxed text-cartao-texto-2">{cartao.bio}</p>
      )}
    </div>
  )
}

/** Sem foto: monograma, serifada e muito espaço em branco. */
function Executivo({ cartao }: Props) {
  const linha = linhaDeCargo(cartao)
  return (
    <div className="flex flex-col items-center pt-4">
      <div className="flex h-22 w-22 items-center justify-center rounded-full border border-cartao-traco">
        <span className="font-display text-[34px] leading-none tracking-wide text-cartao-texto" aria-hidden>
          {iniciais(cartao.nome_exibicao)}
        </span>
      </div>
      <h1 className="mt-6 text-center font-display text-[36px] leading-tight font-normal text-cartao-texto">
        {cartao.nome_exibicao}
      </h1>
      {linha && (
        <p className="mt-2.5 text-center text-[11px] font-bold tracking-[0.18em] uppercase text-cartao-texto-3">
          {linha}
        </p>
      )}
      <div className="my-6 h-px w-10 bg-cartao-traco" />
      {cartao.bio && <p className="max-w-68 text-center text-[15px] leading-relaxed text-cartao-texto-2">{cartao.bio}</p>}
    </div>
  )
}

/** Foto redonda ou iniciais, compartilhada por três dos quatro templates. */
function Retrato({
  cartao, cor, lado, texto, emCima,
}: Props & { lado: string; texto: string; emCima?: boolean }) {
  if (cartao.foto_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={cartao.foto_url} alt={cartao.nome_exibicao} className={`${lado} shrink-0 rounded-full object-cover`} />
  }
  return (
    <div
      className={`${lado} ${texto} flex shrink-0 items-center justify-center rounded-full font-bold text-white`}
      // Sobre a faixa colorida do template `cartao`, as iniciais precisam de um
      // fundo mais claro para não sumirem.
      style={{ backgroundColor: emCima ? cor.suave : cor.fundo, color: emCima ? cor.texto : '#fff' }}
      aria-hidden
    >
      {iniciais(cartao.nome_exibicao)}
    </div>
  )
}
