'use client'

// Lista de links do cartão (épico 8.3).
//
// Reordenação por BOTÕES de subir e descer, não por arrastar (spec 17.2):
// arrastar com precisão em tela pequena falha, e o público monta o cartão no
// celular. O alvo de toque é 44×44 pt como manda 17.3.
//
// Não toca no Firestore (pegadinha 18.4.3) — fala com a rota, que tem a guarda.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconeDoTipo } from '@/components/card/IconeDoTipo'
import { LIMITES } from '@/lib/cartao'
import { ROTULOS_PADRAO, TIPOS, TIPOS_UNICOS } from '@/lib/links'
import { ERROS } from '@/lib/copy'
import type { Cartao, LinkCartao, TipoLink } from '@/types/dominio'

/** O que a pessoa vê no seletor de tipo, e o que digitar em cada um. */
const AJUDA: Record<TipoLink, { rotulo: string; exemplo: string }> = {
  whatsapp: { rotulo: 'WhatsApp', exemplo: '(21) 99876-5432' },
  telefone: { rotulo: 'Telefone', exemplo: '(21) 2555-1234' },
  email: { rotulo: 'E-mail', exemplo: 'voce@exemplo.com.br' },
  instagram: { rotulo: 'Instagram', exemplo: '@seuusuario' },
  linkedin: { rotulo: 'LinkedIn', exemplo: 'seu-usuario' },
  site: { rotulo: 'Site', exemplo: 'seusite.com.br' },
  youtube: { rotulo: 'YouTube', exemplo: 'youtube.com/@canal' },
  tiktok: { rotulo: 'TikTok', exemplo: '@seuusuario' },
  facebook: { rotulo: 'Facebook', exemplo: 'facebook.com/pagina' },
  x: { rotulo: 'X', exemplo: '@seuusuario' },
  github: { rotulo: 'GitHub', exemplo: 'seuusuario' },
  behance: { rotulo: 'Behance', exemplo: 'behance.net/voce' },
  spotify: { rotulo: 'Spotify', exemplo: 'open.spotify.com/…' },
  pix: { rotulo: 'Chave PIX', exemplo: 'CPF, e-mail, telefone ou chave' },
  endereco: { rotulo: 'Endereço', exemplo: 'Rua, número — bairro' },
  outro: { rotulo: 'Outro link', exemplo: 'exemplo.com.br' },
}

/** Item em edição no cliente: o `valor` ainda é o que a pessoa digitou. */
interface ItemLocal {
  id?: string
  tipo: TipoLink
  valor: string
  rotulo: string
}

const paraLocal = (l: LinkCartao): ItemLocal => ({
  id: l.id, tipo: l.tipo, valor: l.valor, rotulo: l.rotulo ?? '',
})

