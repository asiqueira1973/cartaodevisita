'use client'

// Editor do cartão (épico 8.2).
//
// Salva ao sair do foco, sem botão "salvar" global (critério 8.2.1): a pessoa
// mexe no cartão umas poucas vezes na vida (persona 2.1), e um botão de salvar
// é mais uma coisa que ela pode esquecer de apertar.
//
// Não toca no Firestore (pegadinha 18.4.3) — fala com a rota de servidor.

import { useRef, useState } from 'react'
import { LIMITES, deveMostrarContador, type CampoDeTexto } from '@/lib/cartao'
import { TETO_ORIGINAL_BYTES } from '@/lib/imagens'
import { gerarDerivadas } from '@/lib/redimensionar'
import { ERROS } from '@/lib/copy'
import type { Cartao } from '@/types/dominio'

type Estado = 'parado' | 'salvando' | 'salvo' | 'erro'

interface Campo {
  nome: CampoDeTexto
  rotulo: string
  ajuda?: string
  multilinha?: boolean
  espacoReservado?: string
}

const CAMPOS: Campo[] = [
  { nome: 'nome_exibicao', rotulo: 'Nome' },
  { nome: 'cargo', rotulo: 'Cargo', ajuda: 'opcional', espacoReservado: 'Psicanalista' },
  { nome: 'empresa', rotulo: 'Empresa', ajuda: 'opcional', espacoReservado: 'Deixe vazio se for autônomo' },
  { nome: 'bio', rotulo: 'Uma linha sobre você', ajuda: 'opcional', multilinha: true, espacoReservado: 'Atendimento online e presencial na Zona Sul.' },
]

