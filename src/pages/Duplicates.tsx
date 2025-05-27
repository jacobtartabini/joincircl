
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Users } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="hover:bg-gray-200 rounded-xl"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review Duplicates</h1>
              <p className="text-gray-600 mt-1 text-lg">Find and merge duplicate contacts in your network</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="border-gray-200 hover:bg-gray-50 font-semibold shadow-sm"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin mr-2" : "mr-2"} />
            {isRefreshing ? "Checking..." : "Refresh"}
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-6"></div>
                <p className="text-gray-600 text-lg font-medium">Scanning for duplicates...</p>
                <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
              </CardContent>
            </Card>
          </div>
        ) : duplicatePairs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {duplicatePairs.map((pair) => (
              <DuplicateContactCard 
                key={`${pair.contact1.id}-${pair.contact2.id}`}
                duplicatePair={pair}
                onMerge={handleMergeContacts}
                onCompare={openCompareDialog}
              />
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">No Duplicates Found</CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Your contacts list looks clean! We couldn't find any potential duplicates.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center px-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Duplicates can occur when you import contacts from multiple sources or create the same contact more than once.
                  We continuously scan your contacts to identify potential duplicates based on names, email addresses, and phone numbers.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pb-8">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-gray-200 hover:bg-gray-50 font-semibold shadow-sm"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Checking for duplicates...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} className="mr-2" />
                    Check Again
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
    </div>
  );
};

export default Duplicates;
