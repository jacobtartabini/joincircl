
import { ReactNode, useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function RequireAuth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // If not loading and user is not authenticated, redirect to login
    if (!loading) {
      setIsChecking(false);
      
      if (!user) {
        navigate("/auth/sign-in", { replace: true });
      }
    }
  }, [user, loading, navigate]);

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

  return user ? <Outlet /> : <Navigate to="/auth/sign-in" replace />;
}
