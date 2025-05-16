
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useDuplicateContacts } from "@/hooks/useDuplicateContacts";
import { DuplicateContactCard } from "@/components/duplicates/DuplicateContactCard";
import { DuplicateCompareDialog } from "@/components/duplicates/DuplicateCompareDialog";

const Duplicates = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    duplicatePairs,
    isLoading,
    fetchDuplicates,
    handleMergeContacts,
    selectedDuplicate,
    isCompareDialogOpen,
    setIsCompareDialogOpen,
    openCompareDialog,
  } = useDuplicateContacts();
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDuplicates();
    setIsRefreshing(false);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold">Review Duplicates</h1>
        <Button
          variant="outline"
          size="icon"
          className="ml-auto"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : duplicatePairs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {duplicatePairs.map((pair, index) => (
            <DuplicateContactCard 
              key={`${pair.contact1.id}-${pair.contact2.id}`}
              duplicatePair={pair}
              onMerge={handleMergeContacts}
              onCompare={openCompareDialog}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Duplicates Found</CardTitle>
            <CardDescription>
              Your contacts list looks clean! We couldn't find any potential duplicates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Duplicates can occur when you import contacts from multiple sources or create the same contact more than once.
              We continuously scan your contacts to identify potential duplicates.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Checking for duplicates...
                </>
              ) : (
                <>
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Compare Dialog */}
      <DuplicateCompareDialog
        isOpen={isCompareDialogOpen}
        onOpenChange={setIsCompareDialogOpen}
        duplicatePair={selectedDuplicate}
        onMerge={handleMergeContacts}
      />
    </div>
  );
};

export default Duplicates;
