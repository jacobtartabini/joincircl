
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoAuth } from '@/contexts/DemoAuthContext';

export const useDemoOrRealAuth = () => {
  const location = useLocation();
  const isDemo = location.pathname.startsWith('/demo');
  
  const realAuth = useAuth();
  const demoAuth = useDemoAuth();
  
  return isDemo ? demoAuth : realAuth;
};
