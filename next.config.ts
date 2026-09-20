import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Permite construir num diretório separado com DIST_DIR=.next-medicao, para
  // não sobrescrever o `.next` que o `npm run dev` está usando. Rodar os dois
  // no mesmo diretório derruba o servidor com "Cannot find module
  // './vendor-chunks/...'", e a mensagem não diz o que aconteceu.
  distDir: process.env.DIST_DIR || '.next',
}

export default nextConfig
