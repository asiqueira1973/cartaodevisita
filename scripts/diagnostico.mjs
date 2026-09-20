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

  console.log('\nCredenciais funcionando. Projeto:', env.FIREBASE_PROJECT_ID)
} catch (erro) {
  console.error('\nFALHOU:', erro.message)
  process.exitCode = 1
}
