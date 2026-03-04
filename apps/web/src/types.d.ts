import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    sessionVersion?: number;
    username?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      sessionVersion: number;
      username?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    sessionVersion?: number;
    username?: string;
  }
}
