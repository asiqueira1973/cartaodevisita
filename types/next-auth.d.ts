// Acrescenta o uid do Google ao tipo da sessão (spec 6.1).
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }
}
