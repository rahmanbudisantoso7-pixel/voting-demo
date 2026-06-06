import NextAuth, { type DefaultSession } from "next-auth";
import { authConfig, isDemoMode } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { isValidCampusEmail, isAdminEmail } from "@/lib/utils";
import { logAudit } from "@/lib/audit";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      hasVoted: boolean;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "demo") {
        await logAudit(user.email!, "LOGIN", "Provider: demo");

        const isAdmin = !!(user as any).isAdmin;
        const existingUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name || user.email!.split("@")[0],
              isAdmin,
              hasVoted: false,
            },
          });
        } else {
          await prisma.user.update({
            where: { email: user.email! },
            data: { isAdmin, name: user.name || existingUser.name },
          });
        }
        return true;
      }

      const email = user.email?.toLowerCase();
      if (!email) {
        await logAudit("unknown", "LOGIN_FAILED", "No email provided");
        return false;
      }
      if (!isValidCampusEmail(email)) {
        await logAudit(email, "LOGIN_FAILED", "Invalid campus domain");
        return false;
      }

      const adminStatus = isAdminEmail(email);
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        await prisma.user.update({
          where: { email },
          data: { name: user.name || existingUser.name, isAdmin: adminStatus },
        });
      } else {
        await prisma.user.create({
          data: { email, name: user.name || email.split("@")[0], isAdmin: adminStatus },
        });
      }

      await logAudit(email, "LOGIN", `Provider: ${account?.provider}`);
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (dbUser) {
          token.id = dbUser.id;
          token.hasVoted = dbUser.hasVoted;
          token.isAdmin = dbUser.isAdmin;
          token.name = dbUser.name;
        }
      }
      if (trigger === "update" || (!user && token.email)) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email as string } });
        if (dbUser) {
          token.hasVoted = dbUser.hasVoted;
          token.isAdmin = dbUser.isAdmin;
          token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.hasVoted = !!token.hasVoted;
        session.user.isAdmin = !!token.isAdmin;
        session.user.name = (token.name as string) || session.user.name;
        session.user.email = (token.email as string) || session.user.email;
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      const email = (message as any)?.token?.email;
      if (email) await logAudit(email, "LOGOUT");
    },
  },
});
