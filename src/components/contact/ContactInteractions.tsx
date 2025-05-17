
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Interaction } from "@/types/contact";
import { format } from "date-fns";
import { Calendar, Mail, Phone, Coffee, MessageSquare, Clock, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useEmailInteractions, EmailInteraction } from "@/hooks/useEmailInteractions";
import { Skeleton } from "@/components/ui/skeleton";
import SocialInteractionItem from "./SocialInteractionItem";

interface ContactInteractionsProps {
  contactId: string;
  interactions: Interaction[];
}

export default function ContactInteractions({ contactId, interactions }: ContactInteractionsProps) {
  const [activeTab, setActiveTab] = useState("all");
  const { interactions: emailInteractions, loading: emailLoading } = useEmailInteractions(contactId);

  // Combine both types of interactions
  const allInteractions = [...interactions];
  
  // Sort interactions by date (most recent first)
  const sortedInteractions = [...allInteractions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Filter email interactions based on the active tab
  const filteredEmailInteractions = emailInteractions.filter(interaction => {
    if (activeTab === "all") return true;
    if (activeTab === "social" && interaction.type === "social_post") return true;
    if (activeTab === "email" && interaction.type === "email") return true;
    return false;
  });

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone size={16} />;
      case "meeting":
        return <Coffee size={16} />;
      case "message":
        return <MessageSquare size={16} />;
      case "other":
        return <Hash size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="direct">Direct</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0 space-y-4">
          {/* Show traditional interactions */}
          {activeTab === "all" && sortedInteractions.length > 0 && (
            <div className="space-y-3">
              {sortedInteractions.map((interaction) => (
                <InteractionItem key={interaction.id} interaction={interaction} />
              ))}
            </div>
          )}
          
          {/* Show email/social interactions */}
          {(activeTab === "all" || activeTab === "email" || activeTab === "social") && (
            <>
              {emailLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : filteredEmailInteractions.length > 0 ? (
                <div className="space-y-1">
                  {filteredEmailInteractions.map((interaction) => 
                    interaction.type === 'social_post' ? (
                      <SocialInteractionItem 
                        key={interaction.id} 
                        interaction={interaction} 
                      />
                    ) : (
                      <EmailInteractionItem 
                        key={interaction.id} 
                        emailInteraction={interaction} 
                      />
                    )
                  )}
                </div>
              ) : null}
            </>
          )}
          
          {/* Show empty state if no interactions */}
          {sortedInteractions.length === 0 && filteredEmailInteractions.length === 0 && !emailLoading && (
            <Card className="p-6 text-center text-muted-foreground">
              <p>No interactions recorded yet.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="direct" className="mt-0">
          {sortedInteractions.length > 0 ? (
            <div className="space-y-3">
              {sortedInteractions.map((interaction) => (
                <InteractionItem key={interaction.id} interaction={interaction} />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              <p>No direct interactions recorded yet.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="email" className="mt-0">
          {emailLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : filteredEmailInteractions.length > 0 ? (
            <div className="space-y-1">
              {filteredEmailInteractions.filter(i => i.type === 'email').map((interaction) => (
                <EmailInteractionItem
                  key={interaction.id}
                  emailInteraction={interaction}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              <p>No email interactions found.</p>
              <p className="text-sm mt-1">Connect your email account to see interactions.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="social" className="mt-0">
          {emailLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : filteredEmailInteractions.filter(i => i.type === 'social_post').length > 0 ? (
            <div className="space-y-1">
              {filteredEmailInteractions.filter(i => i.type === 'social_post').map((interaction) => (
                <SocialInteractionItem
                  key={interaction.id}
                  interaction={interaction}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              <p>No social interactions found.</p>
              <p className="text-sm mt-1">Connect social accounts to see activity.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface InteractionItemProps {
  interaction: Interaction;
}

function InteractionItem({ interaction }: InteractionItemProps) {
  const formattedDate = format(new Date(interaction.date), "MMM d, yyyy");
  
  return (
    <div className="p-4 border rounded-md">
      <div className="flex justify-between mb-2">
        <div className="flex items-center">
          {getInteractionIcon(interaction.type)}
          <h4 className="ml-2 font-medium capitalize">{interaction.type}</h4>
        </div>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
      </div>
      {interaction.notes && <p className="text-sm">{interaction.notes}</p>}
    </div>
  );
}

interface EmailInteractionItemProps {
  emailInteraction: EmailInteraction;
}

function EmailInteractionItem({ emailInteraction }: EmailInteractionItemProps) {
  const formattedDate = format(new Date(emailInteraction.date), "MMM d, yyyy");

  return (
    <div className="p-4 border rounded-md mb-3">
      <div className="flex justify-between mb-2">
        <div className="flex items-center">
          <div className={`p-2 rounded-full bg-blue-50 mr-2`}>
            <Mail className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium">{emailInteraction.subject}</h4>
            <p className="text-xs text-muted-foreground flex items-center">
              <span>{formattedDate}</span>
              <span className="mx-1">•</span>
              <Badge variant="outline" className="text-xs capitalize">
                {emailInteraction.provider}
              </Badge>
            </p>
          </div>
        </div>
      </div>
      <p className="text-sm">{emailInteraction.preview}</p>
    </div>
  );
}

function getInteractionIcon(type: string) {
  switch (type) {
    case "call":
      return <Phone size={16} />;
    case "meeting":
      return <Coffee size={16} />;
    case "message":
      return <MessageSquare size={16} />;
    case "other":
      return <Hash size={16} />;
    default:
      return <Clock size={16} />;
  }
}
