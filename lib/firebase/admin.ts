// Inicialização do Firebase Admin SDK (spec 4.2).
//
// Só o servidor. A credencial vem de variável de ambiente e NUNCA chega ao
// navegador (spec 20.5). Em desenvolvimento, `FIRESTORE_EMULATOR_HOST` redireciona
// para o emulador sem precisar de credencial nenhuma.

import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

/**
 * Devolve o app do Admin SDK, criando-o na primeira chamada.
 * O Next recarrega módulos em desenvolvimento, então reaproveitar o app já
 * inicializado evita o erro de "app já existe" a cada alteração de arquivo.
 */
function adminApp(): App {
  if (getApps().length) return getApp()

  const projectId = process.env.FIREBASE_PROJECT_ID
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID não configurado')

  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  // Contra o emulador não há credencial: o host vem por variável de ambiente e
  // o SDK dispensa a chave.
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return initializeApp({ projectId, storageBucket })
  }

  if (!clientEmail || !privateKey) {
    throw new Error('FIREBASE_CLIENT_EMAIL ou FIREBASE_PRIVATE_KEY não configurados')
  }

  return initializeApp({
    // A chave vem da variável com "\n" escapado; sem o replace, o PEM é inválido.
    credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') }),
    storageBucket,
  })
}

/** Instância do Firestore, sempre no servidor (pegadinha 18.4.3). */
export function db(): Firestore {
  return getFirestore(adminApp())
}

/** Bucket do Cloud Storage onde ficam as fotos (spec 4.2). */
export function bucket() {
  return getStorage(adminApp()).bucket()
}
