
import { useState, useEffect, useCallback } from "react";
import { duplicateContactService, DuplicatePair } from "@/services/duplicateContactService";
import { useToast } from "@/hooks/use-toast";
import { MergeSuccessToast } from "@/components/duplicates/MergeSuccessToast";
import { Contact } from "@/types/contact";

export const useDuplicateContacts = () => {
  const { toast } = useToast();
  const [duplicatePairs, setDuplicatePairs] = useState<DuplicatePair[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicatePair | null>(null);
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false);
  
  const fetchDuplicates = useCallback(async () => {
    try {
      setIsLoading(true);
      const pairs = await duplicateContactService.findDuplicates();
      setDuplicatePairs(pairs);
    } catch (error) {
      console.error("Error fetching duplicates:", error);
      toast({
        title: "Error",
        description: "Failed to detect duplicate contacts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchDuplicates();
  }, [fetchDuplicates]);
  
  const handleMergeContacts = useCallback(async (primaryId: string, secondaryId: string): Promise<Contact | null> => {
    try {
      const mergedContact = await duplicateContactService.mergeContacts(primaryId, secondaryId);
      
      if (mergedContact) {
        // Show success toast
        toast({
          description: <MergeSuccessToast contactName={mergedContact.name} />,
        });
        
        // Remove the merged pair from the list
        setDuplicatePairs(prev => 
          prev.filter(pair => 
            !(pair.contact1.id === primaryId && pair.contact2.id === secondaryId) &&
            !(pair.contact1.id === secondaryId && pair.contact2.id === primaryId)
          )
        );
        
        return mergedContact;
      } else {
        throw new Error("Failed to merge contacts");
      }
    } catch (error) {
      console.error("Error merging contacts:", error);
      toast({
        title: "Error",
        description: "Failed to merge contacts. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const handleIgnoreDuplicate = useCallback((duplicatePair: DuplicatePair) => {
    // Remove the pair from the list
    setDuplicatePairs(prev => 
      prev.filter(pair => 
        !(pair.contact1.id === duplicatePair.contact1.id && pair.contact2.id === duplicatePair.contact2.id) &&
        !(pair.contact1.id === duplicatePair.contact2.id && pair.contact2.id === duplicatePair.contact1.id)
      )
    );
    
    // Show confirmation toast
    toast({
      description: "Duplicate suggestion ignored",
    });
  }, [toast]);
  
  const openCompareDialog = useCallback((duplicate: DuplicatePair) => {
    setSelectedDuplicate(duplicate);
    setIsCompareDialogOpen(true);
  }, []);
  
  return {
    duplicatePairs,
    isLoading,
    fetchDuplicates,
    handleMergeContacts,
    handleIgnoreDuplicate,
    selectedDuplicate,
    setSelectedDuplicate,
    isCompareDialogOpen,
    setIsCompareDialogOpen,
    openCompareDialog,
  };
};
