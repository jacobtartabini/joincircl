
import React from 'react';
import { Calendar, Mail, Twitter, Gift, Bell, ExternalLink } from 'lucide-react';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

// Types for our timeline items
type TimelineItemType = 
  | 'twitter' 
  | 'email' 
  | 'calendar' 
  | 'birthday' 
  | 'keystone' 
  | 'interaction';

interface TimelineItem {
  id: string;
  type: TimelineItemType;
  date: Date;
  title: string;
  description?: string;
  contactId?: string;
  contactName?: string;
  contactAvatar?: string;
  link?: string;
}

const UnifiedTimeline: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [timelineItems, setTimelineItems] = React.useState<TimelineItem[]>([]);

  // Mock data loading
  React.useEffect(() => {
    const mockTimelineData: TimelineItem[] = [
      {
        id: '1',
        type: 'twitter',
        date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        title: 'New tweet from Sarah Johnson',
        description: 'Just announced our new product launch. So excited for everyone to see what we've been working on!',
        contactId: 'contact1',
        contactName: 'Sarah Johnson',
        contactAvatar: '',
      },
      {
        id: '2',
        type: 'calendar',
        date: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
        title: 'Meeting with Alex Chen',
        description: 'Quarterly review at Coffee Shop',
        contactId: 'contact2',
        contactName: 'Alex Chen',
      },
      {
        id: '3',
        type: 'email',
        date: new Date(Date.now() - 1000 * 60 * 90), // 90 minutes ago
        title: 'Email from David Wong',
        description: 'RE: Project Milestone Updates',
        contactId: 'contact3',
        contactName: 'David Wong',
      },
      {
        id: '4',
        type: 'birthday',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
        title: 'Maria\'s Birthday',
        contactId: 'contact4',
        contactName: 'Maria Garcia',
      },
      {
        id: '5',
        type: 'keystone',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
        title: 'Follow up with client',
        description: 'Check on proposal status',
        contactId: 'contact5',
        contactName: 'Client Co.',
      },
      {
        id: '6',
        type: 'interaction',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        title: 'Phone call with James',
        description: 'Discussed new partnership opportunity',
        contactId: 'contact6',
        contactName: 'James Wilson',
      }
    ];
    
    // Sort by date (most recent first for past events, soonest first for future events)
    const sortedItems = mockTimelineData.sort((a, b) => {
      const now = new Date();
      const aPast = a.date < now;
      const bPast = b.date < now;
      
      if (aPast && bPast) {
        return b.date.getTime() - a.date.getTime(); // Most recent past event first
      } else if (!aPast && !bPast) {
        return a.date.getTime() - b.date.getTime(); // Soonest future event first
      } else {
        return aPast ? 1 : -1; // Future events before past events
      }
    });

    setTimeout(() => {
      setTimelineItems(sortedItems);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Get the appropriate icon for each type
  const getItemIcon = (type: TimelineItemType) => {
    switch (type) {
      case 'twitter':
        return <Twitter className="h-4 w-4 text-sky-400" />;
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'calendar':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'birthday':
        return <Gift className="h-4 w-4 text-pink-500" />;
      case 'keystone':
        return <Bell className="h-4 w-4 text-amber-500" />;
      case 'interaction':
        return <ExternalLink className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Get type label
  const getTypeLabel = (type: TimelineItemType) => {
    switch (type) {
      case 'twitter':
        return 'Tweet';
      case 'email':
        return 'Email';
      case 'calendar':
        return 'Event';
      case 'birthday':
        return 'Birthday';
      case 'keystone':
        return 'Keystone';
      case 'interaction':
        return 'Interaction';
      default:
        return 'Update';
    }
  };

  // Get the color for the badge based on type
  const getTypeBadgeColor = (type: TimelineItemType) => {
    switch (type) {
      case 'twitter':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'email':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'calendar':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'birthday':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'keystone':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'interaction':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format the date based on whether it's in the past or future
  const formatTimelineDate = (date: Date) => {
    const now = new Date();
    const isPast = date < now;
    
    if (isPast) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return `in ${formatDistanceToNow(date)}`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (timelineItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No recent activities to display.</p>
        <p className="text-sm mt-2">Connect your social accounts or add more contacts to see updates here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {timelineItems.map((item) => (
        <div key={item.id} className="rounded-lg border p-4 hover:bg-accent/5 transition-colors">
          <div className="flex items-start">
            {item.contactName && (
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={item.contactAvatar} alt={item.contactName} />
                <AvatarFallback>
                  {item.contactName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("py-1 px-2 text-xs flex items-center gap-1", getTypeBadgeColor(item.type))}>
                    {getItemIcon(item.type)}
                    <span>{getTypeLabel(item.type)}</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatTimelineDate(item.date)}</span>
                </div>
              </div>
              <h4 className="font-medium">{item.title}</h4>
              {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
              
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm font-medium text-primary">
                  {item.contactName}
                </div>
                <Button variant="ghost" size="sm" className="text-xs">View Details</Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UnifiedTimeline;
