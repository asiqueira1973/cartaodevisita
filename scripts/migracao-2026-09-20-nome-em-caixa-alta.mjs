// Migração pontual (spec 7.12): aplica a regra 11.12 aos cartões criados ANTES
// de a regra existir.
//
// Firestore não tem migração versionada, então a convenção do spec é um script
// por mudança, com a data no nome, e uma linha no DOCUMENTACAO-TECNICA.md
// registrando quando foi rodado.
//
// Idempotente: rodar de novo não muda nada, porque a normalização de um nome já
// normalizado devolve ele mesmo.
//
// Uso:  node scripts/migracao-2026-09-20-nome-em-caixa-alta.mjs [--aplicar]
// Sem --aplicar, só mostra o que mudaria.

import { readFileSync } from 'node:fs'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const aplicar = process.argv.includes('--aplicar')

const env = {}
for (const linha of readFileSync('.env.local', 'utf8').split('\n')) {
  const corte = linha.indexOf('=')
  if (!linha.trim() || linha.trimStart().startsWith('#') || corte === -1) continue
  let valor = linha.slice(corte + 1).trim()
  if (valor.startsWith('"') && valor.endsWith('"')) valor = valor.slice(1, -1)
  env[linha.slice(0, corte).trim()] = valor
}

initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
})

// Mesma lógica de lib/display-name.ts. Duplicada de propósito: um script de
// migração precisa continuar rodando igual mesmo que o módulo mude depois.
const PARTICULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'di', 'du', 'del', 'della', 'la', 'le', 'van', 'von', 'y'])
function normalizar(nome) {
  const limpo = nome.trim().replace(/\s+/g, ' ')
  if (!limpo || limpo !== limpo.toLocaleUpperCase('pt-BR')) return limpo
  return limpo.split(' ').map((palavra, i) => {
    const min = palavra.toLocaleLowerCase('pt-BR')
    if (i > 0 && PARTICULAS.has(min)) return min
    return min.replace(/(^|[-'’])([\p{L}])/gu, (_, s, l) => s + l.toLocaleUpperCase('pt-BR'))
  }).join(' ')
}

const db = getFirestore()
const snap = await db.collection('cartoes').get()
let mudariam = 0

for (const doc of snap.docs) {
  const atual = doc.data().nome_exibicao ?? ''
  const novo = normalizar(atual)
  if (novo === atual) continue
  mudariam++
  console.log(`  ${doc.id}\n    "${atual}"  ->  "${novo}"`)
  if (aplicar) await doc.ref.update({ nome_exibicao: novo, atualizado_em: new Date() })
}

console.log(`\n${snap.size} cartões · ${mudariam} ${aplicar ? 'atualizados' : 'mudariam'}`)
if (!aplicar && mudariam) console.log('Rode de novo com --aplicar para gravar.')
