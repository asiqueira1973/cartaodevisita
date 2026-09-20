# DOCUMENTAÇÃO TÉCNICA — Cartão de Visita

O que **está** implementado, não o que foi planejado. Para o que foi planejado,
leia o `spec.md`; para as convenções e as pegadinhas, o `CLAUDE.md`.

Este documento existe para alguém — pessoa ou agente — retomar o projeto sem
engenharia reversa. **Mudou modelo de dados, guarda, rota ou lógica de tela?
Atualize-o no mesmo commit.**

| | |
|---|---|
| Gerado em | 20 de setembro de 2026 |
| Estado | dez épicos da seção 8 implementados; em produção |
| Produção | <https://cartaodevisita.app.br> · `www` redireciona com 308 |
| Projeto Vercel | `cartaodevisita` (conta `asiqueira1973`) |
| Projeto Firebase | `cartao-de-visita-60325` |
| Testes | 127 na suíte padrão · 22 na de integração |

---

## 1. Modelo de dados

Cloud Firestore. Coleções e campos em **português**, `snake_case` (convenção
18.1). O modelo é raso de propósito: tudo que a página pública precisa sai em
**uma leitura por chave**, porque o princípio 0.2 não tolera duas viagens ao
banco para pintar o cartão.

### 1.1 `usuarios` — a conta

Id do documento: **o `uid` do Google** (`sub`). Não é o e-mail, porque e-mail muda.

| Campo | Tipo | Nulo | O que significa no negócio |
|---|---|:---:|---|
| `email` | string | não | E-mail do Google. **Acompanha o provedor**: se mudar lá, `garantirUsuario` atualiza aqui. É o que o admin vê, o que vira `distinct_id` na telemetria, e o que as duas allowlists conferem |
| `nome_google` | string | não | Nome vindo do provedor. Usado para sugerir o endereço e pré-preencher o cartão. Também acompanha o provedor |
| `foto_google_url` | string | **sim** | Foto do perfil Google. Nula quando o perfil não tem. É só sugestão inicial — não é a foto do cartão |
| `handle` | string | **sim** | O endereço público (`/alexandresiqueira`). **Nulo entre o primeiro login e a escolha** — é o único estado em que a conta existe sem URL pública, e enquanto for nulo todo o painel redireciona para a escolha |
| `id_permanente` | string | **sim** | O endereço que vai no QR e na etiqueta NFC (`/c/tcdhebzs`). Nulo pelo mesmo motivo. **Nunca muda depois de criado** — não existe operação de troca, e não deve existir |
| `criado_em` | timestamp | não | |
| `ultimo_acesso_em` | timestamp | não | Atualizado no máximo **uma vez por dia**, para não escrever a cada requisição |
| `bloqueado` | boolean | não | Ligado por admin quando o conteúdo viola os termos. Cartão de conta bloqueada responde 404 **para todos, inclusive o dono** |
| `plano` | enum | não | Ver 1.6. O valor inicial depende da variável `EARLY_ADOPTER_ABERTO` e da allowlist de ilimitados |
| `plano_anterior` | enum | **sim** | Guarda de onde a conta veio antes de ser promovida a `ilimitado` pela allowlist, para poder voltar se o e-mail sair da lista. Nulo em conta nunca promovida |

**Exclusão:** *hard delete*. Exigência de LGPD — apagar em 30 dias não é apagar.

### 1.2 `handles` — a reserva do endereço público

Id do documento: **o próprio handle**, em minúsculas.

Esta coleção existe por um motivo único: **o id do documento é a chave de
unicidade**. O `create` do Firestore falha se o documento já existe, e é isso que
faz um de dois cadastros simultâneos perder. Sem ela, os dois venceriam.

| Campo | Tipo | Significado |
|---|---|---|
| `usuario_id` | string | Dono do endereço |
| `criado_em` | timestamp | |

**Exclusão:** *hard delete*. Trocar de endereço apaga o antigo e o devolve ao
pool; excluir a conta idem. Não há histórico de endereços, de propósito.

### 1.3 `ids_permanentes` — a reserva do endereço imutável

Id do documento: **o próprio id permanente**. Mesmo padrão e mesmo motivo de 1.2.

