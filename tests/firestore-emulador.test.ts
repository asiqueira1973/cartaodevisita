// Testes de INTEGRAÇÃO contra o emulador do Firestore (spec 22.1).
//
// Exigem o emulador no ar — `npm run emu` num terminal à parte. Rode com
// `npm run test:emu`, que já aponta as variáveis de ambiente.
//
// Aqui vivem os invariantes que só se provam com banco de verdade: a corrida de
// dois cadastros simultâneos, e as condições em que um endereço responde 404.

import { afterAll, beforeEach, describe, expect, it } from 'vitest'

process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080'
process.env.FIREBASE_PROJECT_ID ??= 'cartao-de-visita-local'
process.env.EARLY_ADOPTER_ABERTO = 'true'

const { db } = await import('@/lib/firebase/admin')
const {
  alterarPlano, atualizarCartao, buscarCartaoDoDono, buscarCartaoPorHandle,
  excluirConta, garantirUsuario, registrarAcaoAdmin, registrarVisita,
  reservarHandle, resolverIdPermanente, trocarHandle, visitasRecentes,
} = await import('@/lib/firebase/firestore')
const { limitesDoPlano } = await import('@/lib/planos')
const { validarListaDeLinks } = await import('@/lib/links')

/** Apaga tudo entre os testes, para um não enxergar o estado do outro. */
async function limpar() {
  for (const col of ['usuarios', 'cartoes', 'handles', 'ids_permanentes', 'visitas_diarias', 'acoes_admin']) {
    const snap = await db().collection(col).get()
    await Promise.all(snap.docs.map((d) => d.ref.delete()))
  }
}

async function contaNova(uid: string, email = `${uid}@exemplo.com`) {
  return garantirUsuario(uid, email, 'Pessoa de Teste', null)
}

beforeEach(limpar)
afterAll(limpar)

describe('nascimento da conta (spec 6.2)', () => {
  it('cria usuário e cartão juntos, sem handle', async () => {
    const usuario = await contaNova('u1')
    expect(usuario.handle).toBeNull()
    expect(usuario.id_permanente).toBeNull()
    expect(usuario.plano).toBe('early_adopter')

    const cartao = await db().collection('cartoes').doc('u1').get()
    expect(cartao.exists).toBe(true)
    expect(cartao.data()?.nome_exibicao).toBe('Pessoa de Teste')
    expect(cartao.data()?.publicado).toBe(false)
  })

  it('a allowlist de ilimitados vence a variável de ambiente (regra 11.11.4)', async () => {
    const usuario = await garantirUsuario('u2', 'alexandre@dablab.com.br', 'Alexandre', null)
    expect(usuario.plano).toBe('ilimitado')
  })
})

describe('critério 8.1.9 — dois cadastros simultâneos, um perde', () => {
  it('só uma das duas contas fica com o endereço', async () => {
    await contaNova('a')
    await contaNova('b')

    // O ponto do teste é a simultaneidade: sem a transação de `reservarHandle`,
    // as duas gravações venceriam e duas contas ficariam com o mesmo endereço.
    const [r1, r2] = await Promise.all([
      reservarHandle('a', 'disputado'),
      reservarHandle('b', 'disputado'),
    ])

    const vencedores = [r1, r2].filter(Boolean)
    expect(vencedores).toHaveLength(1)

    const snap = await db().collection('handles').doc('disputado').get()
    expect(snap.exists).toBe(true)
    expect(['a', 'b']).toContain(snap.data()?.usuario_id)
  })

  it('cada conta ganha um id permanente distinto', async () => {
    await contaNova('a')
    await contaNova('b')
    const [r1, r2] = await Promise.all([
      reservarHandle('a', 'primeiro'),
      reservarHandle('b', 'segundo'),
    ])
    expect(r1).not.toBeNull()
    expect(r2).not.toBeNull()
    expect(r1!.id_permanente).not.toBe(r2!.id_permanente)
  })
})

