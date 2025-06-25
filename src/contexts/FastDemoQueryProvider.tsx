
import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fastDemoStore } from '@/lib/demo/fastDemoStore';

// Create a query client optimized for demo with instant responses
const createFastDemoQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Instant responses for demo
        staleTime: Infinity,
        gcTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        // Override fetch functions to use fast demo store
        queryFn: async ({ queryKey }) => {
          const [resource] = queryKey as [string];
          
          switch (resource) {
            case 'contacts':
              return fastDemoStore.getContacts();
            case 'events':
              return fastDemoStore.getEvents();
            case 'keystones':
              return fastDemoStore.getKeystones();
            case 'job_applications':
              return fastDemoStore.getJobApplications();
            case 'conversations':
              return fastDemoStore.getConversations();
            default:
              return [];
          }
        }
      },
      mutations: {
        // Instant optimistic updates
        onMutate: async (variables: any) => {
          // Return optimistic data immediately
          return { optimisticData: variables };
        }
      }
    }
  });
};

interface FastDemoQueryProviderProps {
  children: ReactNode;
}

export const FastDemoQueryProvider: React.FC<FastDemoQueryProviderProps> = ({ children }) => {
  const queryClient = React.useMemo(() => createFastDemoQueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
