
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ContactDetailSkeletonProps {
  isLoading?: boolean;
  error?: boolean;
  errorMessage?: string;
}

export default function ContactDetailSkeleton({ 
  isLoading = true, 
  error = false,
  errorMessage = "Could not load contact data. Please try again."
}: ContactDetailSkeletonProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading contact details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Contact not found</h2>
        <p className="mb-6">{errorMessage}</p>
        <Link to="/circles">
          <Button>Back to Contacts</Button>
        </Link>
      </div>
    );
  }

  return null;
}