| Campo | Tipo | Significado |
|---|---|---|
| `usuario_id` | string | Dono do id |
| `criado_em` | timestamp | |

**Formato:** 8 caracteres do alfabeto `23456789abcdefghjkmnpqrstuvwxyz`. Ficam de
fora `0`, `1`, `l`, `i` e `o` — os que confundem quem transcreve de um cartão
impresso. São 31⁸ ≈ 852 bilhões de combinações.

**Exclusão:** *hard delete*, **apenas** na exclusão da conta.

### 1.4 `cartoes` — o cartão

Id do documento: **o mesmo `uid` do usuário**. Usar o mesmo id evita uma consulta:
quem tem o usuário tem o cartão, por chave direta.

| Campo | Tipo | Nulo | O que significa no negócio |
|---|---|:---:|---|
| `usuario_id` | string | não | Redundante com o id; guardado para consulta por campo |
| `nome_exibicao` | string | não | O nome de 28 px do topo. Até 60 caracteres. **Nasce normalizado**: nome do Google em CAIXA ALTA vira caixa de título |
| `cargo` | string | **sim** | "Psicanalista", "Corretor de imóveis". Nulo quando não preenchido. Até 60 |
| `empresa` | string | **sim** | Nulo para autônomo sem razão social. Até 60 |
| `bio` | string | **sim** | Uma linha de apresentação. Até 160 — o limite é proposital: bio longa transforma o cartão em site |
| `foto_url` | string | **sim** | Foto de exibição, 600×600. Nula quando não há foto — a página mostra as iniciais sobre a cor de destaque |
| `foto_vcard_url` | string | **sim** | Derivada 300×300 com teto de 80 KB, usada **só** para embutir no `.vcf`. **Nula sempre que `foto_url` for nula** — as duas gravam juntas ou nenhuma grava |
| `links` | array | não | Ver 1.5. Array embutido, não subcoleção |
| `template` | enum | não | Sempre `minimalista` na v1: não há tela para trocar (ver 6.2) |
| `cor_destaque` | enum | não | Sempre `azul` na v1, pelo mesmo motivo. Ainda pinta o botão de WhatsApp e as iniciais |
| `publicado` | boolean | não | Nasce `false`. Publicar é ato explícito do dono |
| `permitir_indexacao` | boolean | não | Nasce `false`: o cartão **não** aparece em buscadores até a pessoa permitir |
| `mensagem_whatsapp` | string | **sim** | Texto que já vem digitado ao abrir o WhatsApp. Nulo usa o padrão. Até 120 |
| `atualizado_em` | timestamp | não | |

### 1.5 `links` — embutido em `cartoes`

**Array dentro do documento, não subcoleção.** Trade-off declarado: não dá para
consultar ou contar links entre cartões, e reordenar reescreve o documento
inteiro. Em troca, a página pública lê o cartão completo em **uma leitura**, que
é o que o princípio 0.2 exige. Com teto de 15 itens, a reescrita é irrelevante.

| Campo | Tipo | Significado |
|---|---|---|
| `id` | string | UUID gerado no servidor |
| `tipo` | enum | Determina ícone, validação e formato da URL |
| `valor` | string | **O dado já normalizado**, não o digitado: telefone em E.164, usuário sem `@`, URL com esquema |
| `rotulo` | string \| nulo | Texto do botão. Nulo usa o rótulo padrão do tipo. Até 24 |
| `ordem` | inteiro | Posição na página, de 0 em diante. **Renumerado pelo servidor** a cada gravação |

### 1.6 `visitas_diarias` — o contador

Id do documento: **`<usuario_id>_<AAAA-MM-DD>`**, no fuso de São Paulo.

Este formato de id não é enfeite: ele permite ler a janela de 30 dias por
**faixa de id**, usando só o índice automático de `__name__` — sem índice
composto para manter. Ver 3.4.

| Campo | Tipo | Significado |
|---|---|---|
| `usuario_id` | string | |
| `data` | string | `AAAA-MM-DD`, fuso `America/Sao_Paulo` |
| `total` | inteiro | Visitas no dia |
| `por_link` | inteiro | Chegou direto em `/<handle>` |
| `por_codigo` | inteiro | Chegou por `/c/<id>` — QR ou etiqueta |
| `salvou_contato` | inteiro | Baixou o `.vcf` |
| `abriu_whatsapp` | inteiro | Clicou no botão de WhatsApp |

