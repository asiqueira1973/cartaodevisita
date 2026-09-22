# Prompt de design — Cartão de Visita

Cole no Claude Design. Gerado a partir das seções 8, 9, 10, 15 e 16 do `spec.md`.
Toda copy aqui é **final**, tirada literalmente da seção 15 — não reescreva.

---

## O produto em uma frase

**Cartão de Visita** (`cartaodevisita.app.br`) é um site onde o autônomo brasileiro
monta, de graça e em cinco minutos, um cartão de visitas digital com endereço
público próprio, QR code e botão de salvar na agenda de quem recebe.

**Para quem:** a psicanalista com consultório próprio, o arquiteto, o dentista, o
personal, o fotógrafo, o corretor, o vendedor autônomo, e o prestador de serviço
que atende em domicílio — eletricista, técnico de ar-condicionado, montador,
chaveiro. Uma pessoa, sem equipe, sem TI, sem marketing. O canal de trabalho dela é
o WhatsApp e o "site" dela hoje é a bio do Instagram.

**Não é** HiHello, Popl nem Blinq. Aqueles são ferramentas corporativas com painel
de equipe e integração com CRM, vendidas em dólar. Este é o oposto: faz menos, em
português, de graça, e fica pronto numa tela de celular.

---

## Três regras que mandam em todo o resto

**1. O botão de WhatsApp é o elemento mais pesado da página do cartão, sempre.**
Em todos os quatro templates, sem exceção. No Brasil o WhatsApp *é* o contato; o
resto é decoração. Os concorrentes tratam como um ícone entre doze — é aí que este
produto ganha. Área de toque mínima de 44×44 pt.

**2. Duas estéticas, separadas de propósito.**

| | Painel (`/conta`, `/admin`) | Cartão público (`/<handle>`) |
|---|---|---|
| De quem é a estética | do produto | **do dono do cartão** |
| Cor | neutra do produto | a cor de destaque que ele escolheu |
| Layout | fixo, menu lateral | um entre quatro templates |
| Modo escuro | segue o sistema | **não tem** |
| Objetivo | não atrapalhar | causar boa impressão em 3 segundos |

O painel é ferramenta. O cartão é a peça. **O painel nunca deve competir
visualmente com a pré-visualização do cartão que ele contém.**

**3. O painel é desenhado primeiro para o celular.**
Essa pessoa monta o cartão no aparelho que tem na mão, entre um atendimento e
outro. Toda tela de `/conta` tem de funcionar em **375 px** sem rolagem
horizontal. A pré-visualização fica **abaixo** do formulário no celular e ao lado
só a partir de 1024 px. Nada depende de passar o mouse por cima nem de arrastar
com precisão: a reordenação de links tem alça grande **e** botões de subir/descer.

---

## O que eu mais preciso desta rodada: os quatro templates

Esta é a entrega principal. São quatro arranjos da **mesma informação** — nenhum
esconde campo, o que muda é hierarquia e proporção.

| Nome | Ideia | Para quem |
|---|---|---|
| `minimalista` | Foto redonda pequena no topo, nome grande, links empilhados em botões de largura total | padrão, o mais legível |
| `cartao` | A área superior imita um cartão de visitas físico, proporção 85×55 mm, cor de destaque preenchendo o fundo | quem quer o gesto do cartão de papel |
| `foto` | Foto ocupando a largura inteira no topo, nome sobreposto num degradê | fotógrafo, personal, quem vende imagem |
| `executivo` | Sem foto grande: iniciais num monograma, tipografia serifada, muito espaço em branco | advogado, consultor, psicanalista, perfil sóbrio |

**Desenhe os quatro em 375 px de largura**, com o mesmo conteúdo de exemplo, para
dar para comparar lado a lado. Use este conteúdo:

```
Foto:      retrato, enquadramento de rosto
Nome:      Helena Prado
Cargo:     Psicanalista
Empresa:   (vazio)
Bio:       Atendimento online e presencial na Zona Sul.
Links:     WhatsApp · Instagram · E-mail · Endereço
Cor:       roxo
```