export function CardEditor({
  cartaoInicial,
  onMudou,
}: {
  cartaoInicial: Cartao
  onMudou: (cartao: Cartao) => void
}) {
  const [valores, setValores] = useState<Record<string, string>>({
    nome_exibicao: cartaoInicial.nome_exibicao,
    cargo: cartaoInicial.cargo ?? '',
    empresa: cartaoInicial.empresa ?? '',
    bio: cartaoInicial.bio ?? '',
  })
  const [estado, setEstado] = useState<Estado>('parado')
  const [erro, setErro] = useState<string | null>(null)
  const [foto, setFoto] = useState<string | null>(cartaoInicial.foto_url)
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const seletor = useRef<HTMLInputElement>(null)

  // Guarda o que já foi gravado, para não mandar requisição quando a pessoa
  // entra e sai do campo sem mudar nada.
  const gravado = useRef<Record<string, string>>({ ...valores })

  async function salvar(campo: CampoDeTexto) {
    const valor = valores[campo] ?? ''
    if (valor === gravado.current[campo]) return

    setEstado('salvando')
    setErro(null)
    try {
      const r = await fetch('/api/conta/cartao', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ [campo]: valor }),
      })
      const dados = (await r.json()) as { cartao?: Cartao; mensagem?: string }
      if (!r.ok) {
        setErro(dados.mensagem ?? ERROS[16])
        setEstado('erro')
        return
      }
      gravado.current[campo] = valor
      if (dados.cartao) onMudou(dados.cartao)
      setEstado('salvo')
    } catch {
      setErro(ERROS[16])
      setEstado('erro')
    }
  }

  async function enviarFoto(arquivo: File) {
    setErro(null)

    // Teto checado ANTES de qualquer envio (critério 8.2.6): não faz sentido
    // subir 40 MB para o servidor recusar.
    if (arquivo.size > TETO_ORIGINAL_BYTES) {
      setErro(ERROS[7])
      return
    }

    setEnviandoFoto(true)
    try {
      const { exibicao, vcard } = await gerarDerivadas(arquivo)
      const formulario = new FormData()
      formulario.append('exibicao', exibicao, 'exibicao.jpg')
      formulario.append('vcard', vcard, 'vcard.jpg')

      const r = await fetch('/api/conta/cartao/foto', { method: 'POST', body: formulario })
      const dados = (await r.json()) as { cartao?: Cartao; mensagem?: string }
      if (!r.ok) {
        setErro(dados.mensagem ?? ERROS[10])
        return
      }
      if (dados.cartao) {
        setFoto(dados.cartao.foto_url)
        onMudou(dados.cartao)
      }
    } catch {
      // Falha do canvas é diferente de falha de rede, e a copy distingue as duas.
      setErro(ERROS[9])
    } finally {
      setEnviandoFoto(false)
      if (seletor.current) seletor.current.value = ''
    }
  }

  async function removerFoto() {
    setEnviandoFoto(true)
    try {
      const r = await fetch('/api/conta/cartao/foto', { method: 'DELETE' })
      const dados = (await r.json()) as { cartao?: Cartao }
      if (r.ok && dados.cartao) {
        setFoto(null)
        onMudou(dados.cartao)
      }
    } finally {
      setEnviandoFoto(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 rounded-xl border border-traco px-4 py-3.5">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={foto} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-superficie-2 text-tinta-apagada">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="3.5" />
            </svg>
          </div>
        )}
        <div className="flex grow flex-col gap-0.5">
          <span className="text-sm font-semibold text-tinta">Sua foto</span>
          <span className="text-xs text-tinta-apagada">JPEG ou PNG, até 10 MB. Enquadre o rosto.</span>
        </div>

        <input
          ref={seletor}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const arquivo = e.target.files?.[0]
            if (arquivo) void enviarFoto(arquivo)
          }}
        />
        <button
          type="button"
          disabled={enviandoFoto}
          onClick={() => seletor.current?.click()}
          className="min-h-9 cursor-pointer rounded-full border border-traco-forte px-4 text-[13px] font-semibold text-tinta disabled:cursor-wait disabled:text-tinta-desabilitada"
        >
          {enviandoFoto ? 'Enviando…' : foto ? 'Trocar' : 'Escolher'}
        </button>
        {foto && (
          <button
            type="button"
            disabled={enviandoFoto}
            onClick={() => void removerFoto()}
            className="min-h-9 cursor-pointer px-2 text-[13px] font-semibold text-tinta-apagada hover:text-tinta"
          >
            Remover
          </button>
        )}
      </div>

      {CAMPOS.map((campo) => {
        const valor = valores[campo.nome] ?? ''
        const limite = LIMITES[campo.nome]
        return (
          <div key={campo.nome} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <label htmlFor={campo.nome} className="text-[13px] font-semibold text-tinta">
                {campo.rotulo}
                {campo.ajuda && <span className="ml-1.5 font-medium text-tinta-desabilitada">· {campo.ajuda}</span>}
              </label>
              {/* O contador só aparece perto do limite (critério 8.2.2). */}
              {deveMostrarContador(campo.nome, valor) && (
                <span className={`text-xs tabular-nums ${valor.length > limite ? 'text-perigo' : 'text-tinta-desabilitada'}`}>
                  {valor.length} / {limite}
                </span>
              )}
            </div>

            {campo.multilinha ? (
              <textarea
                id={campo.nome}
                rows={2}
                value={valor}
                placeholder={campo.espacoReservado}
                maxLength={limite}
                onChange={(e) => setValores((v) => ({ ...v, [campo.nome]: e.target.value }))}
                onBlur={() => void salvar(campo.nome)}
                className="w-full resize-none rounded-xl border border-traco-forte px-3.5 py-3 text-[15px] leading-relaxed text-tinta outline-none focus:border-tinta"
              />
            ) : (
              <input
                id={campo.nome}
                type="text"
                value={valor}
                placeholder={campo.espacoReservado}
                maxLength={limite}
                onChange={(e) => setValores((v) => ({ ...v, [campo.nome]: e.target.value }))}
                onBlur={() => void salvar(campo.nome)}
                className="min-h-11 w-full rounded-xl border border-traco-forte px-3.5 text-[15px] text-tinta outline-none focus:border-tinta"
              />
            )}
          </div>
        )
      })}

      <p aria-live="polite" className="min-h-5 text-[13px]">
        {erro && <span className="text-perigo">{erro}</span>}
        {!erro && estado === 'salvando' && <span className="text-tinta-apagada">Salvando…</span>}
        {!erro && estado === 'salvo' && <span className="text-sucesso">Salvo.</span>}
      </p>
    </div>
  )
}
