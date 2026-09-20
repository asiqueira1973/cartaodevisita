'use server'

// Ações de servidor do painel (spec 13.1).
// Ficam separadas para poderem ser importadas por componentes de cliente sem
// arrastar o Auth.js — e, por tabela, o Firebase — para o pacote do navegador.

import { signOut } from '@/lib/auth'

/** Encerra a sessão e volta para a home (critério 8.8.3). */
export async function sair(): Promise<void> {
  await signOut({ redirectTo: '/' })
}
