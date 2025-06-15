
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
      color: "bg-[#0daeec]/5 dark:bg-[#0daeec]/10 hover:bg-[#0daeec]/10 dark:hover:bg-[#0daeec]/20 border-[#0daeec]/20 dark:border-[#0daeec]/30"
    },
    {
      icon: TrendingUp,
      title: "Network Growth",
      question: "How can I strengthen connections in the tech industry?",
      color: "bg-[#0daeec]/5 dark:bg-[#0daeec]/10 hover:bg-[#0daeec]/10 dark:hover:bg-[#0daeec]/20 border-[#0daeec]/20 dark:border-[#0daeec]/30"
    },
    {
      icon: Calendar,
      title: "Follow-up",
      question: "Who haven't I spoken to in a while that I should reach out to?",
      color: "bg-[#0daeec]/5 dark:bg-[#0daeec]/10 hover:bg-[#0daeec]/10 dark:hover:bg-[#0daeec]/20 border-[#0daeec]/20 dark:border-[#0daeec]/30"
    },
    {
      icon: MessageCircle,
      title: "Relationship Building",
      question: "What's the best way to maintain long-distance professional relationships?",
      color: "bg-[#0daeec]/5 dark:bg-[#0daeec]/10 hover:bg-[#0daeec]/10 dark:hover:bg-[#0daeec]/20 border-[#0daeec]/20 dark:border-[#0daeec]/30"
    }
  ];

  return (
    <div className="p-3 max-w-2xl mx-auto">
      <div className="text-center mb-3">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Welcome to Arlo
        </h2>
        <p className="text-muted-foreground text-sm">
          Your AI relationship assistant. How can I help you strengthen your network today?
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {prompts.map((prompt, index) => {
          const Icon = prompt.icon;
          return (
            <Card
              key={index}
              className={`p-3 cursor-pointer transition-all duration-200 border ${prompt.color}`}
              onClick={() => onSelectPrompt(prompt.question)}
            >
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-[#0daeec]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-foreground mb-1">
                    {prompt.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
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
