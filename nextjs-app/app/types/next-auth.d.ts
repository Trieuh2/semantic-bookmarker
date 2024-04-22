import "next-auth";

declare module "next-auth" {
  /**
   * Represents the shape of the user object in the session.
   */
  interface User {
    id: string;
    role?: string;
  }

  /**
   * Represents the session object returned by useSession, getSession, etc.
   */
  interface Session {
    user: User;
    userId?: string;
    sessionToken?: string;
  }
}
