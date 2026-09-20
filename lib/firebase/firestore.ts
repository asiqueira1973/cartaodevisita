// O ÚNICO arquivo que conhece os nomes das coleções (spec 18.1 e 18.3).
//
// Esta é a fronteira de idioma: as funções daqui têm nome em português porque
// são acesso a dados, e devolvem tipos cujos campos também estão em português.
// Todo o resto do código — componentes, rotas, helpers — fica em inglês.
//
// Nada aqui roda no navegador (pegadinha 18.4.3).

import { FieldPath, FieldValue, Timestamp, type Transaction } from 'firebase-admin/firestore'
import { db } from '@/lib/firebase/admin'
import { generatePermanentId } from '@/lib/ids'
import { isHandleSelectable } from '@/lib/handle'
import { planoInicial, reconciliarPlano } from '@/lib/planos'
import { normalizeDisplayName } from '@/lib/display-name'
import type { Cartao, PlanoConta, Usuario, VisitaDiaria } from '@/types/dominio'

const USUARIOS = 'usuarios'
const HANDLES = 'handles'
const IDS_PERMANENTES = 'ids_permanentes'
const CARTOES = 'cartoes'
const VISITAS_DIARIAS = 'visitas_diarias'
const ACOES_ADMIN = 'acoes_admin'

/** Converte Timestamp do Firestore para Date, aceitando data já convertida. */
function paraData(valor: unknown): Date {
  return valor instanceof Timestamp ? valor.toDate() : (valor as Date) ?? new Date(0)
}

function montarUsuario(id: string, d: FirebaseFirestore.DocumentData): Usuario {
  return {
    id,
    email: d.email,
    nome_google: d.nome_google,
    foto_google_url: d.foto_google_url ?? null,
    handle: d.handle ?? null,
    id_permanente: d.id_permanente ?? null,
    criado_em: paraData(d.criado_em),
    ultimo_acesso_em: paraData(d.ultimo_acesso_em),
    bloqueado: d.bloqueado ?? false,
    plano: d.plano,
    plano_anterior: d.plano_anterior ?? null,
  }
}

function montarCartao(id: string, d: FirebaseFirestore.DocumentData): Cartao {
  return {
    id,
    usuario_id: d.usuario_id,
    nome_exibicao: d.nome_exibicao,
    cargo: d.cargo ?? null,
    empresa: d.empresa ?? null,
    bio: d.bio ?? null,
    foto_url: d.foto_url ?? null,
    foto_vcard_url: d.foto_vcard_url ?? null,
    links: d.links ?? [],
    template: d.template,
    cor_destaque: d.cor_destaque,
    publicado: d.publicado ?? false,
    permitir_indexacao: d.permitir_indexacao ?? false,
    mensagem_whatsapp: d.mensagem_whatsapp ?? null,
    atualizado_em: paraData(d.atualizado_em),
  }
}

/**
 * Garante que a conta existe e a devolve (spec 6.2).
 *
 * É AQUI que a conta nasce, no primeiro acesso — e não no callback do Auth.js,
 * que roda no Edge e não pode carregar o Admin SDK (spec 6.2).
 *
 * Também reconcilia o plano contra a allowlist de ilimitados a cada login
 * (regra 11.11.4) e atualiza `ultimo_acesso_em` no máximo uma vez por dia, para
 * não escrever a cada requisição (spec 7.2).
 */
