import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

// Suíte de integração: exige o emulador do Firestore no ar (`npm run emu`).
// Rode com `npm run test:emu`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/firestore-emulador.test.ts'],
    // As transações do emulador são mais lentas que uma chamada em memória.
    testTimeout: 15000,
    hookTimeout: 15000,
  },
  resolve: { alias: { '@': resolve(__dirname, '.') } },
})