export function LinkList({
  cartaoInicial,
  tetoDoPlano,
  onMudou,
}: {
  cartaoInicial: Cartao
  tetoDoPlano: number
  onMudou: (cartao: Cartao) => void
}) {
  const [itens, setItens] = useState<ItemLocal[]>(
    [...cartaoInicial.links].sort((a, b) => a.ordem - b.ordem).map(paraLocal),
  )
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [escolhendoTipo, setEscolhendoTipo] = useState(false)
  const router = useRouter()

  const noTeto = itens.length >= tetoDoPlano
  const tiposJaUsados = new Set(itens.map((i) => i.tipo))

  /** Manda a lista inteira. O servidor renumera a ordem (critério 8.3.5). */
  async function salvar(lista: ItemLocal[]) {
    setSalvando(true)
    setErro(null)
    try {
      const r = await fetch('/api/conta/cartao/links', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          links: lista.map((i) => ({ id: i.id, tipo: i.tipo, valor: i.valor, rotulo: i.rotulo })),
        }),
      })
      const dados = (await r.json()) as { cartao?: Cartao; mensagem?: string }
      if (!r.ok) {
        setErro(dados.mensagem ?? ERROS[16])
        return false
      }
      if (dados.cartao) {
        // Adota o que o servidor gravou: ids novos e valores já normalizados
        // (regra 11.5). Sem isso, a tela continuaria mostrando o que foi
        // digitado em vez do que ficou guardado.
        setItens([...dados.cartao.links].sort((a, b) => a.ordem - b.ordem).map(paraLocal))
        onMudou(dados.cartao)
        // Pelo mesmo motivo do CardEditor: sem isto, voltar para "Meu cartão"
        // traz a versão cacheada da página, anterior a estes links.
        router.refresh()
      }
      return true
    } catch {
      setErro(ERROS[16])
      return false
    } finally {
      setSalvando(false)
    }
  }

  function acrescentar(tipo: TipoLink) {
    setEscolhendoTipo(false)
    setItens((atuais) => [...atuais, { tipo, valor: '', rotulo: '' }])
  }

  function mover(de: number, para: number) {
    if (para < 0 || para >= itens.length) return
    const lista = [...itens]
    const [movido] = lista.splice(de, 1)
    lista.splice(para, 0, movido)
    setItens(lista)
    // Só salva se todos os itens já têm valor — item recém-criado ainda vazio
    // faria o servidor recusar a lista inteira.
    if (lista.every((i) => i.valor.trim())) void salvar(lista)
  }

  function remover(indice: number) {
    const lista = itens.filter((_, i) => i !== indice)
    setItens(lista)
    if (lista.every((i) => i.valor.trim())) void salvar(lista)
  }

  return (
    <div className="flex flex-col gap-4">
      {itens.length === 0 && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-traco-forte px-5 py-6">
          <p className="text-sm leading-relaxed text-tinta-fraca">
            Seu cartão ainda não tem links. O <strong className="text-tinta">WhatsApp</strong> é o
            mais importante — é o botão principal da página, e quase todo mundo vai usar ele.
          </p>
          <button
            type="button"
            onClick={() => acrescentar('whatsapp')}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-tinta px-5 text-sm font-semibold text-white"
          >
            <IconeDoTipo tipo="whatsapp" tamanho={16} />
            Adicionar WhatsApp
          </button>
        </div>
      )}

      {itens.map((item, indice) => (
        <div key={item.id ?? `novo-${indice}`} className="flex flex-col gap-2.5 rounded-xl border border-traco p-3.5">
          <div className="flex items-center gap-2.5">
            <span className="text-tinta-fraca"><IconeDoTipo tipo={item.tipo} /></span>
            <span className="grow text-sm font-semibold text-tinta">{AJUDA[item.tipo].rotulo}</span>

            <button type="button" aria-label="Subir" disabled={indice === 0}
              onClick={() => mover(indice, indice - 1)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-traco text-tinta-fraca disabled:cursor-not-allowed disabled:text-traco-forte">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 15l-6-6-6 6" /></svg>
            </button>
            <button type="button" aria-label="Descer" disabled={indice === itens.length - 1}
              onClick={() => mover(indice, indice + 1)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-traco text-tinta-fraca disabled:cursor-not-allowed disabled:text-traco-forte">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            <button type="button" aria-label="Remover" onClick={() => remover(indice)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-tinta-apagada hover:text-perigo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13" /></svg>
            </button>
          </div>

          <input
            type="text"
            value={item.valor}
            placeholder={AJUDA[item.tipo].exemplo}
            inputMode={item.tipo === 'whatsapp' || item.tipo === 'telefone' ? 'tel' : 'text'}
            onChange={(e) => setItens((a) => a.map((x, i) => (i === indice ? { ...x, valor: e.target.value } : x)))}
            onBlur={() => { if (itens.every((i) => i.valor.trim())) void salvar(itens) }}
            className="min-h-11 w-full rounded-lg border border-traco-forte px-3 text-[15px] text-tinta outline-none focus:border-tinta"
          />

          <input
            type="text"
            value={item.rotulo}
            maxLength={LIMITES.rotulo}
            placeholder={`Texto do botão · padrão: ${ROTULOS_PADRAO[item.tipo]}`}
            onChange={(e) => setItens((a) => a.map((x, i) => (i === indice ? { ...x, rotulo: e.target.value } : x)))}
            onBlur={() => { if (itens.every((i) => i.valor.trim())) void salvar(itens) }}
            className="min-h-10 w-full rounded-lg border border-traco px-3 text-[13px] text-tinta-media outline-none focus:border-tinta"
          />
        </div>
      ))}

      {escolhendoTipo ? (
        <div className="flex flex-col gap-2.5 rounded-xl border border-traco p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-tinta">Que tipo de link?</span>
            <button type="button" onClick={() => setEscolhendoTipo(false)}
              className="cursor-pointer text-[13px] font-semibold text-tinta-apagada hover:text-tinta">Cancelar</button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TIPOS.map((tipo) => {
              // WhatsApp e PIX só podem aparecer uma vez (regra 11.4).
              const jaTem = TIPOS_UNICOS.includes(tipo) && tiposJaUsados.has(tipo)
              return (
                <button key={tipo} type="button" disabled={jaTem} onClick={() => acrescentar(tipo)}
                  title={jaTem ? (tipo === 'whatsapp' ? ERROS[4] : ERROS[5]) : undefined}
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-traco px-3 text-[13px] font-semibold text-tinta hover:bg-superficie-2 disabled:cursor-not-allowed disabled:border-dashed disabled:text-tinta-desabilitada">
                  <IconeDoTipo tipo={tipo} tamanho={16} />
                  <span className="truncate">{AJUDA[tipo].rotulo}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={noTeto}
          onClick={() => setEscolhendoTipo(true)}
          className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-tinta text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-ativo disabled:text-tinta-desabilitada"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          Adicionar link
        </button>
      )}

      <p aria-live="polite" className="min-h-5 text-[13px]">
        {erro && <span className="text-perigo">{erro}</span>}
        {!erro && salvando && <span className="text-tinta-apagada">Salvando…</span>}
        {/* O motivo fica AO LADO do botão desabilitado, não escondido num
            tooltip (padrão de 16.6). */}
        {!erro && !salvando && noTeto && (
          <span className="text-tinta-fraca">
            {tetoDoPlano === 5 ? ERROS[17] : ERROS[6]} Remova um para trocar por outro.
          </span>
        )}
      </p>
    </div>
  )
}