**Todos os contadores nascem em zero**, mesmo os que não mudaram na escrita: um
documento só com `por_link` deixaria os outros indefinidos, e `undefined` numa
soma vira `NaN` na tela.

> **NENHUM campo aqui identifica o visitante.** Sem IP, sem user-agent, sem
> cookie, sem cidade. Não é política — é o que está gravado. Há teste estrutural
> que falha se um campo novo aparecer.

**Exclusão:** *hard delete* junto com a conta. Retenção prevista de 400 dias
(rotina ainda não implementada).

### 1.7 `acoes_admin` — log de auditoria

Id automático.

| Campo | Tipo | Significado |
|---|---|---|
| `admin_email` | string | Quem fez |
| `acao` | enum | O quê |
| `usuario_id_alvo` | string | Em qual conta |
| `detalhe` | string \| nulo | Motivo, e o valor anterior quando houve troca (`gratuito → ilimitado`) |
| `criado_em` | timestamp | Quando |

**Exclusão: NUNCA**, nem na exclusão da conta. São registros de atos da
*plataforma*, não dados do titular; depois da exclusão o `usuario_id_alvo` passa
a apontar para uma conta inexistente, que é o comportamento correto de um log.

### 1.8 Enums e o que cada valor quer dizer

**`tipo_link`** — `whatsapp` (botão principal, máximo 1) · `telefone` · `email` ·
`instagram` · `linkedin` · `site` · `youtube` · `tiktok` · `facebook` · `x` ·
`github` · `behance` · `spotify` · `pix` (botão de copiar, não abre link, máximo
1) · `endereco` (abre no mapa) · `outro`

**`plano_conta`**
- `gratuito` — conta nova com a chave desligada. 5 links, marca no rodapé.
- `early_adopter` — conta nova com `EARLY_ADOPTER_ABERTO=true`. **Nunca expira**, e é essa a promessa. 15 links, sem marca.
- `ilimitado` — e-mail na allowlist de `lib/planos.ts`, conferida a cada login. Mesmos limites do early adopter.
- `pago` — **não atribuível na v1**. Existe no enum para não exigir migração quando a cobrança chegar.

**`template_cartao`** — `minimalista` (o único em uso) · `cartao` · `foto` ·
`executivo` (os três últimos existem no enum, ver 6.2)

**`cor_destaque`** — `azul` (o único em uso) · `verde` · `roxo` · `vermelho` ·
`laranja` · `rosa` · `grafite` · `dourado`

**`acao_admin`** — `despublicou_cartao` · `alterou_handle` · `alterou_plano` ·
`bloqueou_conta` · `desbloqueou_conta`

---

## 2. Relacionamentos

```
                        ┌──────────────┐
                        │   usuarios   │   id = uid do Google
                        └──────┬───────┘
         ┌─────────────────────┼─────────────────────┬──────────────┐
         │ 1:1                 │ 1:1                 │ 1:1          │ 1:N
         ▼                     ▼                     ▼              ▼
   ┌───────────┐   ┌─────────────────┐   ┌──────────────┐   ┌──────────────────┐
   │  handles  │   │ ids_permanentes │   │   cartoes    │   │ visitas_diarias  │
   │ id=handle │   │ id=id_permanente│   │   id=uid     │   │ id=uid_AAAA-MM-DD│
   └───────────┘   └─────────────────┘   └──────┬───────┘   └──────────────────┘
                                                │ embutido
                                                ▼
                                          ┌──────────┐
                                          │  links   │
                                          └──────────┘

   ┌──────────────┐
   │ acoes_admin  │  aponta para usuarios.id, SEM integridade referencial:
   └──────────────┘  sobrevive à exclusão da conta, de propósito
```

Em vocabulário de negócio:

