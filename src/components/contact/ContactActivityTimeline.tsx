
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, Users, ExternalLink, Twitter, Linkedin } from "lucide-react";
import { Contact, Interaction } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { keystoneService } from "@/services/keystoneService";
import { supabase } from "@/integrations/supabase/client";

interface TimelineItem {
  id: string;
  type: "keystone" | "interaction" | "social";
  title: string;
  description?: string;
  date: string;
  source?: "twitter" | "linkedin" | "app";
  url?: string;
  category?: string;
}

interface ContactActivityTimelineProps {
  contact: Contact | null;
}

export function ContactActivityTimeline({ contact }: ContactActivityTimelineProps) {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      fetchContactTimeline();
    } else {
      setTimelineItems([]);
    }
  }, [contact]);

  const fetchContactTimeline = async () => {
    if (!contact) return;
    
    setIsLoading(true);
    try {
      const items: TimelineItem[] = [];

      // Fetch keystones for this contact
      const keystones = await keystoneService.getKeystonesByContactId(contact.id);
      keystones.forEach(keystone => {
        items.push({
          id: `keystone-${keystone.id}`,
          type: "keystone",
          title: keystone.title,
          description: keystone.notes,
          date: keystone.date,
          source: "app",
          category: keystone.category
        });
      });

      // Fetch interactions for this contact
      const { data: interactions } = await supabase
        .from("interactions")
        .select("*")
        .eq("contact_id", contact.id)
        .order("date", { ascending: false })
        .limit(10);

      if (interactions) {
        interactions.forEach((interaction: Interaction) => {
          items.push({
            id: `interaction-${interaction.id}`,
            type: "interaction",
            title: `${interaction.type} interaction`,
            description: interaction.notes,
            date: interaction.date || interaction.created_at,
            source: "app"
          });
        });
      }

      // TODO: Add social media integration data
      if (contact.twitter) {
        items.push({
          id: `social-twitter-${contact.id}`,
          type: "social",
          title: "Recent Twitter Activity",
          description: "Check their latest posts and updates",
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          source: "twitter",
          url: `https://twitter.com/${contact.twitter}`
        });
      }

      if (contact.linkedin) {
        items.push({
          id: `social-linkedin-${contact.id}`,
          type: "social",
          title: "LinkedIn Profile Update",
          description: "View their professional updates and posts",
          date: new Date(Date.now() - 86400000 * 5).toISOString(),
          source: "linkedin",
          url: contact.linkedin
        });
      }

      // Sort by date (most recent first)
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTimelineItems(items.slice(0, 15));
    } catch (error) {
      console.error("Error fetching contact timeline:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)}m ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getIcon = (item: TimelineItem) => {
    switch (item.type) {
      case "keystone":
        return <Calendar className="h-3 w-3" />;
      case "interaction":
        return <MessageSquare className="h-3 w-3" />;
      case "social":
        if (item.source === "twitter") return <Twitter className="h-3 w-3" />;
        if (item.source === "linkedin") return <Linkedin className="h-3 w-3" />;
        return <Users className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getItemColor = (item: TimelineItem) => {
    switch (item.type) {
      case "keystone":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "interaction":
        return "bg-green-50 text-green-600 border-green-100";
      case "social":
        if (item.source === "twitter") return "bg-cyan-50 text-cyan-600 border-cyan-100";
        if (item.source === "linkedin") return "bg-blue-50 text-blue-600 border-blue-100";
        return "bg-purple-50 text-purple-600 border-purple-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  if (!contact) {
    return (
      <Card className="unified-card h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a contact to view timeline</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="unified-card h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Timeline
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          Recent activity with {contact.name}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px] px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : timelineItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {timelineItems.map((item, index) => (
                <div key={item.id} className="flex gap-2">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`p-1.5 rounded-full border ${getItemColor(item)}`}>
                      {getIcon(item)}
                    </div>
                    {index < timelineItems.length - 1 && (
                      <div className="w-px h-6 bg-border mt-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs text-foreground truncate">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDate(item.date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {item.category && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                          {item.category}
                        </Badge>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          View <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