export async function garantirUsuario(
  uid: string,
  email: string,
  nomeGoogle: string,
  fotoGoogleUrl: string | null,
): Promise<Usuario> {
  const refUsuario = db().collection(USUARIOS).doc(uid)
  const snap = await refUsuario.get()

  if (!snap.exists) {
    const agora = new Date()
    const plano = planoInicial(email, process.env.EARLY_ADOPTER_ABERTO)
    const novo = {
      email, nome_google: nomeGoogle, foto_google_url: fotoGoogleUrl,
      handle: null, id_permanente: null,
      criado_em: agora, ultimo_acesso_em: agora,
      bloqueado: false, plano, plano_anterior: null,
    }
    // O cartão nasce junto, já com o nome do Google preenchido (critério 8.1.3).
    const lote = db().batch()
    lote.set(refUsuario, novo)
    lote.set(db().collection(CARTOES).doc(uid), {
      // O nome do Google vem em CAIXA ALTA com frequência (regra 11.12). No
      // cartão ele é o elemento de 28 px do topo, e caixa alta parece um grito.
      usuario_id: uid, nome_exibicao: normalizeDisplayName(nomeGoogle),
      cargo: null, empresa: null, bio: null,
      foto_url: null, foto_vcard_url: null, links: [],
      template: 'minimalista', cor_destaque: 'azul',
      publicado: false, permitir_indexacao: false,
      mensagem_whatsapp: null, atualizado_em: agora,
    })
    await lote.commit()
    return montarUsuario(uid, novo)
  }

  const usuario = montarUsuario(uid, snap.data() as FirebaseFirestore.DocumentData)
  const mudancas: Record<string, unknown> = {}

  const reconciliado = reconciliarPlano(usuario.email, usuario.plano, usuario.plano_anterior)
  if (reconciliado) Object.assign(mudancas, reconciliado)

  const umDia = 24 * 60 * 60 * 1000
  if (Date.now() - usuario.ultimo_acesso_em.getTime() > umDia) {
    mudancas.ultimo_acesso_em = new Date()
  }

  if (Object.keys(mudancas).length) {
    await refUsuario.update(mudancas)
    return { ...usuario, ...(reconciliado ?? {}) }
  }
  return usuario
}

/**
 * Reserva o endereço público e o id permanente, numa transação (spec 7.11).
 *
 * O `create` falha se o documento já existir, e é ISSO que faz um de dois
 * cadastros simultâneos perder (critério 8.1.9). Sem esta função, os dois
 * venceriam.
 *
 * Devolve o handle e o id gravados, ou `null` quando o handle não está livre.
 */
export async function reservarHandle(
  usuarioId: string,
  handle: string,
): Promise<{ handle: string; id_permanente: string } | null> {
  const normalizado = handle.trim().toLowerCase()
  if (!isHandleSelectable(normalizado)) return null

  try {
    return await db().runTransaction(async (tx: Transaction) => {
      const refHandle = db().collection(HANDLES).doc(normalizado)
      const agora = new Date()

      // Sorteia um id permanente livre dentro da mesma transação, para não
      // sobrar id reservado se a gravação do handle falhar.
      let idPermanente = ''
      for (let tentativa = 1; tentativa <= 5; tentativa++) {
        const candidato = generatePermanentId()
        const refId = db().collection(IDS_PERMANENTES).doc(candidato)
        const existente = await tx.get(refId)
        if (existente.exists) continue
        idPermanente = candidato
        tx.create(refId, { usuario_id: usuarioId, criado_em: agora })
        break
      }
      if (!idPermanente) throw new Error('Não consegui gerar um id permanente livre')

      tx.create(refHandle, { usuario_id: usuarioId, criado_em: agora })
      tx.update(db().collection(USUARIOS).doc(usuarioId), {
        handle: normalizado, id_permanente: idPermanente,
      })

      return { handle: normalizado, id_permanente: idPermanente }
    })
  } catch {
    // `create` num documento existente derruba a transação: o handle está tomado.
    return null
  }
}

/**
 * Troca o endereço público (spec 7.11, critério 8.8.1).
 * Reserva o novo, aponta o usuário e libera o antigo, em transação.
 *
 * NÃO TOCA no `id_permanente` — é o princípio 0.4, e é o que mantém funcionando
 * todo QR já impresso e toda etiqueta já gravada.
 */
export async function trocarHandle(usuarioId: string, novo: string): Promise<string | null> {
  const normalizado = novo.trim().toLowerCase()
  if (!isHandleSelectable(normalizado)) return null

  try {
    return await db().runTransaction(async (tx: Transaction) => {
      const refUsuario = db().collection(USUARIOS).doc(usuarioId)
      const snap = await tx.get(refUsuario)
      if (!snap.exists) throw new Error('conta inexistente')
      const anterior: string | null = snap.data()?.handle ?? null
      if (anterior === normalizado) return normalizado

      tx.create(db().collection(HANDLES).doc(normalizado), {
        usuario_id: usuarioId, criado_em: new Date(),
      })
      tx.update(refUsuario, { handle: normalizado })
      // Libera o antigo de volta para o pool (spec 7.3).
      if (anterior) tx.delete(db().collection(HANDLES).doc(anterior))
      return normalizado
    })
  } catch {
    return null
  }
}

