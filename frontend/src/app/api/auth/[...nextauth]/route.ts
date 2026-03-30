import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              providerId: account.providerAccountId,
              avatar: user.image,
            }),
          });
          if (!res.ok) return false;
          const data = await res.json();
          (user as Record<string, unknown>).backendTokens = data;
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user && (user as Record<string, unknown>).backendTokens) {
        token.backendTokens = (user as Record<string, unknown>).backendTokens;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.backendTokens) {
        (session as Record<string, unknown>).backendTokens = token.backendTokens;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
