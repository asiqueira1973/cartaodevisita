// Allowlist de administradores da plataforma (spec 5.3).
//
// Este arquivo NÃO tem imports, de propósito: ele é lido por `lib/guards.ts` e
// por rotas de servidor, e qualquer import aqui criaria ciclo de dependência.
// Mesmo desenho e mesmo motivo do ViraPágina.
//
// Mudar a lista exige commit e deploy — essa é a barreira desejada. Não existe
// tela para promover admin, e não deve existir.

const ADMINS = [
  'alexandre.silva.siqueira@gmail.com',
  'alexandre@dablab.com.br',
] as const

/**
 * Diz se um e-mail pertence a um administrador da plataforma (spec 5.3).
 * Recebe o e-mail da sessão (pode ser nulo). Devolve booleano.
 * A comparação ignora caixa porque o provedor pode variar a capitalização.
 */
export function isPlatformAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const normalizado = email.trim().toLowerCase()
  return ADMINS.some((admin) => admin === normalizado)
}
