// Contador de cliques no WhatsApp (spec 13.2).
//
// Rota PÚBLICA, e por isso ela NÃO fala com o Visão de Produto (regra 21.3.1):
// quem clica é visitante, não tem conta e não consentiu. O único registro é o
// contador agregado do dono, sem nenhum dado de quem clicou.
//
// Responde 204 sempre. O clique no WhatsApp nunca espera por esta chamada.

import { buscarCartaoPorHandle, registrarVisita } from '@/lib/firebase/firestore'

export async function POST(request: Request): Promise<Response> {
  try {
    const { handle } = (await request.json()) as { handle?: string }
    if (handle) {
      const achado = await buscarCartaoPorHandle(handle)
      if (achado) await registrarVisita(achado.usuario.id, 'abriu_whatsapp')
    }
  } catch {
    // Falha em silêncio: um contador não pode virar erro para quem visita.
  }
  return new Response(null, { status: 204 })
}
