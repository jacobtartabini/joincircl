
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '@/components/notifications/NotificationBell';

interface HomeActionBarProps {
  onAddContact: () => void;
}

const HomeActionBar = ({ onAddContact }: HomeActionBarProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  // Safely extract first name with proper null checking
  const firstName = profile?.full_name 
    ? profile.full_name.split(' ')[0] 
    : 'User';
  
  return (
    <div className="flex items-center justify-between py-2 mb-6">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-muted">
          {profile?.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile?.full_name || 'User'} />
          ) : (
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <p className="text-sm text-muted-foreground">Hello,</p>
          <p className="font-semibold">{firstName}!</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onAddContact}
          className="border-primary text-primary hover:bg-primary/10"
        >
          <Plus size={16} className="mr-1" /> Add Contact
        </Button>
        
        <NotificationBell variant="ghost" size="sm" />
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/settings')}
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default HomeActionBar;
