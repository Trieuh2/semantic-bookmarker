"use client";

import Sidebar from "../components/sidebar/Sidebar";
import AuthProvider from "../context/AuthContext";

interface BaseLayoutProps {
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <div className="h-full flex bg-zinc-800">
      <AuthProvider>
        <Sidebar />
        {children}
      </AuthProvider>
    </div>
  );
};

export default BaseLayout;
