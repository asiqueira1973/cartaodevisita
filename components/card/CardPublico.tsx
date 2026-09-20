// A página pública do cartão (épico 8.4).
//
// PRINCÍPIO 0.2: todo o conteúdo sai renderizado do servidor e a página é
// utilizável com JavaScript desativado. Cada link é um `<a href>` de verdade —
// nada aqui depende de handler no cliente, exceto o botão de copiar a chave
// PIX, que degrada mostrando a chave como texto selecionável.
//
// PRINCÍPIO 0.3: o botão de WhatsApp é o primeiro elemento de ação e o mais
// pesado da página, com alvo de toque de 56 px (mínimo de 44 pt, spec 17.3).

import Link from 'next/link'
import { tons } from '@/lib/cores'
import { CabecalhoDoCartao, ESTILOS } from '@/components/card/CabecalhoDoCartao'
import { ROTULOS_PADRAO, buildLinkUrl } from '@/lib/links'
import { IconeDoTipo } from '@/components/card/IconeDoTipo'
import { CopiarChavePix } from '@/components/card/CopiarChavePix'
import { BotaoWhatsapp } from '@/components/card/BotaoWhatsapp'
import { MARCA_RODAPE, TEXTOS } from '@/lib/copy'
import type { Cartao } from '@/types/dominio'

export function CardPublico({
  cartao, comMarca, handle, qrSvg,
}: {
  cartao: Cartao
  comMarca: boolean
  handle: string
  /** SVG já gerado no servidor (critério 8.5.2). Nulo na pré-visualização. */
  qrSvg: string | null
}) {
  const cor = tons(cartao.cor_destaque)
  const estilo = ESTILOS[cartao.template]

  const ordenados = [...cartao.links].sort((a, b) => a.ordem - b.ordem)
  const whatsapp = ordenados.find((l) => l.tipo === 'whatsapp')
  const demais = ordenados.filter((l) => l.tipo !== 'whatsapp')

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-white px-6 pb-4 pt-12">
      <div className="flex grow flex-col items-center">
        <div className="w-full">
          <CabecalhoDoCartao cartao={cartao} cor={cor} />
        </div>

        {whatsapp && (
          <BotaoWhatsapp
            href={buildLinkUrl('whatsapp', whatsapp.valor, cartao.mensagem_whatsapp) ?? '#'}
            handle={handle}
            cor={estilo.fundoPrincipal(cor)}
            raio={estilo.raioBotao}
          >
            <IconeDoTipo tipo="whatsapp" tamanho={20} />
            {whatsapp.rotulo ?? ROTULOS_PADRAO.whatsapp}
          </BotaoWhatsapp>
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
                  className={`flex min-h-13 items-center gap-3 ${estilo.raio} border border-cartao-traco px-4 text-[15px] font-semibold text-cartao-texto`}
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
        {/* "Salvar nos contatos" é um <a download> de verdade: baixa o .vcf
            sem uma linha de JavaScript (princípio 0.2). É a função central do
            produto — se ela dependesse de script, quebraria no pior momento. */}
        <a
          href={`/api/cartoes/${handle}/vcard`}
          download
          className={`mt-4.5 flex min-h-13 w-full items-center justify-center gap-2.5 ${estilo.raio} border border-[#D6D3D1] bg-cartao-fundo-2 px-4 text-[15px] font-semibold text-cartao-texto`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#18181B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="3.5" /><path d="M19 8v6M22 11h-6" />
          </svg>
          {TEXTOS.cartaoSalvarContato}
        </a>

        {qrSvg && (
          <Link
            href={`/${handle}/qr`}
            className="mt-7 flex flex-col items-center gap-2.5"
            aria-label="Abrir o QR code em tela cheia"
          >
            <span className="text-[12px] font-semibold uppercase tracking-wide text-cartao-texto-3">
              {TEXTOS.cartaoAcimaDoQr}
            </span>
            <span
              className="block w-28 rounded-xl border border-cartao-traco p-2 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          </Link>
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