/**
 * Busca o cartão pelo endereço público (spec 7.11).
 * Duas leituras por chave: `handles/<handle>` e depois `cartoes/<usuario_id>`.
 *
 * Devolve `null` quando o handle não existe, quando a conta está bloqueada ou
 * quando o cartão está despublicado — os três casos respondem 404 idêntico
 * (pegadinha 18.4.2). Quem precisa distinguir é a pré-visualização do dono, que
 * usa `buscarCartaoDoDono`.
 */
export async function buscarCartaoPorHandle(
  handle: string,
): Promise<{ cartao: Cartao; usuario: Usuario } | null> {
  const snapHandle = await db().collection(HANDLES).doc(handle.trim().toLowerCase()).get()
  if (!snapHandle.exists) return null

  const usuarioId: string = snapHandle.data()?.usuario_id
  const [snapUsuario, snapCartao] = await Promise.all([
    db().collection(USUARIOS).doc(usuarioId).get(),
    db().collection(CARTOES).doc(usuarioId).get(),
  ])
  if (!snapUsuario.exists || !snapCartao.exists) return null

  const usuario = montarUsuario(usuarioId, snapUsuario.data() as FirebaseFirestore.DocumentData)
  if (usuario.bloqueado) return null

  const cartao = montarCartao(usuarioId, snapCartao.data() as FirebaseFirestore.DocumentData)
  if (!cartao.publicado) return null

  return { cartao, usuario }
}

/**
 * Grava campos do cartão (épico 8.2).
 * Recebe só os campos que mudaram; `atualizado_em` é sempre acrescentado.
 *
 * Não valida nada: a validação é da rota, que conhece as regras da seção 11 e
 * devolve a mensagem certa. Esta função só escreve.
 */
export async function atualizarCartao(
  usuarioId: string,
  campos: Record<string, unknown>,
): Promise<Cartao | null> {
  await db().collection(CARTOES).doc(usuarioId).update({ ...campos, atualizado_em: new Date() })
  return buscarCartaoDoDono(usuarioId)
}

/** Busca o cartão do próprio dono, publicado ou não (critério 8.4.6). */
export async function buscarCartaoDoDono(usuarioId: string): Promise<Cartao | null> {
  const snap = await db().collection(CARTOES).doc(usuarioId).get()
  return snap.exists ? montarCartao(usuarioId, snap.data() as FirebaseFirestore.DocumentData) : null
}

/**
 * Resolve o id permanente para o handle atual, para o 308 de `/c/<id>` (spec 4.3).
 *
 * Devolve `null` — e o chamador responde 404 — nas MESMAS condições da página
 * pública: id inexistente, conta bloqueada ou **cartão despublicado** (spec 13.2).
 *
 * A checagem de `publicado` é a que importa aqui e é fácil de esquecer: sem ela
 * o 308 acontece, o navegador vai para `/<handle>`, e lá toma 404 — mas o
 * redirecionamento já revelou que aquele id existe e para qual endereço aponta.
 * Um 308 e um 404 são distinguíveis; era a pegadinha 18.4.2 sendo furada pela
 * porta dos fundos. Encontrado rodando o épico 8.1 em 20/09/2026.
 */
export async function resolverIdPermanente(idPermanente: string): Promise<string | null> {
  const snap = await db().collection(IDS_PERMANENTES).doc(idPermanente).get()
  if (!snap.exists) return null

  const usuarioId: string = snap.data()?.usuario_id
  const [snapUsuario, snapCartao] = await Promise.all([
    db().collection(USUARIOS).doc(usuarioId).get(),
    db().collection(CARTOES).doc(usuarioId).get(),
  ])
  if (!snapUsuario.exists || !snapCartao.exists) return null

  const usuario = montarUsuario(usuarioId, snapUsuario.data() as FirebaseFirestore.DocumentData)
  if (usuario.bloqueado) return null

  if (!snapCartao.data()?.publicado) return null

  return usuario.handle
}

/** Origens de visita contadas em `visitas_diarias` (spec 7.6 e regra 11.8). */
export type OrigemVisita = 'por_link' | 'por_codigo' | 'salvou_contato' | 'abriu_whatsapp'

/**
 * Conta uma visita, por incremento atômico (spec 7.11, regra 11.8).
 *
 * O id do documento é montado no fuso de São Paulo, não em UTC: uma visita às
 * 23h de terça em Brasília tem de contar na terça (regra 11.9).
 *
 * NENHUM dado de visitante entra aqui — sem IP, sem user-agent, sem cidade.
 * É a pegadinha 18.4.5, e há teste estrutural guardando a forma do documento.
 */
