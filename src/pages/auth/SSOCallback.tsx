
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export default function SSOCallback() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        navigate("/home");
      } else {
        navigate("/signin");
      }
    }
  }, [isSignedIn, isLoaded, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}