- Um usuário tem **exatamente um** endereço público e **exatamente um** id permanente, depois da escolha.
- Um usuário tem **exatamente um** cartão. Não existe usuário sem cartão depois do primeiro acesso, nem cartão sem usuário.
- Um cartão tem **de zero a quinze** links, guardados dentro do próprio documento.
- Um usuário tem **muitos** registros de visita, um por dia em que houve ao menos uma.
- Uma conta pode ter **muitas** ações de moderação, que continuam existindo depois de ela ser apagada.

---

## 3. A lógica que vive no servidor

Não há trigger nem função de banco: o Firestore não tem, e não usamos Cloud
Functions. **Toda regra roda em rota de servidor ou componente de servidor.**

### 3.1 As guardas — `lib/guards.ts`

> **Esta é a única camada de autorização do produto.** O Firestore não tem RLS.
> As regras de segurança (`firestore.rules`, `storage.rules`) negam **todo**
> acesso do cliente e existem para garantir que não há segunda porta — elas não
> autorizam nada.

| Função | Onde | O que faz |
|---|---|---|
| `requireDono(exigirHandle = true)` | **primeira linha** de toda rota `/api/conta/*` | Sem sessão → `401`. Com sessão → **é aqui que a conta nasce** (`garantirUsuario`). Conta bloqueada → `403`. Sem endereço → `409` com o destino da escolha |
| `requireAdminPlataforma()` | **primeira linha** de toda rota `/api/admin/*` | E-mail fora da allowlist → **`404`**, nunca `403`. Responder 403 confirmaria que a rota existe |

O `403` de conta bloqueada é a **única exceção** declarada à regra do 404, e há
teste estrutural que a limita a `lib/guards.ts`. Limite de plano responde `422`.

### 3.2 Acesso a dados — `lib/firebase/firestore.ts`

**O único arquivo que conhece os nomes das coleções.** É a fronteira de idioma:
as funções aqui têm nome em português porque são acesso a dados; o resto do
código é em inglês.

| Função | O que faz |
|---|---|
| `garantirUsuario(uid, email, nome, foto)` | Cria a conta e o cartão juntos, no primeiro acesso. Em conta existente, **atualiza e-mail, nome e foto se mudaram no provedor**, reconcilia o plano contra a allowlist e toca `ultimo_acesso_em` no máximo uma vez por dia |
| `reservarHandle(usuarioId, handle)` | **Transação.** Grava `handles/<handle>` e `ids_permanentes/<id>` com `create` (que falha se existir) e aponta o usuário para os dois. É isso que faz um de dois cadastros simultâneos perder |
| `trocarHandle(usuarioId, novo)` | **Transação.** Reserva o novo, aponta o usuário, apaga o antigo. **NÃO toca no `id_permanente`** |
| `buscarCartaoPorHandle(handle)` | Duas leituras por chave. Devolve `null` para handle inexistente, conta bloqueada **ou cartão despublicado** — os três indistinguíveis |
| `buscarCartaoDoDono(usuarioId)` | O cartão do dono, publicado ou não |
| `resolverIdPermanente(id)` | Resolve o id para o endereço atual. Mesmas condições de `null` da função acima — **inclusive cartão despublicado** |
| `atualizarCartao(usuarioId, campos)` | Grava campos e `atualizado_em`. Não valida: a validação é da rota |
| `registrarVisita(usuarioId, origem)` | Incremento atômico no documento do dia. Toca todos os contadores, os que mudaram com 1 e os demais com 0 |
| `visitasRecentes(usuarioId, dias)` | Lê por **faixa de id de documento**, não por dois campos. Ver 3.4 |
| `listarContas(limite)` | Listagem do admin, por criação decrescente, com links e visitas por conta |
| `buscarContaParaAdmin(id)` | Conta, cartão e histórico. **Ordena o histórico em memória**, para não exigir índice composto |
| `definirBloqueio` · `despublicarPorAdmin` · `alterarPlano` · `registrarAcaoAdmin` | Ações de moderação |
| `excluirConta(usuarioId)` | Apaga usuário, cartão, endereço, id permanente e visitas. **Não apaga `acoes_admin`** |
| `handleEstaTomado(handle)` | Para a verificação enquanto a pessoa digita |

### 3.3 Regras puras e testadas — `lib/`

