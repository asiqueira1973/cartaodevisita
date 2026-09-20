# SDD — Cartão de Visita

Cartão de visitas digital com endereço público, QR code e salvar-em-contatos.

| | |
|---|---|
| **Versão do documento** | 1.0 |
| **Status** | rascunho — aguarda revisão da seção 24 |
| **Responsável de produto** | Alexandre Siqueira |
| **Data** | 20 de setembro de 2026 |
| **Projeto de referência** | ViraPágina (`~/ViraPagina`) — mesma stack, mesmas convenções, mesmos padrões de guarda |

> **Placeholders a substituir antes de implementar.** O nome e o domínio ainda não
> foram escolhidos (pendência de busca no registro.br — ver seção 25). Em todo o
> documento, `Cartão de Visita` é o nome do produto e `cartaodevisita.app.br` é o domínio.
> São dois find-and-replace e nada mais depende deles.

---

## Como usar este documento

Este é o documento-fonte do produto. Ele é escrito para ser colado inteiro num
agente de código (Claude Code) como entrada de implementação, e para continuar
sendo a referência depois que o código existir.

Quem consome: o agente de código, na implementação inicial; e qualquer pessoa ou
agente que for mexer no projeto depois.

**Antes de gerar qualquer código, revise a seção 24 (Assunções declaradas).** Ela
contém as decisões que foram tomadas sem consulta, por serem de baixo impacto ou
por não valerem uma rodada de conversa. Assunção não revisada vira verdade no
minuto em que o agente começa a codar, e desfazer depois custa mais do que ler
agora.

A numeração das seções é estável e referenciada em comentários de código, no
prompt de implementação e em conversas futuras. Não renumere; se precisar
inserir, use subitens.

---

## 0. Princípios não-negociáveis

Estas são as regras de desempate. Quando houver dúvida de UX, de copy ou de
trade-off técnico que o documento não resolve, decida a favor destes princípios,
nesta ordem.

**0.1 — Quem recebe o cartão não instala nada, não cria conta e não faz login.**
O lado de quem recebe é web pura, pública, sem cadastro. Qualquer funcionalidade
que exija que o destinatário se identifique está fora, por definição. Este
princípio é o que separa este produto dos concorrentes que exigem o app dos dois
lados.

**0.2 — A página pública do cartão é a tela mais rápida do produto.**
Ela é lida em pé, num evento, no 4G ruim do centro de convenções, por alguém que
acabou de encostar o celular numa etiqueta. O conteúdo principal renderiza no
servidor e não depende de JavaScript. Nenhuma decisão de conveniência do painel
pode custar milissegundo nela.

**0.3 — WhatsApp é o canal principal, não "mais um link".**
O botão de WhatsApp é o primeiro elemento de ação da página, com a maior área de
toque, sempre. Os concorrentes internacionais tratam WhatsApp como um ícone entre
doze; no Brasil ele é o único que importa na maioria dos casos. É aqui que o
produto ganha.

**0.4 — O endereço permanente nunca muda, o endereço bonito pode mudar.**
Todo endereço que pode virar físico — QR impresso, etiqueta NFC gravada e travada,
print de tela — aponta para a URL permanente e opaca. O handle bonito é apelido.
Quem grava handle em objeto físico transforma toda troca de nome em cartão morto.

**0.5 — Simplicidade antes de complexidade prematura.**
Uma conta tem um cartão. Não há cobrança. Não há equipe, não há organização, não
há papel além dos dois que existem. Campo "para depois" não entra no modelo de
dados; épico adiado mora na seção 28 e não deixa resíduo no código.

---

## 1. Visão e problema

**O que é.** `Cartão de Visita` é uma plataforma web onde um profissional liberal monta,
em poucos minutos e de graça, um cartão de visitas digital com endereço público
próprio (`cartaodevisita.app.br/alexandre`). A página mostra foto, nome, cargo, uma
linha de apresentação e os canais de contato — com WhatsApp em primeiro lugar —,
exibe um QR code do próprio endereço para quem estiver do outro lado apontar a
câmera, e oferece um botão que salva tudo na agenda do celular de quem recebeu.

**Para quem.** O **autônomo brasileiro que trabalha sozinho**. Não é o executivo de
empresa grande trocando contato em conferência — é a psicanalista com consultório
próprio, o arquiteto, o dentista, o personal, a nutricionista, o fotógrafo, o
corretor, o representante comercial, e o prestador de serviço que vai à casa do
cliente: eletricista, técnico de ar-condicionado, montador, chaveiro, instalador.

O traço comum não é a profissão, é a estrutura: **uma pessoa, sem equipe, sem TI,
sem marketing, cujo canal de trabalho é o WhatsApp e cujo "site" hoje é a bio do
Instagram.** Essa pessoa não vai configurar integração, não vai ler documentação e
não vai assinar nada em dólar.

**A dor.** Trocar contato pessoalmente ainda é ruim. Cartão de papel é caro em
lote, fica desatualizado no dia em que você troca de telefone, e morre no fundo da
carteira de quem recebeu. Ditar o Instagram em voz alta num lugar barulhento falha.
Mandar "meu contato" por WhatsApp exige que a pessoa já esteja no seu WhatsApp —
que é exatamente o que você está tentando resolver. E o vCard que o celular gera
sozinho não leva Instagram, LinkedIn nem site.

**Por que agora.** A leitura de etiqueta NFC passou a funcionar sem app instalado
em todo iPhone de 2018 em diante e em praticamente todo Android — o destinatário
encosta e a página abre. Isso torna viável, pela primeira vez, um produto em que
só quem tem o cartão precisa da conta.

### 1.1 Anti-escopo — o que este produto explicitamente não é

| Não é | Por quê |
|---|---|
| Um construtor de sites | Uma página, um layout escolhido entre poucos, zero editor livre. Quem quer site usa outra coisa. |
| Um link-in-bio (Linktree) | O objeto aqui é a **identidade profissional** com foto, cargo e salvar-em-contatos — não uma lista de links de campanha com analytics de clique por link. |
| Um CRM ou gerenciador de leads | Não captura dados de quem visita, não tem formulário de contato, não guarda quem escaneou. Ver seção 20. |
| Uma rede social | Não há perfil de terceiros, seguir, feed, busca de pessoas nem diretório público. |
| Um produto de equipe | Sem organização, sem cartão corporativo, sem administrador de time. Uma conta, uma pessoa, um cartão (princípio 0.5). |
| Um app de celular | A v1 é web. Ver seção 4.1 e seção 28. |

### 1.2 Posicionamento: por que os concorrentes não servem a este público

A categoria é disputada — HiHello, Popl, Blinq, Linq, Mobilo, V1CE. Todos são
produtos bons, e **nenhum deles é feito para o autônomo brasileiro.** Eles
convergem para o mesmo lugar: cartão digital como ferramenta corporativa,
vendida para o time de vendas de uma empresa.

| O que eles fazem | O que isso significa para a Dani, psicanalista |
|---|---|
| Painel de equipe, cartão corporativo, controle de marca | Complexidade que ela nunca vai usar, ocupando a primeira tela |
| Captura de lead e integração com CRM (Salesforce, HubSpot) | Não existe CRM. Existe a agenda do consultório |
| Assinatura em dólar, a partir de ~US$ 6/mês por usuário | Preço em moeda estrangeira, cobrado em cartão internacional, por algo que ela usa uma vez por mês |
| WhatsApp como um ícone entre doze | Inverte a realidade: no Brasil o WhatsApp **é** o contato, o resto é decoração |
| Interface e conteúdo em inglês | Barreira real para boa parte do público |
| Exigem o app dos dois lados em alguns fluxos | Quem recebe não instala nada, nunca (princípio 0.1) |

**A aposta:** não competir em robustez. Competir em **caber**. Um produto que faz
menos, em português, de graça, com o WhatsApp no lugar certo, e que fica pronto em
cinco minutos numa tela de celular.

Consequências diretas no escopo, para que este posicionamento não seja só um
parágrafo bonito:

- Nada de equipe, organização ou cartão corporativo — está no anti-escopo 1.1 e sai do modelo de dados (princípio 0.5).
- Nada de captura de lead ou integração com CRM — anti-escopo 1.1 e seção 20.2.
- Botão de WhatsApp com peso visual maior que todo o resto, em **todos** os templates (princípio 0.3, seção 16.3).
- Chave PIX como tipo de link de primeira classe (seção 7.7) — nenhum concorrente internacional tem, e para o prestador de serviço que recebe na hora isso vale mais que o LinkedIn.
- Grátis na v1, e quando houver cobrança, em real (seção 28.2).

### 1.3 O caso que resume o produto

O técnico de ar-condicionado termina o serviço, tira o celular do bolso, abre seu
cartão em tela cheia e vira a tela para a cliente. Ela aponta a câmera, o cartão
abre, ela toca em "Salvar nos contatos". Ele ganhou um contato salvo com foto,
nome e WhatsApp na agenda dela — em vez de um papel amassado que ela ia perder, ou
de um número ditado errado.

Nenhuma das duas pessoas instalou nada. Só uma delas tem conta.


---

## 2. Personas e cenários de uso

### 2.1 Quem usa o painel — o dono do cartão

A Dani (psicanalista, consultório próprio), o arquiteto, o dentista, o técnico que
atende em domicílio, o vendedor autônomo. De 28 a 55 anos, monta o cartão uma vez —
**provavelmente no celular, não no computador** — e depois quase não volta. Mexe de novo quando troca de telefone, de
emprego ou de foto. **Não é usuário frequente, e o produto não deve fingir que é:**
nada de gamificação, de notificação de engajamento, de "complete seu perfil 80%".

O momento mais difícil do painel é o **primeiro**: escolher o endereço. É a única
decisão irreversível-ish do produto (o handle pode mudar, mas a URL que ele já
mandou para alguém quebra). A tela de escolha precisa sugerir um handle pronto,
verificar disponibilidade enquanto digita e explicar em uma frase o que acontece.

### 2.2 Quem recebe — o destinatário

Não sabe o que é `Cartão de Visita`, nunca vai criar conta, e provavelmente nunca mais
volta à página. Chega por um destes quatro caminhos: link no WhatsApp, QR apontado
na tela de outro celular, QR impresso, ou encostando o celular numa etiqueta NFC.

O momento mais difícil é **o evento**: em pé, segurando um copo, celular na outra
mão, barulho, internet ruim, três segundos de atenção. É esse momento que define a
arquitetura — daí o princípio 0.2 (renderização no servidor, sem depender de JS) e
o princípio 0.3 (WhatsApp primeiro, área de toque grande).

O segundo momento difícil é **salvar o contato**: se o botão de salvar gerar um
arquivo que o iPhone abre num visualizador confuso, a pessoa desiste. A seção 14
especifica o vCard com precisão de byte justamente por isso.

### 2.3 Cenário de borda que o desenho precisa cobrir

**O destinatário de iPhone com a tela apagada.** A leitura de NFC em segundo plano
só acontece com o display ligado (seção 11.6). Se a pessoa encosta o celular
bloqueado e apagado na etiqueta, não acontece nada — e ela conclui que o produto
não funciona. Por isso o QR code é o mecanismo principal da v1 e o NFC é assunto
de roadmap (seção 28.1), não o contrário.

---

## 3. Escopo do MVP

### 3.1 Dentro

1. Entrar com Google, conta criada no primeiro acesso.
2. Escolher o endereço público (handle), com verificação de disponibilidade.
3. Editar o cartão: foto, nome de exibição, cargo, empresa, uma linha de bio.
4. Adicionar, remover e reordenar canais de contato e links.
5. Escolher um entre os layouts disponíveis e uma cor de destaque da paleta.
6. Página pública do cartão, renderizada no servidor, em `/<handle>`.
7. Rota permanente `/c/<id_permanente>` que redireciona para o cartão.
8. QR code do endereço permanente: na página, em tela cheia e para baixar em PNG.
9. Botão "Salvar nos contatos" que entrega um `.vcf` com foto embutida.
10. Botão de WhatsApp com mensagem inicial configurável.
11. Publicar e despublicar o cartão.
12. Contador de visitas, agregado por dia e por origem.
13. Ajustes da conta: trocar handle, sair, excluir conta e dados.
14. Painel administrativo da plataforma: listar contas, ver uma conta, despublicar cartão por denúncia, trocar handle.
15. Página inicial de marketing, termos de uso e política de privacidade.
16. **Estrutura de planos** — gratuito, early adopter e ilimitado —, com a abertura a early adopters controlada por variável de ambiente. Ver seção 11.11.

### 3.2 Fora

| Item | Destino | Motivo / dependência |
|---|---|---|
| Gravação de etiqueta NFC pelo produto | **v2** — seção 28.1 | Web NFC só existe no Chrome do Android (~6% de suporte global) e o iPhone nunca terá em navegador. Gravar no iPhone exige app nativo. A v1 orienta o uso do NFC Tools, que é grátis e resolve. |
| **Cobrança** — meio de pagamento, assinatura, webhook, fatura | **v2** — seção 28.2 | Decisão de produto: v1 grátis para validar. Mesmo caminho do ViraPágina, onde a cobrança foi desenhada e deliberadamente não implementada. **Nenhum campo de pagamento entra no modelo de dados agora**, nem "só a estrutura". ⚠️ **Não confundir com a estrutura de planos, que está DENTRO do MVP** (seção 11.11): o campo `plano` existe e funciona desde a v1; o que não existe é forma de pagar por ele. |
| Venda de etiqueta NFC física | **v2** — seção 28.3 | Exige pedido, endereço, frete e logística de gravação em lote. É um negócio adjacente, não uma feature. |
| Vários cartões por conta | **v2** — seção 28.4 | Conta = cartão na v1 (princípio 0.5). O caso "pessoal + empresa" existe, mas é minoria e dobra a complexidade de modelo e de navegação. |
| Domínio próprio do usuário | **v2** — seção 28.5 | Exige verificação de DNS e emissão de certificado por tenant. |
| Analytics por link clicado | **v2** — seção 28.6 | A v1 conta visita à página, não clique em link. Rastrear clique exige redirecionador próprio, que piora a latência da página (princípio 0.2). |
| App nativo iOS/Android | **v2** — seção 28.1 | O único motivo real para existir é gravar NFC no iPhone. Ver a avaliação em 4.1. |
| Modo escuro | **descartado na v1** | O cartão é uma peça de identidade visual com cor de destaque escolhida pelo dono; herdar o tema do sistema do visitante desfiguraria o cartão de outra pessoa. O painel segue o tema do sistema; a página pública, não. |
| Importar contato do cartão de papel por foto/OCR | **descartado** | Resolve o problema de quem *recebe* cartão de papel — produto diferente, e fora do anti-escopo 1.1. |
| Diretório público / busca de pessoas | **descartado** | Transformaria uma ferramenta pessoal numa rede social e criaria um alvo de scraping com valor comercial. Ver seção 20. |

---

## 4. Arquitetura

### 4.1 A decisão que define tudo: web, não app

O lado do destinatário **tem de ser web** — QR code e etiqueta NFC abrem URL, e o
princípio 0.1 proíbe exigir instalação. Isso não é preferência, é consequência.

Resta a pergunta de se o **editor** precisa ser app nativo. Não precisa:

| Critério | Web | App nativo |
|---|---|---|
| Editor (formulário com foto e links) | resolve | resolve, com mais trabalho |
| Publicação de correção | minutos | dias, via App Review |
| Alcance | iPhone, Android e desktop com uma base | uma base por plataforma |
| Gravar etiqueta NFC no iPhone | **impossível** | possível, via Core NFC |
| Gravar etiqueta NFC no Android | possível no Chrome (Web NFC) | possível |

A única coluna em que o app ganha é a gravação de NFC no iPhone — e ela não
justifica um app na v1, porque há dois caminhos melhores antes (seção 28.1): usar
o NFC Tools, que é gratuito e já existe, ou vender a etiqueta já gravada, que é
como o mercado realmente monetiza.

**Decisão: web.** **Alternativa descartada:** app nativo primeiro, descartado
porque adiaria o produto em semanas para resolver um problema que afeta uma
funcionalidade que nem está no MVP.

### 4.2 Stack

Mesmo padrão do ViraPágina, para reaproveitar conhecimento, convenções e os
padrões de guarda já testados. Onde este documento não especifica um detalhe de
infraestrutura, **siga o que o ViraPágina faz.**

| Camada | Escolha | Versão | Por quê |
|---|---|---|---|
| Framework | Next.js (App Router) | 15.5.x | Mesmo do ViraPágina. Renderização no servidor é requisito do princípio 0.2, não preferência. |
| Runtime de UI | React | 19.1.x | Acompanha o Next. |
| Linguagem | TypeScript | 5.x | `strict: true`. |
| Estilo | Tailwind CSS | 4.x | Mesmo do ViraPágina. |
| Autenticação | Auth.js (NextAuth) v5 + provedor Google | 5.0.0-beta.x | Já configurado e testado no ViraPágina; `lib/auth.ts` sem dependência de Firebase, para rodar no Edge. |
| Dados | Cloud Firestore, via Admin SDK no servidor | firebase-admin 13.x | Mesmo do ViraPágina. O modelo é raso e lido por chave — não há consulta relacional que justifique Postgres. |
| Arquivos | Cloud Storage for Firebase, via Admin SDK | firebase-admin 13.x | Guarda as fotos. |
| QR code | `qrcode` (npm), gerando **SVG no servidor** | 1.5.x | SVG no servidor não custa JavaScript no cliente (princípio 0.2) e escala sem perda para o download em PNG. |
| Testes | Vitest | 3.x | Mesmo do ViraPágina, incluindo a suíte contra o emulador. |
| Hospedagem | Vercel | — | Mesmo do ViraPágina. |
| Domínio | `cartaodevisita.app.br` | — | Registrado; apontamento pendente (pergunta 25.1). |
| Projeto Firebase | `cartao-de-visita-60325` | — | Bucket: `cartao-de-visita-60325.firebasestorage.app`. Plano Blaze exigido pelo Storage (seção 4.6). |

**Premissa a validar:** que o plano gratuito do Firestore/Storage comporta o
volume previsto na seção 17.4. A validar quando passar de 500 contas.

### 4.3 Endereços: a arquitetura de URL

Esta é a decisão de arquitetura mais consequente do produto, e ela existe por
causa do princípio 0.4.

**Subpasta, não subdomínio.** Cada cartão vive em `cartaodevisita.app.br/<handle>`.

| | Subdomínio `alexandre.cartaodevisita.app.br` | **Subpasta `cartaodevisita.app.br/alexandre`** |
|---|---|---|
| DNS | curinga | nada |
| Certificado | curinga, via desafio DNS-01 | o do domínio |
| Provisionamento | por conta | nenhum |
| URL para ditar/imprimir | mais longa | mais curta |
| SEO | autoridade fragmentada | concentrada |

Não há ganho de isolamento: são páginas públicas de leitura, não aplicações por
cliente. **Alternativa descartada:** subdomínio por conta, descartado por custar
infraestrutura e comprimento de URL sem entregar nada em troca. O ViraPágina já
usa subpasta (`/[handle]`) pelo mesmo motivo.

**Dois endereços, com papéis distintos:**

| Endereço | Muda? | Serve para | Vai parar em objeto físico? |
|---|---|---|---|
| `/<handle>` | pode mudar | compartilhar por link, ditar, colocar na bio | não |
| `/c/<id_permanente>` | **nunca** | QR code e etiqueta NFC | **sim** |

`/c/<id_permanente>` responde **308** para `/<handle>` atual. A regra prática:
tudo que pode virar físico aponta para o permanente; tudo que a pessoa lê ou
digita usa o bonito. Sem essa separação, trocar de handle mata todo QR já impresso
e toda etiqueta já gravada e travada.

Efeito colateral bem-vindo: como o acesso por QR/NFC chega por um caminho
diferente, dá para contar a origem da visita sem rastrear ninguém (seção 11.8).

### 4.4 Onde o código vive

Repositório `Cartão de Visita` no GitHub, conectado à Vercel. Branch `main` é produção.
Preview automático por pull request.

### 4.5 Dependências externas

| Serviço | Para quê | Quebra o quê se cair |
|---|---|---|
| Google Identity (via Auth.js) | login do dono do cartão | o painel. **A página pública continua no ar** — ela não toca em autenticação. |
| Cloud Firestore | dados das contas e cartões | tudo, inclusive a página pública. |
| Cloud Storage | fotos | a foto do cartão; o resto da página renderiza. |
| Vercel | hospedagem | tudo. |
| Visão de Produto | telemetria **do painel**, nunca da página pública (seção 21.3) | nada. A chamada é disparada e esquecida, falha em silêncio e jamais bloqueia a interface. |

Nenhum serviço de e-mail transacional, nenhum gateway de pagamento e **nenhum
analytics na página pública**. A ausência é deliberada: menos dependência, menos
dado de visitante trafegando (seção 20).

### 4.6 Custo: por que Firebase e não Supabase

A pergunta é legítima — Supabase é relacional, tem RLS de verdade e seria uma
escolha melhor de modelagem. Ela perde por um motivo que não tem a ver com
modelagem.

**O fator decisivo: o plano gratuito do Supabase pausa o projeto após 7 dias sem
requisição.** Num produto de cartão de visitas isso é fatal. Um cartão pode passar
semanas sem uma única visita — é o comportamento *normal* de quem trocou de
emprego e não foi a nenhum evento no mês. Quando alguém finalmente encostar o
celular na etiqueta NFC, a página tem que abrir. Um produto cuja página pública sai
do ar porque ninguém a visitou é um produto morto, e a correção custa **US$ 25/mês
por organização**, que é justamente o custo que se quer evitar na v1.

