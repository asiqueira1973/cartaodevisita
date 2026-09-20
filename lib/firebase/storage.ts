// Fotos do cartão, no Cloud Storage (spec 4.2 e 20.5).
//
// Nada aqui roda no navegador (pegadinha 18.4.3). O cliente redimensiona e
// manda os bytes para a rota de servidor; é ela que chama estas funções.

import { randomBytes } from 'node:crypto'
import { bucket } from '@/lib/firebase/admin'

/** Pasta de uma conta. O uid no caminho é o que separa as contas. */
const pasta = (usuarioId: string) => `fotos/${usuarioId}`

/**
 * Grava as duas derivadas e devolve as URLs públicas (critério 8.2.3).
 *
 * O nome do arquivo leva um token aleatório por DOIS motivos:
 * 1. Torna a URL não adivinhável mesmo para quem descobrir o uid (spec 20.5).
 * 2. Troca a URL a cada envio, o que invalida o cache do navegador sozinho —
 *    sem isso, trocar a foto deixaria a antiga na tela por horas.
 *
 * AS DUAS GRAVAM JUNTAS OU NENHUMA GRAVA (máquina de estado 12.3): um cartão com
 * `foto_url` preenchida e `foto_vcard_url` nula geraria um .vcf sem foto sem
 * ninguém entender por quê. Se a segunda falhar, a primeira é removida.
 */
export async function salvarFotos(
  usuarioId: string,
  exibicao: Uint8Array,
  vcard: Uint8Array,
): Promise<{ foto_url: string; foto_vcard_url: string }> {
  const token = randomBytes(8).toString('hex')
  const caminhoExibicao = `${pasta(usuarioId)}/${token}-exibicao.jpg`
  const caminhoVcard = `${pasta(usuarioId)}/${token}-vcard.jpg`

  const gravar = async (caminho: string, dados: Uint8Array) => {
    const arquivo = bucket().file(caminho)
    await arquivo.save(Buffer.from(dados), {
      contentType: 'image/jpeg',
      // Um ano de cache é seguro porque a URL muda a cada envio.
      metadata: { cacheControl: 'public, max-age=31536000, immutable' },
    })
    await arquivo.makePublic()
    return `https://storage.googleapis.com/${bucket().name}/${caminho}`
  }

  const urlExibicao = await gravar(caminhoExibicao, exibicao)
  try {
    const urlVcard = await gravar(caminhoVcard, vcard)
    // Só depois de as duas novas existirem é que as antigas saem.
    await apagarAntigas(usuarioId, token)
    return { foto_url: urlExibicao, foto_vcard_url: urlVcard }
  } catch (erro) {
    await bucket().file(caminhoExibicao).delete({ ignoreNotFound: true })
    throw erro
  }
}

/** Remove os arquivos de envios anteriores, preservando os do token atual. */
async function apagarAntigas(usuarioId: string, tokenAtual: string): Promise<void> {
  const [arquivos] = await bucket().getFiles({ prefix: `${pasta(usuarioId)}/` })
  await Promise.all(
    arquivos
      .filter((a) => !a.name.includes(tokenAtual))
      .map((a) => a.delete({ ignoreNotFound: true })),
  )
}

/** Apaga TODAS as fotos da conta (critério 8.2.7 e spec 20.4). */
export async function apagarFotos(usuarioId: string): Promise<void> {
  await bucket().deleteFiles({ prefix: `${pasta(usuarioId)}/`, force: true })
}
