// As guardas de autorização (spec 6.5).
//
// PEGADINHA 18.4.1: toda rota `/api/conta/*` chama `requireDono()` na PRIMEIRA
// LINHA, e toda rota `/api/admin/*` chama `requireAdminPlataforma()`. Firestore
// não tem RLS — essas funções são a única camada de autorização, e as regras de
// segurança do Firestore só garantem que não existe uma segunda porta.
//
// Há teste estrutural que falha se uma rota tocar o Firestore ou o Storage antes
// de autorizar. Não desative esse teste.

import { auth } from '@/lib/auth'
import { isPlatformAdmin } from '@/lib/admins'
import { garantirUsuario } from '@/lib/firebase/firestore'
import type { Usuario } from '@/types/dominio'

/** Resultado de uma guarda: ou passou com o dado, ou tem uma resposta pronta. */
export type Guarda<T> = { ok: true; dados: T } | { ok: false; resposta: Response }

function json(corpo: unknown, status: number): Response {
  return new Response(JSON.stringify(corpo), {
    status, headers: { 'content-type': 'application/json' },
  })
}

/**
 * Exige um dono autenticado e devolve a conta dele (spec 6.5).
 *
 * É AQUI que a conta nasce, no primeiro acesso (spec 6.2) — por isso a guarda
 * chama `garantirUsuario` em vez de só ler.
 *
 * Sem sessão devolve 401. Com sessão mas sem handle devolve 409 com o destino
 * da tela de escolha, para o cliente redirecionar (critério 8.1.4).
 *
 * `exigirHandle: false` é usado pela própria rota de escolha do endereço, que
 * precisa rodar justamente quando ainda não há handle.
 */
export async function requireDono(
  exigirHandle = true,
): Promise<Guarda<{ usuario: Usuario; email: string }>> {
  const sessao = await auth()
  const email = sessao?.user?.email
  const uid = sessao?.user?.id

  if (!email || !uid) {
    return { ok: false, resposta: json({ erro: 'sem_sessao' }, 401) }
  }

  const usuario = await garantirUsuario(
    uid, email, sessao.user.name ?? email, sessao.user.image ?? null,
  )

  // Conta bloqueada por moderação: o painel fica em leitura, as rotas recusam.
  if (usuario.bloqueado) {
    return { ok: false, resposta: json({ erro: 'conta_bloqueada' }, 403) }
  }

  if (exigirHandle && !usuario.handle) {
    return { ok: false, resposta: json({ erro: 'sem_handle', destino: '/conta/handle' }, 409) }
  }

  return { ok: true, dados: { usuario, email } }
}

/**
 * Exige um administrador da plataforma (spec 5.3 e 6.5).
 *
 * Devolve 404 — NUNCA 403 — para quem não é admin, inclusive para quem não está
 * logado. Responder 403 confirmaria que a rota existe (pegadinha 18.4.2).
 */
export async function requireAdminPlataforma(): Promise<Guarda<{ email: string }>> {
  const sessao = await auth()
  const email = sessao?.user?.email

  if (!isPlatformAdmin(email)) {
    return { ok: false, resposta: new Response(null, { status: 404 }) }
  }

  return { ok: true, dados: { email: email as string } }
}