**O Firebase não pausa nada, nunca.**

| | Firebase (Spark) | Supabase (Free) |
|---|---|---|
| Pausa por inatividade | **não** | **sim, em 7 dias** |
| Banco | 1 GB, 50.000 leituras/dia, 20.000 escritas/dia | 500 MB |
| Arquivos | 5 GB (Always Free do GCS) | 1 GB |
| Custo para sair do gratuito | pay-as-you-go, centavos | US$ 25/mês, degrau seco |
| Já em uso no ViraPágina | **sim** | não |

**A pegadinha do Firebase, registrada para não virar surpresa:** desde fevereiro de
2026 o Cloud Storage for Firebase exige **conta de faturamento vinculada (plano
Blaze)** mesmo para usar a cota gratuita. Ou seja: é preciso cadastrar cartão de
crédito para ter as fotos, ainda que a fatura fique em zero. O Firestore continua
funcionando no Spark sem cartão. **Configure um orçamento com alerta em R$ 20/mês
no Google Cloud antes de subir para produção** — isso está no Definition of Done
(seção 26).

#### 4.6.1 Projeção de custo

Com o desenho da seção 7, cada visita à página pública custa **2 leituras**
(`handles` → `cartoes`) e **1 escrita** (o incremento do contador).

| Cenário | Visitas/mês | Leituras/dia | Escritas/dia | Cabe no gratuito? |
|---|---|---|---|---|
| 100 cartões, 30 visitas cada | 3.000 | 200 | 100 | folgado |
| 1.000 cartões, 50 visitas cada | 50.000 | 3.300 | 1.600 | folgado |
| 5.000 cartões, 50 visitas cada | 250.000 | 16.600 | 8.300 | ainda cabe |
| **Teto do plano Spark** | ~750.000 | 50.000 | 20.000 | limite |

O gargalo é a **escrita**, não a leitura: 20.000 escritas/dia significam 20.000
visitas/dia. Fotos: ~140 KB por cartão (600×600 e 300×300 somadas), então 5 GB
comportam cerca de **35.000 cartões**.

**Conclusão: o produto roda de graça até um volume que seria uma excelente notícia
ter.** Quando chegar lá, a seção 28.2 (cobrança) já estará justificada pelo próprio
volume.

#### 4.6.2 A decisão de cache que mantém o custo em zero

**Cacheia-se a leitura, não a página.** `buscarCartaoPorHandle()` é embrulhada em
cache com revalidação de 60 segundos; a página continua sendo renderizada a cada
requisição.

Por que não cachear a página inteira: com a página em cache, o servidor não roda a
cada visita, e o contador de visitas precisaria de um pixel ou de JavaScript no
cliente — um contraria a seção 20.2, o outro contraria o princípio 0.2. Cacheando
só a leitura, as duas leituras do Firestore caem para perto de zero em cartões com
tráfego, a escrita do contador continua acontecendo no servidor, e a página segue
funcionando sem JavaScript.

**Efeito:** um cartão visitado 50 vezes numa hora custa 2 leituras, não 100.

**Alternativa descartada:** Supabase, descartada pela pausa por inatividade.
**Segunda alternativa descartada:** Postgres gerenciado em outro provedor (Neon,
Railway), descartada por acrescentar um fornecedor que o ViraPágina não usa, sem
resolver nada que o Firestore não resolva neste modelo de dados raso.

---

## 5. Perfis de usuário e matriz de permissões

Dois perfis, e só. Não há papel de equipe, de editor nem de convidado (princípio 0.5).

| Perfil | Quem é | Como se torna |
|---|---|---|
| **Dono** | Qualquer pessoa que entrou com o Google. Tem uma conta e um cartão. | Autocadastro: a conta nasce no primeiro login (seção 6.2). |
| **Admin da plataforma** | Você. Modera conteúdo denunciado e dá suporte. | Allowlist de e-mails em código (`lib/admins.ts`), igual ao ViraPágina. Não é campo de banco, não é promovível pela interface. |
| *(Visitante)* | Quem abre um cartão. **Não é perfil** — não tem conta, não se identifica, não é rastreado. | — |

### 5.1 Matriz ação × perfil

O que importa em cada célula é o **escopo**, não o sim/não.

| Ação | Visitante | Dono | Admin |
|---|---|---|---|
| Ver cartão publicado | ✅ qualquer um | ✅ qualquer um | ✅ qualquer um |
| Ver cartão **não publicado** | ❌ 404 | ✅ **só o próprio**, em pré-visualização | ✅ qualquer um |
| Criar conta | ✅ por login Google | — | — |
| Editar dados do cartão | ❌ | ✅ **só o próprio** | ❌ **nunca** — admin modera, não edita conteúdo alheio |
| Subir/remover foto | ❌ | ✅ **só a própria** | ❌ |
| Escolher handle | ❌ | ✅ **só o próprio**, se livre | ✅ de qualquer conta (suporte e conflito de marca) |
| Publicar / despublicar | ❌ | ✅ **só o próprio** | ✅ **só despublicar**, de qualquer conta, por denúncia |
| Ver contador de visitas | ❌ | ✅ **só as próprias** | ✅ de qualquer conta |
| Listar todas as contas | ❌ | ❌ | ✅ |
| Excluir conta e dados | ❌ | ✅ **só a própria** | ❌ — exclusão é direito do titular, não ação de moderação |
| Ver e-mail de outra conta | ❌ | ❌ | ✅ |
| Ver o próprio plano | ❌ | ✅ **só o próprio** | ✅ de qualquer conta |
| **Alterar plano de uma conta** | ❌ | ❌ **nunca** | ✅ de qualquer conta |

### 5.2 Regras que decorrem da matriz

- **Admin não edita conteúdo alheio.** Ele despublica e troca handle; não mexe em
  foto, texto nem links. Isso mantém a responsabilidade pelo conteúdo com o dono e
  evita a pergunta "quem escreveu isso no meu cartão?".
- **Admin não exclui conta.** Exclusão é ato do titular (seção 20.4). Se for
  preciso remover uma conta por ordem judicial, isso é operação manual
  documentada, não botão.
- **Toda ação de admin é registrada** em `acoes_admin`, com quem fez, o quê, em
  qual conta e quando (seção 7.6). Sem exceção.

### 5.3 Como nasce o primeiro admin

Por allowlist em código: `lib/admins.ts` exporta a lista de e-mails, sem nenhum
`import`, para não criar ciclo de dependência — mesmo arquivo e mesmo motivo do
ViraPágina. Mudar a lista exige commit e deploy, que é exatamente a barreira
desejada. Não há tela para promover admin, e não deve haver.

### 5.4 Escopo de dados

Não há tenant, organização nem departamento. O escopo de todo dado é o
`usuario_id`, e a regra é única: **uma conta só enxerga o que é dela.** A guarda
que implementa isso está em 6.5.

---

## 6. Autenticação e identidade

### 6.1 Como a pessoa se identifica

**Login com Google, e só.** Auth.js v5 com o provedor Google.

Por quê: o público-alvo tem conta Google (Android é maioria no Brasil, e quem tem
iPhone quase sempre tem Gmail); e não ter senha elimina de uma vez o fluxo de
recuperação, o e-mail transacional, o armazenamento de hash e a superfície de
ataque de credencial. O ViraPágina já roda assim em produção.

**Alternativa descartada:** e-mail com link mágico, descartado por exigir um
provedor de e-mail transacional e mais um fluxo para manter e testar, sem cobrir
um público que hoje esteja de fora. Está registrado como pergunta aberta 25.3
caso apareça demanda real.

O identificador interno é o `uid` do Google (`sub`), não o e-mail — e-mail muda.

### 6.2 Como a conta é criada

Autocadastro no primeiro login. Não há tela de cadastro, não há convite, não há
criação por admin.

A conta nasce **dentro de `requireDono()`**, na primeira rota autenticada que a
pessoa tocar — mesmo padrão do `requireAutor()` do ViraPágina. Motivo: criar a
conta no callback do Auth.js colocaria o Firebase Admin SDK no caminho do Edge
Runtime, que é justamente o que `lib/auth.ts` evita.

A conta nasce com:

| Campo | Valor inicial |
|---|---|
| `handle` | **nulo** — único estado em que a conta existe sem endereço público |
| `id_permanente` | gerado e reservado **no mesmo momento da escolha do handle**, não antes |
| `publicado` | `false` |
| cartão | documento criado vazio, com `nome_exibicao` preenchido com o nome do Google |

Enquanto `handle` for nulo, **todo o painel redireciona para `/conta/handle`**.

### 6.3 Primeiro acesso

1. `/entrar` → botão único "Entrar com o Google".
2. Volta autenticado, sem handle → `/conta/handle`.
3. A tela sugere um handle derivado do nome do Google (normalizado conforme 11.1);
   se estiver ocupado, sugere com sufixo numérico.
4. Ao confirmar, `reservarHandle()` grava a reserva e o `id_permanente` numa
   operação só (seção 7.3).
5. Vai para `/conta` com o cartão já pré-preenchido com nome e foto do Google.

Não há troca de senha obrigatória, porque não há senha.

### 6.4 Recuperação de acesso

**Não existe fluxo de recuperação, e isso é decisão, não esquecimento.** Quem
perde acesso à conta Google perde acesso à conta do produto. O caminho oficial é
recuperar a conta Google com o próprio Google.

O que o produto oferece: o texto de ajuda em `/conta/ajustes` explica isso em uma
frase, e o e-mail de suporte está na página de termos. Caso alguém perca a conta
Google de vez, a saída é criar conta nova — e o handle antigo só é liberado por
ação manual de admin, com verificação de identidade fora do sistema.

### 6.5 Sessão e guardas

- Sessão por cookie do Auth.js, JWT, validade de 30 dias, renovada a cada acesso.
- Logout limpa a sessão e volta para a home.
- `middleware.ts` protege `/conta/:path*`: sem sessão, redireciona para `/entrar`
  com `?voltar=<destino>`. **As rotas `/admin/*` não passam pelo middleware** —
  elas devolvem 404 para quem não é admin, inclusive para quem não está logado,
  e quem faz isso é o layout com `notFound()`. Redirecionar para o login já
  confirmaria que a rota existe. Mesmo desenho do ViraPágina.

**As guardas, em `lib/guards.ts`:**

| Guarda | Onde | O que faz |
|---|---|---|
| `requireDono()` | **primeira linha** de toda rota `/api/conta/*` | Sem sessão → `401`. Com sessão → garante que a conta existe (é aqui que ela nasce) e devolve o documento. Sem handle → `409` com o destino da tela de escolha. |
| `requireAdminPlataforma()` | **primeira linha** de toda rota `/api/admin/*` | E-mail fora da allowlist → `404`, nunca `403`. |

### 6.6 Autorização nos dados

Firestore não tem RLS. **As guardas são a única camada de autorização** — as regras
de segurança do Firestore (`firestore.rules`, `storage.rules`) negam **todo**
acesso do cliente, e existem para garantir que não há segunda porta, não para
autorizar.

| Coleção | Regra do cliente | Quem lê/escreve de fato |
|---|---|---|
| `usuarios` | negado | servidor, via Admin SDK |
| `handles` | negado | servidor |
| `ids_permanentes` | negado | servidor |
| `cartoes` | negado | servidor |
| `visitas_diarias` | negado | servidor |
| `acoes_admin` | negado | servidor |

#### 6.6.1 Publicar as regras não é opcional, e esquecer é o modo de falha

**Arquivo no repositório não é regra no ar.** Há três formas de terminar com o
banco aberto, e todas são silenciosas:

1. Editar `firestore.rules` e **nunca publicar** — o repositório mente e o banco fica com a regra antiga.
2. Editar no console do Firebase — o banco muda e o repositório mente.
3. Criar o projeto em **"modo de teste"**, que nasce com `allow read, write: if true` até uma data. Qualquer pessoa com o id do projeto lê e escreve tudo, e nada na interface avisa.

Por isso `scripts/diagnostico.mjs` **compara o repositório com o que está
publicado** e falha quando divergem ou quando encontra regra permissiva. Rode-o
depois de qualquer mudança em `.rules` e antes de qualquer release:

```bash
npm run diagnostico     # confere; falha se divergir ou se estiver permissivo
npm run deploy:rules    # publica firestore.rules e storage.rules
```

Conferido em 20/09/2026: o projeto `cartao-de-visita-60325` nasceu em modo de
produção, e as duas regras publicadas já batem com as do repositório.

**Nenhuma chamada ao Firestore ou ao Storage acontece no navegador.** Sempre em
rota de servidor ou componente de servidor. Esta é uma das pegadinhas da seção 18.

---

## 7. Modelo de dados

Cloud Firestore. Nomes de coleção e de campo em **português**, `snake_case`,
conforme a convenção da seção 18.1.

Modelo raso de propósito: tudo que a página pública precisa está em **uma leitura
por chave**, porque o princípio 0.2 não tolera duas viagens ao banco para pintar o
cartão.

### 7.1 Diagrama de relacionamento

```
                    ┌──────────────┐
                    │   usuarios   │  id = uid do Google
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┬─────────────────┐
        │ 1:1              │ 1:1              │ 1:1             │ 1:N
        ▼                  ▼                  ▼                 ▼
  ┌───────────┐   ┌─────────────────┐   ┌──────────┐   ┌──────────────────┐
  │  handles  │   │ ids_permanentes │   │ cartoes  │   │ visitas_diarias  │
  │ id=handle │   │ id=id_permanente│   │ id=uid   │   │ id=uid_AAAA-MM-DD│
  └───────────┘   └─────────────────┘   └────┬─────┘   └──────────────────┘
                                             │ embutido (array)
                                             ▼
                                        ┌──────────┐
                                        │  links   │
                                        └──────────┘

  ┌──────────────┐
  │ acoes_admin  │  id automático — referencia usuarios.id, sem relação forçada
  └──────────────┘
```

Cardinalidades em português de negócio:

- Um usuário tem **exatamente um** handle reservado (depois da escolha) e **exatamente um** id permanente.
- Um usuário tem **exatamente um** cartão. Não existe usuário sem cartão depois do primeiro acesso, nem cartão sem usuário.
- Um cartão tem **de zero a quinze** links, guardados dentro do próprio documento.
- Um usuário tem **muitos** registros de visitas diárias, um por dia em que houve ao menos uma visita.

### 7.2 `usuarios`

Id do documento: o `uid` do Google.

| Campo | Tipo | Nulo? | Default | Descrição |
|---|---|---|---|---|
| `email` | string | não | — | E-mail do Google. Só o admin vê. |
| `nome_google` | string | não | — | Nome vindo do provedor, usado para sugerir o handle e pré-preencher o cartão. |
| `foto_google_url` | string | **sim** | `null` | URL da foto do Google. Nulo quando o perfil não tem foto. Só sugestão inicial — não é a foto do cartão. |
| `handle` | string | **sim** | `null` | Nulo entre o primeiro login e a escolha do endereço. É o único estado em que a conta existe sem URL pública. |
| `id_permanente` | string | **sim** | `null` | Nulo pelo mesmo motivo — nasce junto com o handle. Ver 7.4. |
| `criado_em` | timestamp | não | agora | |
| `ultimo_acesso_em` | timestamp | não | agora | Atualizado por `requireDono()`, no máximo uma vez por dia, para não escrever a cada requisição. |
| `bloqueado` | boolean | não | `false` | Marcado por admin quando o conteúdo viola os termos. Cartão de conta bloqueada responde 404. |
| `plano` | enum `plano_conta` | não | ver 11.11 | O que a conta pode fazer. O valor inicial **depende da variável `EARLY_ADOPTER_ABERTO` e da allowlist de ilimitados** no momento da criação — ver regra 11.11. |
| `plano_anterior` | enum `plano_conta` | **sim** | `null` | Guarda o plano de antes de a conta virar `ilimitado` pela allowlist, para poder voltar se o e-mail sair da lista (regra 11.11.4). Nulo em toda conta que nunca foi promovida pela allowlist. |

**Índices:** `handle` (único por construção, via `handles`), `criado_em` decrescente
para a listagem do admin.

### 7.3 `handles` — a reserva do endereço público

Id do documento: **o próprio handle, em minúsculas.** Esta coleção existe por um
motivo único: o id do documento é a chave de unicidade, e o `create` do Firestore
falha se o documento já existe. É o que faz um de dois cadastros simultâneos
perder. Sem ela, os dois venceriam.

| Campo | Tipo | Nulo? | Descrição |
|---|---|---|---|
| `usuario_id` | string | não | Dono do handle. |
| `criado_em` | timestamp | não | |

Padrão idêntico ao do ViraPágina (`reservarHandle()`), inclusive na lista de
handles reservados (regra 11.2).

**Exclusão:** hard delete. Quando o dono troca de handle, o documento antigo é
apagado e o handle volta para o pool. Quando a conta é excluída, idem. Não há
histórico de handle, de propósito — guardar rastro de endereços antigos de uma
conta excluída contraria a seção 20.4.

### 7.4 `ids_permanentes` — a reserva do endereço imutável

Id do documento: **o próprio id permanente.** Mesmo padrão e mesmo motivo de 7.3:
garantir unicidade atômica na criação.

| Campo | Tipo | Nulo? | Descrição |
|---|---|---|---|
| `usuario_id` | string | não | Dono do id. |
| `criado_em` | timestamp | não | |

**Exclusão:** hard delete **apenas na exclusão da conta**. O id permanente **nunca
é trocado** em conta viva (princípio 0.4) — não existe operação de troca, e não
deve existir. O formato está na regra 11.3.

### 7.5 `cartoes`

Id do documento: **o mesmo `uid` do usuário** (1:1). Usar o mesmo id evita uma
consulta: quem tem o usuário tem o cartão, e vice-versa, por chave direta.

| Campo | Tipo | Nulo? | Default | Descrição |
|---|---|---|---|---|
| `usuario_id` | string | não | — | Redundante com o id do documento, guardado para consulta por campo. |
| `nome_exibicao` | string | não | nome do Google | O nome grande da página. Até 60 caracteres. |
| `cargo` | string | **sim** | `null` | "Arquiteta", "Corretor de imóveis". Nulo quando a pessoa não quis preencher. Até 60. |
| `empresa` | string | **sim** | `null` | Nulo para autônomo sem razão social. Até 60. |
| `bio` | string | **sim** | `null` | Uma linha de apresentação. Nulo por padrão. Até 160 caracteres — o limite é proposital: bio longa quebra o princípio 0.2 e transforma o cartão em site. |
| `foto_url` | string | **sim** | `null` | Foto de exibição, 600×600. Nulo quando a pessoa não subiu foto — a página mostra as iniciais. |
| `foto_vcard_url` | string | **sim** | `null` | Derivada 300×300 com teto de 80 KB, usada **só** para embutir no `.vcf`. Nula sempre que `foto_url` for nula. Ver 14.2. |
| `links` | array | não | `[]` | Ver 7.5.1. Máximo 15 (regra 11.4). |
| `template` | enum `template_cartao` | não | `minimalista` | Ver 16.3. |
| `cor_destaque` | enum `cor_destaque` | não | `azul` | Ver 16.2. Enum, não hexadecimal livre — ver o porquê em 16.2. |
| `publicado` | boolean | não | `false` | Cartão nasce despublicado. A pessoa publica quando achar que está pronto. |
| `permitir_indexacao` | boolean | não | `false` | Quando falso, a página emite `noindex, nofollow`. Ver 20.3. |
| `mensagem_whatsapp` | string | **sim** | `null` | Texto que já vem digitado ao abrir o WhatsApp. Nulo = usa o padrão da seção 15. Até 120 caracteres. |
| `atualizado_em` | timestamp | não | agora | |

**Exclusão:** hard delete junto com a conta.

#### 7.5.1 Estrutura de um item de `links`

Array embutido, não subcoleção. **Trade-off declarado:** um array embutido não
permite consultar ou contar links entre cartões, e obriga a reescrever o documento
inteiro a cada reordenação. Em troca, a página pública lê o cartão completo em uma
única leitura, que é o que o princípio 0.2 exige. Com teto de 15 itens, o custo de
reescrita é irrelevante. Se um dia houver analytics por link (seção 28.6), esta
decisão precisa ser revista.

| Campo | Tipo | Nulo? | Descrição |
|---|---|---|---|
| `id` | string | não | Identificador local do item, para a reordenação no cliente. |
| `tipo` | enum `tipo_link` | não | Ver 7.7. Determina o ícone, a validação e o formato final da URL. |
| `valor` | string | não | O dado cru: telefone em E.164, e-mail, usuário do Instagram sem `@`, URL completa para `site`. A normalização está na regra 11.5. |
| `rotulo` | string | **sim** | Texto alternativo do botão. Nulo = usa o rótulo padrão do tipo (seção 15.3). |
| `ordem` | número inteiro | não | Posição na página, começando em 0. |

### 7.6 `visitas_diarias`

Id do documento: `<usuario_id>_<AAAA-MM-DD>`, no fuso de São Paulo.

Agregado por dia, e não um documento por visita, por dois motivos: um documento
por visita cresceria sem limite e custaria caro, e — mais importante — **guardar
uma linha por visita é guardar comportamento de visitante**, que é justamente o
que a seção 20.2 proíbe.

