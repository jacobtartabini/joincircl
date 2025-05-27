
import ModernMainLayout from "./ModernMainLayout";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return <ModernMainLayout>{children}</ModernMainLayout>;
};

export default MainLayout;
