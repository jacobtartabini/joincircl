
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
      // This would pull from social platforms when integrations are available
      // For now, we'll add some placeholder social data if the contact has social profiles
      if (contact.twitter) {
        // This is where you'd fetch real Twitter data
        items.push({
          id: `social-twitter-${contact.id}`,
          type: "social",
          title: "Recent Twitter Activity",
          description: "Check their latest posts and updates",
          date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          source: "twitter",
          url: `https://twitter.com/${contact.twitter}`
        });
      }

      if (contact.linkedin) {
        // This is where you'd fetch real LinkedIn data
        items.push({
          id: `social-linkedin-${contact.id}`,
          type: "social",
          title: "LinkedIn Profile Update",
          description: "View their professional updates and posts",
          date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
          source: "linkedin",
          url: contact.linkedin
        });
      }

      // Sort by date (most recent first)
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTimelineItems(items.slice(0, 15)); // Limit to 15 most recent items
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
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (item: TimelineItem) => {
    switch (item.type) {
      case "keystone":
        return <Calendar className="h-4 w-4" />;
      case "interaction":
        return <MessageSquare className="h-4 w-4" />;
      case "social":
        if (item.source === "twitter") return <Twitter className="h-4 w-4" />;
        if (item.source === "linkedin") return <Linkedin className="h-4 w-4" />;
        return <Users className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getItemColor = (item: TimelineItem) => {
    switch (item.type) {
      case "keystone":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "interaction":
        return "bg-green-100 text-green-700 border-green-200";
      case "social":
        if (item.source === "twitter") return "bg-cyan-100 text-cyan-700 border-cyan-200";
        if (item.source === "linkedin") return "bg-blue-100 text-blue-700 border-blue-200";
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (!contact) {
    return (
      <Card className="unified-card h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Select a contact to view their activity timeline</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="unified-card h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Timeline
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Activity and interactions with {contact.name}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : timelineItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity found</p>
              <p className="text-xs">Interactions and keystones will appear here</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {timelineItems.map((item, index) => (
                <div key={item.id} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-full border ${getItemColor(item)}`}>
                      {getIcon(item)}
                    </div>
                    {index < timelineItems.length - 1 && (
                      <div className="w-px h-8 bg-border mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-foreground line-clamp-1">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(item.date)}
                          </span>
                          {item.category && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
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
                              View <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
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
