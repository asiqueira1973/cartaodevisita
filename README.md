# Cartão de Visita

Cartão de visitas digital para o profissional autônomo brasileiro: endereço público, QR code e botão de salvar nos contatos.

Site: <https://cartaodevisita.app.br/>

## Principais funcionalidades

- Entrar com Google; a conta é criada no primeiro acesso.
- Escolher o endereço público (`/<handle>`), com verificação de disponibilidade.
- Editar o cartão: foto, nome, cargo, empresa, bio curta, canais de contato e links (adicionar, remover, reordenar).
- Página pública renderizada no servidor e endereço permanente `/c/<id>` que não muda quando o handle muda.
- QR code do endereço permanente, em tela cheia e para baixar em PNG.
- "Salvar nos contatos" com arquivo `.vcf` (vCard 3.0) com foto embutida.
- Botão de WhatsApp com mensagem inicial configurável.
- Publicar e despublicar o cartão; contador de visitas agregado por dia e por origem, sem dados que identifiquem o visitante.
- Ajustes da conta: trocar handle, sair, excluir conta e dados.
- Painel administrativo da plataforma e estrutura de planos (gratuito, early adopter, ilimitado), sem cobrança na v1.

## Stack técnica

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Auth.js v5 (login com Google)
- Firebase: Cloud Firestore e Cloud Storage via Admin SDK, só no servidor (as regras negam todo acesso do cliente)
- `qrcode` para gerar os QR codes
- Vitest (testes unitários e de integração com o emulador do Firestore)
- Hospedagem na Vercel

## Como foi construído

Desenvolvido com Claude (Anthropic) a partir de uma especificação SDD: [`spec.md`](spec.md), com o modelo de dados em [`modelo-cartaodevisita.dbml`](modelo-cartaodevisita.dbml) e o prompt de design em [`prompt-design-cartaodevisita.md`](prompt-design-cartaodevisita.md).

- Convenções e as "pegadinhas que não podem ser quebradas" para o agente de código: [`CLAUDE.md`](CLAUDE.md).
- Testes em [`tests/`](tests/): lógica pura (handle, ids, links, vCard, QR, planos, publicação, telemetria) e integração com o emulador do Firestore.
- Guardrail automatizado: [`tests/estrutura.test.ts`](tests/estrutura.test.ts) varre o código para garantir as regras de segurança do `CLAUDE.md` (guardas nas rotas, 404 em vez de 403, nada de Firestore no navegador, QR pelo id permanente, página pública sem telemetria).
- [`scripts/diagnostico.mjs`](scripts/diagnostico.mjs) confere as regras de segurança publicadas contra as do repositório.
- Documentação técnica do que está implementado: [`DOCUMENTACAO-TECNICA.md`](DOCUMENTACAO-TECNICA.md).

## Status

Publicado (web).

## Licença

O código está disponível apenas para leitura e estudo. Veja [LICENSE](LICENSE).

## Contribuições

Issues são bem-vindas; pull requests não são aceitos. Veja [CONTRIBUTING.md](CONTRIBUTING.md).

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm test                     # suíte unitária, não precisa de credencial
npm run dev
```

Outros comandos: `npm run typecheck`, `npm run lint`, `npm run emu` (emulador do Firestore, exige Java) e `npm run test:emu` (integração, com o emulador no ar).

### Variáveis de ambiente

Todas em [`.env.example`](.env.example). As que precisam de atenção:

| Variável | Observação |
|---|---|
| `EARLY_ADOPTER_ABERTO` | `true` faz conta nova nascer early adopter, para sempre. Lida só na criação da conta; desligar nunca rebaixa quem já entrou |
| `VISAO_API_KEY` | Telemetria do painel. Ausente = desligada, e o app funciona igual |
| `FIREBASE_PRIVATE_KEY` | Secreta. Nunca versionar, nunca com prefixo `NEXT_PUBLIC_` |

Nenhuma credencial vai para o navegador. Variável com `NEXT_PUBLIC_` é pública: não coloque segredo atrás desse prefixo.

---

Feito pela [Dab Lab](https://www.dablab.com.br/) — product studio de software e IA que constrói apps para pequenas empresas, startups e áreas dentro de grandes empresas, partindo de uma especificação (Spec-Driven Development) e com as disciplinas de engenharia de software robusta.
