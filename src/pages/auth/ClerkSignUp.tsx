
import { SignUp } from '@clerk/clerk-react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

export default function ClerkSignUp() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12">
            <img 
              src="/lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png" 
              alt="Circl" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
              card: 'shadow-lg',
              headerTitle: 'text-2xl font-bold',
              headerSubtitle: 'text-muted-foreground',
            }
          }}
          redirectUrl="/"
          fallbackRedirectUrl="/"
        />
      </div>
    </div>
  );
}
