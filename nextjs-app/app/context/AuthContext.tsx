"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthContextProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthContextProps> = ({ children }) => {
  return (
    <SessionProvider>
      <AuthContext>{children}</AuthContext>
    </SessionProvider>
  );
};

const AuthContext: React.FC<AuthContextProps> = ({ children }) => {
  const session = useSession();
  const router = useRouter();
  const currentPath = usePathname();
  const protected_path = "/bookmarks";
  const home_path = "/";

  useEffect(() => {
    if (session?.status === "authenticated" && currentPath === "/") {
      router.push(protected_path);
    }
    if (session?.status === "unauthenticated" && currentPath !== "/") {
      router.push(home_path);
    }
  }, [session?.status, currentPath, router]);

  return <>{children}</>;
};

export default AuthProvider;
