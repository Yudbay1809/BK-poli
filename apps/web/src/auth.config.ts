import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authConfig = {
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email atau Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            identifier: z.string().min(1),
            password: z.string().min(8),
          })
          .safeParse(credentials);
        if (!parsed.success) return null;

        const identifier = parsed.data.identifier.trim().toLowerCase();
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: identifier, mode: "insensitive" } },
              { username: { equals: identifier, mode: "insensitive" } },
            ],
          },
        });
        if (!user) return null;
        if (!user.isActive) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: String(user.id),
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && "role" in user) token.role = user.role as string;
      if (user && "sessionVersion" in user) token.sessionVersion = user.sessionVersion as number;
      if (user && "username" in user) token.username = user.username as string;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? "PASIEN";
        session.user.sessionVersion = Number(token.sessionVersion ?? 0);
        session.user.username = (token.username as string | undefined) ?? undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
