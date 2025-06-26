
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useFastDemoContacts } from './use-fast-demo-data';
import { useContacts as useRealContacts } from './use-contacts';
import { fastDemoStore } from '@/lib/demo/fastDemoStore';
import { Contact } from '@/types/contact';

export const useDemoContacts = () => {
  const location = useLocation();
  const isDemo = location.pathname.startsWith('/demo');
  
  if (isDemo) {
    // Use demo data
    const { data: demoContacts = [], isLoading } = useFastDemoContacts();
    const [followUpStats, setFollowUpStats] = useState({
      due: 0,
      trend: { value: 0, isPositive: true },
    });

    useEffect(() => {
      if (demoContacts.length > 0) {
        calculateFollowUpStats(demoContacts);
      }
    }, [demoContacts]);

    const calculateFollowUpStats = (contactsData: Contact[]) => {
      const followUpsDue = contactsData.filter(contact => {
        if (!contact.last_contact) return true;
        
        const lastContactDate = new Date(contact.last_contact);
        const today = new Date();
        const daysSinceLastContact = Math.floor((today.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let followUpFrequency = 30;
        if (contact.circle === "inner") followUpFrequency = 7;
        else if (contact.circle === "middle") followUpFrequency = 14;
        
        return daysSinceLastContact >= followUpFrequency;
      }).length;
      
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
      const innerCircleCount = demoContacts.filter(c => c.circle === "inner").length;
      const middleCircleCount = demoContacts.filter(c => c.circle === "middle").length;
      const outerCircleCount = demoContacts.filter(c => c.circle === "outer").length;

      return { innerCircleCount, middleCircleCount, outerCircleCount };
    };

    const getRecentContacts = (limit = 4) => {
      return [...demoContacts]
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, limit);
    };

    const addContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
      const newContact = fastDemoStore.createContact(contactData);
      return newContact;
    };

    return {
      contacts: demoContacts,
      isLoading,
      followUpStats,
      getContactDistribution,
      getRecentContacts,
      fetchContacts: async () => demoContacts,
      addContact
    };
  } else {
    // Use real contacts hook for non-demo routes
    return useRealContacts();
  }
};
