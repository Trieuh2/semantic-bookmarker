"use client";

import { Suspense } from "react";
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
      <Suspense>
        <AuthProvider>
          <BookmarkProvider>
            <Sidebar />
            <div className="flex flex-col w-full">
              <Header />
              {children}
            </div>
          </BookmarkProvider>
        </AuthProvider>
      </Suspense>
    </div>
  );
};

export default BaseLayout;
