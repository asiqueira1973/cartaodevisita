'use client'

// Ações de moderação sobre uma conta (critérios 8.9.3 a 8.9.6).
//
// NÃO EXISTE, AQUI NEM EM LUGAR NENHUM, caminho para o admin editar foto,
// texto ou links de um cartão (regra 5.2 e critério 8.9.6). Ele despublica,
// troca endereço, bloqueia e muda plano — e a ausência do resto é proposital:
// mantém a responsabilidade pelo conteúdo com o dono e evita a pergunta "quem
// escreveu isso no meu cartão?".
//
// Toda ação pede MOTIVO e grava em `acoes_admin` (regra 5.2).

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { isHandleFormatValid } from '@/lib/handle'
import { TEXTOS } from '@/lib/copy'
import type { PlanoConta } from '@/types/dominio'

/** `pago` fica de fora: não é atribuível na v1 (regra 11.11.5). */
const PLANOS: { valor: PlanoConta; rotulo: string }[] = [
  { valor: 'gratuito', rotulo: 'Gratuito' },
  { valor: 'early_adopter', rotulo: 'Early adopter' },
  { valor: 'ilimitado', rotulo: 'Ilimitado' },
]

type Aberta = 'despublicar' | 'handle' | 'bloqueio' | 'plano' | null

export function AcoesDaConta({
  usuarioId, handle, plano, bloqueado, publicado,
}: {
  usuarioId: string
  handle: string | null
  plano: PlanoConta
  bloqueado: boolean
  publicado: boolean
}) {
  const [aberta, setAberta] = useState<Aberta>(null)
  const [motivo, setMotivo] = useState('')
  const [novoHandle, setNovoHandle] = useState(handle ?? '')
  const [novoPlano, setNovoPlano] = useState<PlanoConta>(plano)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, iniciar] = useTransition()
  const router = useRouter()

  function executar(caminho: string, corpo: Record<string, unknown>) {
    setErro(null)
    iniciar(async () => {
      const r = await fetch(`/api/admin/contas/${usuarioId}/${caminho}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...corpo, detalhe: motivo }),
      })
      if (!r.ok) {
        const d = (await r.json().catch(() => ({}))) as { mensagem?: string }
        setErro(d.mensagem ?? 'Não consegui aplicar. Tente de novo.')
        return
      }
      setAberta(null); setMotivo(''); setErro(null)
      router.refresh()
    })
  }

  return (
    <div className="flex max-w-xl flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {publicado && <Botao onClick={() => setAberta('despublicar')}>{TEXTOS.adminDespublicar}</Botao>}
        <Botao onClick={() => setAberta('handle')}>{TEXTOS.adminTrocarEndereco}</Botao>
        <Botao onClick={() => setAberta('plano')}>{TEXTOS.adminAlterarPlano}</Botao>
        <Botao onClick={() => setAberta('bloqueio')} destrutivo>
          {bloqueado ? TEXTOS.adminDesbloquear : TEXTOS.adminBloquear}
        </Botao>
      </div>

      {aberta && (
        <div className={`flex flex-col gap-3 rounded-xl border p-4 ${aberta === 'bloqueio' ? 'border-perigo' : 'border-traco'}`}>
          {aberta === 'handle' && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-tinta">Novo endereço</span>
              <input type="text" value={novoHandle} autoComplete="off" autoCapitalize="none"
                onChange={(e) => setNovoHandle(e.target.value.toLowerCase())}
                className="min-h-10 rounded-lg border border-traco-forte px-3 text-[15px] text-tinta outline-none focus:border-tinta" />
            </label>
          )}

          {aberta === 'plano' && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-tinta">Novo plano</span>
              <select value={novoPlano} onChange={(e) => setNovoPlano(e.target.value as PlanoConta)}
                className="min-h-10 rounded-lg border border-traco-forte px-3 text-[15px] text-tinta outline-none focus:border-tinta">
                {PLANOS.map((p) => <option key={p.valor} value={p.valor}>{p.rotulo}</option>)}
              </select>
              <span className="text-xs text-tinta-apagada">
                Rebaixar não apaga link nenhum — o cartão continua como está, e a
                pessoa só não consegue adicionar mais.
              </span>
            </label>
          )}

          {aberta === 'despublicar' && (
            <p className="text-[13px] leading-relaxed text-tinta-fraca">
              O cartão sai do ar e passa a responder 404. Publicar de volta é ato
              do dono — o admin não publica cartão alheio.
            </p>
          )}

          {aberta === 'bloqueio' && (
            <p className="text-[13px] leading-relaxed text-tinta">
              {bloqueado
                ? 'A conta volta a funcionar e o cartão pode ir ao ar de novo.'
                : 'A conta é bloqueada e o cartão responde 404 para todo mundo, inclusive para o dono.'}
            </p>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-tinta">{TEXTOS.adminMotivo}</span>
            <input type="text" value={motivo} placeholder="Fica registrado no histórico"
              onChange={(e) => setMotivo(e.target.value)}
              className="min-h-10 rounded-lg border border-traco-forte px-3 text-[15px] text-tinta outline-none focus:border-tinta" />
          </label>

          {erro && <p className="text-[13px] text-perigo">{erro}</p>}

          <div className="flex gap-2">
            <button type="button" disabled={enviando || (aberta === 'handle' && !isHandleFormatValid(novoHandle))}
              onClick={() => {
                if (aberta === 'despublicar') executar('publicacao', { publicado: false })
                if (aberta === 'handle') executar('handle', { valor: novoHandle })
                if (aberta === 'plano') executar('plano', { plano: novoPlano })
                if (aberta === 'bloqueio') executar('bloqueio', { bloqueado: !bloqueado })
              }}
              className={`min-h-10 cursor-pointer rounded-full px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-ativo disabled:text-tinta-desabilitada ${aberta === 'bloqueio' && !bloqueado ? 'bg-perigo' : 'bg-tinta'}`}>
              {enviando ? 'Aplicando…' : 'Confirmar'}
            </button>
            <button type="button" onClick={() => { setAberta(null); setMotivo(''); setErro(null) }}
              className="min-h-10 cursor-pointer px-3 text-sm font-semibold text-tinta-apagada hover:text-tinta">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Botao({ children, onClick, destrutivo }: { children: React.ReactNode; onClick: () => void; destrutivo?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      className={`min-h-10 cursor-pointer rounded-full border px-4 text-[13px] font-semibold ${destrutivo ? 'border-perigo text-perigo' : 'border-traco-forte text-tinta'}`}>
      {children}
    </button>
  )
}