| Campo | Tipo | Nulo? | Default | Descrição |
|---|---|---|---|---|
| `usuario_id` | string | não | — | |
| `data` | string `AAAA-MM-DD` | não | — | Fuso `America/Sao_Paulo` (regra 11.9). |
| `total` | inteiro | não | `0` | Visitas no dia, somando todas as origens. |
| `por_link` | inteiro | não | `0` | Chegou direto em `/<handle>`. |
| `por_codigo` | inteiro | não | `0` | Chegou por `/c/<id>` — QR ou NFC. |
| `salvou_contato` | inteiro | não | `0` | Baixou o `.vcf`. |
| `abriu_whatsapp` | inteiro | não | `0` | Clicou no botão de WhatsApp. |

Incremento atômico (`FieldValue.increment`). **Nenhum campo identifica o
visitante** — sem IP, sem user-agent, sem cookie, sem cidade.

**Exclusão:** hard delete junto com a conta.

### 7.7 Enums

```
tipo_link:
  whatsapp | telefone | email | instagram | linkedin | site
  youtube | tiktok | facebook | x | github | behance
  spotify | pix | endereco | outro

template_cartao:
  minimalista | cartao | foto | executivo

cor_destaque:
  azul | verde | roxo | vermelho | laranja | rosa | grafite | dourado

plano_conta:
  gratuito | early_adopter | ilimitado | pago

acao_admin:
  despublicou_cartao | alterou_handle | alterou_plano
  bloqueou_conta | desbloqueou_conta
```

O que cada valor significa no negócio está na seção 19.1 do documento de
documentação técnica, gerado ao fim da implementação.

### 7.8 `acoes_admin`

Id automático. Registro de auditoria de tudo que o admin faz (regra 5.2).

| Campo | Tipo | Nulo? | Descrição |
|---|---|---|---|
| `admin_email` | string | não | Quem fez. |
| `acao` | enum `acao_admin` | não | O quê. |
| `usuario_id_alvo` | string | não | Em qual conta. |
| `detalhe` | string | **sim** | Contexto livre — handle anterior e novo, motivo da denúncia. Nulo quando a ação não precisa de contexto. |
| `criado_em` | timestamp | não | Quando. |

**Exclusão:** nunca. Log de auditoria não é apagado, nem na exclusão da conta —
nesse caso o `usuario_id_alvo` passa a apontar para uma conta inexistente, o que é
o comportamento correto para um log.

### 7.9 Constraints e validações

| Regra | Onde é aplicada |
|---|---|
| `handle` casa `^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$` (3 a 30 caracteres) | cliente (feedback) **e** servidor (autoridade) |
| `handle` não está em `HANDLES_RESERVADOS` | servidor |
| `handle` é único | Firestore, pelo id do documento em `handles` |
| `id_permanente` casa `^[23456789abcdefghjkmnpqrstuvwxyz]{8}$` | servidor |
| `id_permanente` é único | Firestore, pelo id do documento em `ids_permanentes` |
| Telefone/WhatsApp em E.164 `^\+[1-9]\d{7,14}$` | cliente (máscara) e servidor |
| E-mail com formato válido | cliente e servidor |
| `links` tem no máximo 15 itens | servidor |
| Só um link de tipo `whatsapp` e um de tipo `pix` | servidor (regra 11.4) |
| Foto: JPEG ou PNG, verificado pelos **magic bytes**, não pela extensão nem pelo `Content-Type` | servidor |

### 7.10 Estratégia de exclusão — resumo

| Coleção | Estratégia | Por quê |
|---|---|---|
| `usuarios` | hard delete | Exigência de LGPD (seção 20.4). Não há histórico apontando para ela que justifique soft delete. |
| `handles` | hard delete | Libera o endereço. |
| `ids_permanentes` | hard delete | Só na exclusão da conta. |
| `cartoes` | hard delete | |
| `visitas_diarias` | hard delete | Dado do titular. |
| `acoes_admin` | **nunca apaga** | Log de auditoria. |

### 7.11 Lógica que vive no servidor

Firestore não tem trigger nem função de banco na arquitetura escolhida (sem Cloud
Functions na v1 — ver assunção 24.6). Toda regra roda em rota de servidor ou em
componente de servidor. As funções que concentram lógica de dados vivem em
`lib/firebase/firestore.ts`, **o único arquivo que conhece os nomes das coleções**:

| Função | O que faz |
|---|---|
| `reservarHandle(usuario_id, handle)` | Grava `handles/<handle>` com `create` (falha se existir), gera e grava `ids_permanentes/<id>` também com `create`, e atualiza `usuarios.handle` e `usuarios.id_permanente` — tudo numa transação. É o que faz um de dois cadastros simultâneos perder. |
| `trocarHandle(usuario_id, novo)` | Reserva o novo, aponta o usuário para ele e apaga o antigo, em transação. **Não toca no `id_permanente`.** |
| `gerarIdPermanente()` | Sorteia no alfabeto da regra 11.3 e tenta gravar; em colisão, sorteia de novo, até 5 vezes. |
| `buscarCartaoPorHandle(handle)` | Duas leituras por chave: `handles/<handle>` → `cartoes/<usuario_id>`. Usada pela página pública. |
| `registrarVisita(usuario_id, origem)` | `increment` no documento do dia, criando-o se não existir. |
| `excluirConta(usuario_id)` | Apaga usuário, cartão, handle, id permanente, visitas e os arquivos do Storage. Não apaga `acoes_admin`. |

Toda uma delas leva comentário de cabeçalho em português citando a regra do spec
que implementa (seção 18.2).

### 7.12 Dados de seed e migrações

Não há seed de produção — a primeira conta nasce do primeiro login. O script
`scripts/seed-emulador.mjs` cria uma conta com cartão completo no emulador, para
desenvolvimento local.

Firestore não tem migração versionada. Mudança de formato de campo exige script
pontual em `scripts/`, com o nome no formato `migracao-<AAAA-MM-DD>-<descricao>.mjs`,
e uma linha em `DOCUMENTACAO-TECNICA.md` registrando quando foi rodado.

---

## 8. Épicos e critérios de aceite

Na ordem de implementação. Cada épico só é dado por pronto quando **todos** os
seus critérios passam. Critério é binário: ou a frase é verdadeira, ou não é.

### 8.1 Fundação: projeto, login e endereço

**Objetivo:** a pessoa entra com o Google e sai com um endereço público reservado.

**Fluxo:** `/entrar` → Google → volta sem handle → `/conta/handle` → sugestão
pré-preenchida → digita → vê disponibilidade em tempo real → confirma → `/conta`.

**Estados:** *carregando* — o campo de disponibilidade mostra um indicador discreto
enquanto verifica; *erro* — handle ocupado, reservado ou com formato inválido, cada
um com a mensagem literal da seção 15.2.

**Critérios de aceite:**

1. Acessar `/conta` sem sessão redireciona para `/entrar?voltar=/conta`.
2. Depois do login, a pessoa volta para o destino guardado em `voltar`.
3. Primeiro login cria o documento em `usuarios` com `handle` nulo e o documento em `cartoes` com `nome_exibicao` igual ao nome do Google.
4. Com `handle` nulo, **qualquer** rota sob `/conta` que não seja `/conta/handle` redireciona para `/conta/handle`.
5. A tela de escolha chega com uma sugestão já preenchida, derivada do nome do Google pela regra 11.1.
6. Digitar um handle ocupado mostra a mensagem de indisponível **sem** recarregar a página.
7. Digitar um handle da lista reservada mostra a mesma mensagem de indisponível — não uma mensagem diferente, que revelaria a existência da lista.
8. Confirmar um handle livre grava `handles/<handle>`, grava `ids_permanentes/<id>`, atualiza `usuarios` e leva para `/conta`.
9. Duas requisições simultâneas com o mesmo handle: uma vence, a outra recebe erro de indisponível. **Há teste que exerce isso contra o emulador.**
10. O `id_permanente` gerado casa `^[23456789abcdefghjkmnpqrstuvwxyz]{8}$`.

### 8.2 Editor do cartão: dados e foto

**Objetivo:** a pessoa preenche quem ela é e sobe uma foto.

**Fluxo:** `/conta` mostra o formulário à esquerda e a pré-visualização do cartão à
direita (empilhados no celular). Cada campo salva ao sair do foco, sem botão
"salvar" global.

**Estados:** *vazio* — sem foto, mostra as iniciais sobre a cor de destaque;
*carregando* — barra de progresso durante o envio da foto; *erro* — arquivo grande
demais, formato não aceito, falha de rede, cada um com a copy de 15.2.

**Critérios de aceite:**

1. Editar `nome_exibicao` e tirar o foco salva, e a pré-visualização reflete em até 1 segundo.
2. Cada campo respeita o limite de caracteres de 7.5, com contador visível a partir de 80% do limite.
3. Subir uma imagem gera **duas** derivadas: `foto_url` 600×600 e `foto_vcard_url` 300×300 com no máximo 80 KB.
4. O redimensionamento acontece **no navegador**, antes do envio; o servidor recebe as duas imagens já prontas e só valida.
5. O servidor rejeita arquivo cujos **magic bytes** não sejam de JPEG ou PNG, mesmo que a extensão e o `Content-Type` digam o contrário.
6. Arquivo original acima de 10 MB é rejeitado no cliente antes de qualquer envio.
7. Remover a foto apaga os dois arquivos do Storage e põe os dois campos em nulo.
8. Sem foto, a página pública mostra as iniciais do `nome_exibicao` sobre a cor de destaque, com contraste mínimo de 4.5:1.

### 8.3 Links e ordenação

**Objetivo:** a pessoa monta a lista de canais de contato na ordem que quiser.

**Fluxo:** `/conta/links`. Botão "Adicionar" abre a lista de tipos. Cada item tem
campo de valor, rótulo opcional, alça de arrastar e botão de remover.

**Estados:** *vazio* — nenhum link, com texto explicando que o WhatsApp é o mais
importante e um atalho para adicioná-lo; *erro* — valor inválido para o tipo.

**Critérios de aceite:**

1. Adicionar um link do tipo `whatsapp` com o telefone digitado como `(11) 98765-4321` grava `+5511987654321`.
2. Tentar adicionar um **segundo** link do tipo `whatsapp` é impedido, com a mensagem de 15.2.
3. Vale o mesmo para um segundo link do tipo `pix`.
4. Adicionar link de `instagram` com `@fulano`, `fulano` ou `instagram.com/fulano` grava `fulano` nos três casos (regra 11.5).
5. Arrastar um item muda o campo `ordem` de todos os afetados e a página pública respeita a nova ordem.
6. O décimo sexto link é recusado com a mensagem de 15.2.
7. Um link sem `rotulo` mostra na página pública o rótulo padrão do tipo (seção 15.3).

### 8.4 Página pública do cartão

**Objetivo:** o cartão aparece, rápido, para quem tem o link.

**Fluxo:** `/<handle>` renderiza no servidor. `/c/<id_permanente>` responde 308
para `/<handle>` atual.

**Estados:** *não encontrado* — handle inexistente, cartão despublicado ou conta
bloqueada, todos com a **mesma** página 404; *pré-visualização* — o dono, logado,
vendo o próprio cartão despublicado, com uma tarja fixa no topo dizendo que só ele
enxerga aquilo.

**Critérios de aceite:**

1. O conteúdo principal — foto, nome, cargo, bio e todos os links — está no HTML entregue pelo servidor, e a página continua utilizável com JavaScript desativado.
2. O botão de WhatsApp é o primeiro elemento de ação, com área de toque de no mínimo 44×44 pt (princípio 0.3).
3. `/c/<id_permanente>` responde **308** para `/<handle>` atual.
4. Trocar o handle e acessar de novo o mesmo `/c/<id_permanente>` leva ao **novo** handle. **Há teste para isso** — é o princípio 0.4 em forma executável.
5. Handle inexistente, cartão despublicado e conta bloqueada devolvem exatamente a mesma resposta 404, byte a byte, para quem não é o dono.
6. O dono logado acessando o próprio cartão despublicado vê a página com a tarja de pré-visualização.
7. Com `permitir_indexacao` falso, a página emite `noindex, nofollow`.
8. Com `permitir_indexacao` verdadeiro, a página emite as metatags Open Graph da seção 16.5.
9. A página atinge os alvos de 17.1.

### 8.5 QR code

**Objetivo:** outra pessoa aponta a câmera e o cartão abre.

**Fluxo:** o QR aparece na página pública, abaixo dos links. Tocar nele abre o modo
tela cheia. Em `/conta/compartilhar`, o dono baixa o PNG para imprimir.

**Critérios de aceite:**

1. O QR codifica **sempre** `https://cartaodevisita.app.br/c/<id_permanente>`, nunca o handle (princípio 0.4).
2. O SVG é gerado **no servidor**; a página pública não carrega biblioteca de QR no cliente.
3. Nível de correção de erro M, com zona de silêncio de 4 módulos.
4. O modo tela cheia mostra o QR preto sobre branco puro ocupando no mínimo 70% da menor dimensão da tela, sem nenhum outro elemento além do handle em texto pequeno.
5. O modo tela cheia tenta subir o brilho do aparelho; se o navegador não permitir, a página funciona igual e não mostra erro.
6. O download entrega um PNG de 1024×1024, nome `qr-<handle>.png`.
7. Ler o QR com a câmera nativa do iPhone e do Android abre o cartão. **Verificação manual, registrada na seção 22.**

### 8.6 Salvar nos contatos

**Objetivo:** quem recebeu o cartão fica com os dados na agenda.

**Fluxo:** botão "Salvar nos contatos" na página pública → baixa o `.vcf` → o
sistema operacional abre a tela de novo contato.

**Critérios de aceite:**

1. A rota devolve `Content-Type: text/vcard; charset=utf-8` e `Content-Disposition: attachment; filename="<nome-normalizado>.vcf"`.
2. O arquivo é vCard **3.0**, com quebras de linha **CRLF**.
3. Linhas com mais de 75 octetos são dobradas com continuação iniciada por um espaço, conforme a RFC 2426. **Há teste que verifica isso na linha da foto**, que é a única longa o bastante para quebrar.
4. A foto entra como `PHOTO;ENCODING=b;TYPE=JPEG` a partir de `foto_vcard_url`, e o arquivo final fica abaixo de 120 KB.
5. Sem foto no cartão, o `.vcf` sai sem a propriedade `PHOTO` — e não com uma vazia.
6. Os campos seguem exatamente o mapeamento de 14.1.
7. Abrir o arquivo no iPhone e no Android mostra a tela de novo contato com nome, telefone, e-mail e foto preenchidos. **Verificação manual, seção 22.**
8. Baixar o `.vcf` incrementa `salvou_contato` no dia.

### 8.7 Publicar, despublicar e visitas

**Objetivo:** o dono controla se o cartão está no ar e vê quanto foi visto.

**Critérios de aceite:**

1. Cartão nasce com `publicado` falso.
2. Publicar exige `nome_exibicao` preenchido e **ao menos um** link; faltando, o botão fica desabilitado com o motivo ao lado.
3. Despublicar faz a página pública responder 404 para todo mundo menos o dono.
4. Cada visita à página pública incrementa `total` e a origem correspondente.
5. Acesso por `/c/<id>` incrementa `por_codigo`; acesso direto por `/<handle>` incrementa `por_link`.
6. **O acesso do próprio dono, logado, não conta.**
7. `/conta` mostra o total dos últimos 30 dias e um gráfico por dia.
8. Nenhum campo de `visitas_diarias` permite identificar um visitante (seção 20.2). **Há teste estrutural que falha se um campo novo for adicionado a essa coleção sem atualizar o teste.**

### 8.8 Ajustes e exclusão da conta

**Critérios de aceite:**

1. Trocar o handle reserva o novo, libera o antigo e **não altera** o `id_permanente`.
2. A tela avisa, antes de confirmar, que os links já compartilhados com o handle antigo param de funcionar — e que o QR e as etiquetas NFC continuam funcionando.
3. Sair limpa a sessão e volta para a home.
4. Excluir a conta exige digitar o handle para confirmar.
5. A exclusão remove usuário, cartão, handle, id permanente, visitas e os arquivos do Storage, e **não** remove `acoes_admin`.
6. Depois da exclusão, `/<handle>` responde 404 e o handle fica disponível para outra pessoa.

### 8.9 Painel da plataforma

**Critérios de aceite:**

1. `/admin` responde **404** para quem não está na allowlist, inclusive deslogado.
2. A listagem mostra contas com handle, e-mail, data de criação, estado de publicação e total de visitas.
3. O admin despublica um cartão, e a ação grava em `acoes_admin`.
4. O admin troca o handle de uma conta, e a ação grava em `acoes_admin` com o valor anterior em `detalhe`.
5. O admin bloqueia uma conta; o cartão passa a responder 404 e a ação fica registrada.
6. **Não existe** caminho na interface para o admin editar foto, texto ou links de um cartão (regra 5.2).

### 8.10 Planos

> **⚠️ Este épico é o décimo no número, mas não no tempo.** Planos tocam a criação
> da conta (8.1), o teto de links (8.3), a escolha de template e cor (8.2) e o
> rodapé da página pública (8.4). Implementar tudo isso só no fim significa voltar
> em quatro épicos já dados por prontos.
>
> **Ordem correta:** o campo `plano`, o campo `plano_anterior`, a leitura de
> `EARLY_ADOPTER_ABERTO` e a allowlist `ILIMITADOS` entram **dentro do épico 8.1**,
> junto com a criação da conta — são cinco linhas em `requireDono()`. O que fica
> aqui é o **cumprimento dos limites** (critérios 6 a 9), a **tela de plano no
> admin** (10 a 13) e os testes. Os critérios 1 a 5 são verificados no 8.1 e
> reverificados aqui.
>
> A numeração não muda, porque ela é referenciada em código e em conversa (seção
> "Como usar este documento").

**Objetivo:** a estrutura de planos funciona de ponta a ponta, sem cobrança.

**Fluxo:** invisível para o dono na maior parte do tempo. Ele só encontra o plano
quando esbarra num limite, e na linha discreta em `/conta/ajustes`.

**Critérios de aceite:**

1. Com `EARLY_ADOPTER_ABERTO=true`, conta nova nasce `early_adopter`.
2. Com a variável ausente, vazia ou com qualquer valor que não seja `true`, conta nova nasce `gratuito`.
3. Desligar a variável **não altera o plano de nenhuma conta existente**. **Há teste para isso.**
4. E-mail na allowlist `ILIMITADOS` entra como `ilimitado`, mesmo que a conta já existisse com outro plano.
5. Retirar um e-mail da allowlist devolve a conta ao `plano_anterior`; sem valor guardado, a `gratuito`.
6. Conta `gratuito` é impedida de adicionar o 6º link, com a mensagem 15.2.17.
7. Conta `early_adopter` é impedida de adicionar o 16º link, com a mensagem 15.2.6.
8. Conta `gratuito` vê os quatro templates e as oito cores, com os indisponíveis marcados e **não** clicáveis.
9. A página pública de conta `gratuito` mostra a marca do produto no rodapé; a dos demais planos, não.
10. O admin altera o plano de uma conta, e a ação grava em `acoes_admin` com o plano anterior em `detalhe`.
11. O admin **não** consegue atribuir `pago` — o valor não aparece na interface e a rota o rejeita com `422`.
12. Rebaixar uma conta com 12 links **não apaga link nenhum**; o cartão publicado continua com os 12. **Há teste para isso** (regra 11.11.6).
13. `/admin` mostra a contagem de contas por plano e o estado atual de `EARLY_ADOPTER_ABERTO`.

---

## 9. Fluxos principais ponta a ponta

### 9.1 Do zero ao cartão no ar

1. Pessoa abre `cartaodevisita.app.br` e toca em "Criar meu cartão".
2. `/entrar` → Google → consentimento.
3. Conta nasce, sem handle. → `/conta/handle`.
4. Sugestão pronta; ajusta; confirma. Handle e id permanente reservados.
5. `/conta` com nome e foto do Google já preenchidos.
6. Ajusta nome e cargo, escreve a bio, troca a foto.
7. `/conta/links` → adiciona WhatsApp (obrigatório na prática, ver 8.7.2) e mais o que quiser.
8. `/conta/aparencia` → escolhe template e cor.
9. Volta a `/conta`, o botão "Publicar" está habilitado. Publica.
10. `/conta/compartilhar` mostra o link, o QR e as instruções de NFC.

**Caminho da exceção:** se a pessoa abandonar entre 3 e 4, a conta fica sem handle
e o painel inteiro continua mandando para `/conta/handle` no próximo login. Não há
estado intermediário perdido.

### 9.2 O encontro — o fluxo que o produto existe para servir

1. Alexandre abre `cartaodevisita.app.br/alexandre` no próprio celular e toca no QR para ir a tela cheia.
2. Maria aponta a câmera nativa. O banner aparece; ela toca.
3. O cartão abre no navegador dela, direto da URL permanente, com o 308 para o handle.
4. `por_codigo` do dia é incrementado.
5. Maria toca em "Salvar nos contatos". O `.vcf` baixa, o sistema abre a tela de novo contato, ela confirma.
6. `salvou_contato` é incrementado.
7. Mais tarde, Maria toca em "Chamar no WhatsApp". Abre a conversa com a mensagem inicial já digitada.
8. `abriu_whatsapp` é incrementado.

**Caminho da exceção:** Maria está sem internet. O QR abre, a página não carrega.
Não há solução na v1 — e não deve haver tentativa de contornar com dado embutido
no QR, porque um QR com um vCard inteiro dentro fica denso demais para ser lido de
uma tela de celular. Registrado como risco 23.4.

