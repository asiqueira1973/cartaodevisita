'use client'

// Ajustes da conta (épico 8.8).
//
// Três blocos, do mais inofensivo ao mais perigoso: endereço, conta, zona de
// risco. A ordem é deliberada — o que apaga tudo fica por último, longe do
// caminho de quem entrou aqui para fazer outra coisa.

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sair } from '@/app/conta/actions'
import { isHandleFormatValid } from '@/lib/handle'
import { ERROS, TEXTOS } from '@/lib/copy'
import type { PlanoConta } from '@/types/dominio'

const NOME_DO_PLANO: Record<PlanoConta, string> = {
  gratuito: 'Gratuito',
  early_adopter: 'Early adopter',
  ilimitado: 'Ilimitado',
  pago: 'Pago',
}

export function Ajustes({
  handle, email, plano, permitirIndexacao, urlBase,
}: {
  handle: string
  email: string
  plano: PlanoConta
  permitirIndexacao: boolean
  urlBase: string
}) {
  const router = useRouter()

  const [novoHandle, setNovoHandle] = useState(handle)
  const [trocando, setTrocando] = useState(false)
  const [erroHandle, setErroHandle] = useState<string | null>(null)
  const [salvandoHandle, iniciarTroca] = useTransition()

  const [indexar, setIndexar] = useState(permitirIndexacao)
  const [confirmacao, setConfirmacao] = useState('')
  const [excluindo, setExcluindo] = useState(false)
  const [erroExclusao, setErroExclusao] = useState<string | null>(null)
  const [apagando, iniciarExclusao] = useTransition()

  function trocarEndereco() {
    setErroHandle(null)
    iniciarTroca(async () => {
      const r = await fetch('/api/conta/handle', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ valor: novoHandle.trim().toLowerCase() }),
      })
      const dados = (await r.json().catch(() => ({}))) as { mensagem?: string }
      if (!r.ok) { setErroHandle(dados.mensagem ?? ERROS[1]); return }
      setTrocando(false)
      router.refresh()
    })
  }

  async function alternarIndexacao(valor: boolean) {
    setIndexar(valor)
    const r = await fetch('/api/conta/indexacao', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ permitir: valor }),
    })
    // Desfaz na tela se o servidor recusou — nada pior que um interruptor que
    // mostra um estado e o banco guarda outro.
    if (!r.ok) setIndexar(!valor)
  }

  function excluir() {
    setErroExclusao(null)
    iniciarExclusao(async () => {
      const r = await fetch('/api/conta', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ confirmacao }),
      })
      if (!r.ok) {
        const dados = (await r.json().catch(() => ({}))) as { mensagem?: string }
        setErroExclusao(dados.mensagem ?? ERROS[14])
        return
      }
      // A conta não existe mais: a sessão tem de ir junto.
      await sair()
    })
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-tinta">{TEXTOS.ajustesEndereco}</h2>

        {!trocando ? (
          <div className="flex items-center gap-3 rounded-xl border border-traco px-4 py-3">
            <span className="grow truncate text-[15px] text-tinta">{urlBase}/{handle}</span>
            <button type="button" onClick={() => setTrocando(true)}
              className="min-h-9 shrink-0 cursor-pointer rounded-full border border-traco-forte px-4 text-[13px] font-semibold text-tinta">
              {TEXTOS.ajustesTrocarEndereco}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-xl border border-traco p-4">
            {/* O aviso vem ANTES do campo, não depois de confirmar: é o momento
                em que a pessoa ainda pode desistir (critério 8.8.2). */}
            <p className="text-[13px] leading-relaxed text-tinta-fraca">
              {TEXTOS.trocarHandleAviso}
            </p>

            <div className="flex min-h-11 items-center rounded-lg border border-traco-forte px-3 focus-within:border-tinta">
              <span className="shrink-0 text-[15px] text-tinta-apagada">{urlBase}/</span>
              <input
                type="text" value={novoHandle} autoComplete="off" autoCapitalize="none" spellCheck={false}
                onChange={(e) => setNovoHandle(e.target.value.toLowerCase())}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-tinta outline-none"
              />
            </div>

            {erroHandle && <p className="text-[13px] text-perigo">{erroHandle}</p>}

            <div className="flex gap-2">
              <button type="button" onClick={trocarEndereco}
                disabled={salvandoHandle || !isHandleFormatValid(novoHandle.trim().toLowerCase()) || novoHandle.trim().toLowerCase() === handle}
                className="min-h-10 cursor-pointer rounded-full bg-tinta px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-ativo disabled:text-tinta-desabilitada">
                {salvandoHandle ? 'Trocando…' : 'Confirmar'}
              </button>
              <button type="button" onClick={() => { setTrocando(false); setNovoHandle(handle); setErroHandle(null) }}
                className="min-h-10 cursor-pointer px-3 text-sm font-semibold text-tinta-apagada hover:text-tinta">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-tinta">{TEXTOS.ajustesConta}</h2>
        <dl className="flex flex-col divide-y divide-traco rounded-xl border border-traco">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-[13px] font-semibold text-tinta">{TEXTOS.ajustesEntrandoCom}</dt>
            <dd className="truncate text-[13px] text-tinta-fraca">{email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-[13px] font-semibold text-tinta">{TEXTOS.ajustesPlano}</dt>
            <dd>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                plano === 'ilimitado' ? 'bg-tinta text-white'
                  : plano === 'gratuito' ? 'bg-superficie-2 text-tinta-fraca'
                  : 'border border-tinta text-tinta'
              }`}>
                {NOME_DO_PLANO[plano]}
              </span>
            </dd>
          </div>
        </dl>
        <p className="text-xs leading-relaxed text-tinta-apagada">
          Não há senha para esquecer. Se você perder acesso à conta do Google, o
          caminho é recuperá-la com o próprio Google.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-tinta">{TEXTOS.ajustesBusca}</h2>
        <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-traco px-4 py-3.5">
          <span className="grow text-[13px] leading-relaxed text-tinta-fraca">
            {TEXTOS.ajustesBuscaAjuda}
          </span>
          <input type="checkbox" checked={indexar} className="sr-only"
            onChange={(e) => void alternarIndexacao(e.target.checked)} />
          <span aria-hidden className={`flex h-6 w-10 shrink-0 items-center rounded-full px-0.75 ${indexar ? 'justify-end bg-tinta' : 'bg-traco'}`}>
            <span className="h-4.5 w-4.5 rounded-full bg-white" />
          </span>
        </label>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-perigo">{TEXTOS.ajustesRisco}</h2>

        <form action={sair}>
          <button type="submit"
            className="min-h-11 w-full cursor-pointer rounded-xl border border-traco text-sm font-semibold text-tinta">
            {TEXTOS.ajustesSair}
          </button>
        </form>

        {!excluindo ? (
          <button type="button" onClick={() => setExcluindo(true)}
            className="min-h-11 w-full cursor-pointer rounded-xl border border-perigo text-sm font-semibold text-perigo">
            {TEXTOS.ajustesExcluir}
          </button>
        ) : (
          <div className="flex flex-col gap-3 rounded-xl border border-perigo p-4">
            <p className="text-[13px] leading-relaxed text-tinta">{TEXTOS.excluirContaAviso}</p>
            <label htmlFor="confirmacao" className="text-[13px] font-semibold text-tinta">
              Digite <span className="font-mono">{handle}</span> para confirmar
            </label>
            <input id="confirmacao" type="text" value={confirmacao} autoComplete="off"
              onChange={(e) => setConfirmacao(e.target.value)}
              className="min-h-11 rounded-lg border border-traco-forte px-3 text-[15px] text-tinta outline-none focus:border-perigo" />
            {erroExclusao && <p className="text-[13px] text-perigo">{erroExclusao}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={excluir}
                disabled={apagando || confirmacao.trim().toLowerCase() !== handle}
                className="min-h-10 cursor-pointer rounded-full bg-perigo px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-ativo disabled:text-tinta-desabilitada">
                {apagando ? 'Apagando…' : 'Apagar tudo'}
              </button>
              <button type="button" onClick={() => { setExcluindo(false); setConfirmacao(''); setErroExclusao(null) }}
                className="min-h-10 cursor-pointer px-3 text-sm font-semibold text-tinta-apagada hover:text-tinta">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
