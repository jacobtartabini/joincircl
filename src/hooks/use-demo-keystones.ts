
import { useLocation } from 'react-router-dom';
import { useFastDemoKeystones } from './use-fast-demo-data';
import { useKeystones as useRealKeystones } from './use-keystones';

export const useDemoKeystones = () => {
  const location = useLocation();
  const isDemo = location.pathname.startsWith('/demo');
  
  if (isDemo) {
    // Use demo data
    const { data: keystones = [], isLoading, error, refetch } = useFastDemoKeystones();
    
    return {
      keystones,
      isLoading,
      error,
      refetch
    };
  } else {
    // Use real keystones hook for non-demo routes
    return useRealKeystones();
  }
};
