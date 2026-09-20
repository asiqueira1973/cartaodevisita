# CLAUDE.md — Cartão de Visita

Cartão de visitas digital para o autônomo brasileiro. Next.js 15, React 19,
TypeScript, Firestore, Auth.js v5, Tailwind 4. Web, sem app.

A fonte de verdade do produto é `spec.md`. Este arquivo é o resumo operacional do
que não pode ser quebrado. **Onde os dois divergirem, `spec.md` manda.**
O `DOCUMENTACAO-TECNICA.md` descreve o que **está** implementado — ainda não existe.

---

## As cinco pegadinhas que não podem ser quebradas

Valem para qualquer mudança, em qualquer arquivo. Há um comando de verificação
para cada uma em "Como conferir".

1. **Toda rota `/api/conta/*` chama `requireDono()` na primeira linha; toda rota
   `/api/admin/*` chama `requireAdminPlataforma()`.** Firestore não tem RLS —
   essa linha é a única coisa entre um estranho e os dados de todo mundo.

2. **Cartão despublicado, conta bloqueada, handle inexistente e rota de admin
   para não-admin devolvem `404`, nunca `403`.** "Existe, mas não é seu" confirma
   a existência.

3. **Nenhuma chamada ao Firestore ou ao Storage no navegador.** Sempre em rota de
   servidor ou componente de servidor. As regras de segurança negam todo acesso
   do cliente — elas não são a autorização, são a garantia de que não há segunda
   porta.

4. **O QR e a etiqueta NFC codificam `/c/<id_permanente>`, nunca `/<handle>`.**
   É o princípio 0.4: quem grava handle em objeto físico transforma toda troca de
   nome em cartão morto. O `id_permanente` não tem operação de troca, e não deve ter.

5. **`visitas_diarias` não ganha campo que identifique visitante**, e **a página
   pública nunca fala com o Visão de Produto** (spec 21.3.1). Sem IP, sem
   user-agent, sem cookie, sem cidade. É o que mantém a página sem banner de
   consentimento.

---

## Convenções

- **Dados em português**, `snake_case`: coleções, campos, enums e valores de enum
  (`cartoes`, `nome_exibicao`, `id_permanente`, `tipo_link`).
- **Código em inglês**: componentes, hooks, rotas, helpers, nomes de arquivo.
- **A fronteira é `lib/firebase/firestore.ts`** — o único arquivo que conhece os
  nomes das coleções. Suas funções são em português porque são acesso a dados.
- **Toda string de interface vive em `lib/copy.ts`.** A copy da seção 15 do spec é
  literal: não reescreva, não melhore, não acrescente exclamação nem emoji.
- **Toda função, rota, guarda e hook leva comentário de cabeçalho em português**
  dizendo o que faz, o que recebe, o que devolve e qual regra do spec implementa,
  com o número da seção.
- **Nenhuma constante numérica inventada.** Todo número vem da seção 11 do spec.
  Se precisar de um que não está lá, pergunte antes de escolher.

---

## Estado da implementação

**Pronto e testado** (69 testes, sem dependência externa):

```
lib/handle.ts       formato, lista de reservados, normalização e sugestão (11.1, 11.2)
lib/ids.ts          id permanente e reserva com colisão (11.3)
lib/links.ts        normalização por tipo e montagem de URL (11.5, 20.5)
lib/vcard.ts        vCard 3.0: CRLF, dobra em 75 octetos, escape (14)
lib/planos.ts       allowlist de ilimitados, limites e reconciliação (11.11)
lib/admins.ts       allowlist de admin (5.3)
lib/telemetria.ts   Visão de Produto, só do painel (21.3)
lib/copy.ts         toda a copy da seção 15
types/dominio.ts    tipos que espelham a seção 7
```

```
lib/firebase/admin.ts      init do Admin SDK, com desvio para o emulador
lib/firebase/firestore.ts  O ÚNICO que conhece as coleções (spec 7.11)
lib/auth.ts                Auth.js v5, SEM Firebase — roda no Edge (spec 6.1)
lib/guards.ts              requireDono e requireAdminPlataforma (spec 6.5)
middleware.ts              barreira de /conta/* (critério 8.1.1)
firestore.rules            nega TODO acesso do cliente (spec 6.6)
storage.rules              idem
tests/estrutura.test.ts    guarda as cinco pegadinhas por varredura de arquivo
```

**Falta**: `lib/firebase/storage.ts`, `lib/qr.ts`, todas as rotas de `app/api/*`,
todas as telas e o `DOCUMENTACAO-TECNICA.md`. Ver `spec.md` seção 8 para a ordem,
e seção 25 para o que ainda está travado.

