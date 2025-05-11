
import React, { useState, useEffect } from 'react';
import { KeystoneCard } from '@/components/ui/keystone-card';
import { useNavigate } from 'react-router-dom';
import { keystoneService } from '@/services/keystoneService';
import { Keystone } from '@/types/keystone';
import { format, isAfter } from 'date-fns';
import KeystoneDetailModal from '@/components/keystone/KeystoneDetailModal';
import { useToast } from '@/hooks/use-toast';
import { CalendarConnectionDialog } from '@/components/calendar/CalendarConnectionDialog';
import { CalendarExportDialog } from '@/components/calendar/CalendarExportDialog';

export function UpcomingKeystones() {
  const [keystones, setKeystones] = useState<Keystone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKeystone, setSelectedKeystone] = useState<Keystone | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchKeystones();
  }, []);
  
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

  const handleKeystoneClick = (keystone: Keystone) => {
    setSelectedKeystone(keystone);
    setIsDetailOpen(true);
  };
  
  const handleEditKeystone = () => {
    if (selectedKeystone) {
      navigate(`/keystones`, { state: { editKeystone: selectedKeystone } });
    }
    setIsDetailOpen(false);
  };
  
  const handleDeleteKeystone = async () => {
    if (!selectedKeystone) return;
    
    try {
      await keystoneService.deleteKeystone(selectedKeystone.id);
      toast({ 
        title: "Keystone deleted", 
        description: "The keystone has been successfully deleted." 
      });
      
      // Remove from local state
      setKeystones(keystones.filter(k => k.id !== selectedKeystone.id));
      setIsDetailOpen(false);
      setSelectedKeystone(null);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to delete keystone.", 
        variant: "destructive" 
      });
    }
  };
  
  const handleExportToCalendar = () => {
    if (selectedKeystone) {
      setIsDetailOpen(false);
      setIsExportDialogOpen(true);
    }
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
    <>
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
              // The KeystoneCard component should handle undefined avatars
              contactAvatar: undefined,
            }}
            onEdit={() => handleKeystoneClick(keystone)}
            className="hover-scale"
          />
        ))}
      </div>
      
      <KeystoneDetailModal
        keystone={selectedKeystone}
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={handleEditKeystone}
        onDelete={handleDeleteKeystone}
        onCalendarExport={handleExportToCalendar}
      />
      
      <CalendarConnectionDialog 
        isOpen={isCalendarDialogOpen}
        onOpenChange={setIsCalendarDialogOpen}
      />
      
      <CalendarExportDialog
        isOpen={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        eventType="keystone"
        keystone={selectedKeystone || undefined}
      />
    </>
  );
}
