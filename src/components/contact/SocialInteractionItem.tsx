
import { format } from "date-fns";
import { Facebook, Twitter, Linkedin, Instagram, ExternalLink } from "lucide-react";
import { EmailInteraction } from "@/hooks/useEmailInteractions";

interface SocialInteractionItemProps {
  interaction: EmailInteraction;
}

export default function SocialInteractionItem({ interaction }: SocialInteractionItemProps) {
  // Format the interaction date
  const formattedDate = format(new Date(interaction.date), "MMM d, yyyy");
  
  // Get platform icon
  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="text-blue-600" size={16} />;
      case "twitter":
        return <Twitter className="text-sky-500" size={16} />;
      case "linkedin":
        return <Linkedin className="text-blue-700" size={16} />;
      case "instagram":
        return <Instagram className="text-pink-600" size={16} />;
      default:
        return null;
    }
  };
  
  // Get platform color class
  const getPlatformColorClass = (platform?: string) => {
    switch (platform) {
      case "facebook":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "twitter":
        return "bg-sky-50 text-sky-600 border-sky-100";
      case "linkedin":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "instagram":
        return "bg-pink-50 text-pink-600 border-pink-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="p-4 border rounded-md mb-3">
      <div className="flex justify-between mb-2">
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${getPlatformColorClass(interaction.platform)} mr-2`}>
            {getPlatformIcon(interaction.platform)}
          </div>
          <div>
            <h4 className="font-medium capitalize">
              {interaction.platform || "Social"} Post
            </h4>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
        
        {interaction.post_url && (
          <a 
            href={interaction.post_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center"
          >
            <span className="mr-1">View</span>
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      
      <div className="mt-2">
        {interaction.summary ? (
          <p className="text-sm">{interaction.summary}</p>
        ) : interaction.content ? (
          <p className="text-sm line-clamp-3">{interaction.content}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No content preview available</p>
        )}
      </div>
    </div>
  );
}