E mostre **um** deles também no estado difícil: sem foto, sem cargo, sem empresa,
sem bio — só nome e um link de WhatsApp. É o cartão que a maioria vai publicar no
primeiro dia, e ele não pode parecer quebrado.

### A marca no rodapé — desenhe com cuidado

O cartão de conta gratuita leva **uma linha discreta no rodapé** com a marca do
produto. Ela é a alavanca comercial inteira (é o que o plano pago remove) **e** o
canal de crescimento, então ela precisa cumprir duas coisas que puxam para lados
opostos:

- **Visível o bastante** para quem recebe o cartão reparar e querer um.
- **Discreta o bastante** para não estragar o cartão de ninguém — texto pequeno, cor de baixo contraste, sem logo grande, sem cor chamativa, sem competir com a cor de destaque escolhida pelo dono.

Proponha o texto dessa linha junto com o desenho. Ela deve funcionar como link
para a home. **Desenhe os quatro templates nas duas versões** — com e sem a marca
—, porque essa diferença é o que a pessoa vê ao considerar pagar.

### Elementos que todo template tem

Nesta ordem vertical:

1. Foto (ou iniciais sobre a cor de destaque, quando não houver)
2. Nome de exibição — até 60 caracteres, pode quebrar em duas linhas
3. Cargo · Empresa — cada um opcional; com os dois, separados por `·`
4. Bio — uma linha, até 160 caracteres
5. **Botão de WhatsApp** — o mais pesado da página
6. Demais links, na ordem que o dono definiu, em botões de largura total
7. Botão `Salvar nos contatos`
8. QR code, com `Aponte a câmera` acima
9. Rodapé com a marca do produto — **só no plano gratuito**, e este é o único item da lista que muda entre planos

### A paleta: oito cores, dois tons cada

Preciso que você **defina os valores**. Oito cores de destaque, cada uma com dois
tons — um para fundo de botão (com texto branco por cima) e um para texto sobre
fundo claro. **Os dois tons precisam bater 4.5:1 de contraste**, e isso é requisito
testado automaticamente, não sugestão.

```
azul (padrão) · verde · roxo · vermelho · laranja · rosa · grafite · dourado
```

`grafite` é a opção sóbria, para quem não quer cor. `dourado` é a mais difícil —
se não der para atingir contraste com um dourado que ainda pareça dourado, me diga
e a gente troca por outra cor.

**Cor semântica é separada de cor de marca.** Verde, âmbar e vermelho de estado
(sucesso, aviso, erro) existem **só no painel** e não são afetados pela cor de
destaque do cartão. Um cartão com destaque vermelho não pode fazer a mensagem de
erro do painel sumir no meio da interface.

---

## Telas públicas — sem conta, estética livre

| Tela | Rota | O que mostra | Ações |
|---|---|---|---|
| **Cartão** | `/<handle>` | A peça. Ver os quatro templates acima | WhatsApp, cada link, salvar contato, abrir QR |
| QR em tela cheia | `/<handle>/qr` | QR preto sobre branco puro ocupando no mínimo **70% da menor dimensão da tela**, handle em texto pequeno, e **nada mais** | Voltar |
| Home | `/` | Cabeçalho fino, bloco principal com mockup do cartão, quatro casos de uso, quatro públicos, fechamento, rodapé — ver detalhamento abaixo | Entrar, Criar meu cartão |
| 404 | — | Mensagem neutra e link para a home | — |
| Termos / Privacidade | `/termos`, `/privacidade` | Texto legal | — |

### Estados da tela do cartão

- **Pré-visualização** (o dono, logado, vendo o próprio cartão despublicado): tarja fixa no topo com `Só você está vendo. Publique para liberar o link.`
- **Sem foto**: iniciais do nome sobre a cor de destaque, contraste ≥ 4.5:1.
- **404** (handle inexistente, cartão despublicado ou conta bloqueada — visualmente idênticos): `Não encontrei esse cartão.` + `Ele pode ter sido removido ou o endereço mudou.`

