import type { NextAuthConfig } from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";

export const isDemoMode = process.env.DEMO_MODE === "true";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    ...(isDemoMode
      ? [
          Credentials({
            id: "demo",
            name: "Demo Login",
            credentials: {
              email: { label: "Email", type: "email" },
              name: { label: "Nama", type: "text" },
              role: { label: "Role", type: "text" },
            },
            async authorize(credentials) {
              const email = (credentials?.email as string)?.toLowerCase();
              const name = (credentials?.name as string) || email?.split("@")[0] || "Demo User";
              const role = (credentials?.role as string) || "voter";

              if (!email) return null;

              const isAdmin =
                role === "admin" ||
                (process.env.ADMIN_EMAILS || "")
                  .split(",")
                  .map((e) => e.trim().toLowerCase())
                  .includes(email);

              return {
                id: email,
                email,
                name,
                isAdmin,
              } as any;
            },
          }),
        ]
      : []),
    ...(isDemoMode
      ? []
      : [
          MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
            authorization: {
              params: { scope: "openid profile email User.Read" },
            },
          }),
        ]),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if ((user as any).isAdmin !== undefined) {
          token.isAdmin = (user as any).isAdmin;
        }
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.sub || (token.email as string);
        (session.user as any).isAdmin = !!token.isAdmin;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const isLoggedIn = !!auth?.user;
      const isAdmin = !!(auth?.user as any)?.isAdmin;
      const hasVoted = !!(auth?.user as any)?.hasVoted;

      const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");
      const isPublicRoute =
        nextUrl.pathname === "/" ||
        nextUrl.pathname === "/login" ||
        nextUrl.pathname === "/hasil";
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isVotingRoute = nextUrl.pathname.startsWith("/voting");

      if (isAuthRoute) return true;

      if (isAdminRoute) {
        if (!isLoggedIn) {
          const cb = encodeURIComponent(nextUrl.pathname);
          return Response.redirect(new URL(`/login?callbackUrl=${cb}`, nextUrl));
        }
        if (!isAdmin) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (isVotingRoute) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/login?callbackUrl=/voting", nextUrl));
        }
        if (hasVoted) {
          return Response.redirect(new URL("/voting/success", nextUrl));
        }
        return true;
      }

      if (!isPublicRoute && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