### 9.3 A troca de telefone — por que o princípio 0.4 existe

1. Alexandre muda de "alexandre" para "alexandresiqueira".
2. `trocarHandle()` reserva o novo, aponta o usuário, apaga o antigo.
3. `cartaodevisita.app.br/alexandre` passa a responder 404, e o handle fica livre.
4. **O QR impresso nos cem cartões de papel dele continua funcionando**, porque codifica `/c/k7f3q9`, que agora redireciona para `/alexandresiqueira`.
5. **A etiqueta NFC na carteira dele, gravada e travada, continua funcionando**, pelo mesmo motivo.

---

## 10. Inventário de telas

Rótulo entre colchetes = perfil que acessa.

### 10.1 Públicas — sem conta

| Tela | Rota | Mostra | Ações | Lê | Escreve |
|---|---|---|---|---|---|
| Home | `/` | Cabeçalho fino; bloco principal com título, subtítulo, botão e a garantia ao lado; mockup de um cartão real à direita; os **três blocos de objeção** de 15.4.1; rodapé com termos, privacidade e contato | Entrar, Criar meu cartão | — | — |
| **Cartão** | `/<handle>` | Foto, nome, cargo, empresa, bio, links na ordem, QR | WhatsApp, cada link, salvar contato, abrir QR | `handles`, `cartoes` | `visitas_diarias` |
| Redirecionador | `/c/<id>` | *(sem tela — 308)* | — | `ids_permanentes`, `usuarios` | — |
| QR tela cheia | `/<handle>/qr` | QR grande, handle em texto pequeno | Voltar | `handles`, `cartoes` | — |
| Termos | `/termos` | Texto legal | — | — | — |
| Privacidade | `/privacidade` | Texto legal | — | — | — |
| Não encontrado | *(404)* | Mensagem neutra e link para a home | — | — | — |

### 10.2 Do dono — exige sessão

Todas sob `/conta`, com menu lateral persistente (seção 16.6).

| Tela | Rota | Mostra | Ações | Lê | Escreve |
|---|---|---|---|---|---|
| Escolher endereço | `/conta/handle` | Campo com sugestão, disponibilidade em tempo real | Confirmar | `handles` | `handles`, `ids_permanentes`, `usuarios` |
| **Meu cartão** | `/conta` | Formulário + pré-visualização + visitas dos últimos 30 dias | Editar campos, subir/remover foto, publicar/despublicar | `cartoes`, `visitas_diarias` | `cartoes`, Storage |
| Links | `/conta/links` | Lista ordenável | Adicionar, editar, reordenar, remover | `cartoes` | `cartoes` |
| Aparência | `/conta/aparencia` | Quatro templates e oito cores, com pré-visualização ao vivo | Escolher | `cartoes` | `cartoes` |
| Compartilhar | `/conta/compartilhar` | Link, QR, botão de baixar PNG, instruções de NFC | Copiar link, baixar QR | `cartoes`, `usuarios` | — |
| Ajustes | `/conta/ajustes` | Handle atual, e-mail, **plano atual em uma linha discreta**, indexação, zona de risco | Trocar handle, alternar indexação, sair, excluir conta | `usuarios`, `cartoes` | `usuarios`, `handles`, `cartoes` |

### 10.3 Do admin — allowlist

| Tela | Rota | Mostra | Ações | Lê | Escreve |
|---|---|---|---|---|---|
| Contas | `/admin` | Contagem no subtítulo (`N contas · M early adopters`); **faixa de estado da abertura a early adopters, com o valor de `EARLY_ADOPTER_ABERTO` à direita**; tabela com conta (e-mail), endereço, **plano em selo colorido**, links, visitas do mês e ação de abrir | Buscar, abrir | `usuarios`, `cartoes`, `visitas_diarias` | — |
| Uma conta | `/admin/contas/[id]` | Dados, cartão, plano atual e histórico de ações | **Alterar plano**, despublicar, trocar handle, bloquear | `usuarios`, `cartoes`, `acoes_admin` | `usuarios`, `cartoes`, `handles`, `acoes_admin` |

A tela `/admin` segue o desenho já validado no painel do ViraPágina, inclusive nos
selos de plano: `Gratuito` em cinza neutro, `Early adopter` em verde, `Ilimitado`
em azul, `Pago` em cinza-escuro (sem uso na v1).

---

## 11. Regras de negócio

Nenhum número deste produto deve ser inferido. Se precisar de um que não esteja
aqui, **pergunte** (seção 25).

### 11.1 Formato e sugestão do handle

| Regra | Valor |
|---|---|
| Caracteres aceitos | `a-z`, `0-9`, hífen |
| Não pode começar nem terminar com hífen | sim |
| Comprimento | 3 a 30 |
| Expressão | `^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$` |
| Normalização da sugestão | minúsculas, remove acento, troca espaço por hífen, remove o resto, corta em 30 |
| Sugestão ocupada | acrescenta `-2`, depois `-3`, até `-9`; depois disso, deixa o campo vazio |
| Onde é aplicada | cliente para feedback, **servidor como autoridade** |

### 11.2 Handles reservados

Não podem ser escolhidos. Devolvem a **mesma** mensagem de "indisponível" que um
handle ocupado, para não revelar a existência da lista (critério 8.1.7).

```
admin, api, app, ajuda, blog, c, cartao, cartoes, conta, contato,
dashboard, docs, entrar, equipe, favicon, home, login, logout, null,
painel, precos, privacidade, public, qr, root, sair, sobre, static,
suporte, termos, undefined, www, _next
```

`c` é o mais importante da lista: é o prefixo da rota permanente (seção 4.3).

### 11.3 Formato do id permanente

| Regra | Valor |
|---|---|
| Alfabeto | `23456789abcdefghjkmnpqrstuvwxyz` — 31 caracteres |
| Excluídos de propósito | `0`, `1`, `l`, `i`, `o` — confundem quem digita ou transcreve à mão |
| Comprimento | 8 |
| Espaço total | 31⁸ ≈ 852 bilhões |
| Expressão | `^[23456789abcdefghjkmnpqrstuvwxyz]{8}$` |
| Em colisão | sorteia de novo, até 5 tentativas; na sexta, erro 500 registrado |
| Muda alguma vez? | **nunca** (princípio 0.4) |

### 11.4 Limites do cartão

| Regra | Valor |
|---|---|
| Links por cartão | **depende do plano** — ver 11.11 |
| Links do tipo `whatsapp` | no máximo 1 |
| Links do tipo `pix` | no máximo 1 |
| Demais tipos | quantos quiser, dentro do teto de 15 |
| `nome_exibicao` | 1 a 60 caracteres |
| `cargo`, `empresa` | até 60 |
| `bio` | até 160 |
| `mensagem_whatsapp` | até 120 |
| `rotulo` de link | até 24 |
| Publicar exige | `nome_exibicao` preenchido **e** ao menos 1 link |

O teto absoluto de links é **15**, em qualquer plano. Nenhum plano, nem o
`ilimitado`, passa disso: acima de 15 o cartão deixa de ser cartão (anti-escopo
1.1), e o array embutido de 7.5.1 perde o argumento de desempenho.

### 11.5 Normalização por tipo de link

O que a pessoa digita não é o que fica guardado. A coluna "guarda" é o que vai
para `valor`; a coluna "abre" é a URL final na página pública.

| Tipo | Aceita digitado | Guarda | Abre |
|---|---|---|---|
| `whatsapp` | `(11) 98765-4321`, `11987654321`, `+5511987654321` | E.164 `+5511987654321` | `https://wa.me/5511987654321?text=<mensagem>` |
| `telefone` | idem | E.164 | `tel:+5511987654321` |
| `email` | `fulano@dominio.com` | minúsculas, sem espaço | `mailto:fulano@dominio.com` |
| `instagram` | `@fulano`, `fulano`, `instagram.com/fulano` | `fulano` | `https://instagram.com/fulano` |
| `linkedin` | `fulano`, `linkedin.com/in/fulano` | `fulano` | `https://linkedin.com/in/fulano` |
| `tiktok` | `@fulano`, `fulano` | `fulano` | `https://tiktok.com/@fulano` |
| `x` | `@fulano`, `fulano` | `fulano` | `https://x.com/fulano` |
| `github` | `fulano` | `fulano` | `https://github.com/fulano` |
| `youtube`, `facebook`, `behance`, `spotify`, `site`, `outro` | URL completa | URL, forçando `https://` se faltar esquema | a própria |
| `pix` | chave (CPF, e-mail, telefone ou aleatória) | como digitada, sem espaço nas pontas | **não abre** — botão "Copiar chave PIX" |
| `endereco` | texto livre, até 120 | como digitado | `https://maps.google.com/?q=<urlencoded>` |

**Telefone sem DDI** recebe `+55` automaticamente. Telefone com 8 dígitos depois do
DDD é aceito como está — **não** se insere o nono dígito, porque fixo de 8 dígitos
existe e inserir o 9 quebraria o número.

### 11.6 Realidade do NFC — o que é verdade e o que não é

Esta tabela existe para impedir que qualquer texto do produto prometa o que não
acontece. A copy da seção 15.4 deriva literalmente dela.

| Afirmação | Verdade? | Detalhe |
|---|---|---|
| Etiqueta NFC com URL abre o cartão no iPhone sem app | **sim** | iPhone XS (2018) em diante, tela ligada, aparelho desbloqueado ao menos uma vez desde que ligou. |
| ...no Android | **sim** | Praticamente todo aparelho com NFC, tela ligada. |
| A tela do destinatário pode estar apagada | **não** | Sem display ligado, não há leitura em segundo plano. |
| Dá para gravar a etiqueta pelo navegador no Android | **sim** | Web NFC, só no Chrome e derivados. Fora do escopo da v1. |
| ...no iPhone | **não** | Safari não tem Web NFC, e nenhum navegador no iOS tem. |
| Dá para gravar pelo app nativo no iPhone | **sim** | Core NFC, iOS 13+. Não exige aprovação especial da Apple para NDEF. Fora do escopo da v1. |
| Encostar um celular no outro passa o cartão | **não** | Android Beam acabou no Android 10; o iOS não deixa app emular etiqueta. **Só etiqueta física passiva funciona.** |
| Dá para gravar o contato (vCard) direto na etiqueta | **não serve** | O iPhone não abre vCard vindo de etiqueta. Por isso a etiqueta guarda **URL**, e o vCard vem da página. |
| Etiqueta colada atrás do próprio celular funciona | **sim, com ressalva** | O *outro* celular lê. Exige etiqueta "on-metal" com ferrite; a traseira de vidro com anel metálico reduz muito o alcance, e a etiqueta pode atrapalhar o carregamento por indução. |

### 11.7 Etiquetas recomendadas

| Regra | Valor |
|---|---|
| Chip recomendado | NTAG215 (504 bytes) |
| Mínimo aceitável | NTAG213 (144 bytes) |
| Tamanho da URL gravada | `https://cartaodevisita.app.br/c/xxxxxxxx` ≈ 35 bytes |
| Tipo de registro | NDEF, registro único de URI |
| Travar como somente-leitura? | **sim**, se for cartão vendido ou impresso; a URL é permanente por construção (princípio 0.4) |

### 11.8 Contagem de visitas

| Regra | Valor |
|---|---|
| Granularidade | uma linha por conta por dia |
| Origem `por_codigo` | chegou por `/c/<id>` |
| Origem `por_link` | chegou direto em `/<handle>` |
| Visita do próprio dono logado | **não conta** |
| Requisição de robô conhecido (user-agent de bot) | **não conta** |
| Recarregar a página | conta de novo — não há deduplicação, porque deduplicar exigiria identificar o visitante (seção 20.2) |
| Retenção | 400 dias; documento mais antigo é apagado por rotina |
| Fuso | `America/Sao_Paulo` |

### 11.9 Fusos e virada de dia

Toda data de agregação usa `America/Sao_Paulo`. Uma visita às 23h de terça em
Brasília conta na terça, mesmo que o servidor esteja em UTC — a conversão acontece
na montagem do id do documento, não na leitura.

### 11.10 O que não é automático

- **A foto não é recortada automaticamente por detecção de rosto.** A pessoa enquadra.
- **A bio não é gerada por IA.** Não há IA neste produto.
- **O cartão não é publicado sozinho** ao terminar de preencher. Publicar é ato explícito.
- **O handle não muda quando a pessoa muda o nome.** São coisas independentes.
- **A ordem dos links não é otimizada por nada.** É a ordem que a pessoa escolheu. Única exceção estrutural: o WhatsApp é renderizado como botão principal acima da lista, e isso é layout, não reordenação de dados (princípio 0.3).

### 11.11 Planos

Mesma estrutura do ViraPágina, adaptada ao que este produto tem para limitar.
**Existe plano desde a v1; não existe forma de pagar por ele** (seção 3.2).

#### 11.11.1 Os quatro planos

| Plano | Como se chega nele | Expira? |
|---|---|---|
| `gratuito` | conta nova criada com `EARLY_ADOPTER_ABERTO=false` | não |
| `early_adopter` | conta nova criada com `EARLY_ADOPTER_ABERTO=true` | **nunca** — é para sempre, e é essa a promessa |
| `ilimitado` | e-mail presente na allowlist `ILIMITADOS` (`lib/planos.ts`), verificada **a cada login** | não |
| `pago` | **não atribuível na v1.** Nenhuma rota o define; o valor existe no enum para não exigir migração quando a seção 28.2 chegar | — |

#### 11.11.2 O que cada plano libera

| Recurso | `gratuito` | `early_adopter` · `ilimitado` · `pago` |
|---|---|---|
| Links no cartão | **5** | **15** |
| Templates (16.3) | `minimalista` e `cartao` | os quatro |
| Cores de destaque (16.2) | `azul` e `grafite` | as oito |
| Marca do produto no rodapé da página pública | **sim** | não |
| Foto, QR, vCard, WhatsApp, PIX, contador de visitas, domínio `/handle` | **sim** | sim |

**O plano gratuito entrega um cartão completo e útil.** Nada essencial está atrás
de plano: foto, QR, salvar-em-contatos e WhatsApp são iguais para todo mundo. O
motivo é comercial, não generoso — **todo cartão publicado é propaganda do
produto**, e cartão capado é propaganda ruim.

**O que o plano gratuito paga é a marca no rodapé, e ela é inegociável.** Decisão
de 20/09/2026, nas palavras do responsável de produto: *"senão nunca teremos razão
para vender"*. A marca faz dois trabalhos ao mesmo tempo, e é por isso que ela é a
alavanca certa:

1. **É o canal de crescimento.** Cada cartão publicado divulga o produto para todo mundo que o recebe — e o público-alvo (seção 1) se apresenta muito, por definição.
2. **É a única coisa que a pessoa vai querer comprar.** Limitar link ou template incomoda pouco; aparecer a marca de outra empresa no próprio cartão de visitas incomoda na hora certa, que é a de quem leva o cartão a sério.

**Diferença deliberada em relação ao ViraPágina**, onde o plano gratuito publica
sem marca ("Sem marca d'água" é o primeiro argumento da home de lá). Aqui é o
oposto, e é consciente: lá o que se limita é a quantidade de livros; aqui, com um
cartão por conta (princípio 0.5), **não existe quantidade para limitar** — a marca
é o único ponto de pressão que não estraga o produto.

A marca é discreta: uma linha no rodapé, texto pequeno, sem logo grande e sem cor
chamativa. Ela não pode competir com o conteúdo do cartão de ninguém.

#### 11.11.3 A variável `EARLY_ADOPTER_ABERTO`

| Regra | Valor |
|---|---|
| Onde mora | variável de ambiente na Vercel, **sem** prefixo `NEXT_PUBLIC_` |
| Valores | `true` ou `false`; qualquer outra coisa é lida como `false` |
| Quando é lida | **só na criação da conta**, dentro de `requireDono()` |
| Efeito ao desligar | contas novas nascem `gratuito`. **Nenhuma conta existente muda de plano** |
| Efeito ao religar | contas novas voltam a nascer `early_adopter`. Continua sem mexer em conta existente |

A regra que importa: **desligar a chave nunca rebaixa ninguém.** Quem entrou como
early adopter é early adopter para sempre, e é isso que se promete na interface.
Rebaixar em lote exigiria script manual e uma boa explicação.

#### 11.11.4 A allowlist `ILIMITADOS`

Lista de e-mails em `lib/planos.ts`, **sem nenhum `import`**, pelo mesmo motivo de
`lib/admins.ts`: não criar ciclo de dependência.

```
alexandre.silva.siqueira@gmail.com
alexandre@dablab.com.br
```

| Regra | Valor |
|---|---|
| Verificada | a cada login, dentro de `requireDono()` |
| Se o e-mail entra na lista | a conta passa a `ilimitado` no próximo acesso, mesmo que já existisse como `gratuito` |
| Se o e-mail sai da lista | a conta **volta** ao que era antes, guardado em `plano_anterior`; sem valor guardado, volta a `gratuito` |
| Mudar a lista | exige commit e deploy — é exatamente a barreira desejada |
| Não há tela | conceder ilimitado pela interface é ação de admin sobre o plano (11.11.5), não edição desta lista |

`ilimitado` é, na prática, o plano das contas de casa: a sua, a da Dab Lab, e a de
quem você decidir presentear — a Dani, por exemplo, quando começar a usar.

#### 11.11.5 Alteração de plano pelo admin

O admin altera o plano de qualquer conta pela tela `/admin/contas/[id]`, para
qualquer valor **exceto `pago`**, que não é atribuível na v1.

| Regra | Valor |
|---|---|
| Registra em `acoes_admin` | sempre, com `acao: alterou_plano` e o plano anterior em `detalhe` |
| Rebaixar conta com mais links que o novo teto | **os links não são apagados.** O cartão continua no ar como está; a pessoa só não consegue adicionar mais. Ver 11.11.6 |
| Alterar para `ilimitado` pela tela | permitido, e **sobrevive** à allowlist — os dois caminhos levam ao mesmo plano |

#### 11.11.6 O que acontece com quem excede o limite depois de um rebaixamento

Regra única, e ela vale para links, template e cor: **o que já está lá continua
funcionando; o que muda é o que se pode fazer daqui para a frente.**

| Situação | O cartão publicado | O editor |
|---|---|---|
| 12 links, rebaixado para `gratuito` (teto 5) | mostra os 12 | "Adicionar" desabilitado, com o motivo; remover funciona |
| Template `foto`, rebaixado para `gratuito` | continua `foto` | o template fica marcado como indisponível, sem ser trocado à força |
| Cor `roxo`, rebaixado para `gratuito` | continua `roxo` | idem |

**Alternativa descartada:** truncar a lista de links ou forçar o template padrão no
rebaixamento. Descartada porque destruiria dado do usuário por uma mudança
administrativa — e porque apagar conteúdo sem o usuário pedir é o tipo de coisa
que se descobre tarde e não se desfaz.

### 11.12 Nome de exibição em caixa alta

**Decidida em 20/09/2026, depois de aparecer rodando o épico 8.1.** Conta do
Google criada a partir de documento oficial costuma trazer o nome INTEIRO EM
MAIÚSCULAS, e isso é frequente justamente no público da seção 1. No cartão o nome
é o elemento de 28 px do topo — em caixa alta ele parece um grito.

| Regra | Valor |
|---|---|
| Quando age | **só** quando o nome não tem nenhuma letra minúscula |
| O que faz | converte para caixa de título ao **pré-preencher** `nome_exibicao` |
| Partículas minúsculas | `de da do das dos e di du del della la le van von y` |
| Primeira palavra | sempre maiúscula, mesmo sendo partícula — `DA SILVA NETO` → `Da Silva Neto` |
| Hífen e apóstrofo | a letra seguinte também sobe — `JEAN-PIERRE D’ÁVILA` → `Jean-Pierre D’Ávila` |
| Acento | a detecção e a conversão usam locale `pt-BR`, para `Ç`, `Ã` e `É` funcionarem |
| Nome já misturado | **não é tocado** |
| Onde é aplicada | no servidor, ao criar o cartão, e no rodapé do menu |

**Nome já misturado não é tocado de propósito:** mexer nele estragaria `McSilva`,
`d’Ávila` e `LuizA`, e quem escreveu assim escreveu de propósito. O campo continua
editável — isto é um palpite inicial, não uma correção.

**Não se aplica ao `nome_google`**, que guarda o que o provedor mandou, nem ao
handle, que tem a própria normalização (regra 11.1).

### 11.13 Tamanho de propriedade de evento

| Regra | Valor |
|---|---|
| Corte de string em propriedade de evento | **64 caracteres** |
| O que acontece acima disso | a propriedade é **descartada**, não truncada |

É a linha de defesa contra conteúdo do cartão vazar por engano para o Visão de
Produto (regra 21.3.1, item 5): valor de enum do spec cabe folgado, bio e
endereço não cabem. Descartar em vez de truncar é deliberado — metade de uma bio
continua sendo bio.

*Ratificada em 20/09/2026. Era a pergunta aberta 25.10.*

---

## 12. Máquinas de estado

### 12.1 Ciclo de vida da conta

```
   (não existe)
        │ primeiro login com Google
        ▼
   SEM_HANDLE ──── escolheu endereço ────► ATIVA
        │                                    │ │
        │                                    │ └── admin bloqueia ──► BLOQUEADA
        │                                    │                            │
        │                                    │ ◄──── admin desbloqueia ───┘
        │                                    │
        └──────── excluiu conta ─────────────┴──────► (não existe)
```

