// Tipos que espelham a camada de dados (spec 7). Por isso os nomes de campo e os
// valores de enum estão em português: a fronteira de idioma é o acesso a dados
// (spec 18.1). O código que consome estes tipos permanece em inglês.

/** Tipos de link aceitos num cartão (spec 7.7). */
export type TipoLink =
  | 'whatsapp' | 'telefone' | 'email' | 'instagram' | 'linkedin' | 'site'
  | 'youtube' | 'tiktok' | 'facebook' | 'x' | 'github' | 'behance'
  | 'spotify' | 'pix' | 'endereco' | 'outro'

/** Os quatro arranjos visuais do cartão (spec 7.7 e 16.3). */
export type TemplateCartao = 'minimalista' | 'cartao' | 'foto' | 'executivo'

/** Cores de destaque do cartão (spec 7.7 e 16.2). */
export type CorDestaque =
  | 'azul' | 'verde' | 'roxo' | 'vermelho'
  | 'laranja' | 'rosa' | 'grafite' | 'dourado'

/**
 * Planos de conta (spec 7.7 e 11.11.1).
 * `pago` existe no tipo para não exigir migração quando a cobrança chegar
 * (spec 28.2) — nenhuma rota o atribui na v1.
 */
export type PlanoConta = 'gratuito' | 'early_adopter' | 'ilimitado' | 'pago'

/** Ações de moderação registradas em `acoes_admin` (spec 7.7 e 7.8). */
export type AcaoAdmin =
  | 'despublicou_cartao' | 'alterou_handle' | 'alterou_plano'
  | 'bloqueou_conta' | 'desbloqueou_conta'

/** Um item do array `cartoes.links` (spec 7.5.1). */
export interface LinkCartao {
  id: string
  tipo: TipoLink
  /** Dado cru já normalizado pela regra 11.5 — E.164, usuário sem @, URL completa. */
  valor: string
  /** Nulo usa o rótulo padrão do tipo (spec 15.3). */
  rotulo: string | null
  ordem: number
}

/** Documento da coleção `cartoes` (spec 7.5). */
export interface Cartao {
  id: string
  usuario_id: string
  nome_exibicao: string
  cargo: string | null
  empresa: string | null
  bio: string | null
  foto_url: string | null
  foto_vcard_url: string | null
  links: LinkCartao[]
  template: TemplateCartao
  cor_destaque: CorDestaque
  publicado: boolean
  permitir_indexacao: boolean
  mensagem_whatsapp: string | null
  atualizado_em: Date
}

/** Documento da coleção `usuarios` (spec 7.2). */
export interface Usuario {
  id: string
  email: string
  nome_google: string
  foto_google_url: string | null
  handle: string | null
  id_permanente: string | null
  criado_em: Date
  ultimo_acesso_em: Date
  bloqueado: boolean
  plano: PlanoConta
  plano_anterior: PlanoConta | null
}

/** Documento da coleção `visitas_diarias` (spec 7.6). */
export interface VisitaDiaria {
  id: string
  usuario_id: string
  data: string
  total: number
  por_link: number
  por_codigo: number
  salvou_contato: number
  abriu_whatsapp: number
}
