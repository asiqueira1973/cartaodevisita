// Endereço público: formato, normalização e sugestão (spec 11.1 e 11.2).
//
// Tudo aqui roda nos dois lados: no cliente para dar retorno enquanto a pessoa
// digita, e no servidor como autoridade. O servidor NUNCA confia na validação
// do cliente — ele revalida (spec 7.9).

/** Formato aceito: 3 a 30 caracteres, sem hífen nas pontas (regra 11.1). */
const FORMATO_HANDLE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/

/**
 * Handles que ninguém pode escolher (regra 11.2).
 * `c` é o mais importante da lista: é o prefixo da rota permanente (spec 4.3).
 */
export const HANDLES_RESERVADOS: readonly string[] = [
  'admin', 'api', 'app', 'ajuda', 'blog', 'c', 'cartao', 'cartoes', 'conta',
  'contato', 'dashboard', 'docs', 'entrar', 'equipe', 'favicon', 'home',
  'login', 'logout', 'null', 'painel', 'precos', 'privacidade', 'public',
  'qr', 'root', 'sair', 'sobre', 'static', 'suporte', 'termos', 'undefined',
  'www', '_next',
]

/** Diz se o handle tem formato válido (regra 11.1). */
export function isHandleFormatValid(handle: string): boolean {
  return FORMATO_HANDLE.test(handle)
}

/** Diz se o handle está na lista de reservados (regra 11.2). */
export function isHandleReserved(handle: string): boolean {
  return HANDLES_RESERVADOS.includes(handle.trim().toLowerCase())
}

/**
 * Diz se um handle pode ser reservado, do ponto de vista de formato e lista.
 * Não consulta o banco — a unicidade é garantida pelo id do documento em
 * `handles` (spec 7.3), não por esta função.
 *
 * Reservado e ocupado devolvem a MESMA resposta para quem chama, porque a
 * interface mostra a mesma mensagem nos dois casos — revelar a existência da
 * lista seria vazar informação (critério de aceite 8.1.7).
 */
export function isHandleSelectable(handle: string): boolean {
  return isHandleFormatValid(handle) && !isHandleReserved(handle)
}

/**
 * Transforma um texto livre num handle candidato (regra 11.1).
 * Recebe o nome vindo do Google. Devolve minúsculas, sem acento, espaço vira
 * hífen, o resto é removido, cortado em 30 e sem hífen nas pontas.
 */
export function normalizeToHandle(texto: string): string {
  const semAcento = texto
    .normalize('NFD')
    // Remove os diacríticos que o NFD separou das letras.
    .replace(/[̀-ͯ]/g, '')

  return semAcento
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    // Colapsa hífens repetidos, que aparecem quando o nome tem pontuação.
    .replace(/-{2,}/g, '-')
    .slice(0, 30)
    .replace(/^-+|-+$/g, '')
}

/**
 * Sugere um handle livre a partir do nome do Google (regra 11.1, critério 8.1.5).
 * Recebe o nome e uma função que diz se um candidato já está tomado.
 * Devolve o primeiro livre, tentando sufixos de -2 a -9; esgotado isso, devolve
 * string vazia e a tela deixa o campo em branco para a pessoa escrever.
 */
export async function suggestHandle(
  nome: string,
  isTaken: (candidato: string) => Promise<boolean>,
): Promise<string> {
  const base = normalizeToHandle(nome)
  // Nome que normaliza para menos de 3 caracteres não vira sugestão.
  if (base.length < 3) return ''

  if (isHandleSelectable(base) && !(await isTaken(base))) return base

  for (let sufixo = 2; sufixo <= 9; sufixo++) {
    // O sufixo pode estourar os 30 caracteres, então o corte vem antes dele.
    const candidato = `${base.slice(0, 30 - 2)}-${sufixo}`
    if (isHandleSelectable(candidato) && !(await isTaken(candidato))) return candidato
  }

  return ''
}