**Para rodar de verdade** falta preencher `.env.local`: `AUTH_SECRET`,
`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `FIREBASE_CLIENT_EMAIL` e
`FIREBASE_PRIVATE_KEY`. O projeto e o bucket já estão no `.env.example`.

---

## Comandos

```bash
npm run dev            # servidor local
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm test               # suíte unitária, sem dependência externa
npm run build          # build de produção — sem warning nosso é critério de aceite
npm run emu            # emulador do Firestore (exige Java)
npm run test:emu       # integração — exige `npm run emu` no ar
npm run diagnostico    # ida e volta real no Firestore + confere as REGRAS publicadas
npm run deploy:rules   # publica firestore.rules e storage.rules
```

**O emulador do Firestore NÃO exige índice composto — a produção exige.**
Uma consulta que filtra por dois campos (`where(a).where(b)`) passa no emulador
e explode em produção com `FAILED_PRECONDITION: The query requires an index`,
na cara de quem abriu a tela. Aconteceu com `visitasRecentes` em 20/09/2026.

A saída preferida **não** é criar o índice: é desenhar a consulta para não
precisar de um. `visitasRecentes` consulta por **faixa de id de documento**
(`<uid>_<data>`), que usa só o índice automático de `__name__`. Quando um índice
for mesmo inevitável, ele entra em `firestore.indexes.json` e vai no
`npm run deploy:rules` — nunca criado só pelo link do console, senão o
repositório mente igual às regras.

**Nunca rode `npm run build` com o `npm run dev` no ar.** O build sobrescreve o
`.next` que o servidor de desenvolvimento está usando, e toda rota passa a dar
500 com `Cannot find module './vendor-chunks/...'`. A mensagem não diz o que
aconteceu. Se cair nisso: pare o dev, `rm -rf .next`, suba de novo.

**Mexeu em `.rules`? Rode `npm run deploy:rules` e depois `npm run diagnostico`.**
Arquivo no repositório não é regra no ar — o diagnóstico compara os dois e falha
quando divergem, ou quando acha regra permissiva. Foi esse o problema no
ViraPágina.

## Como conferir as pegadinhas

```bash
grep -rLn "requireDono" app/api/conta --include="route.ts"
grep -rLn "requireAdminPlataforma" app/api/admin --include="route.ts"
grep -rn "403" app/ lib/ --include="*.ts" --include="*.tsx"
grep -rn "use client" -l app/ components/ | xargs grep -ln "firebase\|firestore\|storage"
grep -rn "visaodeproduto\|registrarEvento" "app/(public)" app/c
```

As duas primeiras têm de vir **vazias**; as três últimas também.

---

## Produção

| | |
|---|---|
| Projeto Vercel | `cartaodevisita` (conta `asiqueira1973`) |
| URL de teste | <https://cartaodevisita-puce.vercel.app> |
| Domínio final | `cartaodevisita.app.br` — adicionado na Vercel, **DNS pendente no registro.br** |
| Projeto Firebase | `cartao-de-visita-60325` |

```bash
vercel --prod --yes        # publica
vercel ls cartaodevisita   # estado dos deploys
vercel env ls              # variáveis (valores não aparecem)
```

**As variáveis de produção já estão configuradas na Vercel**, inclusive
`EARLY_ADOPTER_ABERTO=true` e `VISAO_API_KEY`. Elas NÃO vêm do `.env.local` —
mudar lá não muda produção. Use `vercel env add <NOME> production --force`.

**Toda URL nova precisa entrar no console do Google OAuth**, em dois campos
diferentes: origem (`https://dominio`) e redirecionamento
(`https://dominio/api/auth/callback/google`). Faltar o segundo dá
`redirect_uri_mismatch`, e a mensagem não diz qual campo está errado.

## Uma aparência só

A v1 tem **um** visual: foto redonda centralizada, nome grande, links
empilhados, cor azul. `template` e `cor_destaque` existem no modelo de dados e
ficam no padrão — não há tela para trocar, e a rota `PATCH /api/conta/cartao`
ignora as duas chaves.

Os quatro templates da seção 16.3 chegaram a ser implementados e foram
removidos no mesmo dia (commit `42e87dc`). `components/card/CabecalhoDoCartao.tsx`
ficou como costura: é o único arquivo a mexer quando eles voltarem (roadmap
28.10, com os desenhos prontos no canvas).

## Fora de escopo

Nada da seção 28 do spec: gravação de NFC, cobrança, etiqueta física vendida,
vários cartões por conta, domínio próprio, analytics por link, rotina de limpeza,
link mágico, wallet. **Nem "só a estrutura", nem campo "para depois".**

E nada do anti-escopo da seção 1.1: construtor de sites, link-in-bio, CRM,
rede social, produto de equipe, app nativo.

## Protocolo de mudança

Seção 29 do spec. O essencial: liste os arquivos que vai alterar **antes** de
escrever código, espere aprovação, e atualize `DOCUMENTACAO-TECNICA.md` e este
arquivo no mesmo commit.