### Copy final da tela do cartão

```
Botão de contato:   Salvar nos contatos
Acima do QR:        Aponte a câmera
Rótulos dos links:  Chamar no WhatsApp · Ligar · Enviar e-mail · Instagram ·
                    LinkedIn · Site · YouTube · TikTok · Facebook · X · GitHub ·
                    Behance · Spotify · Copiar chave PIX · Ver no mapa · Abrir link
```

`Copiar chave PIX` não abre link nenhum — é botão de copiar, com confirmação
visual. É um diferencial brasileiro que nenhum concorrente internacional tem, e
para o prestador de serviço que recebe na hora vale mais que o LinkedIn.

### A home — copie a estrutura da home do ViraPágina

**Referência direta:** `virapagina.app.br`. A estrutura já está validada; o que
muda é o conteúdo. Não reinvente o arranjo.

**Estrutura, de cima para baixo:**

1. **Cabeçalho fino**, fundo branco, hairline embaixo. À esquerda, o quadradinho da
   cor da marca + `Cartão de Visita`. À direita, só `Entrar`, em texto, sem botão.

2. **Bloco principal** sobre fundo cinza bem claro, **duas colunas**:
   - **Esquerda:** título grande em **serifada**, quebrando em duas linhas; subtítulo em sans cinza, três linhas; botão sólido na cor da marca; e — **ao lado do botão, na mesma linha, em cinza pequeno** — a garantia `Grátis, sem cartão`. Essa garantia fica **beside**, não embaixo: é o detalhe que tira o medo sem roubar peso do botão.
   - **Direita:** um mockup do produto real — **um cartão de visitas aberto no celular**, em moldura de cantos arredondados com sombra suave. No ViraPágina é um livro aberto; aqui é o cartão da Helena, com foto, nome, e o botão de WhatsApp visível. **Mostre o produto, não um ícone abstrato.**

3. **Três cartões lado a lado**, brancos, cantos arredondados, hairline de borda.
   Cada um: **ícone de traço fino na cor da marca** num quadradinho arredondado,
   título em negrito, e duas ou três linhas de corpo em cinza.

4. **Rodapé** discreto: `Cartão de Visita — Dab Lab` à esquerda; `Termos`,
   `Privacidade` e o e-mail de contato à direita.

No celular, as duas colunas viram uma (texto em cima, mockup embaixo) e os três
cartões empilham.

### Copy final da home

```
Título:        Seu contato na agenda de quem você acabou de conhecer.
Subtítulo:     Monte o seu em cinco minutos. Compartilhe por link, QR code ou
               etiqueta NFC. Do outro lado, ninguém precisa instalar nada.
Botão:         Criar meu cartão
Ao lado:       Grátis, sem cartão
Rodapé:        Cartão de Visita — Dab Lab   ·   Termos · Privacidade · contato
```

O título é **final** e é o elemento mais importante da página. Ele nomeia o
resultado, não o objeto: o produto não é o cartão, é o contato salvo na agenda da
outra pessoa. São **nove palavras** — desenhe em serifada grande, quebrando em
**duas ou três linhas**, sem apertar. Se precisar reduzir o corpo da fonte para
caber em duas, prefira três linhas e o tamanho maior.

### Onde a etiqueta vive — quatro cartões

Quatro lugares concretos onde a etiqueta fica colada, em grade de 2×2 no desktop
e empilhada no celular. Cada um é um objeto que a pessoa já carrega todo dia — a
venda é "cola aqui", não "instale isto". Título curto em negrito, duas ou três
linhas de texto, sem ícone: o texto já é concreto o bastante.

