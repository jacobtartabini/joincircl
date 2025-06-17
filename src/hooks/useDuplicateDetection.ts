
import { useState, useEffect } from 'react';
import { duplicateContactService } from '@/services/duplicateContactService';
import { useContacts } from '@/hooks/use-contacts';

export const useDuplicateDetection = () => {
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const { contacts, isLoading } = useContacts();

  const checkForDuplicates = async () => {
    if (!contacts || contacts.length < 2 || isLoading) {
      setDuplicateCount(0);
      return;
    }
    
    setIsChecking(true);
    try {
      console.log('[useDuplicateDetection] Checking for duplicates with', contacts.length, 'contacts');
      const duplicates = await duplicateContactService.findDuplicates();
      console.log('[useDuplicateDetection] Found', duplicates.length, 'duplicate pairs');
      setDuplicateCount(duplicates.length);
    } catch (error) {
      console.error('[useDuplicateDetection] Error checking for duplicates:', error);
      setDuplicateCount(0);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Only check for duplicates when we have contacts and they're not loading
    if (!isLoading && contacts && contacts.length > 1) {
      console.log('[useDuplicateDetection] Contacts loaded, checking for duplicates');
      const timer = setTimeout(() => {
        checkForDuplicates();
      }, 1000); // Reduced delay for better responsiveness

      return () => clearTimeout(timer);
    } else {
      console.log('[useDuplicateDetection] Not checking - isLoading:', isLoading, 'contacts:', contacts?.length);
      setDuplicateCount(0);
    }
  }, [contacts, isLoading]);

  return {
    duplicateCount,
    isChecking,
    checkForDuplicates
  };
};
