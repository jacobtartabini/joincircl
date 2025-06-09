
import { NotFound as NotFoundComponent, Illustration } from "@/components/ui/not-found";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="relative flex flex-col w-full justify-center min-h-screen bg-background p-6 md:p-10">
      <div className="relative max-w-5xl mx-auto w-full">
        <Illustration className="absolute inset-0 w-full h-[50vh] opacity-[0.04] dark:opacity-[0.03] text-foreground" />
        <div className="relative text-center z-[1] pt-52">
          <h1 className="mt-4 text-balance text-5xl font-semibold tracking-tight text-primary sm:text-7xl">
            404
          </h1>
          <p className="mt-6 text-pretty text-lg font-medium text-muted-foreground sm:text-xl/8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-y-3 gap-x-6">
            <Button className="-order-1 sm:order-none" asChild>
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