| Arquivo | O que decide |
|---|---|
| `handle.ts` | Formato (3–30, sem hífen nas pontas), lista de reservados, normalização e sugestão a partir do nome |
| `ids.ts` | Geração do id permanente com `randomInt` do crypto, não `Math.random`: id adivinhável facilitaria enumerar contas |
| `links.ts` | Normalização por tipo, montagem da URL final, validação da lista, renumeração da ordem. **Recusa `javascript:`, `data:` e qualquer esquema fora de http/https** — é a única entrada de texto livre que vira `href` |
| `vcard.ts` | vCard 3.0: CRLF, dobra em **75 octetos** (não caracteres), escape de `; , \`, foto em base64 |
| `cartao.ts` | Limites de texto, contador a partir de 80%, campo vazio virando nulo, iniciais |
| `imagens.ts` | **Magic bytes** — extensão e `Content-Type` são texto que qualquer um escreve |
| `planos.ts` | Allowlist de ilimitados, limites por plano, plano inicial, reconciliação |
| `publicacao.ts` | Condições para publicar, soma de visitas, série diária com dias vazios |
| `display-name.ts` | Caixa de título quando o nome vem todo em maiúsculas |
| `cores.ts` | As oito cores com os dois tons de cada |
| `qr.ts` | SVG e PNG do QR. **Recebe id permanente e não aceita handle**, para a pegadinha não depender de disciplina |
| `telemetria.ts` | Visão de Produto. Único arquivo que conhece a URL e a chave |
| `copy.ts` | Toda a copy da interface |

### 3.4 A consulta de visitas, e por que ela é assim

`visitasRecentes` **não** filtra por `usuario_id` e `data` ao mesmo tempo. Isso
exigiria índice composto — que precisa ser criado, versionado e implantado, e
cuja falta **só aparece em produção**, porque o emulador não exige índice.
Aconteceu em 20/09/2026, com a aba Visitas quebrando na cara de quem abriu.

Como o id é `<usuario_id>_<AAAA-MM-DD>`, a consulta usa **faixa de id**:

```ts
.orderBy(FieldPath.documentId())
.startAt(`${usuarioId}_${limite}`)
.endAt(`${usuarioId}_`)
```

Zero índice a manter, e lê apenas os dias que existem. **Era para isso que o id
tinha sido desenhado assim.**

---

## 4. Mapa tela → coleções

### 4.1 Públicas — sem conta

| Tela | Rota | Lê | Escreve | Guarda |
|---|---|---|---|---|
| Home | `/` | — | — | — |
| Termos, Privacidade | `/termos`, `/privacidade` | — | — | — |
| **Cartão** | `/<handle>` | `handles`, `cartoes`, `usuarios` (**com cache de 60 s**) | `visitas_diarias` | — |
| Redirecionador | `/c/<id>` | `ids_permanentes`, `usuarios`, `cartoes` | **nada** | — |
| QR em tela cheia | `/<handle>/qr` | idem cartão | — | — |
| vCard | `/api/cartoes/<handle>/vcard` | idem cartão + a foto do Storage | `visitas_diarias` | — |
| QR em PNG | `/api/cartoes/<handle>/qr.png` | idem cartão | — | — |
| Clique no WhatsApp | `/api/eventos/whatsapp` | `handles`, `cartoes` | `visitas_diarias` | — |

### 4.2 Do dono — exige sessão

| Tela | Rota | Lê | Escreve | Guarda |
|---|---|---|---|---|
| Entrar | `/entrar` | — | — | middleware |
| Escolher endereço | `/conta/handle` | `usuarios`, `handles` | `handles`, `ids_permanentes`, `usuarios`, `cartoes` | sessão na página |
| **Meu cartão** | `/conta` | `usuarios`, `cartoes`, `visitas_diarias` | `cartoes`, Storage | middleware + layout |
| Links | `/conta/links` | `usuarios`, `cartoes` | `cartoes` | idem |
| Compartilhar | `/conta/compartilhar` | `usuarios`, `cartoes` | — | idem |
| Ajustes | `/conta/ajustes` | `usuarios`, `cartoes` | `usuarios`, `handles`, `cartoes`, Storage | idem |

Rotas de API do dono: `/api/conta/handle`, `/api/conta/cartao`,
`/api/conta/cartao/links`, `/api/conta/cartao/foto`,
`/api/conta/cartao/publicacao`, `/api/conta/indexacao`, `/api/conta/eventos`,
`/api/conta` (DELETE). **Todas com `requireDono()` na primeira linha.**

### 4.3 Do admin — allowlist em código

> ## O painel da plataforma fica em <https://cartaodevisita.app.br/admin>
>
> **Não há link para ele em lugar nenhum do produto, de propósito.** Para quem
> não está na allowlist — inclusive para quem não está logado — ele responde
> **404**, indistinguível de rota inexistente. Isso significa que **ele é
> impossível de descobrir navegando**: se você esquecer o endereço, não há como
> achá-lo clicando. Daí este bloco existir aqui.

| Tela | Rota | Lê | Escreve | Guarda |
|---|---|---|---|---|
| Contas | `/admin` | `usuarios`, `cartoes`, `visitas_diarias` | — | `notFound()` no layout |
| Uma conta | `/admin/contas/[id]` | `usuarios`, `cartoes`, `acoes_admin`, `visitas_diarias` | — | idem |

Rotas de API: `/api/admin/contas/[id]/{publicacao,handle,bloqueio,plano}`.
**Todas com `requireAdminPlataforma()` na primeira linha.**

**Quem entra:** os e-mails listados em `lib/admins.ts`. Hoje:
`alexandre.silva.siqueira@gmail.com` e `alexandre@dablab.com.br`.

**Como dar acesso a alguém:** acrescentar o e-mail naquele arquivo, commitar e
fazer push — o deploy é automático. **Não existe tela para promover admin, e não
deve existir**: exigir commit e deploy é justamente a barreira desejada (spec
5.3). O arquivo não tem nenhum `import`, para não criar ciclo de dependência.

**O que o admin pode:** tirar cartão do ar, trocar endereço, alterar plano e
bloquear conta — sempre com motivo, e tudo gravado em `acoes_admin`.

**O que o admin NÃO pode, e a ausência é proposital:** editar foto, texto ou
links de um cartão, publicar cartão alheio, ou excluir conta de alguém. A
responsabilidade pelo conteúdo fica com o dono, e a exclusão é ato do titular.
Há teste estrutural que falha se uma rota ou componente de admin mencionar campo
de conteúdo do cartão.

---

## 5. O que acontece em cada tela

### 5.1 `/entrar`
Um botão. O `?voltar=` é limitado a caminhos internos — sem isso, o login vira
redirecionador aberto, a forma clássica de usar o domínio de alguém para dar
credibilidade a um golpe.

### 5.2 `/conta/handle`
**Vive fora de `app/conta/`**, dentro do grupo de rota `(escolha)`. O layout de
`/conta` manda para cá toda conta sem endereço; se esta página herdasse aquele
layout, o primeiro login entraria em **laço de redirecionamento**.

A sugestão vem do nome do Google normalizado. O campo confere disponibilidade com
debounce de 350 ms e **cancela a requisição anterior** — sem isso, uma resposta
velha chega depois da nova e sobrescreve o resultado certo. Endereço **reservado**
e **ocupado** devolvem a mesma resposta, para não revelar a existência da lista.

### 5.3 `/conta` — Meu cartão
Cabeçalho, abas, editor, prévia e botão de publicar **compartilham o mesmo estado
do cliente**. Renderizar qualquer um no servidor o deixaria congelado no valor
que tinha ao carregar — foi exatamente o bug do contador de links.

Campos salvam **ao sair do foco**, sem botão global. A foto é redimensionada **no
navegador** em duas derivadas (600×600 e 300×300 ≤ 80 KB); o servidor só valida
magic bytes e tamanho. As duas gravam juntas ou nenhuma grava.

Publicar exige nome e ao menos um link, decidido pela **mesma função** que
desabilita o botão no cliente. Publicar **invalida o cache** da página pública —
sem isso levaria até 60 s, e o primeiro reflexo de quem publica é abrir o link.

A aba Visitas é um **link com `?aba=`**, não estado: funciona sem JavaScript e
sobrevive ao recarregar.

### 5.4 `/conta/links`
`PUT` da **lista inteira**, não `POST` por item: reordenar muda todos de uma vez,
e um endpoint por item exigiria transação. Reordena por **botões de subir e
descer**, não arrastar — arrastar com precisão em tela pequena falha.

A lista só é enviada quando **todos os itens têm valor**; senão o servidor
recusaria a lista inteira e a pessoa perderia o que acabou de escrever. Depois de
salvar, a tela **adota o que o servidor gravou** — ids novos e valores
normalizados, senão continuaria mostrando `(21) 99876-5432` em vez de
`+5521998765432`.

### 5.5 `/conta/compartilhar`
Link com copiar, envio por WhatsApp, QR com download em PNG, e o bloco de NFC com
o texto **literal** da seção 15.5 do spec. Avisa quando o cartão está fora do ar.

### 5.6 `/conta/ajustes`
Três blocos, do inofensivo ao perigoso. O aviso da troca de endereço aparece
**antes** do campo — é o momento em que a pessoa ainda pode desistir. A exclusão
pede para **digitar o próprio endereço**: um "tem certeza?" com dois botões é
clicado no automático.

### 5.7 `/<handle>` — o cartão público
Componente de servidor. **Todo o conteúdo sai no HTML e a página funciona com
JavaScript desativado.** O único pedaço que precisa de JS é copiar a chave PIX,
que degrada mostrando a chave como texto selecionável.

O botão de WhatsApp é `<a href>` de verdade; o JS só acrescenta um `sendBeacon`
que não segura a navegação. Salvar nos contatos é `<a download>` — se dependesse
de script, quebraria no pior momento.

O acesso do **próprio dono logado não conta** como visita. O `?qr` no destino do
redirecionamento distingue quem veio por QR de quem veio por link.

Dono logado vendo o próprio cartão despublicado recebe a página com uma tarja; a
leitura nesse caso é **sem cache**, para ver o que acabou de salvar.

### 5.8 `/admin`
Mostra o valor **real** de `EARLY_ADOPTER_ABERTO` na tela: esquecer de ligar ou
desligar a chave é o erro provável, e ver o valor é o que faz alguém perceber.

Quatro ações de moderação, todas com motivo e todas gravando no log. A de
publicação **só aceita `false`** — o admin despublica, nunca publica cartão
alheio. **Não existe caminho para editar conteúdo de cartão**, e a ausência é
proposital: há teste estrutural que falha se uma rota ou componente de admin
mencionar campo de conteúdo.

---

## 6. Divergências em relação ao spec

Sem esta seção o documento envelhece mentindo.

### 6.1 `/c/<id>` redireciona para `/<handle>?qr`, não para `/<handle>`
**Spec 8.4.3, divergência registrada em 8.4.3.1.** No salto do 308 a origem da
visita se perde. Contar dos dois lados dobraria o total; contar só no `/c/`
some quando o navegador cacheia o 308; `Referer` não chega em redirecionamento; e
cookie é proibido na página pública. O custo é um parâmetro visível na barra.

### 6.2 A tela Aparência e os quatro templates saíram do MVP
**Decisão de 20/09/2026, movida para o roadmap 28.10.** Os quatro templates
chegaram a ser implementados e foram removidos no mesmo dia (commit `42e87dc`).
`template` e `cor_destaque` continuam no modelo, fixos no padrão;
`components/card/CabecalhoDoCartao.tsx` ficou como costura para quando voltarem.

**Consequência:** o plano gratuito passou a se distinguir por **duas coisas
apenas** — teto de links e marca no rodapé.

### 6.3 O alvo de JavaScript passou de 40 KB para 110 KB
**Spec 17.1, revisada em 17.1.1.** A página entrega 707 B próprios; os 105 KB são
o runtime do React. Medido: LCP 460 ms, primeiro byte 258 ms, funciona sem JS.

### 6.4 O critério 8.5.5 pede algo impossível
Ele fala em "subir o brilho do aparelho". **Nenhum navegador permite isso** — não
existe API. O implementado é a **Screen Wake Lock**, que impede a tela de dormir
no meio do "aponta a câmera", e resolve o problema real.

### 6.5 A conta não nasce no callback do Auth.js
**Spec 6.2, e é o que o spec já previa.** `lib/auth.ts` roda no Edge Runtime e
não pode carregar o Admin SDK. A conta nasce dentro de `requireDono()`.

### 6.6 Regras 11.12 e 11.13 nasceram durante a implementação
Não estavam no spec original: a normalização de nome em caixa alta apareceu ao
ver o nome do Google chegar como `ALEXANDRE SIQUEIRA`, e o corte de 64 caracteres
em propriedade de evento foi um número que escolhi e o responsável ratificou.

---

## 7. Bugs encontrados rodando, e o que os trava

Registrados porque a causa de cada um é mais útil que a correção.

| Bug | Causa | O que trava agora |
|---|---|---|
| `/c/<id>` devolvia **308** com cartão despublicado, vazando a existência do id | `resolverIdPermanente` conferia conta bloqueada mas não `publicado` | Teste de integração |
| `.vcf` quebrava com `toISOString is not a function` **só com cache quente** | `unstable_cache` serializa em JSON e `Date` vira string | Revivido na fronteira do cache; teste que falha se alguém "resolver" tornando `buildVCard` tolerante |
| Aba Visitas quebrava em produção com `FAILED_PRECONDITION` | Consulta por dois campos exige índice composto, e **o emulador não exige índice** | Consulta por faixa de id; `firestore.indexes.json` versionado |
| Soma de visitas viraria `NaN` | Contadores nasciam indefinidos | `increment(0)` em todos; teste de integração |
| Contador de links congelado em "0 de 15" | Renderizado no servidor, não acompanhava o cliente | Movido para o cliente |
| Allowlist olhava o e-mail **guardado** | `garantirUsuario` não atualizava e-mail quando mudava no provedor | Atualiza e reconcilia contra o atual; teste de regressão |
| Aparência e Compartilhar davam 404 no menu | Telas não existiam | Teste estrutural: todo destino do menu tem página |
| Teste de guarda passava por **falso positivo** | `requireDono(` aparecia no comentário do topo | O teste ignora comentários e analisa handler por handler |

---

## 8. Como conferir que nada quebrou

```bash
npm test               # 127 testes, sem dependência externa
npm run emu            # emulador do Firestore (exige Java)
npm run test:emu       # 22 testes de integração
npm run typecheck
npm run build          # sem warning nosso é critério de aceite
npm run diagnostico    # ida e volta real + confere as REGRAS publicadas
```

As cinco pegadinhas da seção 18.4 do spec são cobertas por
`tests/estrutura.test.ts`, que **varre os arquivos**: rota nova sem guarda quebra
a suíte. Não desative esses testes.

---

## 9. Verificação manual em aparelho

A seção 22.2 do spec exige registrar em que aparelho a coisa foi realmente
testada, porque nenhuma suíte prova isto.

| Verificação | Resultado | Aparelho |
|---|---|---|
| QR lido pela câmera nativa | **funcionou** — 20/09/2026 | **iPhone 13 mini** |
| `.vcf` abriu e salvou o contato | **funcionou** — 20/09/2026 | **iPhone 13 mini** |
| Envio do link por WhatsApp | **funcionou** — 20/09/2026 | **iPhone 13 mini** |
| Etiqueta NTAG215 gravada e lida | **previsto para a semana de 22/09/2026** — etiquetas e cartões já comprados | iPhone 13 mini |

**O que o iPhone 13 mini prova e o que não prova.** Ele é iPhone XS ou mais
novo, então a leitura de etiqueta NFC em segundo plano funciona nele (regra
11.6) — o teste de NFC que vem tem chance real de passar. O que ele **não**
prova é o lado Android: o `.vcf` é lido por implementações diferentes lá, e é
justamente onde a versão 3.0 foi escolhida em vez da 4.0 (spec 14.1). **Um
teste em Android continua pendente**, e é o que fecharia o critério 8.6.7.

> **Ainda falta a versão do iOS.** O modelo já ajuda, mas se um dia alguém
> relatar que o contato não salva, a pergunta será *em que versão isso já
> funcionou* — e a resposta hoje é "num iPhone 13 mini, versão não registrada".
