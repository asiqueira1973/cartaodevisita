// A página pública do cartão (épico 8.4).
//
// PRINCÍPIO 0.2: todo o conteúdo sai renderizado do servidor e a página é
// utilizável com JavaScript desativado. Cada link é um `<a href>` de verdade —
// nada aqui depende de handler no cliente, exceto o botão de copiar a chave
// PIX, que degrada mostrando a chave como texto selecionável.
//
// PRINCÍPIO 0.3: o botão de WhatsApp é o primeiro elemento de ação e o mais
// pesado da página, com alvo de toque de 56 px (mínimo de 44 pt, spec 17.3).

import { iniciais } from '@/lib/cartao'
import { tons } from '@/lib/cores'
import { ROTULOS_PADRAO, buildLinkUrl } from '@/lib/links'
import { IconeDoTipo } from '@/components/card/IconeDoTipo'
import { CopiarChavePix } from '@/components/card/CopiarChavePix'
import { MARCA_RODAPE } from '@/lib/copy'
import type { Cartao } from '@/types/dominio'

export function CardPublico({ cartao, comMarca }: { cartao: Cartao; comMarca: boolean }) {
  const cor = tons(cartao.cor_destaque)
  const linha = [cartao.cargo, cartao.empresa].filter(Boolean).join(' · ')

  const ordenados = [...cartao.links].sort((a, b) => a.ordem - b.ordem)
  const whatsapp = ordenados.find((l) => l.tipo === 'whatsapp')
  const demais = ordenados.filter((l) => l.tipo !== 'whatsapp')

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white px-6 pt-12">
      <div className="flex grow flex-col items-center">
        {cartao.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cartao.foto_url}
            alt={cartao.nome_exibicao}
            width={104}
            height={104}
            className="h-26 w-26 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-26 w-26 items-center justify-center rounded-full text-[34px] font-bold text-white"
            style={{ backgroundColor: cor.fundo }}
            aria-hidden
          >
            {iniciais(cartao.nome_exibicao)}
          </div>
        )}

        <h1 className="mt-4.5 text-center text-[28px] font-bold leading-tight tracking-tight text-cartao-texto">
          {cartao.nome_exibicao}
        </h1>

        {linha && (
          <p className="mt-1.5 text-center text-[15px] font-medium" style={{ color: cor.texto }}>
            {linha}
          </p>
        )}

        {cartao.bio && (
          <p className="mt-3 max-w-72 text-center text-[15px] leading-relaxed text-cartao-texto-2">
            {cartao.bio}
          </p>
        )}

        {whatsapp && (
          <a
            href={buildLinkUrl('whatsapp', whatsapp.valor, cartao.mensagem_whatsapp) ?? '#'}
            className="mt-6.5 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl px-5 text-base font-semibold text-white"
            style={{ backgroundColor: cor.fundo }}
          >
            <IconeDoTipo tipo="whatsapp" tamanho={20} />
            {whatsapp.rotulo ?? ROTULOS_PADRAO.whatsapp}
          </a>
        )}

        {demais.length > 0 && (
          <nav aria-label="Meus links" className="mt-2.5 flex w-full flex-col gap-2">
            {demais.map((link) => {
              const rotulo = link.rotulo ?? ROTULOS_PADRAO[link.tipo]

              // PIX não abre link nenhum — é botão de copiar (regra 11.5).
              if (link.tipo === 'pix') {
                return <CopiarChavePix key={link.id} chave={link.valor} rotulo={rotulo} cor={cor.texto} />
              }

              return (
                <a
                  key={link.id}
                  href={buildLinkUrl(link.tipo, link.valor) ?? '#'}
                  target={link.tipo === 'telefone' || link.tipo === 'email' ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="flex min-h-13 items-center gap-3 rounded-2xl border border-cartao-traco px-4 text-[15px] font-semibold text-cartao-texto"
                >
                  <span style={{ color: cor.texto }}><IconeDoTipo tipo={link.tipo} /></span>
                  <span className="grow">{rotulo}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </a>
              )
            })}
          </nav>
        )}
      </div>

      {comMarca && (
        <div className="shrink-0 py-6 text-center">
          <a href="/" className="text-[11px] font-medium text-cartao-texto-3">{MARCA_RODAPE}</a>
        </div>
      )}
    </main>
  )
}
