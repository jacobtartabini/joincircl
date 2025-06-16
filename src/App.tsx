
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import ModernMainLayout from "@/components/layout/ModernMainLayout";
import { OfflineIndicator } from "@/components/ui/offline-indicator";

// Pages
import ModernDashboard from "@/pages/ModernDashboard";
import ModernCircles from "@/pages/ModernCircles";
import ModernSettings from "@/pages/ModernSettings";
import AuthPages from "@/pages/AuthPages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/auth/*" element={<AuthPages />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ModernMainLayout>
                    <ModernDashboard />
                  </ModernMainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/circles"
              element={
                <ProtectedRoute>
                  <ModernMainLayout>
                    <ModernCircles />
                  </ModernMainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <ModernMainLayout>
                    <ModernSettings />
                  </ModernMainLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster />
          <OfflineIndicator />
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
