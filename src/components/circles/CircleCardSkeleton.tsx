
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CircleCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start">
          <Skeleton className="h-12 w-12 rounded-full" />
          
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            
            <Skeleton className="h-4 w-48 mt-2" />
            
            <div className="flex flex-wrap gap-3 mt-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32 ml-auto" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