| Posição | Título | Texto |
|---|---|---|
| 1 | **No crachá do evento** | Encostou o crachá no celular de quem você acabou de conhecer e pronto. Nada de ditar Instagram no barulho nem anotar telefone errado no guardanapo. |
| 2 | **No crachá de trabalho** | Quem te recebe na visita, na obra ou no balcão sai com seu contato salvo — com foto, cargo e WhatsApp — sem você soletrar nada. |
| 3 | **Atrás do celular** | Uma etiqueta colada na capa. Você já tira o telefone do bolso o tempo todo; agora ele passa seu contato junto. |
| 4 | **Na carteira** | Um cartão que não acaba, não amassa e não fica velho quando você muda de número, de empresa ou de foto. |

### Para quem é — quatro colunas

Mais leve que o bloco acima: sem caixa, só um traço fino no topo de cada coluna,
título e duas linhas. A pessoa precisa se reconhecer em uma delas em menos de um
segundo.

| Posição | Título | Texto |
|---|---|---|
| 1 | **Para você** | Conheceu alguém num jantar, numa viagem, na fila. Um toque e a pessoa tem seu contato certo. |
| 2 | **Autônomos** | Psicanalista, arquiteto, dentista, personal, eletricista. Quem atende e precisa ser encontrado depois. |
| 3 | **Times de campo** | Técnicos, instaladores, vistoriadores. Cada um com o próprio cartão, sem imprimir nada. |
| 4 | **Força de vendas** | Representantes e corretores que visitam muito e não querem depender do papel que o cliente perdeu. |

### Fechamento

Centralizado, uma linha e o botão de novo: *Leva cinco minutos e não precisa de
nada além da sua conta Google.* Quem rolou a página inteira não deve ter que
subir para achar o botão.

---

## Painel do dono — menu lateral

**Referência direta: o painel do ViraPágina, que já está validado.** Mesmo padrão
de menu lateral, mesma densidade, mesmos selos. Reaproveite.

### O padrão do menu lateral

- **Grupos** com título em **negrito escuro, caixa normal** — nunca maiúsculas decorativas.
- **Itens** indentados sob o grupo, **sem marcador nem bolinha**.
- **Traço fino (hairline)** separando os grupos.
- **Um item ativo por vez**, na cor de destaque do produto: texto na cor de destaque mais uma **pílula clara da mesma cor** ao fundo.
- **Rodapé** com o e-mail do usuário em texto pequeno e um botão `Sair` discreto, com borda fina.
- Cantos arredondados suaves, hairlines no lugar de bordas pesadas, espaçamento generoso.
- Topo do menu: quadradinho da cor da marca + nome do produto.

**A cor de destaque do menu é a do produto, não a cor do cartão do usuário.**

```
Cartão
  Meu cartão
  Links
  Aparência
Compartilhar
  Link e QR code
Conta
  Ajustes
```

No celular, o menu vira **barra inferior** com os destinos de primeiro nível.

### As telas

| Tela | Rota | O que mostra | Ações |
|---|---|---|---|
| **Escolher endereço** | `/conta/handle` | Campo com sugestão já preenchida e disponibilidade em tempo real | Confirmar |
| **Meu cartão** | `/conta` | Formulário + pré-visualização ao vivo + visitas dos últimos 30 dias | Editar campos, subir/remover foto, publicar/despublicar |
| Links | `/conta/links` | Lista ordenável | Adicionar, editar, reordenar, remover |
| Aparência | `/conta/aparencia` | Quatro templates e oito cores, com pré-visualização ao vivo | Escolher |
| Compartilhar | `/conta/compartilhar` | Link, QR, botão de baixar PNG, instruções de NFC | Copiar link, baixar QR |
| Ajustes | `/conta/ajustes` | Handle, e-mail, plano em linha discreta, indexação, zona de risco | Trocar handle, indexação, sair, excluir conta |

### Estados que precisam de desenho

