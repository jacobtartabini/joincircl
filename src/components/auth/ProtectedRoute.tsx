
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // For now, just render the children - authentication logic would go here
  return <>{children}</>;
};

export default ProtectedRoute;
