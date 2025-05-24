
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-serif font-bold text-circl-blue">404</h1>
      <h2 className="text-2xl mt-4">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="mt-6">
        <Link to="/signin">Return Home</Link>
      </Button>
    </div>
  );
};

export default NotFound;
