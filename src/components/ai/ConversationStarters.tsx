
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
      color: "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800"
    },
    {
      icon: TrendingUp,
      title: "Network Growth",
      question: "How can I strengthen connections in the tech industry?",
      color: "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800"
    },
    {
      icon: Calendar,
      title: "Follow-up",
      question: "Who haven't I spoken to in a while that I should reach out to?",
      color: "bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800"
    },
    {
      icon: MessageCircle,
      title: "Relationship Building",
      question: "What's the best way to maintain long-distance professional relationships?",
      color: "bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-orange-200 dark:border-orange-800"
    }
  ];

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Welcome to Arlo
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-base">
          Your AI relationship assistant. How can I help you strengthen your network today?
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {prompts.map((prompt, index) => {
          const Icon = prompt.icon;
          return (
            <Card
              key={index}
              className={`p-4 cursor-pointer transition-all duration-200 border-2 ${prompt.color}`}
              onClick={() => onSelectPrompt(prompt.question)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {prompt.title}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
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
