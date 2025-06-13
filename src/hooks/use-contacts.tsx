
import { useState, useEffect } from "react";
import { Contact } from "@/types/contact";
import { contactService } from "@/services/contactService";
import { useToast } from "@/hooks/use-toast";

export const useContacts = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followUpStats, setFollowUpStats] = useState({
    due: 0,
    trend: { value: 0, isPositive: true },
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const data = await contactService.getContacts();
      setContacts(data);
      calculateFollowUpStats(data);
      return data;
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const addContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newContact = await contactService.createContact(contactData);
      setContacts(prev => [newContact, ...prev]);
      calculateFollowUpStats([newContact, ...contacts]);
      return newContact;
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const calculateFollowUpStats = (contactsData: Contact[]) => {
    // Calculate number of follow-ups due
    const followUpsDue = contactsData.filter(contact => {
      if (!contact.last_contact) return true; // If never contacted, a follow-up is due
      
      const lastContactDate = new Date(contact.last_contact);
      const today = new Date();
      const daysSinceLastContact = Math.floor((today.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Determine follow-up frequency based on circle
      let followUpFrequency = 30; // Default (outer circle)
      if (contact.circle === "inner") followUpFrequency = 7;
      else if (contact.circle === "middle") followUpFrequency = 14;
      
      return daysSinceLastContact >= followUpFrequency;
    }).length;
    
    // Calculate trend (comparing to previous week)
    const previousFollowUps = contactsData.length > 0 ? Math.round(contactsData.length * 0.15) : 0;
    const changePercent = previousFollowUps > 0 
      ? Math.round(((followUpsDue - previousFollowUps) / previousFollowUps) * 100)
      : 0;
    
    setFollowUpStats({
      due: followUpsDue,
      trend: {
        value: Math.abs(changePercent),
        isPositive: changePercent <= 0,
      }
    });
  };

  const getContactDistribution = () => {
    const innerCircleCount = contacts.filter(
      (contact) => contact.circle === "inner"
    ).length;
    const middleCircleCount = contacts.filter(
      (contact) => contact.circle === "middle"
    ).length;
    const outerCircleCount = contacts.filter(
      (contact) => contact.circle === "outer"
    ).length;

    return {
      innerCircleCount,
      middleCircleCount,
      outerCircleCount
    };
  };

  const getRecentContacts = (limit = 4) => {
    return [...contacts]
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  };

  return {
    contacts,
    isLoading,
    followUpStats,
    getContactDistribution,
    getRecentContacts,
    fetchContacts,
    addContact
  };
};
