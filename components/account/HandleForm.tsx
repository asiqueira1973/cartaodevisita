'use client'

// Campo de escolha do endereço, com disponibilidade em tempo real
// (épico 8.1, critérios 8.1.5 a 8.1.8).
//
// É componente de cliente porque precisa reagir à digitação. Ele NÃO toca no
// Firestore: consulta a rota de servidor, que é quem tem a guarda
// (pegadinha 18.4.3).

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ERROS, TEXTOS } from '@/lib/copy'
import { isHandleFormatValid } from '@/lib/handle'

type Estado =
  | { tipo: 'parado' }
  | { tipo: 'conferindo' }
  | { tipo: 'livre' }
  | { tipo: 'ocupado' }
  | { tipo: 'invalido'; mensagem: string }

export function HandleForm({ sugestao, urlBase }: { sugestao: string; urlBase: string }) {
  const [valor, setValor] = useState(sugestao)
  const [estado, setEstado] = useState<Estado>({ tipo: 'parado' })
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const [enviando, iniciarEnvio] = useTransition()
  const router = useRouter()

  // Guarda a requisição em voo para cancelá-la quando a pessoa continua
  // digitando — sem isso, uma resposta antiga pode chegar depois da nova e
  // sobrescrever o resultado certo.
  const emVoo = useRef<AbortController | null>(null)

  useEffect(() => {
    const candidato = valor.trim().toLowerCase()

    if (!candidato) return setEstado({ tipo: 'parado' })
    if (candidato.startsWith('-') || candidato.endsWith('-')) {
      return setEstado({ tipo: 'invalido', mensagem: ERROS[3] })
    }
    if (!isHandleFormatValid(candidato)) {
      return setEstado({ tipo: 'invalido', mensagem: ERROS[2] })
    }

    setEstado({ tipo: 'conferindo' })

    // 350 ms segura a digitação sem parecer lento.
    const relogio = setTimeout(async () => {
      emVoo.current?.abort()
      const controller = new AbortController()
      emVoo.current = controller
      try {
        const r = await fetch(`/api/conta/handle?valor=${encodeURIComponent(candidato)}`, {
          signal: controller.signal,
        })
        const dados = (await r.json()) as { disponivel?: boolean }
        setEstado(dados.disponivel ? { tipo: 'livre' } : { tipo: 'ocupado' })
      } catch (erro) {
        // Abortar é o fluxo normal quando a pessoa continua digitando.
        if ((erro as Error).name !== 'AbortError') setEstado({ tipo: 'parado' })
      }
    }, 350)

    return () => clearTimeout(relogio)
  }, [valor])

  function enviar(evento: React.FormEvent) {
    evento.preventDefault()
    setErroEnvio(null)
    iniciarEnvio(async () => {
      const r = await fetch('/api/conta/handle', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ valor: valor.trim().toLowerCase() }),
      })
      if (r.ok) {
        router.push('/conta')
        router.refresh()
        return
      }
      const dados = (await r.json().catch(() => ({}))) as { mensagem?: string }
      setErroEnvio(dados.mensagem ?? ERROS[16])
      setEstado({ tipo: 'ocupado' })
    })
  }

  const podeEnviar = estado.tipo === 'livre' && !enviando

  return (
    <form onSubmit={enviar} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="handle" className="text-[13px] font-semibold text-tinta">
          Seu endereço
        </label>

        <div className="flex min-h-12 items-center rounded-xl border border-traco-forte bg-superficie px-3.5 focus-within:border-tinta">
          <span className="shrink-0 text-[15px] text-tinta-apagada">{urlBase}/</span>
          <input
            id="handle"
            name="handle"
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value.toLowerCase())}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-describedby="handle-ajuda handle-estado"
            className="min-w-0 flex-1 bg-transparent py-3 text-[15px] text-tinta outline-none"
          />
          <span className="ml-2 shrink-0" aria-hidden>
            {estado.tipo === 'conferindo' && (
              <span className="block h-4 w-4 animate-spin rounded-full border-2 border-traco border-t-tinta" />
            )}
            {estado.tipo === 'livre' && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12l5 5L20 6" />
              </svg>
            )}
          </span>
        </div>

        <p id="handle-estado" aria-live="polite" className="min-h-5 text-[13px]">
          {estado.tipo === 'ocupado' && <span className="text-perigo">{ERROS[1]}</span>}
          {estado.tipo === 'invalido' && <span className="text-perigo">{estado.mensagem}</span>}
          {estado.tipo === 'livre' && <span className="text-sucesso">Disponível.</span>}
          {erroEnvio && <span className="text-perigo">{erroEnvio}</span>}
        </p>
      </div>

      <p id="handle-ajuda" className="text-[13px] leading-relaxed text-tinta-fraca">
        {TEXTOS.escolhaAjuda}
      </p>

      <button
        type="submit"
        disabled={!podeEnviar}
        className="flex min-h-12 w-full items-center justify-center rounded-full bg-tinta px-6 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-ativo disabled:text-tinta-desabilitada"
      >
        {enviando ? 'Reservando…' : 'Confirmar endereço'}
      </button>
    </form>
  )
}