| Estado | `handle` | `bloqueado` | Página pública | Painel |
|---|---|---|---|---|
| `SEM_HANDLE` | nulo | falso | não existe | só `/conta/handle` |
| `ATIVA` | preenchido | falso | conforme `publicado` | completo |
| `BLOQUEADA` | preenchido | **verdadeiro** | **404 para todos, inclusive o dono** | somente leitura, com aviso e contato de suporte |

**Transições proibidas:** de `SEM_HANDLE` direto para `BLOQUEADA` (não há o que
moderar sem cartão publicado); e voltar de `ATIVA` para `SEM_HANDLE` (trocar
handle mantém a conta ativa — não existe operação de "remover handle").

### 12.2 Ciclo de vida do cartão

```
   RASCUNHO ──── publicar (exige nome + 1 link) ────► PUBLICADO
       ▲                                                 │
       └──────── despublicar (dono ou admin) ────────────┘
```

| Estado | `publicado` | `/<handle>` para visitante | `/<handle>` para o dono |
|---|---|---|---|
| `RASCUNHO` | falso | **404** | a página, com tarja de pré-visualização |
| `PUBLICADO` | verdadeiro | a página | a página |

A transição para `PUBLICADO` é bloqueada se `nome_exibicao` estiver vazio ou se
não houver nenhum link (regra 11.4). O botão fica desabilitado com o motivo ao
lado — não habilitado com erro depois do clique.

### 12.3 Ciclo de vida do envio de foto

```
   SELECIONANDO ──► REDIMENSIONANDO ──► ENVIANDO ──► PRONTA
        │                 │                 │
        └── cancelou      └── falhou        └── falhou
                              ▼                 ▼
                            ERRO              ERRO ──► (permite tentar de novo)
```

| Falha | O que o usuário vê | O que fica no banco |
|---|---|---|
| Arquivo acima de 10 MB | mensagem 15.2.7, antes de qualquer envio | nada muda |
| Formato não aceito (magic bytes) | mensagem 15.2.8 | nada muda |
| Redimensionamento falhou no navegador | mensagem 15.2.9 | nada muda |
| Envio falhou pela rede | mensagem 15.2.10, com botão de tentar de novo | nada muda |
| Envio da 600×600 deu certo e o da 300×300 falhou | mensagem 15.2.10 | **nada muda** — as duas gravam juntas ou nenhuma grava |

A última linha é a regra que importa: **as duas derivadas são gravadas na mesma
operação.** Um cartão com `foto_url` preenchida e `foto_vcard_url` nula geraria um
`.vcf` sem foto sem ninguém entender por quê.

---

## 13. Contratos de API

Todas as rotas devolvem JSON, exceto onde indicado. Erros seguem o formato
`{ "erro": "<codigo>", "mensagem": "<texto da seção 15.2>" }`.

### 13.1 Rotas do dono — `/api/conta/*`

**Toda rota desta família chama `requireDono()` na primeira linha.** Sem exceção,
e há teste que falha se uma rota tocar o Firestore ou o Storage antes de autorizar.

| Rota | Método | Entrada | Saída | Erros |
|---|---|---|---|---|
| `/api/conta/handle` | `GET` | `?valor=<handle>` | `{ disponivel: boolean }` | `400` formato inválido |
| `/api/conta/handle` | `POST` | `{ valor }` | `{ handle, id_permanente }` | `409` indisponível · `400` formato · `422` já tem handle (use `PATCH`) |
| `/api/conta/handle` | `PATCH` | `{ valor }` | `{ handle }` | `409` · `400` |
| `/api/conta/cartao` | `PATCH` | qualquer subconjunto dos campos editáveis de 7.5 | o cartão atualizado | `400` validação · `413` texto acima do limite |
| `/api/conta/cartao/links` | `PUT` | `{ links: [...] }` — a lista **inteira**, já ordenada | o cartão atualizado | `400` validação · `409` dois `whatsapp` ou dois `pix` · `413` mais de 15 |
| `/api/conta/cartao/foto` | `POST` | `multipart`: `exibicao` (600×600) e `vcard` (300×300) | `{ foto_url, foto_vcard_url }` | `400` magic bytes · `413` acima do limite |
| `/api/conta/cartao/foto` | `DELETE` | — | `{ ok: true }` | — |
| `/api/conta/cartao/publicacao` | `PATCH` | `{ publicado: boolean }` | `{ publicado }` | `422` faltam nome ou link |
| `/api/conta/visitas` | `GET` | `?dias=30` | `{ total, por_dia: [...] }` | — |
| `/api/conta/indexacao` | `PATCH` | `{ permitir: boolean }` | `{ permitir_indexacao }` | — |
| `/api/conta` | `DELETE` | `{ confirmacao: "<handle>" }` | `{ ok: true }` | `422` confirmação não confere |

**`links` é `PUT` da lista inteira, não `PATCH` item a item.** Reordenar é a
operação mais comum, e ela muda todos os itens de uma vez; um endpoint por item
exigiria uma transação para manter a ordem consistente. O trade-off é perder a
edição concorrente de dois dispositivos — irrelevante num produto de um usuário
por conta.

### 13.2 Rotas públicas

| Rota | Método | Devolve | Observação |
|---|---|---|---|
| `/c/<id_permanente>` | `GET` | **308** para `/<handle>` | `404` se o id não existe, a conta está bloqueada ou o cartão está despublicado |
| `/api/cartoes/<handle>/vcard` | `GET` | `text/vcard; charset=utf-8` | Ver seção 14. Incrementa `salvou_contato`. `404` nas mesmas condições da página |
| `/api/cartoes/<handle>/qr.png` | `GET` | `image/png` 1024×1024 | Cache de 1 ano — o conteúdo nunca muda (princípio 0.4) |
| `/api/eventos/whatsapp` | `POST` | `204` | `{ handle }`. Incrementa `abriu_whatsapp`. **Falha em silêncio** — o clique no WhatsApp nunca espera por esta chamada |

### 13.3 Rotas do admin — `/api/admin/*`

**Toda rota desta família chama `requireAdminPlataforma()` na primeira linha, e
devolve `404` — nunca `403` — para quem não é admin.**

| Rota | Método | Entrada | Efeito |
|---|---|---|---|
| `/api/admin/contas` | `GET` | `?busca=&pagina=` | Lista paginada |
| `/api/admin/contas/[id]/publicacao` | `PATCH` | `{ publicado: false, detalhe }` | Despublica e grava em `acoes_admin`. **Só aceita `false`** — admin não publica cartão alheio |
| `/api/admin/contas/[id]/handle` | `PATCH` | `{ valor, detalhe }` | Troca o handle e grava em `acoes_admin` com o anterior em `detalhe` |
| `/api/admin/contas/[id]/bloqueio` | `PATCH` | `{ bloqueado, detalhe }` | Bloqueia ou desbloqueia e grava em `acoes_admin` |
| `/api/admin/contas/[id]/plano` | `PATCH` | `{ plano, detalhe }` | Altera o plano e grava em `acoes_admin` com o anterior em `detalhe`. **Rejeita `pago` com `422`** (regra 11.11.5). Nunca apaga link, template nem cor (regra 11.11.6) |

### 13.4 Idempotência e concorrência

- `POST /api/conta/handle` é idempotente por construção: a segunda chamada com o mesmo valor pelo mesmo dono devolve `200` com o handle já reservado, não `409`.
- `PUT` de links substitui a lista inteira — idempotente por natureza.
- Não há paginação nas rotas do dono: o teto de 15 links dispensa.
- A listagem do admin pagina de 50 em 50, por cursor de `criado_em`.

---

## 14. Exportação: o arquivo vCard

Esta seção é especificada com precisão de byte porque o vCard é o entregável mais
frágil do produto: o arquivo é interpretado pelo sistema operacional de outra
pessoa, e um detalhe errado transforma "salvar contato" numa tela de erro sem
explicação.

### 14.1 Mapeamento de campos

**Versão: vCard 3.0.** Escolhida em vez da 4.0 por compatibilidade — a 3.0 é lida
sem ressalvas pelo iOS e por todas as variantes de Android; a 4.0 ainda tropeça em
aparelho Android antigo. **Alternativa descartada:** 4.0, descartada por não
oferecer nada que este cartão precise.

| Propriedade vCard | Vem de | Quando sai |
|---|---|---|
| `BEGIN:VCARD` / `VERSION:3.0` | fixo | sempre |
| `N:<sobrenome>;<nome>;;;` | `nome_exibicao`, quebrado no **último** espaço | sempre |
| `FN:<nome_exibicao>` | `nome_exibicao` | sempre |
| `ORG:<empresa>` | `empresa` | só se não for nulo |
| `TITLE:<cargo>` | `cargo` | só se não for nulo |
| `TEL;TYPE=CELL,VOICE:<E.164>` | link `whatsapp` | se existir |
| `TEL;TYPE=WORK,VOICE:<E.164>` | link `telefone` | se existir |
| `EMAIL;TYPE=INTERNET:<email>` | link `email` | se existir |
| `URL:<url do cartão>` | `https://cartaodevisita.app.br/<handle>` | sempre |
| `URL;TYPE=<tipo>:<url final>` | demais links que viram URL (regra 11.5) | um por link |
| `ADR;TYPE=WORK:;;<endereco>;;;;` | link `endereco` | se existir |
| `NOTE:<bio>` | `bio` | só se não for nula |
| `PHOTO;ENCODING=b;TYPE=JPEG:<base64>` | `foto_vcard_url` | **só se `foto_vcard_url` não for nula** |
| `REV:<ISO 8601 UTC>` | `atualizado_em` | sempre |
| `END:VCARD` | fixo | sempre |

O link `pix` **não entra no vCard** — chave PIX não tem propriedade vCard
correspondente, e enfiá-la em `NOTE` poluiria o campo. Ela vive só na página.

### 14.2 Regras de formato — as que quebram na prática

| Regra | Valor | Por que importa |
|---|---|---|
| Quebra de linha | **CRLF** (`\r\n`) | LF puro faz alguns leitores de Android ignorarem o arquivo inteiro |
| Dobra de linha | linhas acima de **75 octetos** são dobradas; a continuação começa com **um espaço** | RFC 2426. É a linha da foto que estoura, e sem dobrar o iOS descarta a imagem em silêncio |
| Contagem para a dobra | **octetos, não caracteres** | Nome com acento ocupa 2 bytes em UTF-8; contar caractere dobra no lugar errado e corrompe |
| Escape em texto livre | `\`, `;`, `,` e quebra de linha viram `\\`, `\;`, `\,` e `\n` | Bio com vírgula sem escape quebra o parsing do campo |
| Codificação | UTF-8, **sem BOM** | BOM em vCard confunde leitor de iOS |
| Foto | JPEG, 300×300, **máximo 80 KB** antes do base64 | Base64 cresce ~33%; o arquivo final fica abaixo de 120 KB |
| Tamanho total | alvo abaixo de **120 KB** | Acima disso o compartilhamento por alguns apps de mensagem falha |

### 14.3 Nome do arquivo

`<nome-normalizado>.vcf`, onde a normalização é: minúsculas, sem acento, espaço
vira hífen, remove o que não for `a-z0-9-`. `Alexandre Siqueira` → `alexandre-siqueira.vcf`.
Se o resultado ficar vazio, usa o handle.

### 14.4 Não há importação

O produto não importa vCard, CSV nem contato de lugar nenhum. Está no anti-escopo
(seção 1.1): importar cartão dos outros é produto diferente.

---

## 15. Copy e tom de voz

**Conteúdo final, não placeholder.** O agente de código usa estas frases
literalmente — não reescreva, não "melhore", não acrescente exclamação nem emoji.

### 15.1 Tom

Direto e adulto. Frase curta. Segunda pessoa ("seu cartão", "você"). Sem
superlativo de marketing, sem "incrível", sem "simples assim", sem emoji em
interface. O erro explica o que aconteceu e o que fazer, nunca pede desculpas.

### 15.2 Mensagens de erro e de estado

| Código | Texto |
|---|---|
| 1 | `Esse endereço já está em uso. Tente outro.` |
| 2 | `O endereço pode ter letras, números e hífen, de 3 a 30 caracteres.` |
| 3 | `O endereço não pode começar nem terminar com hífen.` |
| 4 | `Você já tem um link de WhatsApp. Edite o que existe ou remova antes de adicionar outro.` |
| 5 | `Você já tem uma chave PIX. Edite a que existe ou remova antes de adicionar outra.` |
| 6 | `Um cartão pode ter até 15 links.` |
| 7 | `A imagem passa de 10 MB. Escolha uma menor.` |
| 8 | `Esse arquivo não é uma imagem JPEG ou PNG.` |
| 9 | `Não consegui preparar essa imagem. Tente outra.` |
| 10 | `A foto não subiu. Verifique a conexão e tente de novo.` |
| 11 | `Digite um telefone válido, com DDD.` |
| 12 | `Digite um e-mail válido.` |
| 13 | `Para publicar, preencha seu nome e adicione pelo menos um link.` |
| 14 | `Digite seu endereço para confirmar.` |
| 15 | `Não encontrei esse cartão.` |
| 16 | `Não consegui salvar. Tente de novo.` |
| 17 | `Seu plano permite até 5 links.` |
| 18 | `Esse visual está disponível em outro plano.` |

### 15.3 Rótulos padrão dos links

Usados quando `rotulo` é nulo.

| Tipo | Rótulo |
|---|---|
| `whatsapp` | `Chamar no WhatsApp` |
| `telefone` | `Ligar` |
| `email` | `Enviar e-mail` |
| `instagram` | `Instagram` |
| `linkedin` | `LinkedIn` |
| `site` | `Site` |
| `youtube` | `YouTube` |
| `tiktok` | `TikTok` |
| `facebook` | `Facebook` |
| `x` | `X` |
| `github` | `GitHub` |
| `behance` | `Behance` |
| `spotify` | `Spotify` |
| `pix` | `Copiar chave PIX` |
| `endereco` | `Ver no mapa` |
| `outro` | `Abrir link` |

### 15.4 Textos do produto

| Onde | Texto |
|---|---|
| Home, título | `Seu contato na agenda de quem você acabou de conhecer.` |
| Home, subtítulo | `Monte o seu em cinco minutos. Compartilhe por link, QR code ou etiqueta NFC. Do outro lado, ninguém precisa instalar nada.` |
| Home, botão | `Criar meu cartão` |
| Home, ao lado do botão | `Grátis, sem cartão` |
| Home, rodapé | `Cartão de Visita — Dab Lab` · `Termos` · `Privacidade` · `<e-mail de suporte>` |
| Login, título | `Entre para montar seu cartão` |
| Login, botão | `Entrar com o Google` |
| Login, rodapé | `Sem senha para lembrar. Ao entrar, você concorda com os termos e a privacidade.` |

#### 15.4.1 Os três blocos de objeção da home

Padrão herdado do ViraPágina: abaixo do bloco principal, **três cartões lado a
lado**, cada um com um ícone, um título curto e duas ou três linhas. Eles não
listam funcionalidade — cada um **derruba uma objeção específica**, e cada um
corresponde a um princípio da seção 0. É por isso que são exatamente estes três.

| # | Título | Texto | Princípio que defende |
|---|---|---|---|
| 1 | `Sem app, dos dois lados` | `Quem recebe aponta a câmera ou encosta o celular, e seu cartão abre no navegador. Sem instalar nada, sem criar conta, sem login. Só uma das duas pessoas precisa ter conta aqui — você.` | 0.1 |
| 2 | `Seu QR nunca quebra` | `Mudou de endereço, de emprego ou de telefone? O QR que você imprimiu e a etiqueta que você gravou continuam levando ao seu cartão atualizado. Isso não é promessa: o endereço gravado nunca muda.` | 0.4 |
| 3 | `Quem recebe não é rastreado` | `Sem cookie, sem pixel, sem ferramenta de análise de terceiro. Você vê quantas visitas seu cartão teve; não vê quem entrou — e ninguém mais vê também.` | 20.2 |

O bloco 2 é o mais importante dos três, porque é o único que **nenhum concorrente
pode copiar sem refazer a arquitetura de URL** (seção 4.3). Ele deve ser o do meio,
que é a posição de maior leitura.
| Escolha do endereço, título | `Escolha seu endereço` |
| Escolha do endereço, ajuda | `É o link que você vai compartilhar. Dá para mudar depois, mas os links antigos param de funcionar.` |
| Cartão público, botão de contato | `Salvar nos contatos` |
| Cartão público, acima do QR | `Aponte a câmera` |
| Pré-visualização, tarja | `Só você está vendo. Publique para liberar o link.` |
| Publicar, botão | `Publicar cartão` |
| Despublicar, botão | `Tirar do ar` |
| Trocar handle, aviso | `Os links com o endereço antigo param de funcionar. Seu QR code e suas etiquetas NFC continuam funcionando.` |
| Excluir conta, aviso | `Apaga seu cartão, sua foto e seus dados. Não dá para desfazer, e seu endereço fica livre para outra pessoa.` |
| Mensagem padrão do WhatsApp | `Olá! Vi seu cartão e gostaria de falar com você.` |
| 404 | `Não encontrei esse cartão.` + `Ele pode ter sido removido ou o endereço mudou.` |
| Conta bloqueada, painel | `Seu cartão está fora do ar por violação dos termos de uso. Escreva para alexandre@dablab.com.br.` |
| Rodapé da home | `Cartão de Visita — Dab Lab` · `Termos` · `Privacidade` · `alexandre@dablab.com.br` |

### 15.5 Instruções de NFC — `/conta/compartilhar`

Derivadas literalmente da tabela 11.6. **Não prometa nada além disto.**

> **Etiqueta NFC**
>
> Dá para gravar seu link numa etiqueta NFC e colar atrás do celular, na carteira
> ou num cartão de plástico. Quem encostar o celular na etiqueta abre seu cartão —
> sem app, no iPhone e no Android.
>
> A gravação é feita fora daqui, por enquanto. Baixe o **NFC Tools** (grátis, iPhone
> e Android), escolha *Gravar → URL* e cole este endereço:
>
> `https://cartaodevisita.app.br/c/<id_permanente>`   [Copiar]
>
> Use etiquetas **NTAG215**. Se for colar em metal ou atrás do celular, procure por
> etiqueta "on-metal", que tem uma camada de ferrite — sem ela o alcance cai muito.
>
> Esse endereço nunca muda, mesmo que você troque seu endereço bonito. Pode travar
> a etiqueta como somente leitura sem medo.
>
> **Uma coisa que não funciona:** encostar um celular no outro. Nem o iPhone nem o
> Android passam contato assim. A etiqueta física é o caminho.

---

## 16. Direção visual

### 16.1 Duas estéticas, separadas de propósito

Este produto tem **duas superfícies com regras diferentes**, e confundi-las é o
erro de design mais provável aqui:

| | Painel (`/conta`, `/admin`) | Cartão público (`/<handle>`) |
|---|---|---|
| De quem é a estética | do produto | **do dono do cartão** |
| Cor | **nenhuma — preto, branco e cinza** | a `cor_destaque` escolhida |
| Layout | fixo, menu lateral | um entre quatro templates |
| Modo escuro | segue o sistema | **não** — ver 3.2 |
| Objetivo | não atrapalhar | causar boa impressão em 3 segundos |

O painel é ferramenta. O cartão é a peça. O painel nunca deve competir visualmente
com a pré-visualização do cartão que ele contém.

### 16.2 Paleta de destaque — enum, não hexadecimal livre

Oito cores, e só. **Alternativa descartada:** seletor livre de cor, descartado por
dois motivos concretos: combinação escolhida à mão quebra o contraste mínimo de
4.5:1 com frequência (requisito 17.3), e cartão feio prejudica o produto inteiro,
porque o cartão *é* a propaganda.

Cada cor tem **dois tons**: `fundo` recebe texto branco por cima (botão de
WhatsApp, faixa do template `cartao`), e `texto` é a mesma cor escrevendo sobre
branco. Valores definidos e conferidos em 20/09/2026 — o contraste de cada um está
na tabela e é verificado por teste (22.1).

| Valor | Interface | `fundo` | vs. branco | `texto` | vs. `#FFFFFF` |
|---|---|---|---|---|---|
| `azul` | Azul · padrão | `#1D4ED8` | 6,3:1 | `#1E40AF` | 8,6:1 |
| `verde` | Verde | `#15803D` | 4,9:1 | `#166534` | 7,4:1 |
| `roxo` | Roxo | `#6D28D9` | 6,6:1 | `#5B21B6` | 8,3:1 |
| `vermelho` | Vermelho | `#BE123C` | 6,1:1 | `#9F1239` | 8,2:1 |
| `laranja` | Laranja | `#C2410C` | 5,1:1 | `#9A3412` | 7,0:1 |
| `rosa` | Rosa | `#BE185D` | 6,0:1 | `#9D174D` | 7,9:1 |
| `grafite` | Grafite · o sóbrio | `#27272A` | 14,8:1 | `#18181B` | 17,4:1 |
| `dourado` | Dourado | `#A16207` | 5,2:1 | `#854D0E` | 7,0:1 |

**Nota sobre o `dourado`, registrada para não virar discussão depois:** dourado
metálico de verdade (`#D4AF37`) dá **1,9:1** contra branco e reprova em qualquer
critério de acessibilidade. Não há conserto — é física da cor, não gosto. O que
está na paleta é um **ocre profundo** que passa em 5,2:1 e ainda lê como dourado.
Se isso não servir, a troca recomendada é **teal** (`#0F766E` · 5,3:1), que cobre
um gosto que a paleta hoje não cobre. Ver pergunta 25.9.

