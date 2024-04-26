"use client";

import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";
import { AuthProvider } from "../context/AuthContext";
import { BookmarkProvider } from "../context/BookmarkContext";

interface BaseLayoutProps {
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <div className="h-full flex bg-zinc-800">
      <AuthProvider>
        <BookmarkProvider>
          <Sidebar />
          <div className="flex flex-col w-full">
            <Header />
            {children}
          </div>
        </BookmarkProvider>
      </AuthProvider>
    </div>
  );
};

export default BaseLayout;
