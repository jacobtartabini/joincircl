
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // This page is for OAuth callback redirects
    // Redirect back to the home page after being authenticated
    navigate("/");
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Authenticating...</h2>
        <p>Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}
