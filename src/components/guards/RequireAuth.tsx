
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { validateSession } from "@/utils/security";

interface RequireAuthProps {
  children: ReactNode;
  requiredPermission?: string;
}

export function RequireAuth({ children, requiredPermission }: RequireAuthProps) {
  const { user, profile, loading, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('RequireAuth: checking auth state', { 
        loading, 
        hasUser: !!user, 
        hasProfile: !!profile,
        pathname: location.pathname 
      });

      if (loading) {
        console.log('RequireAuth: still loading auth state');
        return;
      }

      if (!user) {
        console.log('RequireAuth: no user found, redirecting to signin');
        navigate("/signin", { 
          replace: true,
          state: { from: location.pathname }
        });
        return;
      }

      try {
        // Verify session is still valid
        const isValidSession = await validateSession();
        if (!isValidSession) {
          console.log('RequireAuth: invalid session, redirecting to signin');
          navigate("/signin", {
            replace: true,
            state: { from: location.pathname }
          });
          return;
        }
      } catch (error) {
        console.error('RequireAuth: error validating session:', error);
        // Continue with auth check even if validation fails
      }

      // Check if user needs onboarding (but not if already on onboarding page)
      if (profile && location.pathname !== '/onboarding') {
        const hasCompletedOnboarding = profile.onboarding_completed;
        
        if (!hasCompletedOnboarding) {
          console.log('RequireAuth: onboarding not completed, redirecting to onboarding');
          navigate("/onboarding", { replace: true });
          return;
        }
      }

      // Check permission if specified
      if (requiredPermission && !hasPermission(requiredPermission)) {
        console.log('RequireAuth: insufficient permissions, redirecting to home');
        navigate("/", { replace: true });
        return;
      }

      console.log('RequireAuth: auth check passed, user is authenticated');
      setIsChecking(false);
    };

    checkAuth();
  }, [user, profile, loading, navigate, location.pathname, requiredPermission, hasPermission]);

  // Show loading state while checking authentication
  if (loading || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? "Loading authentication..." : "Verifying your session..."}
          </p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/signin" replace />;
}
