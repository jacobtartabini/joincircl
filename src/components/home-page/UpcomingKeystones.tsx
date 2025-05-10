
import React, { useState, useEffect } from 'react';
import { KeystoneCard } from '@/components/ui/keystone-card';
import { useNavigate } from 'react-router-dom';
import { keystoneService } from '@/services/keystoneService';
import { Keystone } from '@/types/keystone';
import { format, isAfter } from 'date-fns';

export function UpcomingKeystones() {
  const [keystones, setKeystones] = useState<Keystone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKeystones = async () => {
      try {
        setIsLoading(true);
        const allKeystones = await keystoneService.getKeystones();
        
        // Sort keystones by date
        const sortedKeystones = allKeystones
          .filter(keystone => {
            const keystoneDate = new Date(keystone.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return isAfter(keystoneDate, today) || format(keystoneDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3); // Get the first 3
        
        setKeystones(sortedKeystones);
      } catch (error) {
        console.error("Error loading keystones:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKeystones();
  }, []);

  const handleKeystoneClick = (keystoneId: string) => {
    navigate(`/keystones`, { state: { openKeystoneId: keystoneId } });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted/30 rounded-md animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (keystones.length === 0) {
    return (
      <div className="text-center py-6 border rounded-md bg-muted/30">
        <p className="text-muted-foreground">No upcoming keystones</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add keystones to track important events with your contacts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {keystones.map((keystone) => (
        <KeystoneCard
          key={keystone.id}
          keystone={{
            id: keystone.id,
            title: keystone.title,
            date: keystone.date,
            category: keystone.category,
            contactId: keystone.contact_id,
            contactName: keystone.contact_name,
          }}
          onEdit={() => handleKeystoneClick(keystone.id)}
          className="hover-scale"
        />
      ))}
    </div>
  );
}
