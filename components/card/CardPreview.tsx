// Pré-visualização do cartão (épico 8.2).
//
// Componente puro de apresentação: recebe os dados e desenha. Não busca nada,
// não sabe de sessão e não toca em dados (pegadinha 18.4.3) — por isso serve
// tanto ao painel quanto, mais adiante, à página pública.
//
// A estética aqui é a do CARTÃO, não a do painel: a cor é a que o dono
// escolheu, e não os tons monocromáticos do produto (spec 16.1).

import { tons } from '@/lib/cores'
import { CabecalhoDoCartao, ESTILOS } from '@/components/card/CabecalhoDoCartao'
import { ROTULOS_PADRAO } from '@/lib/links'
import { MARCA_RODAPE, TEXTOS } from '@/lib/copy'
import type { Cartao } from '@/types/dominio'

export function CardPreview({ cartao, comMarca }: { cartao: Cartao; comMarca: boolean }) {
  const cor = tons(cartao.cor_destaque)
  const estilo = ESTILOS[cartao.template]
  const whatsapp = cartao.links.find((l) => l.tipo === 'whatsapp')
  const demais = cartao.links
    .filter((l) => l.tipo !== 'whatsapp')
    .sort((a, b) => a.ordem - b.ordem)

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="flex grow flex-col items-center px-6 pt-9">
        <div className="w-full">
          {/* A prévia usa EXATAMENTE o mesmo cabeçalho da página pública, para
              não existir "ficou diferente do que eu vi no painel". */}
          <CabecalhoDoCartao cartao={cartao} cor={cor} />
        </div>

        {/* O botão de WhatsApp é o elemento mais pesado da página, em todos os
            templates. Não é opção de layout — é o princípio 0.3. */}
        {whatsapp && (
          <div
            className={`mt-5 flex min-h-12 w-full items-center justify-center gap-2 ${estilo.raio} px-5 text-sm font-semibold text-white`}
            style={{ backgroundColor: estilo.fundoPrincipal(cor) }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z" />
            </svg>
            {whatsapp.rotulo ?? ROTULOS_PADRAO.whatsapp}
          </div>
        )}

        {demais.length > 0 && (
          <div className="mt-2 flex w-full flex-col gap-1.5">
            {demais.map((link) => (
              <div
                key={link.id}
                className={`flex min-h-11 items-center ${estilo.raio} border border-cartao-traco px-3.5 text-[13px] font-semibold text-cartao-texto`}
              >
                {link.rotulo ?? ROTULOS_PADRAO[link.tipo]}
              </div>
            ))}
          </div>
        )}

        {!whatsapp && demais.length === 0 && (
          <p className="mt-6 text-center text-[13px] leading-relaxed text-cartao-texto-3">
            Seus links aparecem aqui.
          </p>
        )}

        <div className={`mt-4 flex min-h-11 w-full items-center justify-center ${estilo.raio} border border-[#D6D3D1] bg-cartao-fundo-2 text-[13px] font-semibold text-cartao-texto`}>
          {TEXTOS.cartaoSalvarContato}
        </div>
      </div>

      {/* A marca só aparece no plano gratuito (regra 11.11.2). */}
      {comMarca && (
        <div className="shrink-0 px-6 pb-5 pt-4 text-center text-[11px] font-medium text-cartao-texto-3">
          {MARCA_RODAPE}
        </div>
      )}
    </div>
  )
}
