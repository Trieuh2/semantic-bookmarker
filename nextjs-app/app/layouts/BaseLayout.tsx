"use client";

import Sidebar from "../components/sidebar/Sidebar";
import { BookmarkProvider } from "../context/BookmarkContext";

interface BaseLayoutProps {
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <div className="h-full flex bg-zinc-800">
      <BookmarkProvider>
        <Sidebar />
        {children}
      </BookmarkProvider>
    </div>
  );
};

export default BaseLayout;