| Tela | Estado | O que acontece |
|---|---|---|
| Escolher endereço | carregando | indicador discreto no campo enquanto verifica |
| Escolher endereço | erro | `Esse endereço já está em uso. Tente outro.` |
| Meu cartão | vazio | sem foto → iniciais sobre a cor de destaque |
| Meu cartão | carregando | barra de progresso durante o envio da foto |
| Meu cartão | erro | `A foto não subiu. Verifique a conexão e tente de novo.` |
| Meu cartão | publicar bloqueado | botão **desabilitado com o motivo ao lado**, nunca habilitado com erro depois do clique: `Para publicar, preencha seu nome e adicione pelo menos um link.` |
| Links | vazio | texto explicando que o WhatsApp é o mais importante + atalho para adicioná-lo |
| Links | limite atingido | `Seu plano permite até 5 links.` (gratuito) · `Um cartão pode ter até 15 links.` (demais) |
| Aparência | indisponível no plano | template ou cor **marcados como indisponíveis e não clicáveis** — nunca escondidos: `Esse visual está disponível em outro plano.` |

### Copy final do painel

```
Escolha do endereço, título:  Escolha seu endereço
Escolha do endereço, ajuda:   É o link que você vai compartilhar. Dá para mudar
                              depois, mas os links antigos param de funcionar.
Publicar:                     Publicar cartão
Despublicar:                  Tirar do ar
Trocar handle, aviso:         Os links com o endereço antigo param de funcionar.
                              Seu QR code e suas etiquetas NFC continuam funcionando.
Excluir conta, aviso:         Apaga seu cartão, sua foto e seus dados. Não dá para
                              desfazer, e seu endereço fica livre para outra pessoa.
Login, botão:                 Entrar com o Google
```

### A tela `/conta/compartilhar` tem um texto longo

É a explicação de NFC, e ela é **literal** — não resuma, não reescreva, não promete
nada além disto. Desenhe como um bloco de ajuda, com o endereço em fonte
monoespaçada e um botão de copiar ao lado:

> **Etiqueta NFC**
>
> Dá para gravar seu link numa etiqueta NFC e colar atrás do celular, na carteira
> ou num cartão de plástico. Quem encostar o celular na etiqueta abre seu cartão —
> sem app, no iPhone e no Android.
>
> A gravação é feita fora daqui, por enquanto. Baixe o **NFC Tools** (grátis,
> iPhone e Android), escolha *Gravar → URL* e cole este endereço:
>
> `https://cartaodevisita.app.br/c/k7f3q9`   [Copiar]
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

## Painel da plataforma — só para o admin

**Copie o desenho do painel do ViraPágina quase literalmente.** Ele já funciona e
não há motivo para reinventar. Duas telas.

### `/admin` — Contas

Estrutura, de cima para baixo:

1. **Título** `Contas`, grande, com **subtítulo em cinza**: `8 contas · 5 early adopters`
2. **Faixa de estado**, em azul claro com um pontinho azul à esquerda, ocupando a largura toda:
   `Aberta a early adopters.` em negrito, seguido de `Toda conta nova nasce com plano de early adopter, para sempre.` — e, alinhado à **direita da mesma faixa**, em fonte monoespaçada e cinza: `EARLY_ADOPTER_ABERTO=true`
3. **Tabela** em cartão de cantos arredondados, com hairline entre as linhas:

| Conta | Endereço | Plano | Links | Visitas do mês | |
|---|---|---|---|---|---|
| helena.prado@exemplo.com.br | /helenaprado | `Early adopter` | 4 | ▓▓▓░░ 128 | Abrir |
| appsdablab@gmail.com | /apps-dab-lab | `Gratuito` | 5 de 5 | ▓░░░░ 12 | Abrir |
| alexandre.silva.siqueira@gmail.com | /alexandresiqueira | `Ilimitado` | 9 | ▓▓▓▓▓ 1.204 | Abrir |

**Selos de plano** — pílula pequena, cantos bem arredondados, texto pequeno:

