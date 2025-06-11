
import { Button } from "@/components/ui/button";
import { Users, Briefcase, GraduationCap, Heart, TrendingUp, Calendar } from "lucide-react";

interface ConversationStartersProps {
  onSelectPrompt: (prompt: string) => void;
}

const prompts = [
  {
    icon: Users,
    text: "Who should I reach out to this week?",
    category: "Networking"
  },
  {
    icon: Briefcase,
    text: "Who in my network can help me with a finance internship?",
    category: "Career"
  },
  {
    icon: GraduationCap,
    text: "What clubs should I join based on my interests?",
    category: "Campus"
  },
  {
    icon: Heart,
    text: "Help me reconnect with someone I haven't spoken to in a while",
    category: "Relationships"
  },
  {
    icon: TrendingUp,
    text: "Analyze my networking patterns and suggest improvements",
    category: "Growth"
  },
  {
    icon: Calendar,
    text: "What are some ways to get more involved on campus?",
    category: "Engagement"
  }
];

export default function ConversationStarters({ onSelectPrompt }: ConversationStartersProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          What can I help you with today?
        </h3>
        <p className="text-muted-foreground">
          Choose a conversation starter or type your own question below
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => onSelectPrompt(prompt.text)}
            className="h-auto p-4 text-left justify-start gap-3 glass-card hover:glass-card-enhanced transition-all"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <prompt.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-foreground">{prompt.text}</div>
              <div className="text-xs text-muted-foreground mt-1">{prompt.category}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
