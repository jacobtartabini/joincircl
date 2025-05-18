
import { Calendar, Mail, MessageSquare, Cake, Bell } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "note" | "email" | "meeting" | "birthday" | "reminder";
  contactId: string;
  contactName: string;
  contactAvatar?: string;
  content: string;
  date: Date;
  isNew?: boolean;
}

interface ActivityGrouping {
  title: string;
  items: ActivityItem[];
}

interface ActivityFeedProps {
  onSelectActivity?: (activity: ActivityItem) => void;
}

export function ActivityFeed({ onSelectActivity }: ActivityFeedProps) {
  // In a real application, this data would be fetched from a database or API
  const activities: ActivityItem[] = [
    {
      id: "1",
      type: "meeting",
      contactId: "c1",
      contactName: "Alex Johnson",
      contactAvatar: "https://i.pravatar.cc/150?u=alex",
      content: "Weekly planning meeting",
      date: new Date(),
      isNew: true
    },
    {
      id: "2",
      type: "note",
      contactId: "c2",
      contactName: "Sarah Williams",
      contactAvatar: "https://i.pravatar.cc/150?u=sarah",
      content: "Discussed marketing strategy for Q3",
      date: new Date(Date.now() - 3600000), // 1 hour ago
      isNew: true
    },
    {
      id: "3",
      type: "email",
      contactId: "c3",
      contactName: "Michael Brown",
      content: "Sent proposal for new project",
      date: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      id: "4",
      type: "birthday",
      contactId: "c4",
      contactName: "Emma Davis",
      contactAvatar: "https://i.pravatar.cc/150?u=emma",
      content: "Birthday tomorrow",
      date: new Date(Date.now() - 172800000), // 2 days ago
    },
    {
      id: "5",
      type: "reminder",
      contactId: "c5",
      contactName: "James Wilson",
      content: "Follow up on presentation",
      date: new Date(Date.now() - 604800000), // 1 week ago
    },
  ];

  // Group activities by time period
  const groupedActivities: ActivityGrouping[] = [
    { 
      title: "Today", 
      items: activities.filter(item => 
        new Date(item.date).toDateString() === new Date().toDateString()
      )
    },
    { 
      title: "Yesterday", 
      items: activities.filter(item => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return new Date(item.date).toDateString() === yesterday.toDateString();
      })
    },
    { 
      title: "This Week", 
      items: activities.filter(item => {
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(item.date) < today && new Date(item.date) > weekAgo && 
          new Date(item.date).toDateString() !== today.toDateString() && 
          new Date(item.date).toDateString() !== new Date(today.setDate(today.getDate() - 1)).toDateString();
      })
    },
  ];

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "meeting": return <Calendar className="h-4 w-4 text-blue-500" />;
      case "email": return <Mail className="h-4 w-4 text-green-500" />;
      case "note": return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "birthday": return <Cake className="h-4 w-4 text-rose-500" />;
      case "reminder": return <Bell className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-semibold">Activity Feed</h1>
      
      {groupedActivities.map((group) => (
        group.items.length > 0 && (
          <div key={group.title} className="space-y-4">
            <h2 className="text-lg font-medium text-muted-foreground">{group.title}</h2>
            <div className="space-y-3">
              {group.items.map((activity) => (
                <div 
                  key={activity.id}
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onSelectActivity?.(activity)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      {activity.contactAvatar && <AvatarImage src={activity.contactAvatar} alt={activity.contactName} />}
                      <AvatarFallback>{activity.contactName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {activity.contactName}
                          {activity.isNew && (
                            <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
                              New
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {getActivityIcon(activity.type)}
                        <p className="text-sm text-muted-foreground">{activity.content}</p>
                      </div>
                      
                      <div className="pt-2 flex gap-2">
                        {activity.type === "reminder" && (
                          <Button variant="outline" size="sm">Complete</Button>
                        )}
                        {activity.type === "email" && (
                          <Button variant="outline" size="sm">Reply</Button>
                        )}
                        {activity.type === "meeting" && (
                          <Button variant="outline" size="sm">Add Notes</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
