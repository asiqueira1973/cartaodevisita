// Configuração do Auth.js v5 (spec 6.1).
//
// ESTE ARQUIVO NÃO IMPORTA FIREBASE, de propósito: ele é carregado pelo
// `middleware.ts`, que roda no Edge Runtime, e o Admin SDK não roda lá.
// A conta nasce em `garantirUsuario`, dentro de `requireDono()` (spec 6.2).

import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: {
    strategy: 'jwt',
    // 30 dias, renovada a cada acesso (spec 6.5).
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: { signIn: '/entrar' },
  callbacks: {
    /**
     * Leva o `sub` do Google para o token (spec 6.1).
     * O identificador interno é o `sub`, e não o e-mail: e-mail muda, e a conta
     * inteira está chaveada pelo uid.
     */
    async jwt({ token, profile }) {
      if (profile?.sub) token.sub = profile.sub
      return token
    },
    /** Expõe o uid na sessão, para as guardas usarem sem reler o token. */
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub
      return session
    },
  },
})
