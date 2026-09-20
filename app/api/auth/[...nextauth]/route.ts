// Handler do Auth.js (spec 6.1).
// O caminho /api/auth/callback/google é o padrão do Auth.js v5 e é o que está
// registrado no console do Google — não mude sem atualizar lá.
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
