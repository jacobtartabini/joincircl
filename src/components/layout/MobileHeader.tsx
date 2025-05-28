
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function MobileHeader() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const firstName = profile?.full_name?.split(' ')[0] || 'User';
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8 border border-gray-200">
          {profile?.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile?.full_name || 'User'} />
          ) : (
            <AvatarFallback className="text-xs">
              <User className="h-4 w-4" />
            </AvatarFallback>
          )}
        </Avatar>
        <span className="text-sm font-medium text-gray-900">{firstName}</span>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => navigate('/settings')}
        className="p-2 relative"
      >
        <Bell className="h-5 w-5" />
        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">
          2
        </Badge>
      </Button>
    </div>
  );
}
