"use client";

import { Suspense } from "react";
import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";
import { AuthProvider } from "../context/AuthContext";
import { BookmarkProvider } from "../context/BookmarkContext";
import DetailedBookmarkPanel from "../components/DetailedBookmarkPanel";

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
              <div className="flex overflow-hidden h-full w-full">
                {children}
              </div>
            </div>
            <DetailedBookmarkPanel />
          </BookmarkProvider>
        </AuthProvider>
      </Suspense>
    </div>
  );
};

export default BaseLayout;
