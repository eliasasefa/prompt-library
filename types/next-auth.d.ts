import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      dbUserId?: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    dbUserId?: number;
  }
}