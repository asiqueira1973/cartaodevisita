# Cartão de Visita

Cartão de visitas digital com endereço público, QR code e salvar-em-contatos,
para o profissional autônomo brasileiro. `cartaodevisita.app.br`

- **Produto:** [`spec.md`](spec.md) — a fonte de verdade
- **Modelo de dados:** [`modelo-cartaodevisita.dbml`](modelo-cartaodevisita.dbml) — cole no dbdiagram.io
- **Design:** [`prompt-design-cartaodevisita.md`](prompt-design-cartaodevisita.md)
- **Convenções:** [`CLAUDE.md`](CLAUDE.md)

## Setup local

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm test                     # 69 testes, não precisa de credencial nenhuma
npm run dev
```

## Variáveis de ambiente

Todas em `.env.example`. As que precisam de atenção:

| Variável | Observação |
|---|---|
| `EARLY_ADOPTER_ABERTO` | `true` faz conta nova nascer early adopter, **para sempre**. Lida só na criação da conta; desligar nunca rebaixa quem já entrou |
| `VISAO_API_KEY` | Telemetria do painel. **Ausente = desligada, e o app funciona igual** |
| `FIREBASE_PRIVATE_KEY` | Secreta. Nunca versionar, nunca com prefixo `NEXT_PUBLIC_` |

Nenhuma credencial vai para o navegador. Variável com `NEXT_PUBLIC_` é pública —
não coloque segredo atrás desse prefixo por engano.

## Estado

Lógica pura implementada e testada. Firebase, autenticação, rotas e telas ainda
não — ver "Estado da implementação" no `CLAUDE.md`.
