
import { ReactNode } from "react";
import { MobileOptimizedLayout } from "./MobileOptimizedLayout";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <MobileOptimizedLayout>
      {children}
    </MobileOptimizedLayout>
  );
}
