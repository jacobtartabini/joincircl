
import React, { ReactNode } from 'react';
import { DemoBanner } from './DemoBanner';
import MainLayout from '@/components/layout/MainLayout';

interface DemoLayoutProps {
  children: ReactNode;
}

export const DemoLayout: React.FC<DemoLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <DemoBanner />
      <div className="pt-[60px]"> {/* Add more padding to account for banner height */}
        <MainLayout>
          {children}
        </MainLayout>
      </div>
    </div>
  );
};
