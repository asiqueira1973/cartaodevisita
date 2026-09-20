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
  buscarCartaoPorHandle, garantirUsuario, reservarHandle,
  resolverIdPermanente, trocarHandle,
} = await import('@/lib/firebase/firestore')

/** Apaga tudo entre os testes, para um não enxergar o estado do outro. */
async function limpar() {
  for (const col of ['usuarios', 'cartoes', 'handles', 'ids_permanentes', 'visitas_diarias']) {
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
