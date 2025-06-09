
import { NotFound as NotFoundComponent, Illustration } from "@/components/ui/not-found";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";

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
            Lost, this page is. In another system, it may be.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-y-3 sm:space-x-2 mx-auto sm:max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search" className="pl-8" />
            </div>
            <Button variant="outline">Search</Button>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-y-3 gap-x-6">
            <Button variant="secondary" asChild className="group">
              <Link to="/">
                <ArrowLeft
                  className="me-2 ms-0 opacity-60 transition-transform group-hover:-translate-x-0.5"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Go back
              </Link>
            </Button>
            <Button className="-order-1 sm:order-none" asChild>
              <Link to="/">Take me home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
