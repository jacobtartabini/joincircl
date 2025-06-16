
import { useState, useEffect } from 'react';
import { duplicateContactService } from '@/services/duplicateContactService';
import { useContacts } from '@/hooks/use-contacts';

export const useDuplicateDetection = () => {
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const { contacts } = useContacts();

  const checkForDuplicates = async () => {
    if (!contacts || contacts.length === 0) return;
    
    setIsChecking(true);
    try {
      const duplicates = await duplicateContactService.findDuplicates();
      setDuplicateCount(duplicates.length);
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      setDuplicateCount(0);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check for duplicates when contacts change
    if (contacts && contacts.length > 1) {
      const timer = setTimeout(() => {
        checkForDuplicates();
      }, 2000); // Delay to avoid excessive API calls

      return () => clearTimeout(timer);
    }
  }, [contacts]);

  return {
    duplicateCount,
    isChecking,
    checkForDuplicates
  };
};
