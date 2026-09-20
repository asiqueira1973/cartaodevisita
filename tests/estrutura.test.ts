// Testes ESTRUTURAIS das pegadinhas (spec 18.4 e 21.3.1).
//
// Eles varrem os arquivos do projeto em vez de exercitar comportamento. É de
// propósito: são invariantes que uma rota nova pode quebrar sem que nenhum teste
// de comportamento perceba. Rota nova sem guarda quebra o build.
//
// NÃO DESATIVE ESTES TESTES.

import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const RAIZ = join(__dirname, '..')

/** Lista recursivamente os arquivos de uma pasta; pasta inexistente devolve vazio. */
function arquivos(pasta: string, extensoes = ['.ts', '.tsx']): string[] {
  let alvo: string
  try {
    alvo = join(RAIZ, pasta)
    if (!statSync(alvo).isDirectory()) return []
  } catch {
    return []
  }
  const achados: string[] = []
  for (const entrada of readdirSync(alvo, { withFileTypes: true })) {
    const caminho = join(alvo, entrada.name)
    if (entrada.isDirectory()) achados.push(...arquivos(relative(RAIZ, caminho), extensoes))
    else if (extensoes.some((e) => entrada.name.endsWith(e))) achados.push(caminho)
  }
  return achados
}

const ler = (caminho: string) => readFileSync(caminho, 'utf8')
const curto = (caminho: string) => relative(RAIZ, caminho)

describe('pegadinha 18.4.1 — guarda na primeira linha de toda rota protegida', () => {
  it('toda rota /api/conta/* chama requireDono antes de tocar em dados', () => {
    for (const rota of arquivos('app/api/conta')) {
      const fonte = ler(rota)
      expect(fonte, `${curto(rota)} não chama requireDono`).toContain('requireDono')

      const posGuarda = fonte.indexOf('requireDono(')
      for (const proibido of ['db()', 'bucket()', 'firestore', 'storage']) {
        const posDado = fonte.indexOf(proibido)
        if (posDado === -1) continue
        expect(posDado, `${curto(rota)} toca ${proibido} antes de autorizar`).toBeGreaterThan(posGuarda)
      }
    }
  })

  it('toda rota /api/admin/* chama requireAdminPlataforma antes de tocar em dados', () => {
    for (const rota of arquivos('app/api/admin')) {
      const fonte = ler(rota)
      expect(fonte, `${curto(rota)} não chama requireAdminPlataforma`).toContain('requireAdminPlataforma')

      const posGuarda = fonte.indexOf('requireAdminPlataforma(')
      for (const proibido of ['db()', 'bucket()']) {
        const posDado = fonte.indexOf(proibido)
        if (posDado === -1) continue
        expect(posDado, `${curto(rota)} toca ${proibido} antes de autorizar`).toBeGreaterThan(posGuarda)
      }
    }
  })
})

describe('pegadinha 18.4.2 — 404, nunca 403', () => {
  it('o único 403 do projeto é o da conta bloqueada em guards.ts', () => {
    // Exceção declarada (spec 18.4.2): uma conta bloqueada recebendo 403 nas
    // PRÓPRIAS rotas não confirma a existência de recurso alheio — ela já sabe
    // que a conta é dela. Qualquer outro 403 é violação.
    const culpados = [...arquivos('app'), ...arquivos('lib')]
      .filter((f) => curto(f) !== 'lib/guards.ts')
      .filter((f) => /\b403\b/.test(ler(f)))
      .map(curto)
    expect(culpados).toEqual([])
  })
})

describe('pegadinha 18.4.3 — nenhum acesso a dados no navegador', () => {
  it('nenhum componente de cliente importa Firebase', () => {
    const culpados = [...arquivos('app'), ...arquivos('components')]
      .filter((f) => {
        const fonte = ler(f)
        return /^\s*['"]use client['"]/m.test(fonte) && /firebase|firestore|@\/lib\/firebase/.test(fonte)
      })
      .map(curto)
    expect(culpados).toEqual([])
  })
})

describe('pegadinha 18.4.5 e regra 21.3.1 — a página pública não rastreia ninguém', () => {
  it('nada sob app/(public) ou app/c fala com o Visão de Produto', () => {
    const culpados = [...arquivos('app/(public)'), ...arquivos('app/c')]
      .filter((f) => /visaodeproduto|registrarEvento|@\/lib\/telemetria/.test(ler(f)))
      .map(curto)
    expect(culpados).toEqual([])
  })

  it('registrarVisita não grava nada que identifique o visitante', () => {
    const fonte = ler(join(RAIZ, 'lib/firebase/firestore.ts'))
    const funcao = fonte.slice(fonte.indexOf('export async function registrarVisita'))
    const corpo = funcao.slice(0, funcao.indexOf('\n}'))
    for (const proibido of [/\bip\b/i, /user.?agent/i, /cookie/i, /cidade/i, /regiao/i, /referer/i]) {
      expect(proibido.test(corpo), `registrarVisita menciona ${proibido}`).toBe(false)
    }
  })
})

describe('spec 20.5 — nenhum segredo versionado', () => {
  it('o .env.example não traz valor de credencial preenchido', () => {
    const exemplo = ler(join(RAIZ, '.env.example'))
    for (const chave of ['AUTH_SECRET', 'AUTH_GOOGLE_SECRET', 'FIREBASE_PRIVATE_KEY', 'VISAO_API_KEY']) {
      const linha = exemplo.split('\n').find((l) => l.startsWith(`${chave}=`))
      expect(linha, `${chave} ausente do .env.example`).toBeDefined()
      expect(linha, `${chave} tem valor preenchido no .env.example`).toBe(`${chave}=`)
    }
  })

  it('nenhum arquivo versionado contém chave privada ou chave do Visão de Produto', () => {
    const culpados = [...arquivos('app'), ...arquivos('lib'), ...arquivos('tests'), ...arquivos('types')]
      .filter((f) => /BEGIN [A-Z ]*PRIVATE KEY|\bing_[A-Za-z0-9_-]{20,}/.test(ler(f)))
      .map(curto)
    expect(culpados).toEqual([])
  })
})