describe('regra 11.1 — formato do endereço é autoridade do servidor', () => {
  it('recusa endereço com menos de 3 caracteres, mesmo vindo de dentro', async () => {
    await contaNova('u1')
    // Esta asserção existe porque eu mesmo escrevi um teste usando 'um' como
    // endereço e passei um tempo achando que a transação estava quebrada.
    expect(await reservarHandle('u1', 'um')).toBeNull()
    expect(await reservarHandle('u1', 'admin')).toBeNull() // reservado (regra 11.2)
  })
})

describe('pegadinha 18.4.2 — o redirecionador não pode vazar existência', () => {
  it('REGRESSÃO: cartão despublicado faz /c/<id> devolver 404, não 308', async () => {
    // Encontrado rodando o épico 8.1 em 20/09/2026: `resolverIdPermanente` só
    // olhava conta bloqueada, então o 308 acontecia e revelava que o id existia
    // e para qual endereço apontava, com o cartão fora do ar.
    await contaNova('u1')
    const { id_permanente } = (await reservarHandle('u1', 'privado'))!

    expect(await resolverIdPermanente(id_permanente)).toBeNull()
    expect(await buscarCartaoPorHandle('privado')).toBeNull()

    await db().collection('cartoes').doc('u1').update({ publicado: true })
    expect(await resolverIdPermanente(id_permanente)).toBe('privado')
  })

  it('conta bloqueada some pelos dois caminhos', async () => {
    await contaNova('u1')
    const { id_permanente } = (await reservarHandle('u1', 'bloqueado'))!
    await db().collection('cartoes').doc('u1').update({ publicado: true })
    await db().collection('usuarios').doc('u1').update({ bloqueado: true })

    expect(await resolverIdPermanente(id_permanente)).toBeNull()
    expect(await buscarCartaoPorHandle('bloqueado')).toBeNull()
  })
})

describe('pegadinha 18.4.4 — trocar o endereço não mata o cartão físico', () => {
  it('o mesmo id permanente passa a levar ao novo endereço', async () => {
    await contaNova('u1')
    const { id_permanente } = (await reservarHandle('u1', 'antigo'))!
    await db().collection('cartoes').doc('u1').update({ publicado: true })

    expect(await resolverIdPermanente(id_permanente)).toBe('antigo')

    await trocarHandle('u1', 'novo')

    // Este é o princípio 0.4 em forma executável: o QR impresso e a etiqueta
    // gravada continuam funcionando.
    expect(await resolverIdPermanente(id_permanente)).toBe('novo')

    // E o endereço antigo volta para o pool.
    expect((await db().collection('handles').doc('antigo').get()).exists).toBe(false)
    expect(await buscarCartaoPorHandle('antigo')).toBeNull()
  })

  it('o id permanente NÃO muda na troca de endereço', async () => {
    await contaNova('u1')
    const reserva = await reservarHandle('u1', 'primeiro')
    expect(reserva).not.toBeNull()
    const antes = reserva!.id_permanente
    await trocarHandle('u1', 'segundo')
    const depois = (await db().collection('usuarios').doc('u1').get()).data()?.id_permanente
    expect(depois).toBe(antes)
  })
})