Neutros do cartão: fundo `#FFFFFF`, fundo alternativo `#FAFAF9`, traço `#E7E5E4`,
texto `#18181B`, texto secundário `#52525B`, texto terciário `#A8A29E`.

**O produto não tem cor de marca** (16.6): preto é a marca. As oito cores desta
seção pertencem ao cartão, nunca ao chrome. Verde, âmbar e vermelho de estado
(sucesso, aviso, erro) existem **só no painel** e não são afetados pela
`cor_destaque` — um cartão com destaque vermelho não pode fazer a mensagem de erro
do painel sumir no meio da interface.

### 16.3 Templates

Quatro, com a mesma informação e arranjos diferentes. Nenhum deles esconde campo:
o que muda é hierarquia e proporção.

| Valor | Ideia | Para quem |
|---|---|---|
| `minimalista` | Foto redonda pequena no topo, nome grande, links empilhados em botões de largura total | padrão, o mais legível |
| `cartao` | A área superior imita um cartão de visitas físico, com proporção 85×55 mm e a cor de destaque preenchendo o fundo | quem quer o gesto do cartão de papel |
| `foto` | Foto ocupando a largura inteira no topo, com o nome sobreposto num degradê | fotógrafo, personal, quem vende imagem |
| `executivo` | Sem foto grande: iniciais num monograma, tipografia serifada, muito espaço em branco | advogado, consultor, perfil sóbrio |

Em todos: o botão de WhatsApp é o primeiro elemento de ação, com o maior peso
visual da página (princípio 0.3). Isso não é opção do template.

### 16.4 Tipografia e espaçamento

**Duas famílias, ambas do Google Fonts.**

| Papel | Família | Onde aparece |
|---|---|---|
| Display | **Instrument Serif** | o título da home e **só ele**, mais o nome e o monograma do template `executivo` |
| Texto e interface | **Plus Jakarta Sans** | todo o resto, nos dois lados do produto |

Plus Jakarta Sans foi escolhida por ter acentuação e `ç` bem desenhados em corpo
pequeno — que é o critério real em pt-BR, não estilo. **Inter, Roboto e Arial estão
fora.**

**Escala — seis tamanhos, e só:**

| px | Peso | Uso |
|---|---|---|
| 28 | 700 | nome no cartão |
| 20 | 600 | título de tela do painel |
| 16 | 400/500 | corpo — **o piso na página pública** |
| 15 | 600 | rótulo de botão |
| 13 | 500 | apoio no painel |
| 11 | 600 | selo, marca no rodapé |

- Espaçamento em múltiplos de **4 px**.
- Cantos: **pílula** (raio total) para ação no painel; **12–14 px** para cartão e caixa; **4 px** no template `executivo`, que é o único anguloso.
- Separadores em **hairline** de 1 px, nunca borda pesada. **Sombra só no template `cartao`**, onde ela existe para simular um cartão físico apoiado na página.

### 16.5 Metatags de compartilhamento

Quando `permitir_indexacao` for verdadeiro, a página emite Open Graph e Twitter
Card com: título `<nome_exibicao>`, descrição `<cargo> · <empresa>` (ou a bio, se
não houver cargo), e imagem `foto_url`. Sem foto, a imagem é uma gerada com as
iniciais sobre a cor de destaque.

Quando for falso, emite `noindex, nofollow` e **não** emite Open Graph — para que o
cartão não ganhe prévia rica ao ser colado em grupo de WhatsApp sem a pessoa ter
pedido.

### 16.6 O painel — monocromático

**Decisão de 20/09/2026, substituindo o padrão anterior de menu lateral colorido.**
A referência é o Ads Manager do ChatGPT: o chrome do produto é preto, branco e
cinza, e **a única cor em tela é a do cartão que a pessoa está editando**.

Por que isso é melhor do que um azul de marca: o painel existe para mostrar o
cartão, e um painel colorido compete com a pré-visualização — que é exatamente o
que o princípio de 16.1 proíbe. Sem cor nenhuma no chrome, a cor de destaque do
cartão salta, e o produto ganha uma identidade que não precisa ser defendida.

| Elemento | Regra |
|---|---|
| Ação primária | **pílula preta** `#0D0D0D`, texto branco, raio total. Nunca azul, nunca colorida |
| Ação secundária | pílula branca com traço `#D9D9D9` |
| Ação desabilitada | pílula `#ECECEC` com texto `#A3A3A3`, **com o motivo ao lado** |
| Ação destrutiva | **única exceção à regra do preto**: traço e texto em vermelho do sistema |
| Item de menu ativo | fundo `#ECECEC`, raio 9 px, texto e ícone pretos — **nunca colorido, sem bolinha, sem barra lateral** |
| Item inativo | texto `#3D3D3D`, ícone `#6E6E6E` |
| Menu lateral | fundo `#F9F9F9`, traço `#E5E5E5` à direita, **lista plana com ícone**, sem títulos de grupo |
| Aba ativa | texto preto com **sublinhado preto de 2 px**; inativa em `#8F8F8F` |
| Aviso / faixa | fundo branco, traço `#E5E5E5`, raio 12 px — **neutro, nunca azul** |
| Cabeçalho de tabela | fundo `#F9F9F9`, rótulo `#6E6E6E` |
| Sombra | **nenhuma**, em lugar nenhum |
| Selos de plano | três degraus de **peso**, não de cor: `Gratuito` cinza chapado · `Early adopter` contornado em preto · `Ilimitado` preenchido em preto |

Menu do dono — lista plana, sem grupos:

```
Meu cartão
Links
Aparência
Compartilhar
Ajustes
```

Menu do admin: `Meu cartão` · `Contas` · `Ações`.

**Rodapé do menu**: avatar e nome curto da pessoa mais o ícone de sair — sem o
e-mail inteiro, que estoura a largura.

No celular, o menu vira **barra inferior** com os cinco destinos, ícone e rótulo
de 10 px, e o ativo em preto.

**A semântica de cor continua existindo só no painel** (verde, âmbar, vermelho de
estado) e não é afetada pela `cor_destaque` do cartão.

### 16.7 O que ainda não foi desenhado

A etapa de design de 20/09/2026 entregou: a paleta do cartão com contraste
conferido (16.2), a tipografia e a escala (16.4), os quatro templates (16.3), o
sistema monocromático do painel (16.6), e as telas de Meu cartão, Links,
Aparência, Compartilhar, QR em tela cheia e Admin · Contas.

**Falta desenhar**, com o sistema já definido:

| Tela | Observação |
|---|---|
| Home, em 1280 e 375 | Estrutura e copy já especificadas (15.4 e 15.4.1); falta o desenho, incluindo o mockup do cartão dentro de um celular |
| `/admin/contas/[id]` | As quatro ações de moderação e o histórico |
| `/conta/ajustes` | Inclui a zona de risco e a exclusão de conta |
| `/conta/handle` | A tela de escolha do endereço, que é o momento mais difícil do painel (2.1) |
| Estado vazio de Links | Texto já definido em 8.3 |
| 404 | Copy já definida em 15.4 |

**Resolvido em 20/09/2026:** o ícone do produto (`app/icon.svg`) — o quadrado
preto de cantos arredondados da marca, com um cartão branco dentro mostrando foto
e duas linhas. As formas são grandes o bastante para continuarem legíveis em
16 px na aba do navegador.

Nenhuma delas precisa de decisão nova de direção visual — o sistema das seções
16.2, 16.4 e 16.6 já cobre todos os componentes que elas usam.

---

## 17. Requisitos não-funcionais

### 17.1 Desempenho — a página pública

Medido em 4G simulado, aparelho mediano, cache frio:

| Métrica | Alvo | Por quê |
|---|---|---|
| LCP | **< 1,5 s** | É o momento do cenário 2.2 |
| Primeiro byte | < 400 ms | |
| JavaScript entregue | **< 40 KB** comprimido | O conteúdo não depende dele (princípio 0.2) |
| Peso total, com foto | < 250 KB | |
| Funciona com JS desativado | **sim**, para todo o conteúdo e todos os links | |

O QR é SVG gerado no servidor; o cliente não baixa biblioteca de QR. A foto é
servida já no tamanho final — não há redimensionamento no cliente na página
pública.

### 17.2 Desempenho e forma do painel

LCP abaixo de 2,5 s. Salvar um campo responde em menos de 500 ms. Não há alvo mais
agressivo porque o painel é usado raramente (persona 2.1).

**O painel é desenhado primeiro para o celular, não para o desktop.** O público da
seção 1 monta o cartão no aparelho que tem na mão — o técnico em domicílio, o
vendedor entre visitas, a psicanalista entre sessões. Desenhar para a tela grande e
"adaptar" depois produz formulário em duas colunas que vira uma coluna apertada.

Consequências concretas:

- Toda tela de `/conta` é usável em 375 px de largura, sem rolagem horizontal.
- Alvo de toque mínimo de 44×44 pt também no painel, não só na página pública.
- A pré-visualização do cartão fica **abaixo** do formulário no celular, e ao lado só a partir de 1024 px.
- O envio de foto aceita a câmera direto (`capture` no seletor de arquivo).
- Nenhuma ação depende de passar o mouse por cima, de arrastar com precisão fina nem de atalho de teclado. A reordenação de links tem alça grande **e** botões de subir/descer, porque arrastar em tela pequena falha.

### 17.3 Acessibilidade

| Requisito | Valor |
|---|---|
| Contraste de texto | mínimo 4.5:1, **verificado para as oito cores da paleta** |
| Área de toque | mínimo 44×44 pt em toda ação da página pública |
| Corpo de texto | nunca abaixo de 16 px na página pública |
| Navegação por teclado | toda ação do painel alcançável por `Tab`, com foco visível |
| Leitor de tela | foto com `alt` igual ao nome; cada link com rótulo acessível; o QR com texto alternativo contendo o endereço |
| Tipografia do sistema aumentada | a página pública não quebra até 200% |
| `prefers-reduced-motion` | respeitado; sem animação de entrada quando ativo |

### 17.4 Volume esperado

| | 6 meses | 24 meses |
|---|---|---|
| Contas | 500 | 5.000 |
| Visitas/mês | 15.000 | 250.000 |
| Armazenamento | 70 MB | 700 MB |

Confortavelmente dentro do gratuito nos dois horizontes (seção 4.6.1).

### 17.5 Compatibilidade

| | Mínimo |
|---|---|
| Safari iOS | 16 |
| Chrome Android | 110 |
| Navegadores de desktop | duas últimas versões estáveis |
| Leitura de NFC (informativo) | iPhone XS / iOS 13+; Android com NFC |

### 17.6 Offline, bateria e idioma

Não há modo offline — a página é um documento remoto e não há o que sincronizar.
Nenhum trabalho em segundo plano, nenhum timer, nenhuma animação contínua: o
consumo de bateria é o de uma página estática. **Português do Brasil, só.**
Internacionalização não está no escopo e não deve haver estrutura de tradução
"preparada para depois" (princípio 0.5).

---

## 18. Convenções de código, documentação e estrutura

### 18.1 Idioma

- **Dados em português.** Coleções, campos, enums e valores de enum em português, `snake_case`: `cartoes`, `nome_exibicao`, `id_permanente`, `visitas_diarias`, `tipo_link`.
- **Todo o resto em inglês.** Componentes, hooks, rotas de servidor, helpers, nomes de arquivo e de pasta.
- **A fronteira é `lib/firebase/firestore.ts`** — o único arquivo que conhece os nomes das coleções. Uma função `buscarCartaoPorHandle` (português, porque é acesso a dados) devolve um tipo `Cartao` cujos campos estão em português. Um componente `CardPreview` (inglês) consome esse tipo. Isso é proposital, não inconsistência.
- **Texto de interface sempre em português, centralizado em `lib/copy.ts`.** Nenhuma string de interface solta em componente. A copy da seção 15 é literal.

### 18.2 Comentários

Toda função, hook, rota de servidor, guarda e componente com lógica leva
**comentário de cabeçalho em português** dizendo o que faz, o que recebe, o que
devolve e **qual regra do spec implementa, com o número da seção**.

Lógica não óbvia leva comentário inline explicando a **intenção**, nunca a sintaxe.

```
// ruim:  // incrementa o contador
// bom:   // conta a visita antes de renderizar, porque a leitura é cacheada
//        // e o render é a única coisa que roda a cada requisição (seção 4.6.2)
```

O objetivo é prático: este código precisa continuar editável por prompt daqui a
seis meses, por alguém — ou algum agente — que não participou da implementação.

### 18.3 Estrutura de pastas

```
app/
  (public)/page.tsx                → home
  (public)/termos, /privacidade    → documentos legais
  (public)/[handle]/page.tsx       → o cartão
  (public)/[handle]/qr/page.tsx    → QR em tela cheia
  c/[id]/route.ts                  → redirecionador permanente (308)
  entrar/                          → login com Google
  conta/                           → painel do dono, com menu lateral
  admin/                           → painel da plataforma
  api/cartoes/                     → vcard e qr.png, públicas
  api/eventos/                     → contadores de clique
  api/conta/                       → do dono, todas com requireDono()
  api/admin/                       → da plataforma, todas com requireAdminPlataforma()
components/
  card/       CardView, CardPhoto, LinkButton, WhatsAppButton, QrCode
  account/    Sidebar, CardEditor, LinkList, TemplatePicker, ColorPicker
  platform/   ações do admin sobre uma conta
  marketing/  cabeçalho, rodapé e casca dos documentos legais
lib/
  firebase/   admin.ts, firestore.ts (ÚNICO que conhece as coleções), storage.ts
  auth.ts     configuração do Auth.js — SEM Firebase, para rodar no Edge
  guards.ts   requireDono, requireAdminPlataforma
  admins.ts   a allowlist de admins, sem imports, para não criar ciclo
  planos.ts   a allowlist ILIMITADOS e os limites por plano (11.11), sem imports
  vcard.ts    geração do .vcf (seção 14)
  qr.ts       geração do SVG e do PNG
  links.ts    normalização por tipo (regra 11.5)
  copy.ts     toda a copy da seção 15
types/
scripts/
tests/
```

### 18.4 As cinco pegadinhas que não podem ser quebradas

Cada uma tem um comando de verificação na seção 26.

1. **Toda rota `/api/conta/*` chama `requireDono()` na primeira linha; toda rota `/api/admin/*` chama `requireAdminPlataforma()`.** Sem banco relacional não há RLS por baixo — essa linha é a única coisa entre um estranho e os dados de todo mundo. **Há teste que falha se uma rota tocar o Firestore ou o Storage antes de autorizar. Não desative esse teste.**
2. **Cartão despublicado, conta bloqueada, handle inexistente e rota de admin para não-admin devolvem `404`, nunca `403`.** "Existe, mas não é seu" confirma a existência. Há teste comparando as respostas byte a byte.

   **Exceção declarada, e a única:** uma conta bloqueada por moderação recebe
   `403` nas **próprias** rotas `/api/conta/*` (`lib/guards.ts`). Isso não
   confirma recurso alheio — a pessoa já sabe que a conta é dela —, e 403 é a
   resposta HTTP correta para "autenticado, mas proibido". O teste estrutural
   permite esse 403 **só em `lib/guards.ts`**; qualquer outro no projeto quebra
   a suíte.
3. **Nenhuma chamada ao Firestore ou ao Storage acontece no navegador.** Sempre em rota de servidor ou componente de servidor. As regras de segurança negam todo acesso do cliente — elas não são a autorização, são a garantia de que não existe segunda porta.
4. **O QR e a etiqueta NFC codificam `/c/<id_permanente>`, nunca `/<handle>`.** É o princípio 0.4. Há teste que troca o handle e verifica que o id permanente continua levando ao cartão.
5. **`visitas_diarias` não ganha campo que identifique visitante.** Sem IP, sem user-agent, sem cookie, sem cidade. Há teste estrutural que falha se a forma do documento mudar sem o teste ser atualizado junto.

### 18.5 Documentação viva

- `DOCUMENTACAO-TECNICA.md` na raiz — ver seção 19.
- `CLAUDE.md` na raiz — convenções, mapa da arquitetura, comandos e as cinco pegadinhas de 18.4.
- `README.md` — setup local, variáveis de ambiente, como rodar o emulador.
- `modelo-Cartão de Visita.dbml` — o modelo de dados, atualizado junto com a seção 7.

**Os três primeiros são atualizados no mesmo commit da mudança.**

### 18.6 Variáveis de ambiente

| Variável | Pública? | Para quê |
|---|---|---|
| `NEXT_PUBLIC_URL_BASE` | pública | Base das URLs absolutas (QR, vCard, Open Graph) |
| `EARLY_ADOPTER_ABERTO` | **secreta** (sem `NEXT_PUBLIC_`) | `true` faz conta nova nascer `early_adopter` (regra 11.11.3). Ausente ou diferente de `true` = `gratuito`. **Lida só na criação da conta** |
| `VISAO_API_KEY` | **secreta** | Chave do Visão de Produto (seção 21.3). **Nunca com prefixo `NEXT_PUBLIC_`, nunca em arquivo versionado.** Ausente = telemetria desligada, e o app funciona igual |
| `AUTH_SECRET` | **secreta** | Auth.js |
| `AUTH_GOOGLE_ID` | pública | OAuth |
| `AUTH_GOOGLE_SECRET` | **secreta** | OAuth |
| `FIREBASE_PROJECT_ID` | pública | Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | **secreta** | Admin SDK |
| `FIREBASE_PRIVATE_KEY` | **secreta** | Admin SDK |
| `FIREBASE_STORAGE_BUCKET` | pública | Storage |

**Nenhuma credencial privilegiada no cliente.** Variável com `NEXT_PUBLIC_` vai
para o navegador — não coloque segredo atrás desse prefixo por engano.

### 18.7 Comandos

```bash
npm run dev         # servidor local
npm run emu         # emulador do Firebase (exige Java)
npm run build       # build de produção
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # suíte unitária, sem dependência externa
npm run test:emu    # integração contra o emulador
```

**Build sem warning nosso é critério de aceite.**

---

## 19. Documento de documentação técnica

Ao fim da implementação, o agente de código gera `DOCUMENTACAO-TECNICA.md` na raiz,
**em português**, descrevendo o sistema **como ele ficou**, não como foi planejado.
É o documento que permite retomar o projeto — ou trocar de agente — sem
engenharia reversa. Conteúdo mínimo, nesta ordem:

1. **Modelo de dados explicado** — cada coleção: para que serve, o que cada campo significa em linguagem de negócio (não só o tipo), quais valores cada enum aceita e o que cada valor quer dizer.
2. **Relacionamento entre as coleções** — diagrama em texto e, para cada relação, uma frase com a cardinalidade no vocabulário do negócio.
3. **Regras que vivem no servidor** — todas as funções de `lib/firebase/firestore.ts` e todas as guardas, com **nome exato**, o que fazem, quando rodam e qual regra do spec implementam. Deve dar para ler essa lista e entender toda a lógica que a interface não mostra.
4. **Mapa tela → coleções** — para cada tela, o que lê, o que escreve e por qual guarda passa.
5. **Lógica das funcionalidades por tela** — o que é validado, o que é gravado, o que é calculado e onde, e o que o usuário vê em caso de erro.
6. **Divergências em relação ao spec** — o que ficou diferente e por quê. Sem esta seção o documento envelhece mentindo.

**Regra de manutenção:** toda mudança em modelo de dados, guarda, rota ou lógica de
tela atualiza este documento no mesmo commit.

---

## 20. Privacidade, segurança e conformidade

O produto lida com dado pessoal por definição — um cartão de visitas **é** um
pacote de dado pessoal, publicado de propósito pelo próprio titular. Isso torna o
desenho mais simples em uma ponta e mais delicado na outra.

### 20.1 O que é coletado do dono

| Dado | De onde | Por quê | Base legal (LGPD) |
|---|---|---|---|
| E-mail, nome e foto do Google | login | identificar a conta e pré-preencher o cartão | execução de contrato (art. 7º, V) |
| Conteúdo do cartão | digitado pelo titular | é o produto | consentimento, com publicação explícita |
| Data de criação e último acesso | sistema | suporte e limpeza de conta inativa | legítimo interesse (art. 7º, IX) |
| **E-mail + eventos de uso do painel**, enviados ao Visão de Produto (seção 21.3) | uso do painel | entender onde as pessoas travam e melhorar o produto | legítimo interesse (art. 7º, IX), **declarado na política de privacidade**, com o Visão de Produto nomeado como operador |

**Retenção:** enquanto a conta existir. Conta sem acesso por 24 meses recebe aviso
e é excluída em 30 dias — rotina da seção 28.7, **não implementada na v1**; até lá,
a limpeza é manual.

### 20.2 O que **não** é coletado do visitante

Esta é a decisão de privacidade mais importante do produto, e ela é uma restrição
de arquitetura, não uma promessa de política:

- **Sem IP, sem user-agent, sem cookie, sem impressão digital do navegador.**
- **Sem analytics de terceiros.** Nada de Google Analytics, Meta Pixel, Hotjar.
- **Nenhuma chamada ao Visão de Produto a partir da página pública** (seção 21.3) — nem no cliente, nem no servidor.
- **Sem cookie de qualquer espécie na página pública** — e, portanto, **sem banner de consentimento**, que é a razão de a página abrir sem nada na frente do conteúdo.
- O único registro é um **contador agregado por dia** (seção 7.6), do qual é impossível extrair quem visitou.

