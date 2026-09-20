import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Permite construir num diretório separado com DIST_DIR=.next-medicao, para
  // não sobrescrever o `.next` que o `npm run dev` está usando. Rodar os dois
  // no mesmo diretório derruba o servidor com "Cannot find module
  // './vendor-chunks/...'", e a mensagem não diz o que aconteceu.
  distDir: process.env.DIST_DIR || '.next',

  /**
   * `www` redireciona para a raiz (spec 4.3).
   *
   * Sem isto, o mesmo cartão responde em dois endereços — e aí existem duas
   * versões de "o endereço da pessoa", o que contraria a ideia de um endereço
   * só (princípio 0.4). O redirecionamento é permanente e preserva o caminho,
   * então um link antigo com `www` continua levando ao cartão certo.
   */
  async redirects() {
    return [
      {
        source: '/:caminho*',
        has: [{ type: 'host', value: 'www.cartaodevisita.app.br' }],
        destination: 'https://cartaodevisita.app.br/:caminho*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