| Plano | Cor |
|---|---|
| `Gratuito` | cinza neutro, fundo cinza claro |
| `Early adopter` | verde, fundo verde claro |
| `Ilimitado` | azul, fundo azul claro |
| `Pago` | cinza-escuro (sem uso na v1, mas desenhe) |

A coluna de links mostra `5 de 5` quando a conta está no teto do plano, e só o
número quando não está. A coluna de visitas tem uma **barra de proporção fina em
cinza claro** com o número à direita, e um traço `—` quando não houve visita.

`Abrir` é link em azul, alinhado à direita, sem botão.

### `/admin/contas/[id]` — Uma conta

Dados da conta, pré-visualização do cartão, e as ações de moderação. Quatro ações,
todas com confirmação e campo de motivo:

- **Alterar plano** — seletor com `Gratuito`, `Early adopter`, `Ilimitado`. **`Pago` não aparece**, porque não é atribuível nesta versão.
- **Despublicar cartão** — só despublica; o admin nunca publica cartão alheio.
- **Trocar endereço** — para conflito de marca.
- **Bloquear conta** — em papel destrutivo (vermelho do sistema).

Abaixo, o **histórico de ações** sobre aquela conta: quem fez, o quê, quando e o
motivo.

**Não desenhe nenhum caminho para o admin editar foto, texto ou links de um
cartão.** Ele modera, não edita conteúdo alheio — e a ausência desse botão é
proposital.

### Menu lateral do admin

```
Cartão
  Meu cartão
Plataforma
  Contas
```

Mesmo padrão visual do painel do dono.

---

## Fluxo principal, para as telas não saírem soltas

```
/ (home)
  └─ Criar meu cartão
       └─ /entrar → Google
            └─ /conta/handle          escolhe o endereço
                 └─ /conta            preenche nome, cargo, bio, foto
                      └─ /conta/links adiciona WhatsApp e o resto
                           └─ /conta/aparencia  escolhe template e cor
                                └─ /conta  → Publicar
                                     └─ /conta/compartilhar  link, QR, NFC
```

E o momento que o produto existe para servir:

```
O técnico termina o serviço, abre /<handle>/qr em tela cheia e vira o
celular para a cliente. Ela aponta a câmera → abre /<handle> no navegador
dela → toca em "Salvar nos contatos" → o contato entra na agenda com foto.

Nenhuma das duas instalou nada. Só uma delas tem conta.
```

---

## Tipografia, espaçamento e acessibilidade

- **Uma família de texto** para todo o produto. O template `executivo` usa uma serifada **só nos títulos do cartão**.
- Escala de tipo com no máximo **6 tamanhos**.
- **Corpo nunca abaixo de 16 px** na página pública.
- Espaçamento em múltiplos de **4 px**.
- Cantos arredondados suaves; separadores em **hairline**, não em borda pesada.
- Contraste mínimo **4.5:1**, verificado nas oito cores.
- Área de toque mínima **44×44 pt**, na página pública **e** no painel.
- A página pública não quebra com tipografia do sistema a **200%**.
- `prefers-reduced-motion` respeitado: sem animação de entrada quando ativo.

---

## O que eu quero de volta

1. **Os quatro templates do cartão**, em 375 px, com o conteúdo de exemplo da Helena — e um deles também no estado mínimo (só nome e WhatsApp).
2. **Os valores das oito cores**, dois tons cada, com o contraste conferido.
3. **A família tipográfica** e a escala de 6 tamanhos.
4. **As telas do painel do dono**, em 375 px e em 1024 px.
5. **As duas telas do admin**, em 1024 px, seguindo o ViraPágina.
6. **O QR em tela cheia.**
7. **A home**, em 1024 px e em 375 px — incluindo o **mockup do cartão da Helena dentro de um celular**, que é a peça que mais trabalha na página.

Se algum dos quatro templates não se sustentar — e o `executivo` é o candidato,
porque abrir mão da foto num cartão de visitas é uma aposta —, me diga e proponha
outro no lugar. Prefiro três templates bons a quatro sendo um deles fraco.
