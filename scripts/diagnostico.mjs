// Diagnóstico de conexão com o Firebase (spec 4.2).
//
// Faz uma ida e volta real contra o Firestore e o Storage de produção, numa
// coleção descartável (`_diagnostico`), e limpa o que criou. Serve para provar
// que as credenciais do .env.local funcionam ANTES de existir tela.
//
// Rode com: node scripts/diagnostico.mjs

import { readFileSync } from 'node:fs'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

/** Lê o .env.local sem depender de dependência externa, respeitando as aspas. */
function carregarEnv(caminho = '.env.local') {
  const env = {}
  for (const linha of readFileSync(caminho, 'utf8').split('\n')) {
    const corte = linha.indexOf('=')
    if (!linha.trim() || linha.trimStart().startsWith('#') || corte === -1) continue
    const chave = linha.slice(0, corte).trim()
    let valor = linha.slice(corte + 1).trim()
    if (valor.startsWith('"') && valor.endsWith('"')) valor = valor.slice(1, -1)
    env[chave] = valor
  }
  return env
}

const env = carregarEnv()
const falta = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_STORAGE_BUCKET']
  .filter((c) => !env[c])
if (falta.length) {
  console.error('Faltam variáveis no .env.local:', falta.join(', '))
  process.exit(1)
}

initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    // Mesmo replace do lib/firebase/admin.ts — sem ele o PEM é inválido.
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
})

const db = getFirestore()
const ref = db.collection('_diagnostico').doc('ida-e-volta')

try {
  const marca = new Date().toISOString()
  await ref.set({ marca, origem: 'scripts/diagnostico.mjs' })
  const lido = await ref.get()
  if (lido.data()?.marca !== marca) throw new Error('o que voltou não é o que foi gravado')
  console.log('Firestore  · escrita e leitura OK')

  await ref.delete()
  console.log('Firestore  · exclusão OK (coleção _diagnostico limpa)')

  const [existe] = await getStorage().bucket().exists()
  console.log(existe ? 'Storage    · bucket acessível' : 'Storage    · BUCKET NÃO ENCONTRADO')

  await conferirRegras(env)

  console.log('\nProjeto:', env.FIREBASE_PROJECT_ID)
} catch (erro) {
  console.error('\nFALHOU:', erro.message)
  process.exitCode = 1
}

/**
 * Compara as regras DO REPOSITÓRIO com as que estão PUBLICADAS (spec 6.6).
 *
 * Existe porque arquivo no repositório não é regra no ar. O modo de falha é
 * silencioso nos dois sentidos: editar o .rules e esquecer de publicar, ou
 * editar no console e o repositório mentir. Pior ainda é projeto criado em
 * "modo de teste", que nasce com `allow read, write: if true` e deixa qualquer
 * um com o id do projeto ler e escrever tudo.
 *
 * Não lança: reporta e segue, porque a conta de serviço pode não ter permissão
 * para ler as regras, e isso não é motivo para o diagnóstico inteiro falhar.
 */
async function conferirRegras(env) {
  let GoogleAuth
  try {
    ({ GoogleAuth } = await import('google-auth-library'))
  } catch {
    console.log('Regras     · pulado (google-auth-library ausente)')
    return
  }

  try {
    const auth = new GoogleAuth({
      credentials: {
        client_email: env.FIREBASE_CLIENT_EMAIL,
        private_key: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
    const { token } = await (await auth.getClient()).getAccessToken()
    const cabecalho = { authorization: `Bearer ${token}` }
    const projeto = env.FIREBASE_PROJECT_ID

    const r = await fetch(`https://firebaserules.googleapis.com/v1/projects/${projeto}/releases`, { headers: cabecalho })
    if (!r.ok) {
      console.log('Regras     · não consegui ler as publicadas (status', r.status + ')')
      return
    }

    const { releases = [] } = await r.json()
    const local = {
      'cloud.firestore': readFileSync('firestore.rules', 'utf8'),
      storage: readFileSync('storage.rules', 'utf8'),
    }

    for (const release of releases) {
      const nome = release.name.split('/').pop()
      const alvo = nome === 'cloud.firestore' ? 'cloud.firestore' : 'storage'

      const rs = await fetch(`https://firebaserules.googleapis.com/v1/${release.rulesetName}`, { headers: cabecalho })
      const publicada = (await rs.json())?.source?.files?.[0]?.content ?? ''

      // O caso perigoso primeiro: regra permissiva deixa o banco aberto.
      if (/allow\s+[a-z,\s]*:\s*if\s+(true|request\.time\s*<)/.test(publicada)) {
        console.log(`Regras     · *** ${nome} ESTÁ PERMISSIVO — qualquer um lê e escreve ***`)
        process.exitCode = 1
        continue
      }

      const iguais = normalizar(publicada) === normalizar(local[alvo])
      console.log(iguais
        ? `Regras     · ${nome} publicada e igual ao repositório`
        : `Regras     · ${nome} DIVERGE do repositório — rode: npm run deploy:rules`)
      if (!iguais) process.exitCode = 1
    }
  } catch (erro) {
    console.log('Regras     · não consegui conferir:', erro.message)
  }
}

/** Ignora comentário e espaço, que não mudam o efeito da regra. */
function normalizar(regras) {
  return regras
    .replace(/\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}
