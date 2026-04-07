import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true, // 동일 이메일 credentials ↔ google 연결 허용
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    /**
     * Google 로그인 시 User 자동 생성/연결
     * - 이메일로 기존 사용자 조회
     * - 없으면 신규 생성 (provider: google)
     * - 있으면 provider 정보 갱신
     */
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existing) {
          // 기존 사용자: provider 정보 갱신 (처음 Google 연동이면)
          if (existing.provider !== "google") {
            await prisma.user.update({
              where: { id: existing.id },
              data: {
                provider: "google",
                providerId: account.providerAccountId,
                image: user.image ?? existing.image,
              },
            });
          }
          user.id = existing.id;
          (user as { role: string }).role = existing.role;
        } else {
          // 신규 사용자 생성 (기본 GUEST)
          const created = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name ?? profile?.name ?? user.email.split("@")[0],
              image: user.image,
              provider: "google",
              providerId: account.providerAccountId,
              role: "GUEST",
            },
          });
          user.id = created.id;
          (user as { role: string }).role = created.role;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      // 기존 세션에서 role 없으면 DB 조회
      if (token.id && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});

/** 현재 로그인 사용자 조회 (서버 컴포넌트용) */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  return user;
}

/** 인증 필수 (API 라우트용) */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
