import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { resolveAppUserId } from "@/lib/app-user";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async jwt({ token, user, account }) {
      const githubId =
        account?.provider === "github" && account.providerAccountId
          ? String(account.providerAccountId)
          : undefined;
      const email =
        (typeof user?.email === "string" && user.email) ||
        (typeof token.email === "string" && token.email) ||
        null;
      const name =
        (typeof user?.name === "string" && user.name) ||
        (typeof token.name === "string" && token.name) ||
        null;
      const image =
        (typeof user?.image === "string" && user.image) ||
        (typeof token.picture === "string" && token.picture) ||
        null;

      const shouldResolve = Boolean(account) || token.dbUserId == null || token.mergedAppUser !== true;
      if (shouldResolve) {
        const dbUserId = await resolveAppUserId({
          githubId: githubId ?? (typeof token.sub === "string" ? token.sub : null),
          email,
          name,
          image,
        });
        if (dbUserId != null) token.dbUserId = dbUserId;
        token.mergedAppUser = true;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.dbUserId != null) {
        session.user.dbUserId = Number(token.dbUserId);
      }
      return session;
    },
  },
});
