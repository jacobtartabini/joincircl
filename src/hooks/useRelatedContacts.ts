
import { useState, useEffect } from 'react';
import { Contact } from '@/types/contact';
import { contactService } from '@/services/contactService';

export const useRelatedContacts = (contactId?: string, limit = 5) => {
  const [relatedContacts, setRelatedContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRelatedContacts = async () => {
      if (!contactId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // For now, we'll just get random contacts as a placeholder
        // In a real implementation, this would use some algorithm to find related contacts
        // based on shared tags, companies, interactions, etc.
        const allContacts = await contactService.getContacts();
        
        // Make sure we have valid contacts
        if (!allContacts || !Array.isArray(allContacts)) {
          setRelatedContacts([]);
          return;
        }
        
        // Filter out the current contact and get a random selection
        const filteredContacts = allContacts
          .filter(c => c.id !== contactId)
          // For demo, make sure we have some from each circle
          .sort(() => 0.5 - Math.random())
          .slice(0, limit);
          
        setRelatedContacts(filteredContacts);
      } catch (err) {
        console.error('Error fetching related contacts:', err);
        setError(err as Error);
        setRelatedContacts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedContacts();
  }, [contactId, limit]);

  return { relatedContacts, loading, error };
};
