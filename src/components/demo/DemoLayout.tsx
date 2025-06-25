
import React, { ReactNode } from 'react';
import { DemoBanner } from './DemoBanner';
import MainLayout from '@/components/layout/MainLayout';

interface DemoLayoutProps {
  children: ReactNode;
}

export const DemoLayout: React.FC<DemoLayoutProps> = ({ children }) => {
  return (
    <>
      <DemoBanner />
      <div className="pt-12"> {/* Add padding to account for banner height */}
        <MainLayout>
          {children}
        </MainLayout>
      </div>
    </>
  );
};