describe('visitas por faixa de id (critério 8.7.7)', () => {
  it('lê só a janela pedida e só da conta certa', async () => {
    await contaNova('u1')
    await contaNova('u2')

    await registrarVisita('u1', 'por_link')
    await registrarVisita('u1', 'por_codigo')
    await registrarVisita('u2', 'por_link')

    const deU1 = await visitasRecentes('u1', 30)
    expect(deU1).toHaveLength(1)
    expect(deU1[0].usuario_id).toBe('u1')
    expect(deU1[0].total).toBe(2)
    expect(deU1[0].por_codigo).toBe(1)

    // A faixa não pode alcançar o documento da outra conta.
    expect(deU1.some((v) => v.usuario_id === 'u2')).toBe(false)
  })

  it('todos os contadores nascem em zero, nunca indefinidos', async () => {
    // Um documento criado só com por_link deixava salvou_contato indefinido, e
    // a soma do painel virava NaN.
    await contaNova('u1')
    await registrarVisita('u1', 'por_link')
    const [dia] = await visitasRecentes('u1', 30)
    for (const campo of ['total', 'por_link', 'por_codigo', 'salvou_contato', 'abriu_whatsapp'] as const) {
      expect(typeof dia[campo], `${campo} deveria ser número`).toBe('number')
    }
  })

  it('conta sem visita devolve lista vazia, não erro', async () => {
    await contaNova('u1')
    expect(await visitasRecentes('u1', 30)).toEqual([])
  })
})

describe('exclusão da conta (critérios 8.8.5 e 8.8.6, spec 20.4)', () => {
  it('apaga tudo do titular e LIBERA o endereço', async () => {
    await contaNova('u1')
    const { id_permanente } = (await reservarHandle('u1', 'vaisair'))!
    await registrarVisita('u1', 'por_link')

    await excluirConta('u1')

    expect((await db().collection('usuarios').doc('u1').get()).exists).toBe(false)
    expect((await db().collection('cartoes').doc('u1').get()).exists).toBe(false)
    expect((await db().collection('handles').doc('vaisair').get()).exists).toBe(false)
    expect((await db().collection('ids_permanentes').doc(id_permanente).get()).exists).toBe(false)
    expect(await visitasRecentes('u1', 30)).toEqual([])

    // O endereço volta para o pool: outra pessoa pode pegá-lo (critério 8.8.6).
    await contaNova('u2')
    expect(await reservarHandle('u2', 'vaisair')).not.toBeNull()
  })

  it('NÃO apaga o log de auditoria — ele é de atos da plataforma, não do titular', async () => {
    await contaNova('u1')
    await reservarHandle('u1', 'moderado')
    await registrarAcaoAdmin('admin@exemplo.com', 'despublicou_cartao', 'u1', 'denúncia')

    await excluirConta('u1')

    const log = await db().collection('acoes_admin').get()
    expect(log.size).toBe(1)
    // O alvo passa a apontar para uma conta inexistente, e isso é o
    // comportamento correto de um log (spec 7.8).
    expect(log.docs[0].data().usuario_id_alvo).toBe('u1')
  })

  it('o cartão some da busca pública depois da exclusão', async () => {
    await contaNova('u1')
    await reservarHandle('u1', 'sumiu')
    await db().collection('cartoes').doc('u1').update({ publicado: true })
    expect(await buscarCartaoPorHandle('sumiu')).not.toBeNull()

    await excluirConta('u1')
    expect(await buscarCartaoPorHandle('sumiu')).toBeNull()
  })
})

describe('spec 6.1 — o e-mail guardado acompanha o provedor', () => {
  it('REGRESSÃO: e-mail, nome e foto são atualizados quando mudam no Google', async () => {
    // O identificador é o uid, não o e-mail — e por isso o e-mail pode mudar
    // por baixo. O registro precisa acompanhar: ele é o que o admin vê, o que
    // vira distinct_id na telemetria, e o que as DUAS allowlists conferem.
    // Encontrado em 20/09/2026 por um teste de promoção de plano que falhou.
    await contaNova('u1', 'antigo@exemplo.com')

    const depois = await garantirUsuario('u1', 'novo@exemplo.com', 'Nome Novo', 'https://foto/nova.jpg')
    expect(depois.email).toBe('novo@exemplo.com')
    expect(depois.nome_google).toBe('Nome Novo')

    const gravado = (await db().collection('usuarios').doc('u1').get()).data()
    expect(gravado?.email).toBe('novo@exemplo.com')
    expect(gravado?.foto_google_url).toBe('https://foto/nova.jpg')
  })

  it('mudar de e-mail NÃO toca no cartão nem no endereço', async () => {
    await contaNova('u1', 'antigo@exemplo.com')
    const { id_permanente } = (await reservarHandle('u1', 'estavel'))!

    await garantirUsuario('u1', 'novo@exemplo.com', 'Nome Novo', null)

    const usuario = (await db().collection('usuarios').doc('u1').get()).data()
    expect(usuario?.handle).toBe('estavel')
    expect(usuario?.id_permanente).toBe(id_permanente)
  })
})

