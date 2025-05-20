
import { Check, Filter, Calendar, Mail, FileText, Link as LinkIcon, Gift } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  contactId: string;
  contactName: string;
  avatarUrl?: string;
  description: string;
  date: Date;
  type: "invite" | "note" | "email" | "calendar" | "birthday" | "article";
  meta?: {
    title?: string;
    source?: string;
    imageUrl?: string;
    url?: string;
  };
}

interface ActivityFeedProps {
  onSelectActivity?: (activity: Activity) => void;
}

export function EnhancedActivityFeed({ onSelectActivity }: ActivityFeedProps) {
  const [filter, setFilter] = useState("all");
  
  // Mock data for demonstration
  const activities: Activity[] = [
    {
      id: "1",
      contactId: "contact1",
      contactName: "John Smith",
      avatarUrl: undefined,
      description: "invited you to the shared group LVMH",
      date: new Date(),
      type: "invite"
    },
    {
      id: "2",
      contactId: "contact2",
      contactName: "Sarah Johnson",
      avatarUrl: undefined,
      description: "is celebrating a birthday today",
      date: new Date(),
      type: "birthday"
    },
    {
      id: "3",
      contactId: "contact3",
      contactName: "Michael Brown",
      avatarUrl: undefined,
      description: "shared an article with you",
      date: new Date(Date.now() - 3600000), // 1 hour ago
      type: "article",
      meta: {
        title: "The Future of AI in Personal Relationship Management",
        source: "NYT",
        imageUrl: undefined,
        url: "https://example.com/article"
      }
    },
    {
      id: "4",
      contactId: "contact4",
      contactName: "Emily Wilson",
      avatarUrl: undefined,
      description: "sent you an email",
      date: new Date(Date.now() - 86400000), // 1 day ago
      type: "email"
    },
    {
      id: "5",
      contactId: "contact5",
      contactName: "Robert Davis",
      avatarUrl: undefined,
      description: "scheduled a meeting with you",
      date: new Date(Date.now() - 172800000), // 2 days ago
      type: "calendar"
    }
  ];
  
  // Group activities by date
  const groupedActivities = activities.reduce((acc, activity) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateGroup: string;
    const activityDate = new Date(activity.date);
    
    if (activityDate.toDateString() === today.toDateString()) {
      dateGroup = "TODAY";
    } else if (activityDate.toDateString() === yesterday.toDateString()) {
      dateGroup = "YESTERDAY";
    } else {
      dateGroup = "LAST WEEK";
    }
    
    if (!acc[dateGroup]) {
      acc[dateGroup] = [];
    }
    
    acc[dateGroup].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case "calendar": return <Calendar className="h-4 w-4 text-blue-500" />;
      case "email": return <Mail className="h-4 w-4 text-green-500" />;
      case "note": return <FileText className="h-4 w-4 text-purple-500" />;
      case "article": return <LinkIcon className="h-4 w-4 text-amber-500" />;
      case "birthday": return <Gift className="h-4 w-4 text-rose-500" />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="py-4 px-6 flex justify-between items-center border-b">
        <h1 className="text-xl font-semibold">Home</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Check className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Activity Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {Object.entries(groupedActivities).map(([dateGroup, activities]) => (
          <div key={dateGroup} className="space-y-4">
            <h2 className="text-xs font-semibold tracking-wider text-muted-foreground">{dateGroup}</h2>
            
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectActivity?.(activity)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    {activity.avatarUrl ? (
                      <AvatarImage src={activity.avatarUrl} alt={activity.contactName} />
                    ) : (
                      <AvatarFallback>{activity.contactName.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{activity.contactName}</span>
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(activity.date, { addSuffix: false })}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    
                    {activity.type === "article" && activity.meta && (
                      <Card className="mt-2 overflow-hidden">
                        <div className="flex p-3">
                          {activity.meta.imageUrl && (
                            <div className="w-16 h-16 rounded mr-3 overflow-hidden bg-muted">
                              <img 
                                src={activity.meta.imageUrl} 
                                alt={activity.meta.title || ""} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="text-sm font-medium">{activity.meta.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {activity.meta.source && (
                                <Badge variant="outline" className="text-xs">{activity.meta.source}</Badge>
                              )}
                              <LinkIcon className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
