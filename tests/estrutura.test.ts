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

/**
 * Remove comentários e linhas de import antes da análise.
 *
 * Sem isso o teste dá FALSO POSITIVO: o comentário de cabeçalho da rota cita
 * `requireDono()`, e a posição encontrada seria a do comentário, não a da
 * chamada real. Importar `@/lib/firebase/firestore` no topo é legítimo e
 * inevitável — o que não pode é USAR o dado antes de autorizar.
 */
function codigoExecutavel(fonte: string): string {
  return fonte
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/^\s*import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
}

/** Separa o corpo de cada handler exportado (GET, POST, PATCH, PUT, DELETE). */
function handlers(fonte: string): { nome: string; corpo: string }[] {
  const achados: { nome: string; corpo: string }[] = []
  const padrao = /export\s+async\s+function\s+(GET|POST|PATCH|PUT|DELETE)\b/g
  const inicios = [...fonte.matchAll(padrao)]
  inicios.forEach((m, i) => {
    const fim = i + 1 < inicios.length ? inicios[i + 1].index! : fonte.length
    achados.push({ nome: m[1], corpo: fonte.slice(m.index!, fim) })
  })
  return achados
}

const ACESSO_A_DADOS = ['db(', 'bucket(', 'reservarHandle(', 'trocarHandle(', 'handleEstaTomado(',
  'buscarCartao', 'registrarVisita(', 'excluirConta(', 'alterarPlano(', 'resolverIdPermanente(']

describe('pegadinha 18.4.1 — guarda antes de qualquer toque em dados', () => {
  it('encontra as rotas que precisa auditar', () => {
    // Um teste estrutural que não enxerga arquivo nenhum passa sempre e não
    // protege nada. Esta asserção falha se a varredura quebrar.
    const rotas = [...arquivos('app/api/conta'), ...arquivos('app/api/admin')]
    expect(rotas.length).toBeGreaterThan(0)
  })

  it('todo handler de /api/conta/* chama requireDono antes de tocar em dados', () => {
    for (const rota of arquivos('app/api/conta')) {
      const codigo = codigoExecutavel(ler(rota))
      expect(codigo, `${curto(rota)} não chama requireDono`).toContain('requireDono(')

      for (const { nome, corpo } of handlers(codigo)) {
        const posGuarda = corpo.indexOf('requireDono(')
        expect(posGuarda, `${curto(rota)} · ${nome} não chama requireDono`).toBeGreaterThan(-1)
        for (const proibido of ACESSO_A_DADOS) {
          const posDado = corpo.indexOf(proibido)
          if (posDado === -1) continue
          expect(posDado, `${curto(rota)} · ${nome} toca ${proibido} antes de autorizar`)
            .toBeGreaterThan(posGuarda)
        }
      }
    }
  })

  it('todo handler de /api/admin/* chama requireAdminPlataforma antes de tocar em dados', () => {
    for (const rota of arquivos('app/api/admin')) {
      const codigo = codigoExecutavel(ler(rota))
      for (const { nome, corpo } of handlers(codigo)) {
        const posGuarda = corpo.indexOf('requireAdminPlataforma(')
        expect(posGuarda, `${curto(rota)} · ${nome} não chama requireAdminPlataforma`).toBeGreaterThan(-1)
        for (const proibido of ACESSO_A_DADOS) {
          const posDado = corpo.indexOf(proibido)
          if (posDado === -1) continue
          expect(posDado, `${curto(rota)} · ${nome} toca ${proibido} antes de autorizar`)
            .toBeGreaterThan(posGuarda)
        }
      }
    }
  })
})

describe('pegadinha 18.4.2 — 404, nunca 403', () => {
  it('o único 403 do projeto é o da conta bloqueada em guards.ts', () => {
    // Exceção declarada (spec 18.4.2): uma conta bloqueada recebendo 403 nas
    // PRÓPRIAS rotas não confirma a existência de recurso alheio — ela já sabe
    // que a conta é dela. Qualquer outro 403 é violação; limite de plano
    // responde 422.
    //
    // A varredura ignora COMENTÁRIOS de propósito: sem isso, um comentário
    // explicando por que NÃO se usa 403 derruba o teste. Já aconteceu duas
    // vezes neste projeto, nos dois sentidos.
    const culpados = [...arquivos('app'), ...arquivos('lib')]
      .filter((f) => curto(f) !== 'lib/guards.ts')
      .filter((f) => /\b403\b/.test(codigoExecutavel(ler(f))))
      .map(curto)
    expect(culpados).toEqual([])
  })

  it('limite de plano responde 422, não 403 (regra 11.11.2)', () => {
    const rota = codigoExecutavel(ler(join(RAIZ, 'app/api/conta/cartao/route.ts')))
    // Onde há ERROS[18] — "Esse visual está disponível em outro plano" — o
    // status tem de ser 422.
    for (const linha of rota.split('\n').filter((l) => l.includes('ERROS[18]'))) {
      expect(linha, `esperava 422 em: ${linha.trim()}`).toContain('422')
    }
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

describe('spec 18.1 — nenhuma string de interface solta em componente', () => {
  it('título de tela vem sempre de lib/copy.ts', () => {
    // Guarda ESTREITO de propósito: só títulos. Detectar toda copy solta em JSX
    // daria falso positivo em exemplo de campo e em rótulo técnico. Título de
    // tela, porém, é sempre copy de produto — e foi exatamente aí que a regra
    // 18.1 foi furada quatro vezes neste projeto.
    const culpados: string[] = []
    for (const arquivo of [...arquivos('app'), ...arquivos('components')]) {
      const codigo = codigoExecutavel(ler(arquivo))
      for (const titulo of codigo.match(/<h1[^>]*>([^<]+)<\/h1>/g) ?? []) {
        const conteudo = titulo.replace(/<[^>]+>/g, '').trim()
        // Conteúdo vindo de expressão ({TEXTOS.x}) é o certo; texto cru não é.
        if (conteudo && !conteudo.startsWith('{')) {
          culpados.push(`${curto(arquivo)}: <h1>${conteudo}</h1>`)
        }
      }
    }
    expect(culpados).toEqual([])
  })
})

describe('spec 10.2 — o menu não aponta para tela que não existe', () => {
  it('todo destino do menu lateral tem uma página', () => {
    // Encontrado em uso: Aparência e Compartilhar estavam no menu e davam 404.
    // Link morto no produto é pior do que funcionalidade faltando — a pessoa
    // conclui que o app está quebrado, não que a tela ainda não chegou.
    const sidebar = ler(join(RAIZ, 'components/account/Sidebar.tsx'))
    const destinos = [...sidebar.matchAll(/href: '(\/conta[^']*)'/g)].map((m) => m[1])

    expect(destinos.length, 'a varredura não achou destino nenhum').toBeGreaterThan(0)

    const mortos = destinos.filter((destino) => {
      const caminho = join(RAIZ, 'app', destino, 'page.tsx')
      try { return !statSync(caminho).isFile() } catch { return true }
    })
    expect(mortos).toEqual([])
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
