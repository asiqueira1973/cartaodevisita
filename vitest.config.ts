import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

// Suíte padrão: só o que roda SEM dependência externa (spec 22.1).
// A suíte de integração tem configuração própria — `vitest.emu.config.ts` —
// porque um `exclude` aqui venceria até um filtro explícito na linha de comando.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/firestore-emulador.test.ts', '**/node_modules/**'],
  },
  resolve: { alias: { '@': resolve(__dirname, '.') } },
})