export async function registrarVisita(usuarioId: string, origem: OrigemVisita): Promise<void> {
  const data = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())

  // TODOS os contadores são tocados, mesmo os que não mudaram: `increment(0)`
  // cria o campo com zero na primeira escrita. Sem isso, um documento só com
  // `por_link` deixaria `salvou_contato` indefinido, e a soma do painel viraria
  // NaN no dia em que alguém olhasse (critério 8.7.7).
  const zerados: Record<OrigemVisita, FirebaseFirestore.FieldValue> = {
    por_link: FieldValue.increment(0),
    por_codigo: FieldValue.increment(0),
    salvou_contato: FieldValue.increment(0),
    abriu_whatsapp: FieldValue.increment(0),
  }

  await db().collection(VISITAS_DIARIAS).doc(`${usuarioId}_${data}`).set(
    {
      usuario_id: usuarioId,
      data,
      ...zerados,
      // `total` conta só quem chegou na página; salvar contato e abrir o
      // WhatsApp são ações DENTRO da visita, não visitas novas (regra 11.8).
      total: FieldValue.increment(origem === 'por_link' || origem === 'por_codigo' ? 1 : 0),
      [origem]: FieldValue.increment(1),
    },
    { merge: true },
  )
}

/**
 * Lê as visitas dos últimos N dias (critério 8.7.7).
 *
 * A consulta é por FAIXA DE ID DE DOCUMENTO, não por dois campos. Filtrar
 * `usuario_id == x` e `data >= y` ao mesmo tempo exigiria um índice composto —
 * que precisa ser criado, versionado e implantado, e cuja falta só aparece em
 * runtime, com a tela quebrada na cara de quem abriu (aconteceu em 20/09/2026).
 *
 * Como o id é `<usuario_id>_<AAAA-MM-DD>` (spec 7.6), a faixa
 * `<uid>_<limite>` até `<uid>_\uf8ff` devolve exatamente a janela daquela
 * conta, usando só o índice automático de `__name__`. Zero índice a manter, e
 * lê apenas os dias que existem.
 *
 * Este é o motivo de o id do documento ter sido desenhado assim.
 */
export async function visitasRecentes(usuarioId: string, dias = 30): Promise<VisitaDiaria[]> {
  const corte = new Date(Date.now() - dias * 24 * 60 * 60 * 1000)
  const limite = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(corte)

  const snap = await db().collection(VISITAS_DIARIAS)
    .orderBy(FieldPath.documentId())
    .startAt(`${usuarioId}_${limite}`)
    // \uf8ff é o maior caractere da área de uso privado do Unicode: ele fecha a
    // faixa neste usuário sem alcançar o id de outro.
    .endAt(`${usuarioId}_\uf8ff`)
    .get()

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as VisitaDiaria)
}

/** Registra uma ação de moderação (spec 7.8, regra 5.2). Nunca é apagada. */
export async function registrarAcaoAdmin(
  adminEmail: string,
  acao: string,
  usuarioIdAlvo: string,
  detalhe: string | null,
): Promise<void> {
  await db().collection(ACOES_ADMIN).add({
    admin_email: adminEmail, acao, usuario_id_alvo: usuarioIdAlvo,
    detalhe, criado_em: new Date(),
  })
}

/** Altera o plano de uma conta, por ação de admin (regra 11.11.5). */
export async function alterarPlano(usuarioId: string, plano: PlanoConta): Promise<void> {
  // Nunca apaga link, template nem cor: o que excede o novo teto continua no ar
  // e a pessoa só não consegue adicionar mais (regra 11.11.6).
  await db().collection(USUARIOS).doc(usuarioId).update({ plano })
}

/**
 * Apaga a conta e tudo que é dela (spec 7.11 e 20.4).
 * Usuário, cartão, handle, id permanente e visitas — na hora, sem fila e sem
 * soft delete. NÃO apaga `acoes_admin`, que é log de auditoria (spec 7.8).
 *
 * Os arquivos do Storage são apagados pelo chamador, que conhece os caminhos.
 */
