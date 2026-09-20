// Lista de links do cartão (spec 13.1, épico 8.3).
//
// PEGADINHA 18.4.1: requireDono() na PRIMEIRA LINHA.
//
// É um PUT da lista INTEIRA, não um POST por item (spec 13.1). Reordenar é a
// operação mais comum e ela muda todos os itens de uma vez; um endpoint por
// item exigiria transação para manter a ordem consistente. O preço é perder
// edição concorrente de dois dispositivos — irrelevante num produto de um
// usuário por conta.

import { randomUUID } from 'node:crypto'
import { requireDono } from '@/lib/guards'
import { atualizarCartao } from '@/lib/firebase/firestore'
import {
  LinkInvalidoError, normalizeLinkValue, renumerar, validarListaDeLinks,
  type ErroDeLista,
} from '@/lib/links'
import { LIMITES } from '@/lib/cartao'
import { limitesDoPlano } from '@/lib/planos'
import { registrarEvento } from '@/lib/telemetria'
import { ERROS } from '@/lib/copy'
import type { LinkCartao, TipoLink } from '@/types/dominio'

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json' } })
}

/** Cada erro de lista tem a sua frase da seção 15.2 — nenhuma genérica. */
const MENSAGEM: Record<ErroDeLista, string> = {
  whatsapp_duplicado: ERROS[4],
  pix_duplicado: ERROS[5],
  acima_do_teto: ERROS[6],
  acima_do_plano: ERROS[17],
  tipo_invalido: ERROS[16],
  rotulo_longo: ERROS[16],
}

/** A normalização que falhou diz qual campo está errado (regra 11.5). */
function mensagemDeValor(tipo: TipoLink): string {
  if (tipo === 'whatsapp' || tipo === 'telefone') return ERROS[11]
  if (tipo === 'email') return ERROS[12]
  return ERROS[16]
}

interface LinkRecebido {
  id?: string
  tipo: TipoLink
  valor: string
  rotulo?: string | null
}

/** Substitui a lista inteira, já na ordem em que ela deve aparecer. */
export async function PUT(request: Request): Promise<Response> {
  const guarda = await requireDono()
  if (!guarda.ok) return guarda.resposta
  const { usuario, email } = guarda.dados

  const corpo = (await request.json().catch(() => ({}))) as { links?: LinkRecebido[] }
  if (!Array.isArray(corpo.links)) return json({ erro: 'formato', mensagem: ERROS[16] }, 400)

  const links: LinkCartao[] = []
  for (const recebido of corpo.links) {
    try {
      links.push({
        // Id novo para item novo; o que já tinha id mantém o dele, para a
        // interface não perder o estado de foco ao salvar.
        id: recebido.id ?? randomUUID(),
        tipo: recebido.tipo,
        // O que a pessoa digitou NÃO é o que fica guardado (regra 11.5).
        valor: normalizeLinkValue(recebido.tipo, String(recebido.valor ?? '')),
        rotulo: recebido.rotulo?.trim() ? recebido.rotulo.trim().slice(0, LIMITES.rotulo) : null,
        ordem: 0,
      })
    } catch (erro) {
      if (erro instanceof LinkInvalidoError) {
        return json({ erro: 'valor', tipo: recebido.tipo, mensagem: mensagemDeValor(recebido.tipo) }, 400)
      }
      throw erro
    }
  }

  const erro = validarListaDeLinks(links, limitesDoPlano(usuario.plano).links)
  if (erro) {
    // Duplicata é conflito; teto é conteúdo grande demais. Status distintos
    // porque a interface trata os dois casos de forma diferente.
    const status = erro === 'whatsapp_duplicado' || erro === 'pix_duplicado' ? 409 : 413
    return json({ erro, mensagem: MENSAGEM[erro] }, status)
  }

  const cartao = await atualizarCartao(usuario.id, { links: renumerar(links) })

  await registrarEvento(
    'links_reordenados', email, 'Links', 'a pessoa salvou a lista de links',
    { total: links.length, plano: usuario.plano },
  )

  return json({ cartao })
}
