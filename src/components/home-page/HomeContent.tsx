
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import ModernHomeContent from './ModernHomeContent';
import MobileHomeContent from './MobileHomeContent';

const HomeContent: React.FC = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileHomeContent />;
  }
  
  return <ModernHomeContent />;
};

export default HomeContent;
