import React from "react";
import BaseLayout from "../layouts/BaseLayout";

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  return <BaseLayout>{children}</BaseLayout>;
};

export default HomeLayout;
