// Alterar o plano de uma conta (regra 11.11.5, critérios 8.10.10 e 8.10.11).

import { requireAdminPlataforma } from '@/lib/guards'
import { alterarPlano, buscarContaParaAdmin, registrarAcaoAdmin } from '@/lib/firebase/firestore'
import { isPlanoAtribuivelPorAdmin } from '@/lib/planos'
import type { PlanoConta } from '@/types/dominio'

const PLANOS: PlanoConta[] = ['gratuito', 'early_adopter', 'ilimitado', 'pago']

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const guarda = await requireAdminPlataforma()
  if (!guarda.ok) return guarda.resposta

  const { id } = await params
  const corpo = (await request.json().catch(() => ({}))) as { plano?: PlanoConta; detalhe?: string }
  const plano = corpo.plano

  if (!plano || !PLANOS.includes(plano)) return new Response(null, { status: 400 })

  // `pago` não é atribuível na v1: não há caminho de pagamento, e uma conta
  // marcada como paga sem ter pago é mentira no banco (regra 11.11.5).
  if (!isPlanoAtribuivelPorAdmin(plano)) {
    return new Response(JSON.stringify({ erro: 'pago_indisponivel' }), {
      status: 422, headers: { 'content-type': 'application/json' },
    })
  }

  const conta = await buscarContaParaAdmin(id)
  if (!conta) return new Response(null, { status: 404 })
  const anterior = conta.usuario.plano

  await alterarPlano(id, plano)

  // Rebaixar NÃO apaga link nenhum (regra 11.11.6): o cartão continua no ar
  // como está, e a pessoa só não consegue adicionar mais.
  await registrarAcaoAdmin(
    guarda.dados.email, 'alterou_plano', id,
    `${anterior} → ${plano}${corpo.detalhe?.trim() ? ` · ${corpo.detalhe.trim()}` : ''}`,
  )

  return new Response(JSON.stringify({ plano }), { headers: { 'content-type': 'application/json' } })
}