**A fronteira, em uma frase:** o produto mede **o dono**, que tem conta e
consentiu; nunca **o visitante**, que não tem conta e não consentiu. Toda
telemetria vive do lado de dentro do login.

**A pegadinha 18.4.5 protege exatamente isto.** A tentação de acrescentar "cidade
do visitante" ou "de onde veio o clique" vai aparecer; ela transformaria o produto
num rastreador e exigiria banner de consentimento, o que contraria o princípio 0.2.

### 20.3 Exposição pública e scraping

O cartão é uma página pública com telefone e e-mail — é literalmente o objetivo.
Isso tem um custo, e o produto é honesto sobre ele:

| Medida | O que faz | O que **não** faz |
|---|---|---|
| `permitir_indexacao` falso por padrão | emite `noindex, nofollow`; o cartão não aparece em busca a menos que o dono queira | não impede scraper que ignora `robots` |
| Sem diretório público (anti-escopo 1.1) | não há lista de cartões para varrer; o endereço precisa ser conhecido | não protege quem divulga o link amplamente |
| `id_permanente` não sequencial (regra 11.3) | não dá para enumerar contas incrementando um número | — |

**Assumido explicitamente:** quem publica um cartão de visitas está dando o contato
de propósito, e o produto não finge que consegue proteger dado que o titular
escolheu publicar. A tela de publicação diz isso em uma frase.

### 20.4 Direitos do titular

| Direito | Como é atendido |
|---|---|
| Acesso | todo o dado está visível no painel |
| Correção | o painel é o editor |
| **Eliminação** | botão em `/conta/ajustes`, com confirmação por digitação do handle. Apaga conta, cartão, handle, id permanente, visitas e arquivos, **na hora, sem fila e sem soft delete** |
| Portabilidade | o `.vcf` do próprio cartão |
| Revogação do consentimento | despublicar tira do ar imediatamente |

O log `acoes_admin` sobrevive à exclusão (seção 7.8). São registros de atos de
moderação da plataforma, mantidos por legítimo interesse e por defesa em processo;
eles guardam o `usuario_id`, não o conteúdo do cartão.

### 20.5 Segredos e superfície de ataque

- Credencial do Firebase Admin SDK **só no servidor**, por variável de ambiente na Vercel. Nunca em `NEXT_PUBLIC_`, nunca em arquivo versionado.
- `.env.local` no `.gitignore`. Há teste que falha se uma chave privada aparecer em arquivo versionado.
- Envio de foto: validação por **magic bytes**, teto de tamanho, e o arquivo é reescrito no redimensionamento — um SVG ou um polyglot disfarçado não sobrevive.
- As fotos são servidas do Storage por URL não adivinhável, contendo o `uid`.
- Sem `dangerouslySetInnerHTML` em nenhum lugar. Todo texto do cartão é renderizado como texto.
- URL de link do tipo `site`/`outro` aceita **só** `https://` e `http://`; `javascript:`, `data:` e demais esquemas são rejeitados no servidor. **Esta é a única entrada de texto livre que vira atributo `href`, e é por onde um XSS entraria.**

### 20.6 Sem IA

Não há modelo de linguagem em nenhum ponto do produto — nem para gerar bio, nem
para sugerir cargo, nem para moderar conteúdo. Não há, portanto, guardrail a
definir. A moderação é humana e reativa, por denúncia (seção 8.9).

---

## 21. Métricas de sucesso e telemetria

### 21.1 As métricas que importam

Quatro, com alvo e prazo. O produto é grátis na v1, então nenhuma delas é de
receita — todas medem se a coisa **serve**.

| # | Métrica | Alvo | Prazo | Por que esta |
|---|---|---|---|---|
| 1 | **Taxa de conclusão**: contas que publicam o cartão ÷ contas criadas | **≥ 60%** | 3 meses | Mede se o caminho de 9.1 funciona. Abaixo disso, alguma tela está perdendo gente — e o suspeito é a escolha do endereço (persona 2.1) |
| 2 | **Cartões com visita real**: cartões com ≥ 5 visitas em 30 dias ÷ cartões publicados | **≥ 40%** | 6 meses | Separa quem montou por curiosidade de quem **usa**. É a métrica mais honesta do produto |
| 3 | **Taxa de salvamento**: `salvou_contato` ÷ visitas | **≥ 25%** | 6 meses | Mede se o cartão cumpre a função. Baixa aqui significa que o `.vcf` está falhando em algum aparelho (seção 14) ou que o botão está no lugar errado |
| 4 | **Origem por código**: `por_codigo` ÷ total de visitas | **≥ 30%** | 6 meses | Mede se QR e NFC pegaram. Se ficar muito baixa, o produto virou só um link-in-bio — e aí a seção 28.1 (NFC) perde prioridade para a 28.6 |

### 21.2 De onde sai cada métrica

**Duas fontes, com fronteira rígida entre elas** — e a fronteira é a seção 20.2.

| Fonte | Mede | Cobre |
|---|---|---|
| **`visitas_diarias`** (Firestore, 7.6) | o que acontece na **página pública**, em contador agregado por dia, sem nenhum dado de visitante | métricas 21.1.2, 21.1.3, 21.1.4 |
| **Visão de Produto** (21.3) | o que o **dono logado** faz dentro do painel | métrica 21.1.1 e o funil de ativação inteiro |

As métricas que dependem de `visitas_diarias` saem por consulta agregada em
`scripts/metricas.mjs`. **Nenhuma delas passa pelo Visão de Produto**, porque
isso seria mandar para fora um evento disparado pela visita de quem não tem conta.

Nenhum SDK de analytics entra na página pública: carregaria JavaScript de terceiro
(contra 17.1), criaria cookie (contra 20.2) e passaria a exigir banner de
consentimento.

### 21.3 Visão de Produto — telemetria do painel

Serviço próprio da Dab Lab, usado para medir o funil de ativação do dono do
cartão. **Só o painel é instrumentado.**

#### 21.3.1 As cinco regras que não podem ser quebradas

1. **Nunca a partir da página pública.** Nem no cliente, nem no servidor, nem por rota interna. Um evento disparado pela visita de alguém sem conta seria rastreamento de visitante, contra a seção 20.2, e passaria a exigir banner de consentimento — o que contraria o princípio 0.2.
2. **Sempre no servidor.** A chave nunca vai ao navegador. Não existe `NEXT_PUBLIC_VISAO_*`.
3. **Disparar e esquecer.** A chamada roda em `after()` do `next/server`, depois de a resposta já ter sido enviada, com timeout de 2 segundos. **Nenhuma ação do usuário espera pela telemetria**, e uma falha nunca vira erro de tela — só um `console.warn`.
4. **Sem `VISAO_API_KEY`, é no-op silencioso.** O app funciona igual em desenvolvimento e em qualquer ambiente sem a chave. Não há erro, não há aviso na interface.
5. **Nunca sai conteúdo, só forma.** Vão contagens, enums e durações. **Nunca** vão foto, bio, nome de exibição, telefone, chave PIX, e-mail de link, endereço, nem o valor de link nenhum. Se a propriedade não for número, booleano ou valor de enum do spec, ela não entra.

#### 21.3.2 Contrato

`POST https://api.visaodeproduto.com.br/functions/v1/ingest`, com
`content-type: application/json` e `x-api-key: <VISAO_API_KEY>`.

```json
{ "eventos": [{
    "id": "<UUID v4 gerado no servidor>",
    "nome": "cartao_de_visitas_<evento>",
    "distinct_id": "<e-mail do dono>",
    "ocorrido_em": "<ISO 8601 em UTC>",
    "tela": "<nome da tela, seção 10>",
    "descricao": "<uma frase em português>",
    "propriedades": { }
}] }
```

| Campo | Regra |
|---|---|
| `id` | UUID v4 gerado no servidor, um por evento. É o que dá idempotência se a chamada for repetida |
| `nome` | sempre com o prefixo `cartao_de_visitas_`, em `snake_case` |
| `distinct_id` | **o e-mail do dono logado**, sempre. Nunca um id de visitante, nunca um id anônimo inventado |
| `ocorrido_em` | UTC, mesmo que a agregação do produto use São Paulo (regra 11.9) |
| `tela` | um dos nomes da seção 10, em `PascalCase`: `Entrar`, `EscolherEndereco`, `MeuCartao`, `Links`, `Aparencia`, `Compartilhar`, `Ajustes`, `AdminContas` |

Tudo vive em `lib/telemetria.ts`, com uma função só — `registrarEvento(nome, dono, tela, descricao, propriedades)`. **Nenhum outro arquivo conhece a URL ou a chave.**

#### 21.3.3 Catálogo de eventos

| `nome` (sem o prefixo) | `tela` | Quando | `propriedades` |
|---|---|---|---|
| `conta_criada` | `Entrar` | a conta nasce, no primeiro acesso | `plano` |
| `endereco_escolhido` | `EscolherEndereco` | reserva do handle concluída | `tentativas`, `usou_sugestao` |
| `foto_enviada` | `MeuCartao` | as duas derivadas gravaram | `kb_exibicao`, `kb_vcard` |
| `link_adicionado` | `Links` | link salvo | `tipo`, `total_apos` |
| `link_removido` | `Links` | link removido | `tipo`, `total_apos` |
| `links_reordenados` | `Links` | ordem salva | `total` |
| `visual_escolhido` | `Aparencia` | template ou cor trocados | `template`, `cor` |
| **`limite_atingido`** | `Links` · `Aparencia` | a pessoa bateu no teto do plano | `recurso` (`links`·`template`·`cor`), `plano` |
| **`cartao_publicado`** | `MeuCartao` | publicou | `links`, `template`, `cor`, `plano`, `tem_foto`, `tem_bio`, `minutos_desde_criacao` |
| `cartao_despublicado` | `MeuCartao` | tirou do ar | `dias_no_ar` |
| `link_copiado` | `Compartilhar` | copiou o link bonito | — |
| `qr_baixado` | `Compartilhar` | baixou o PNG | — |
| **`endereco_nfc_copiado`** | `Compartilhar` | copiou a URL permanente para gravar etiqueta | — |
| `endereco_trocado` | `Ajustes` | trocou o handle | `dias_com_o_anterior` |
| `indexacao_alterada` | `Ajustes` | ligou/desligou indexação | `permitir` |
| `conta_excluida` | `Ajustes` | excluiu a conta | `dias_de_vida`, `chegou_a_publicar` |
| `plano_alterado_por_admin` | `AdminContas` | admin trocou o plano | `de`, `para` |

**Os três em negrito são os que decidem produto:**

- `limite_atingido` é o momento em que a pessoa encosta no plano. É a única evidência real de que existe disposição a pagar, e é o que a seção 28.2 precisa antes de cobrar.
- `cartao_publicado` com `minutos_desde_criacao` mede a promessa da home ("monte em cinco minutos"). Se a mediana for 20, a copy está mentindo.
- `endereco_nfc_copiado` **decide a prioridade da seção 28.1**: se quase ninguém copiar, gravar NFC não vale um app, nem a segunda etapa do roadmap.

#### 21.3.4 O que a página pública manda — nada

Não há evento de visita, de salvamento de contato nem de clique em WhatsApp no
Visão de Produto. Esses três continuam sendo contadores em `visitas_diarias`
(seção 7.6). Se um dia fizer falta ter essa série no Visão de Produto, o caminho
correto é uma **rotina diária que envia o agregado do dia anterior**, com
`distinct_id` do dono — nunca um evento por visita. Isso entra na seção 28.7.

---

## 22. Estratégia de teste

### 22.1 O que é testado automaticamente

| Área | Tipo | O que cobre |
|---|---|---|
| **Guardas** (18.4.1) | unitário + estrutural | Toda rota `/api/conta/*` chama `requireDono()` antes de tocar dados; toda `/api/admin/*` chama `requireAdminPlataforma()`. **Teste estrutural varre os arquivos de rota** — rota nova sem guarda quebra o build |
| **404 vs 403** (18.4.2) | integração | Cartão despublicado, conta bloqueada, handle inexistente e `/admin` para não-admin devolvem respostas idênticas |
| **Reserva de handle** (8.1.9) | integração, emulador | Duas gravações simultâneas do mesmo handle: uma vence, uma perde |
| **Permanência do id** (18.4.4) | integração | Troca o handle e confirma que `/c/<id>` leva ao novo cartão |
| **Normalização de links** (11.5) | unitário | Cada tipo, com todas as formas de entrada da tabela |
| **Formato do vCard** (14.2) | unitário | CRLF, dobra em 75 **octetos** com foto, escape de `;` e `,`, ausência de `PHOTO` sem foto, teto de tamanho |
| **Formato do id permanente** (11.3) | unitário | Alfabeto e comprimento; ausência de `0`, `1`, `l`, `i`, `o` |
| **Limites do cartão** (11.4) | unitário | 16º link, segundo WhatsApp, segundo PIX, textos acima do limite |
| **Esquemas de URL** (20.5) | unitário | `javascript:`, `data:`, `file:` rejeitados em link de tipo `site`/`outro` |
| **Forma de `visitas_diarias`** (18.4.5) | estrutural | Falha se um campo novo aparecer sem o teste ser atualizado |
| **Telemetria fora da página pública** (21.3.1) | estrutural | Varre `app/(public)/` e `app/c/`; falha se qualquer arquivo importar `lib/telemetria.ts` |
| **Propriedades de evento** (21.3.1, item 5) | unitário | Falha se alguma propriedade enviada não for número, booleano ou valor de enum do spec |
| **Segredo versionado** (20.5) | estrutural | Falha se algo com cara de chave privada entrar em arquivo versionado |
| **Contraste da paleta** (17.3) | unitário | As oito cores contra branco e contra o texto do cartão, ≥ 4.5:1 |

Alvo: **build e `npm test` verdes são critério de aceite de todo épico.**

### 22.2 O que é verificado à mão, e por quê

Três coisas dependem de hardware e de sistema operacional de terceiros, e nenhuma
suíte automatizada dá resposta confiável:

| Verificação | Como | Quando |
|---|---|---|
| **Leitura do QR** pela câmera nativa | Um iPhone e um Android reais lendo o QR de uma tela e de um papel impresso | Épico 8.5 e antes de cada release |
| **Abertura do `.vcf`** | Baixar no Safari/iOS e no Chrome/Android e confirmar que a tela de novo contato abre com foto | Épico 8.6 e antes de cada release |
| **Leitura de etiqueta NFC** | Gravar uma NTAG215 com o NFC Tools e encostar num iPhone e num Android | Antes do release, para validar o texto da seção 15.5 |

**Registre o resultado destas três** em `DOCUMENTACAO-TECNICA.md`, com modelo de
aparelho e versão de sistema. É a única forma de saber, meses depois, em que
aparelho a coisa foi realmente testada.

### 22.3 Casos de borda a cobrir

- Nome de uma palavra só (`N:` fica com sobrenome vazio).
- Nome com acento, no `.vcf` e no nome do arquivo.
- Cartão sem foto, sem cargo, sem empresa e sem bio — só nome e um link.
- Bio com vírgula, ponto e vírgula e quebra de linha (escape de 14.2).
- Telefone fixo de 8 dígitos (regra 11.5 — **não** inserir o nono).
- Visita à meia-noite e um minuto, no fuso de São Paulo (regra 11.9).
- Handle de exatamente 3 e de exatamente 30 caracteres.
- Conta sem handle tentando acessar `/conta/links` diretamente.
- Dono logado abrindo o próprio cartão despublicado, e um estranho abrindo o mesmo.

---

## 23. Riscos e mitigação

| # | Risco | Impacto | Probab. | Mitigação |
|---|---|---|---|---|
| 23.1 | **O `.vcf` falha em algum aparelho** e "Salvar nos contatos" não funciona sem o usuário entender — matando a função central do produto | alto | média | A seção 14 especifica CRLF, dobra em 75 octetos e teto de tamanho justamente por isso. Teste manual obrigatório em iOS e Android antes de cada release (22.2). Se persistir, cair para vCard sem foto, que é muito mais tolerante |
| 23.2 | **Squatting de handle**: alguém registra `dentista`, `joao`, `advogado` e nomes de marca | médio | **alta** | `HANDLES_RESERVADOS` cobre o óbvio. Admin pode trocar handle de terceiro (5.1) para resolver conflito de marca. Aceita-se que nomes comuns sejam ocupados por ordem de chegada — é como todo produto com handle funciona |
| 23.3 | **Conteúdo abusivo** num cartão publicado: golpe, falsa identidade, conteúdo ilegal | alto | média | Moderação reativa por denúncia (8.9), com bloqueio e log. `permitir_indexacao` falso por padrão limita o alcance. O e-mail de denúncia fica nos termos |
| 23.4 | **Sem internet no momento do encontro** — o QR abre e a página não carrega | médio | média | Sem solução na v1 (9.2). Não tentar resolver embutindo vCard no QR: o código fica denso demais para ser lido da tela de um celular |
| 23.5 | **Cloud Storage exige plano Blaze** desde fev/2026, então é preciso cartão de crédito mesmo na cota gratuita | baixo | **certa** | Já é fato conhecido (4.6). Orçamento com alerta em R$ 20/mês no Google Cloud, no DoD (seção 26) |
| 23.6 | **Conselhos profissionais** (CFP, CRO, CFM, CAU) têm regras de publicidade; um cartão com promessa de resultado pode expor o profissional | médio | baixa | O produto não sugere nem gera texto (11.10). Os termos deixam claro que o conteúdo é responsabilidade do titular. **Não** criar campos que induzam a promessa (preço, "resultados", depoimento) — está no anti-escopo |
| 23.7 | **Scraping** do telefone e e-mail dos cartões públicos | médio | média | `noindex` por padrão, sem diretório, id não enumerável (20.3). Aceito explicitamente como custo da natureza do produto, e dito na tela de publicação |
| 23.8 | **Nenhum uso**: as pessoas montam e nunca compartilham | alto | média | É exatamente o que a métrica 21.1.2 mede. Se ficar abaixo de 40% em 6 meses, o problema é de distribuição, não de produto, e a resposta é a seção 28.3 (etiqueta física), não mais features |
| 23.9 | **Dependência do login Google**: quem não tem conta Google não entra | baixo | baixa | Registrado como pergunta aberta 25.3. Link mágico por e-mail é a saída, e custa um provedor de e-mail transacional |
| 23.10 | **Custo escapa** com um cartão viralizando | baixo | baixa | O cache de leitura (4.6.2) segura as leituras. O gargalo é escrita, a 20.000 visitas/dia. Alerta de orçamento avisa antes da fatura |

---

## 24. Assunções declaradas

> **Assunção não revisada vira verdade no minuto em que o agente começa a codar.**
> Leia esta seção antes de gerar código. Cada linha traz o que foi decidido, por
> quê, e o que fazer se você discordar.

