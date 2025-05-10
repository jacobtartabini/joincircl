
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';

const MobileHeader = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const firstName = profile?.full_name?.split(' ')[0] || 'User';
  
  return (
    <div className="flex items-center justify-between py-2">
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
      
      <div className="flex items-center gap-2">
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

export default MobileHeader;