export async function excluirConta(usuarioId: string): Promise<void> {
  const snap = await db().collection(USUARIOS).doc(usuarioId).get()
  if (!snap.exists) return
  const { handle, id_permanente } = snap.data() as { handle?: string; id_permanente?: string }

  const lote = db().batch()
  lote.delete(db().collection(USUARIOS).doc(usuarioId))
  lote.delete(db().collection(CARTOES).doc(usuarioId))
  if (handle) lote.delete(db().collection(HANDLES).doc(handle))
  if (id_permanente) lote.delete(db().collection(IDS_PERMANENTES).doc(id_permanente))
  await lote.commit()

  const visitas = await db().collection(VISITAS_DIARIAS).where('usuario_id', '==', usuarioId).get()
  const loteVisitas = db().batch()
  visitas.docs.forEach((d) => loteVisitas.delete(d.ref))
  await loteVisitas.commit()
}

/** Uma linha da listagem do admin (spec 10.3). */
export interface ContaNaListagem {
  usuario: Usuario
  links: number
  publicado: boolean
  visitasNoMes: number
}

/**
 * Lista as contas para o painel da plataforma (critério 8.9.2).
 *
 * Ordena por criação decrescente — o admin quase sempre quer ver quem chegou
 * agora, não quem chegou primeiro.
 *
 * As visitas são somadas por conta, uma consulta por linha. É caro em teoria e
 * irrelevante na prática: esta tela é usada por uma pessoa, algumas vezes por
 * semana, com 50 linhas por página.
 */
export async function listarContas(limite = 50): Promise<ContaNaListagem[]> {
  const snap = await db().collection(USUARIOS).orderBy('criado_em', 'desc').limit(limite).get()

  return Promise.all(
    snap.docs.map(async (doc) => {
      const usuario = montarUsuario(doc.id, doc.data())
      const [snapCartao, visitas] = await Promise.all([
        db().collection(CARTOES).doc(doc.id).get(),
        visitasRecentes(doc.id, 30),
      ])
      const cartao = snapCartao.exists ? montarCartao(doc.id, snapCartao.data()!) : null
      return {
        usuario,
        links: cartao?.links.length ?? 0,
        publicado: cartao?.publicado ?? false,
        visitasNoMes: visitas.reduce((s, v) => s + (v.total ?? 0), 0),
      }
    }),
  )
}

/** Uma conta com tudo que a tela de detalhe do admin precisa (spec 10.3). */
export async function buscarContaParaAdmin(usuarioId: string): Promise<{
  usuario: Usuario
  cartao: Cartao | null
  acoes: { id: string; admin_email: string; acao: string; detalhe: string | null; criado_em: Date }[]
} | null> {
  const snap = await db().collection(USUARIOS).doc(usuarioId).get()
  if (!snap.exists) return null

  const [snapCartao, snapAcoes] = await Promise.all([
    db().collection(CARTOES).doc(usuarioId).get(),
    db().collection(ACOES_ADMIN).where('usuario_id_alvo', '==', usuarioId).get(),
  ])

  return {
    usuario: montarUsuario(usuarioId, snap.data()!),
    cartao: snapCartao.exists ? montarCartao(usuarioId, snapCartao.data()!) : null,
    // Ordenado em memória: ordenar no Firestore com o filtro por usuario_id
    // exigiria índice composto, e a pegadinha já nos custou uma tela quebrada.
    acoes: snapAcoes.docs
      .map((d) => ({
        id: d.id,
        admin_email: d.data().admin_email,
        acao: d.data().acao,
        detalhe: d.data().detalhe ?? null,
        criado_em: paraData(d.data().criado_em),
      }))
      .sort((a, b) => b.criado_em.getTime() - a.criado_em.getTime()),
  }
}

/** Bloqueia ou desbloqueia uma conta (critério 8.9.5). */
export async function definirBloqueio(usuarioId: string, bloqueado: boolean): Promise<void> {
  await db().collection(USUARIOS).doc(usuarioId).update({ bloqueado })
}

/** Despublica o cartão de uma conta, por ação de admin (critério 8.9.3). */
export async function despublicarPorAdmin(usuarioId: string): Promise<void> {
  // Só despublica — o admin nunca publica cartão alheio (regra 5.2).
  await db().collection(CARTOES).doc(usuarioId).update({ publicado: false, atualizado_em: new Date() })
}

/** Diz se um handle já está tomado, para a verificação enquanto a pessoa digita. */
export async function handleEstaTomado(handle: string): Promise<boolean> {
  const snap = await db().collection(HANDLES).doc(handle.trim().toLowerCase()).get()
  return snap.exists
}
