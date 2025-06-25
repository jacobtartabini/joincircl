
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoAuth } from '@/contexts/DemoAuthContext';

export const useDemoOrRealAuth = () => {
  const location = useLocation();
  const isDemo = location.pathname.startsWith('/demo');
  
  // Get auth contexts - in demo mode, these might throw errors, so we need to handle that
  let realAuth = null;
  let demoAuth = null;
  
  try {
    // Only use real auth if not in demo mode
    if (!isDemo) {
      realAuth = useAuth();
    }
  } catch (error) {
    // Real auth context might not be available in demo routes
    console.log('Real auth context not available:', error);
  }
  
  try {
    // Only use demo auth if in demo mode
    if (isDemo) {
      demoAuth = useDemoAuth();
    }
  } catch (error) {
    // Demo auth context might not be available in regular routes
    console.log('Demo auth context not available:', error);
  }
  
  return isDemo ? (demoAuth || { user: null, loading: false }) : (realAuth || { user: null, loading: false });
};