| # | Assumi que... | Por quê | Se discordar |
|---|---|---|---|
| 24.1 | O produto se chama **Cartão de Visita** e o domínio é `cartaodevisita.app.br` | Você disse que está registrando | Um find-and-replace resolve; nada de arquitetura depende disso |
| 24.2 | **Um cartão por conta**, com id do cartão igual ao `uid` | Sua resposta, e o princípio 0.5 | Vira a seção 28.4; muda o modelo de dados e acrescenta um nível de navegação |
| 24.3 | **Sem cobrança na v1**, e nenhum campo de *pagamento* no modelo de dados — mas **com** estrutura de planos funcionando (11.11) | Sua resposta, e o precedente do ViraPágina, que tem plano sem cobrança no site | É só avisar; o desenho da cobrança está em 28.2 |
| 24.3.1 | O plano `gratuito` limita **links (5), templates (2) e cores (2), mais a marca no rodapé** — e nada além disso | Cartão capado é propaganda ruim, e todo cartão é propaganda (11.11.2) | Se quiser limitar mais, o candidato natural é o contador de visitas; não recomendo mexer em foto, QR nem vCard |
| 24.3.2 | **Rebaixar plano não apaga nada** (11.11.6) | Apagar conteúdo por mudança administrativa é irreversível e se descobre tarde | — |
| 24.4 | **Login só com Google** | Sua resposta | 28.8 tem o desenho do link mágico |
| 24.5 | **Firebase, não Supabase** | Avaliação da seção 4.6 — o Supabase gratuito pausa em 7 dias, e isso mata a página pública | Trocar depois é caro: muda repositório de dados, guardas e testes. A hora de discordar é **agora** |
| 24.6 | **Sem Cloud Functions.** Toda lógica em rota de servidor do Next | Menos superfície, menos deploy, mesmo padrão do ViraPágina | Só faria falta para rotina agendada (limpeza de visitas antigas), que por ora é script manual |
| 24.7 | **Sem modo escuro na página pública** | O cartão tem cor escolhida pelo dono; herdar o tema do visitante desfigura a peça de outra pessoa | Fácil de mudar, mas exige definir cada template nos dois temas |
| 24.8 | **Português do Brasil apenas**, sem estrutura de tradução | Princípio 0.5 e público-alvo da seção 1 | Acrescentar depois é trabalhoso; acrescentar agora é complexidade prematura |
| 24.9 | **vCard 3.0**, não 4.0 | Compatibilidade com Android antigo (14.1) | A 4.0 é mais limpa; se testar bem nos aparelhos, dá para trocar |
| 24.10 | **Oito cores fixas**, sem seletor livre | Contraste garantido (16.2) e cartão feio prejudica o produto | Seletor livre exige validação de contraste em tempo real e um modo de recusar a escolha da pessoa |
| 24.11 | **Quatro templates** com os nomes de 16.3 | Cobre os arquétipos sem virar editor | A etapa de design (seção 27) pode propor outros — é o momento certo para mudar |
| 24.23 | **Painel monocromático, sem cor de marca** (16.6) | Decisão de 20/09/2026, a partir do Ads Manager do ChatGPT. Chrome sem cor faz a cor do cartão saltar | Reverter significa reescrever 16.6 e redesenhar o painel inteiro |
| 24.24 | **Tipografia: Instrument Serif no display, Plus Jakarta Sans no texto** | Serifada só no título da home e no template `executivo`; a sans tem acentuação e ç bem desenhados, que é o critério real para pt-BR | Trocar é barato agora, caro depois de implementado |
| 24.12 | **Redimensionamento da foto no navegador**, servidor só valida | Mantém o servidor simples e barato; evita processar imagem em função serverless | Fazer no servidor exige biblioteca de imagem e aumenta tempo e custo da rota |
| 24.13 | **A foto do Google é só sugestão inicial**, não a foto do cartão | Foto de perfil do Google costuma ser antiga ou informal | Usar direto pouparia um passo, mas pioraria o cartão |
| 24.14 | **Contador não deduplica recarga** | Deduplicar exigiria identificar o visitante, contra 20.2 | Aceitar que o número é aproximado, ou abrir mão do princípio |
| 24.15 | **Acesso do dono logado não conta** como visita | Senão o número mente para quem mais olha para ele | — |
| 24.16 | **`acoes_admin` sobrevive à exclusão da conta** | É log de auditoria de atos da plataforma (20.4) | Se preferir apagar tudo, some a trilha de moderação |
| 24.17 | **Cache de leitura de 60 segundos** na página pública | Mantém o custo perto de zero (4.6.2) | Edição do cartão demora até 60s para aparecer. Se incomodar, invalidar o cache ao salvar |
| 24.18 | **Handle antigo não redireciona** para o novo | Senão o handle nunca é liberado de verdade, e o `/c/<id>` já resolve o caso importante | Manter redirecionamento exigiria guardar histórico de handles e nunca liberá-los |
| 24.19 | **PIX é tipo de link de primeira classe**, com botão de copiar | Diferencial real para prestador de serviço brasileiro (1.2) | — |
| 24.20 | **Sem e-mail transacional de espécie alguma** | Não há nada a notificar: sem cobrança, sem convite, sem recuperação de senha | Qualquer e-mail futuro acrescenta um fornecedor |
| 24.21 | **Telemetria só do painel**, nunca da página pública (21.3.1) | Evento disparado por visitante sem conta é rastreamento, e traria de volta o banner de consentimento que a seção 20.2 evita | Se quiser a série de visitas no Visão de Produto, o caminho é a rotina diária de agregados descrita em 21.3.4 — não um evento por visita |
| 24.22 | **`distinct_id` é o e-mail do dono** | É o identificador que o Visão de Produto já usa nos outros apps, e permite cruzar a pessoa entre produtos da Dab Lab | Se preferir não mandar e-mail para fora, dá para usar o `uid` do Google — mas aí some o cruzamento entre apps |

---

## 25. Perguntas abertas

> **O agente de código deve perguntar, não assumir**, ao cruzar com qualquer item
> desta seção.

| # | Pergunta | Quem decide | Até quando | Impacto se ficar em aberto |
|---|---|---|---|---|
| 25.1 | Domínio `cartaodevisita.app.br` já apontado para a Vercel? **Parcial em 20/09/2026:** o projeto do Firebase existe (`cartao-de-visita-60325`, bucket `cartao-de-visita-60325.firebasestorage.app`); falta o apontamento do domínio | Alexandre | antes do primeiro deploy | Bloqueia só a publicação, não o desenvolvimento |
| ~~25.2~~ | ~~Qual o e-mail de suporte e de denúncia?~~ **RESPONDIDA em 20/09/2026:** `alexandre@dablab.com.br`, o mesmo do ViraPágina | — | — | Decidida |
| 25.3 | Entra **link mágico por e-mail** além do Google? | Alexandre | quando aparecer o primeiro pedido real | Nenhum — o desenho está em 28.8 e é aditivo |
| 25.4 | Os **oito valores de cor** e a família tipográfica | etapa de design (seção 27) | antes do épico 8.2 | Bloqueia a aparência, não a lógica. Implemente com valores provisórios e substitua |
| ~~25.5~~ | ~~O cartão leva **marca do produto** no rodapé da página pública?~~ **RESPONDIDA em 20/09/2026: sim.** A marca aparece no rodapé do cartão de conta `gratuito`, e some nos demais planos. Razão declarada pelo Alexandre: *"senão nunca teremos razão para vender"*. Ver 11.11.2 | — | — | Decidida |
| 25.6 | Termos de uso e política de privacidade: texto próprio ou reaproveitar a estrutura do ViraPágina? | Alexandre | antes do primeiro deploy | Bloqueia a publicação |
| ~~25.9~~ | ~~Manter o `dourado` ocre ou trocar por teal?~~ **RESPONDIDA em 20/09/2026: mantém o ocre** `#A16207`. A paleta fica com as oito cores de 16.2, sem teal | — | — | Decidida |
| ~~25.10~~ | ~~O corte de 64 caracteres em propriedade de evento foi escolhido sem consulta.~~ **RESPONDIDA em 20/09/2026: ratificado.** Virou a regra 11.13 | — | — | Decidida |
| 25.7 | Existe limite de contas por pessoa? Hoje, um e-mail = uma conta, e nada impede alguém de criar dez | Alexandre | quando virar problema | Sem impacto imediato |
| ~~25.8~~ | ~~O título da home descreve o artefato em vez da transformação.~~ **RESPONDIDA em 20/09/2026:** o título é `Seu contato na agenda de quem você acabou de conhecer.` O subtítulo foi encurtado junto, porque `quem recebe salva seu contato` virou redundante com o título novo. Ver 15.4 | — | — | Decidida |

---

## 26. Definition of Done

Release só sai com **todos** os itens marcados.

### 26.1 Funcional

- [ ] Os dez épicos da seção 8 implementados, com **todos** os critérios de aceite verificados um a um.
- [ ] Os três fluxos da seção 9 percorridos ponta a ponta, num aparelho real.
- [ ] Todas as telas da seção 10 existem e são alcançáveis pelo perfil correto.
- [ ] As tabelas da seção 11 conferidas contra o código — **nenhum número inventado**.
- [ ] `EARLY_ADOPTER_ABERTO=true` configurada na Vercel **antes** do primeiro acesso público (regra 11.11.3).
- [ ] Allowlist `ILIMITADOS` com `alexandre.silva.siqueira@gmail.com` e `alexandre@dablab.com.br`.
- [ ] Verificado que desligar `EARLY_ADOPTER_ABERTO` **não** rebaixa conta existente (critério 8.10.3).

### 26.2 As cinco pegadinhas (seção 18.4)

```bash
# 1. Guarda na primeira linha de toda rota protegida
grep -rLn "requireDono" app/api/conta --include="route.ts"
grep -rLn "requireAdminPlataforma" app/api/admin --include="route.ts"
#    ↑ as duas listas têm de vir VAZIAS

# 2. Nada de 403 em lugar nenhum
grep -rn "403" app/ lib/ --include="*.ts" --include="*.tsx"

# 3. Nenhum acesso a dados no cliente
grep -rn "use client" -l app/ components/ | xargs grep -ln "firebase\|firestore\|storage"
#    ↑ tem de vir VAZIO

# 4. QR e NFC sempre no id permanente
grep -rn "qr\|Qr\|QR" lib/ components/ --include="*.ts" --include="*.tsx" | grep -i "handle"
#    ↑ inspecionar cada ocorrência: nenhuma pode gerar QR a partir do handle

# 5. visitas_diarias sem dado de visitante
grep -rn "visitas_diarias" lib/ app/ -A 8 | grep -iE "ip|user.?agent|cookie|cidade|regiao|referer"
#    ↑ tem de vir VAZIO
```

- [ ] Os cinco comandos rodados, com o resultado esperado.

### 26.3 Qualidade de código

- [ ] `npm run typecheck` sem erro.
- [ ] `npm run lint` sem erro.
- [ ] `npm test` e `npm run test:emu` verdes.
- [ ] `npm run build` **sem nenhum warning nosso**.
- [ ] Coleções e campos em português `snake_case`, sem exceção fora do padrão (seção 18.1).
- [ ] Toda função, rota, guarda e hook com comentário de cabeçalho em português citando a regra do spec (seção 18.2).
- [ ] Nenhuma string de interface fora de `lib/copy.ts`.

### 26.4 Não-funcional

- [ ] Alvos de 17.1 medidos na página pública, em 4G simulado.
- [ ] Página pública funcionando com JavaScript desativado.
- [ ] Contraste ≥ 4.5:1 verificado nas oito cores (teste automatizado de 22.1).
- [ ] Área de toque ≥ 44×44 pt em toda ação da página pública.
- [ ] Navegação por teclado no painel, com foco visível.

### 26.5 Verificação manual em aparelho (seção 22.2)

- [ ] QR lido pela câmera nativa de um **iPhone** e de um **Android**, de tela e de papel.
- [ ] `.vcf` aberto no **iOS** e no **Android**, com foto, e o contato salvo de verdade.
- [ ] Etiqueta **NTAG215** gravada e lida num iPhone e num Android.
- [ ] Modelos e versões registrados em `DOCUMENTACAO-TECNICA.md`.

### 26.6 Privacidade e segurança

- [ ] Nenhum cookie e nenhum script de terceiro na página pública.
- [ ] `npm test` cobre as cinco pegadinhas por teste estrutural (`tests/estrutura.test.ts`), o que torna os greys de 26.2 uma conferência de segunda opinião, não a barreira principal.
- [ ] A página pública não fala com o Visão de Produto (regra 21.3.1).
- [ ] `VISAO_API_KEY` configurada na Vercel e **ausente do repositório**.
- [ ] Verificado que, sem `VISAO_API_KEY`, o app funciona sem erro e sem aviso.
- [ ] Nenhuma propriedade de evento carrega conteúdo do cartão (regra 21.3.1, item 5).
- [ ] Nenhum dado de visitante em `visitas_diarias` (26.2, item 5).
- [ ] Exclusão de conta removendo tudo o que a seção 20.4 exige, verificada no emulador.
- [ ] Esquemas `javascript:` e `data:` rejeitados em link de texto livre.
- [ ] Validação de foto por magic bytes, verificada com um arquivo renomeado.
- [ ] Nenhuma credencial em arquivo versionado nem em variável `NEXT_PUBLIC_`.
- [ ] Regras do Firestore e do Storage negando todo acesso do cliente.
- [ ] **`npm run diagnostico` verde**, incluindo as duas linhas de `Regras` — elas comparam o que está no repositório com o que está **publicado**. Ver 6.6.1.

### 26.7 Operação

- [ ] Domínio apontado, HTTPS funcionando.
- [ ] Projeto do Firebase no plano Blaze (exigência de 4.6 para o Storage).
- [ ] **Orçamento com alerta em R$ 20/mês configurado no Google Cloud** (risco 23.5).
- [ ] Termos de uso e política de privacidade publicados (pergunta 25.6).
- [ ] E-mail de suporte respondido por alguém (pergunta 25.2).

### 26.8 Documentação

- [ ] `DOCUMENTACAO-TECNICA.md` gerado com os seis itens da seção 19, conferido contra o sistema implementado.
- [ ] `CLAUDE.md` na raiz, com convenções, arquitetura, comandos e as cinco pegadinhas.
- [ ] `README.md` com setup, variáveis de ambiente e como rodar o emulador.
- [ ] `modelo-cartaodevisita.dbml` batendo com a seção 7.

---

## 27. Próximos passos operacionais

1. **Revisar a seção 24.** Sobretudo 24.5 (Firebase), 24.17 (cache de 60s) e 24.18 (handle antigo não redireciona) — as três que são caras de desfazer depois.
2. **Responder 25.1, 25.2, 25.5 e 25.6.** As outras podem esperar.
3. **Etapa de design.** Levar o `prompt-design-cartaodevisita.md` ao Claude Design e definir: os oito valores de cor, a tipografia, os quatro templates e o layout do painel. O resultado volta para a seção 16 **antes** da implementação.
4. **Criar o repositório** `cartaodevisita` no GitHub e conectar à Vercel.
5. **Criar o projeto no Firebase**, subir para o plano Blaze e configurar o alerta de orçamento (26.7).
6. **Implementar**, com o prompt do fim deste documento, na ordem dos épicos da seção 8.
7. **Gerar `DOCUMENTACAO-TECNICA.md`** ao final.
8. **Publicar** contra o checklist da seção 26.

---

## 28. Roadmap: próximas releases

Tudo que saiu do MVP, com o detalhe preservado. Quando uma destas entrar, ela vira
um spec adicional de feature, pelo protocolo da seção 29.

### 28.1 Gravação de etiqueta NFC

**Por que saiu:** Web NFC só existe no Chrome do Android; o iPhone exige app
nativo. Gravar no iPhone é o único motivo real para o produto ter app, e ele não
justifica um app antes de o produto existir (seção 4.1).

**Ordem de ataque recomendada, do mais barato para o mais caro:**

1. **Instruções e nada mais** — é o que a v1 faz (seção 15.5). Custo zero. Resolve para quem se dispõe a baixar o NFC Tools.
2. **Gravação pelo navegador no Android** — `NDEFReader.write()` numa tela que só aparece quando `'NDEFReader' in window`. Poucas horas de trabalho; atende a maior parte do público brasileiro, que está em Android. **É o próximo passo natural e deve vir antes de qualquer app.**
3. **Etiqueta vendida já gravada** — ver 28.3. Remove o problema do usuário por completo, e é onde o mercado realmente monetiza.
4. **App companion mínimo** — uma tela, login, gravar. Só se 1 a 3 não bastarem. **Não mover o editor para dentro dele.**

A tabela de realidade (11.6) e a copy (15.5) já estão escritas e continuam valendo.

### 28.2 Cobrança

**Por que saiu:** decisão de produto — validar de graça primeiro.

**O que já está pronto:** a estrutura de planos (11.11) existe e funciona desde a
v1. O enum `plano_conta` já tem o valor `pago`, o campo `plano` já governa links,
templates, cores e marca no rodapé, e o admin já troca plano de conta. **Falta só o
caminho do dinheiro.**

**O que ainda não existe, e não deve existir até aqui:** meio de pagamento,
assinatura, webhook, fatura, estado de inadimplência, data de renovação. Nenhum
campo de pagamento entra no modelo de dados antes desta seção, nem "só a
estrutura" (princípio 0.5).

**Desenho previsto:** plano grátis com o cartão completo e a marca do produto no
rodapé (pergunta 25.5); plano pago **em real**, cobrado por PIX recorrente ou
cartão, que remove a marca, libera domínio próprio (28.5), templates extras e
analytics por link (28.6). Preço de referência a definir, na faixa de R$ 8 a R$ 15
por mês — abaixo do que os concorrentes cobram em dólar, que é parte do
posicionamento (1.2).

**O que precisa acontecer antes:** métrica 21.1.2 acima de 40%. Sem uso real, não
há o que cobrar.

### 28.3 Etiqueta NFC física vendida

**Desenho:** NTAG215 comprada em lote, gravada em série com um celular e o NFC
Tools, travada como somente leitura, enviada pelos Correios. Cartão de PVC impresso
com o QR de um lado e o nome do outro.

**O que precisa acontecer antes:** pedido, endereço e estado de envio no modelo de
dados; meio de pagamento (28.2); e a logística de gravação em lote.

**Por que é provavelmente o melhor negócio dos três:** margem de produto físico,
compra única, e resolve sozinho o risco 23.8 — quem paga por um cartão físico usa
o cartão.

### 28.4 Vários cartões por conta

**Desenho:** entidade `cartoes` deixa de ter id igual ao `uid` e ganha id próprio;
`usuarios` ganha `cartao_padrao_id`; a URL vira `/<handle>` para o padrão e
`/<handle>/<slug>` para os demais; o painel ganha um seletor. Casos: pessoal e
empresa, ou um cartão por evento.

**O que precisa acontecer antes:** pedido real de usuário. Hoje é hipótese.

### 28.5 Domínio próprio

**Desenho:** a pessoa aponta `cartao.seudominio.com.br` por CNAME; o produto
verifica o DNS e emite certificado pela Vercel. Provavelmente feature de plano
pago (28.2).

### 28.6 Analytics por link

**Desenho:** cada link vira `/l/<id_permanente>/<id_do_link>`, que registra e
redireciona. **Trade-off que precisa ser encarado:** acrescenta um salto de rede
em cima de cada clique, contra o princípio 0.2; e a decisão de guardar links num
array embutido (7.5.1) teria de ser revista.

### 28.7 Rotina de limpeza

Excluir `visitas_diarias` com mais de 400 dias (regra 11.8) e contas sem acesso há
24 meses, com aviso prévio de 30 dias (seção 20.1). Exige agendamento — Cloud
Scheduler ou cron da Vercel —, o que reabre a assunção 24.6. Até lá, script manual.

### 28.8 Link mágico por e-mail

**Desenho:** provedor de e-mail no Auth.js, com Resend. Acrescenta um fornecedor e
um fluxo de teste. Aditivo — não muda nada do que já existe.

### 28.9 Compartilhar por Apple Wallet e Google Wallet

**Desenho:** gerar um passe com o QR do cartão, para o dono guardar na carteira do
celular e abrir sem procurar o app. Exige certificado de passe da Apple e
integração com a API do Google Wallet.

---

## 29. Protocolo de mudanças incrementais

Depois que a v1 estiver no ar, **não cole este documento inteiro de novo.** Spec
inteira colada em projeto existente é convite para reescrita, e reescrita é como
se perde um app que funcionava.

1. **Commit de checkpoint** antes de qualquer mudança, para ter um `git diff` confiável.
2. **Cole só o trecho novo ou alterado**, ou um spec adicional específico da feature.
3. **Escreva como diff, não como recomeço.** Deixe explícito que o projeto já existe e funciona.
4. **Delimite nominalmente o que não deve mudar.**
5. **Peça a lista de arquivos** que serão criados e alterados **antes** do código, e aprove.
6. **Revise o `git diff` contra o plano aprovado.** Arquivo que passou do escopo, reverta e refaça o pedido mais específico.
7. **Exija `DOCUMENTACAO-TECNICA.md` atualizado no mesmo commit.**

### 29.1 Modelo de prompt para mudança

```
O projeto Cartão de Visita já existe, está implementado e funcionando.
Leia CLAUDE.md, DOCUMENTACAO-TECNICA.md e a seção <N> do spec.md antes
de qualquer coisa.

MUDANÇA
<descreva só o que muda, como diff do comportamento atual>

NÃO MUDE
- o modelo de dados da seção 7, exceto <campo>, se for o caso
- as cinco pegadinhas da seção 18.4
- a copy da seção 15
- <liste nominalmente arquivos e telas que não devem ser tocados>

ANTES DE CODAR
Liste os arquivos que vai criar e alterar, com uma linha do que muda em
cada um, e espere aprovação.

AO TERMINAR
Atualize DOCUMENTACAO-TECNICA.md e CLAUDE.md no mesmo commit.
Rode typecheck, lint, test e build — build sem warning nosso.
```

---

## Anexo — Fontes

Pesquisa realizada em **20 de setembro de 2026**. As premissas técnicas deste
documento não vieram de conhecimento prévio; foram verificadas nestas fontes.

| Assunto | Fonte | O que sustenta |
|---|---|---|
| Web NFC, suporte de navegador | [Chrome for Developers — Interact with NFC devices](https://developer.chrome.com/docs/capabilities/nfc) | Só Chrome/Android 89+; Safari e iOS não têm. Seções 4.1, 11.6, 28.1 |
| Web NFC, cobertura global | [WebNfc.org — Supported Browsers & Devices](https://webnfc.org/documentation/browser-support) | ~6% de suporte global em abril/2026. Seção 4.1 |
| Leitura de NFC em segundo plano no iPhone | [GoToTags — iOS Background NFC Tag Reading](https://learn.gototags.com/nfc/software/iphone/reading/background) | iPhone XS+, tela ligada, desbloqueado ao menos uma vez desde o boot; sem app, abre no Safari. Regra 11.6 |
| Core NFC e entitlement | [Apple Developer — Core NFC](https://developer.apple.com/documentation/corenfc) | Escrita de NDEF desde o iOS 13, sem aprovação especial. Seção 28.1 |
| vCard em etiqueta NFC no iPhone | [NFC.cool — Why vCard NFC Tags Don't Work on iPhone](https://nfc.cool/blog/vcard-nfc-iphone-not-working/) | Etiqueta deve guardar URL, não vCard. Regra 11.6, seção 14 |
| Pausa do plano gratuito do Supabase | [Supabase — Pricing](https://supabase.com/pricing) | Pausa após 7 dias sem requisição. **Seção 4.6 — o fator decisivo** |
| Cotas do Firebase e exigência do Blaze | [Firebase — Pricing](https://firebase.google.com/pricing) | Firestore: 50k leituras e 20k escritas/dia no Spark. Cloud Storage exige Blaze desde fev/2026. Seções 4.6 e 23.5 |
| Projeto de referência | `~/ViraPagina` — `spec.md`, `CLAUDE.md`, `DOCUMENTACAO-TECNICA.md`, `lib/firebase/firestore.ts`, `middleware.ts` | Stack, padrão de guardas, reserva de handle, 404-não-403. Seções 4.2, 6.5, 7.3, 18 |