describe('regra 11.11.6 — rebaixar plano NÃO apaga nada', () => {
  /** Monta uma lista de N links de tipos que podem repetir. */
  const muitosLinks = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      id: `l${i}`, tipo: 'site' as const, valor: `https://exemplo${i}.com.br/`,
      rotulo: null, ordem: i,
    }))

  it('conta com 12 links rebaixada para gratuito mantém os 12', async () => {
    await contaNova('u1', 'alguem@exemplo.com')
    await reservarHandle('u1', 'rebaixado')
    await atualizarCartao('u1', { links: muitosLinks(12) })
    await db().collection('cartoes').doc('u1').update({ publicado: true })

    // Nasce early_adopter (EARLY_ADOPTER_ABERTO=true no topo do arquivo).
    expect((await db().collection('usuarios').doc('u1').get()).data()?.plano).toBe('early_adopter')

    await alterarPlano('u1', 'gratuito')

    const cartao = await buscarCartaoDoDono('u1')
    expect(cartao!.links).toHaveLength(12)

    // E o cartão continua no ar exatamente como estava.
    const publico = await buscarCartaoPorHandle('rebaixado')
    expect(publico!.cartao.links).toHaveLength(12)
  })

  it('mas a pessoa não consegue ADICIONAR mais um', async () => {
    // O que muda no rebaixamento é o que se pode fazer daqui para a frente.
    const teto = limitesDoPlano('gratuito').links
    expect(validarListaDeLinks(muitosLinks(12), teto)).toBe('acima_do_plano')
    expect(validarListaDeLinks(muitosLinks(13), teto)).toBe('acima_do_plano')
  })

  it('remover links até caber volta a permitir salvar', async () => {
    const teto = limitesDoPlano('gratuito').links
    expect(validarListaDeLinks(muitosLinks(5), teto)).toBeNull()
  })
})

describe('regra 11.11 — planos ponta a ponta', () => {
  it('a marca no rodapé segue o plano, e só ela', async () => {
    // Depois do corte da Aparência (roadmap 28.10), o plano gratuito se
    // distingue por DUAS coisas: teto de links e marca. Este teste guarda a
    // segunda; validarListaDeLinks guarda a primeira.
    expect(limitesDoPlano('gratuito').marcaNoRodape).toBe(true)
    for (const plano of ['early_adopter', 'ilimitado', 'pago'] as const) {
      expect(limitesDoPlano(plano).marcaNoRodape).toBe(false)
    }
  })

  it('a allowlist promove no login seguinte, sem tocar no cartão', async () => {
    // Primeiro acesso com e-mail fora da lista.
    await contaNova('u1', 'vira-ilimitado@exemplo.com')
    await reservarHandle('u1', 'promovido')
    await atualizarCartao('u1', { links: muitosLinksDeSite(3) })

    // Agora o mesmo uid entra com um e-mail que ESTÁ na allowlist.
    const promovido = await garantirUsuario('u1', 'alexandre@dablab.com.br', 'Alexandre', null)
    expect(promovido.plano).toBe('ilimitado')
    expect(promovido.plano_anterior).toBe('early_adopter')

    // O conteúdo do cartão não foi tocado.
    expect((await buscarCartaoDoDono('u1'))!.links).toHaveLength(3)
  })
})

function muitosLinksDeSite(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `s${i}`, tipo: 'site' as const, valor: `https://exemplo${i}.com.br/`,
    rotulo: null, ordem: i,
  }))
}
