// Visão de Produto — telemetria do painel (spec 21.3).
//
// AS CINCO REGRAS (spec 21.3.1), e por que cada uma existe:
//  1. NUNCA a partir da página pública. Há teste estrutural que falha se
//     qualquer arquivo sob app/(public)/ ou app/c/ importar este módulo.
//  2. Sempre no servidor — a chave jamais vai ao navegador.
//  3. Disparar e esquecer: roda depois da resposta, com timeout, e falha em
//     silêncio. Nenhuma ação do usuário espera por telemetria.
//  4. Sem VISAO_API_KEY é no-op silencioso, para o app funcionar igual em
//     desenvolvimento.
//  5. Só forma, nunca conteúdo: números, booleanos e valores de enum do spec.
//     Nunca foto, bio, nome, telefone, chave PIX, e-mail de link ou endereço.
//
// Este é o ÚNICO arquivo que conhece a URL e a chave do Visão de Produto.

import { generateEventId } from '@/lib/ids'

const ENDPOINT = 'https://api.visaodeproduto.com.br/functions/v1/ingest'
const TIMEOUT_MS = 2000

/** Telas instrumentadas (spec 21.3.2). Só o painel — a página pública não entra. */
export type TelaTelemetria =
  | 'Entrar' | 'EscolherEndereco' | 'MeuCartao' | 'Links'
  | 'Aparencia' | 'Compartilhar' | 'Ajustes' | 'AdminContas'

/** Eventos do catálogo (spec 21.3.3), sem o prefixo. */
export type NomeEvento =
  | 'conta_criada' | 'endereco_escolhido' | 'foto_enviada'
  | 'link_adicionado' | 'link_removido' | 'links_reordenados'
  | 'visual_escolhido' | 'limite_atingido'
  | 'cartao_publicado' | 'cartao_despublicado'
  | 'link_copiado' | 'qr_baixado' | 'endereco_nfc_copiado'
  | 'endereco_trocado' | 'indexacao_alterada' | 'conta_excluida'
  | 'plano_alterado_por_admin'

/**
 * Valores aceitos numa propriedade (regra 21.3.1, item 5).
 * O tipo já impede objeto e array; a checagem em runtime existe porque o valor
 * pode chegar de um lugar sem tipagem, e conteúdo vazado não se desfaz.
 */
export type ValorPropriedade = string | number | boolean | null

const PREFIXO = 'cartao_de_visitas_'

/**
 * Registra um evento no Visão de Produto (spec 21.3.2).
 *
 * `distinctId` é SEMPRE o e-mail do dono logado (spec 21.3.2). Nunca um id de
 * visitante, nunca um id anônimo inventado — se não há dono, não há evento.
 *
 * Não lança nunca: o chamador não precisa envolver em try/catch, e uma falha de
 * telemetria jamais pode virar erro de tela.
 */
export async function registrarEvento(
  nome: NomeEvento,
  distinctId: string,
  tela: TelaTelemetria,
  descricao: string,
  propriedades: Record<string, ValorPropriedade> = {},
): Promise<void> {
  const chave = process.env.VISAO_API_KEY
  // Regra 4: sem chave, não faz nada e não avisa. É o estado normal em dev.
  if (!chave) return

  try {
    const corpo = {
      eventos: [{
        id: generateEventId(),
        nome: `${PREFIXO}${nome}`,
        distinct_id: distinctId,
        ocorrido_em: new Date().toISOString(),
        tela,
        descricao,
        propriedades: sanitizarPropriedades(propriedades),
      }],
    }

    const controller = new AbortController()
    const relogio = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': chave },
        body: JSON.stringify(corpo),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(relogio)
    }
  } catch (erro) {
    // Regra 3: falha em silêncio. Só um aviso no log do servidor.
    console.warn('[telemetria] evento não registrado:', nome, erro)
  }
}

/**
 * Descarta qualquer propriedade que não seja número, booleano ou string curta
 * (regra 21.3.1, item 5).
 *
 * O limite de 64 caracteres é a linha de defesa contra conteúdo do cartão vazar
 * por engano: valor de enum do spec cabe folgado, bio e endereço não cabem.
 */
export function sanitizarPropriedades(
  propriedades: Record<string, ValorPropriedade>,
): Record<string, ValorPropriedade> {
  const limpas: Record<string, ValorPropriedade> = {}
  for (const [chave, valor] of Object.entries(propriedades)) {
    if (valor === null || typeof valor === 'number' || typeof valor === 'boolean') {
      limpas[chave] = valor
    } else if (typeof valor === 'string' && valor.length <= 64) {
      limpas[chave] = valor
    }
  }
  return limpas
}
