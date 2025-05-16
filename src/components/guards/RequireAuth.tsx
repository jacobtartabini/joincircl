
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { validateSession } from "@/utils/security";

interface RequireAuthProps {
  children: ReactNode;
  requiredPermission?: string; // Optional permission required to access the route
}

export function RequireAuth({ children, requiredPermission }: RequireAuthProps) {
  const { user, loading, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!user) {
          // User is not authenticated, redirect to login
          navigate("/auth/sign-in", { 
            replace: true,
            state: { from: location.pathname } // Remember where they were trying to go
          });
          return;
        }
        
        // Verify session is still valid
        const isValidSession = await validateSession();
        if (!isValidSession) {
          // Session expired, redirect to login
          navigate("/auth/sign-in", {
            replace: true,
            state: { from: location.pathname }
          });
          return;
        }
        
        // Check permission if specified
        if (requiredPermission && !hasPermission(requiredPermission)) {
          // User doesn't have the required permission
          navigate("/", { replace: true });
          return;
        }
        
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [user, loading, navigate, location.pathname, requiredPermission, hasPermission]);

  // Show a loading state while checking authentication
  if (loading || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{loading ? "Loading authentication..." : "Verifying your session..."}</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth/sign-in" replace />;
}
