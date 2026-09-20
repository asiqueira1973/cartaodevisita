// Edição dos campos de texto do cartão (spec 13.1, épico 8.2).
//
// PEGADINHA 18.4.1: requireDono() na PRIMEIRA LINHA.

import { requireDono } from '@/lib/guards'
import { atualizarCartao } from '@/lib/firebase/firestore'
import { LIMITES, paraGravar, validarCampo, type CampoDeTexto } from '@/lib/cartao'
import { ERROS } from '@/lib/copy'
import type { CorDestaque, TemplateCartao } from '@/types/dominio'
import { limitesDoPlano } from '@/lib/planos'

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json' } })
}

const CAMPOS_DE_TEXTO: CampoDeTexto[] = ['nome_exibicao', 'cargo', 'empresa', 'bio', 'mensagem_whatsapp']

/**
 * Grava um subconjunto dos campos editáveis (spec 13.1).
 *
 * Aceita só os campos que conhece: uma chave inesperada é IGNORADA, não gravada.
 * Sem isso, um cliente poderia escrever `publicado` ou `plano` por esta rota e
 * contornar as regras que vivem nas rotas próprias.
 */
export async function PATCH(request: Request): Promise<Response> {
  const guarda = await requireDono()
  if (!guarda.ok) return guarda.resposta
  const { usuario } = guarda.dados

  const corpo = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const campos: Record<string, unknown> = {}

  for (const campo of CAMPOS_DE_TEXTO) {
    if (!(campo in corpo)) continue
    const valor = String(corpo[campo] ?? '')

    const erro = validarCampo(campo, valor)
    if (erro === 'obrigatorio') return json({ erro: 'obrigatorio', campo, mensagem: ERROS[13] }, 400)
    if (erro === 'longo') {
      return json({ erro: 'longo', campo, limite: LIMITES[campo], mensagem: ERROS[16] }, 413)
    }

    // Campo opcional vazio vira nulo, não string vazia (spec 7.5).
    campos[campo] = campo === 'nome_exibicao' ? valor.trim() : paraGravar(valor)
  }

  // Template e cor respeitam o plano (regra 11.11.2). O bloqueio é do servidor:
  // a interface marca o indisponível, mas quem manda é esta linha.
  //
  // Responde 422, e não 403, de propósito: limite de plano não é falha de
  // autorização — a pessoa PODE editar o próprio cartão, só não pode usar
  // aquele valor. Deixar 403 aqui corroeria a pegadinha 18.4.2, que reserva o
  // 403 ao único caso da conta bloqueada. Foi o teste estrutural que pegou.
  const limites = limitesDoPlano(usuario.plano)

  if ('template' in corpo) {
    const template = corpo.template as TemplateCartao
    if (!limites.templates.includes(template)) {
      return json({ erro: 'plano', campo: 'template', mensagem: ERROS[18] }, 422)
    }
    campos.template = template
  }

  if ('cor_destaque' in corpo) {
    const cor = corpo.cor_destaque as CorDestaque
    if (!limites.cores.includes(cor)) {
      return json({ erro: 'plano', campo: 'cor_destaque', mensagem: ERROS[18] }, 422)
    }
    campos.cor_destaque = cor
  }

  if (!Object.keys(campos).length) return json({ erro: 'nada_para_gravar' }, 400)

  const cartao = await atualizarCartao(usuario.id, campos)
  return json({ cartao })
}
