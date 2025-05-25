
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from '@clerk/clerk-react';

interface RequireAuthProps {
  children: ReactNode;
  requiredPermission?: string;
}

export function ClerkRequireAuth({ children, requiredPermission }: RequireAuthProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/auth/sign-in" replace state={{ from: location.pathname }} />;
  }

  // TODO: Implement permission checking if needed
  if (requiredPermission) {
    // For now, allow access if signed in
    console.log(`Permission check for: ${requiredPermission}`);
  }

  return <>{children}</>;
}
