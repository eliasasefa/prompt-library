import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    // Create or update the user row on every sign-in
    async signIn({ user, account }) {
      if (account?.provider === "github") {
        await sql`
          INSERT INTO users (github_id, email, name, image)
          VALUES (${user.id}, ${user.email ?? null}, ${user.name ?? null}, ${user.image ?? null})
          ON CONFLICT (github_id)
          DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, image = EXCLUDED.image
        `;
      }
      return true;
    },
    // Store our DB user id in the JWT
    async jwt({ token }) {
      if (token.dbUserId == null && token.sub) {
        const rows = await sql`SELECT id FROM users WHERE github_id = ${token.sub} LIMIT 1`;
        if (rows.length) token.dbUserId = Number(rows[0].id);
      }
      return token;
    },
    // Expose it on the session
    async session({ session, token }) {
      if (session.user) session.user.dbUserId = token.dbUserId;
      return session;
    },
  },
});