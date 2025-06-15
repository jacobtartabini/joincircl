
import { Card } from "@/components/ui/card";
import { MessageCircle, Users, TrendingUp, Calendar } from "lucide-react";

interface ConversationStartersProps {
  onSelectPrompt: (prompt: string) => void;
}

export default function ConversationStarters({ onSelectPrompt }: ConversationStartersProps) {
  const prompts = [
    {
      icon: Users,
      title: "Inner Circle",
      question: "Who in my network can help me with a finance internship?",
    },
    {
      icon: TrendingUp,
      title: "Network Growth",
      question: "How can I strengthen connections in the tech industry?",
    },
    {
      icon: Calendar,
      title: "Follow-up",
      question: "Who haven't I spoken to in a while that I should reach out to?",
    },
    {
      icon: MessageCircle,
      title: "Relationship Building",
      question: "What's the best way to maintain long-distance professional relationships?",
    }
  ];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Welcome to Arlo
        </h2>
        <p className="text-muted-foreground text-sm">
          Your AI relationship assistant. How can I help you strengthen your network today?
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prompts.map((prompt, index) => {
          const Icon = prompt.icon;
          return (
            <Card
              key={index}
              className="glass-card p-4 cursor-pointer transition-all duration-200 hover:glass-float"
              onClick={() => onSelectPrompt(prompt.question)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    {prompt.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {prompt.question}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
