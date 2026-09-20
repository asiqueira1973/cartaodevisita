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
npm run diagnostico    # ida e volta real no Firestore + confere as REGRAS publicadas
npm run deploy:rules   # publica firestore.rules e storage.rules
npm run emu            # emulador do Firebase (exige Java)
```

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
