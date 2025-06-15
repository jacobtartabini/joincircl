
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Atom, Plus, Calendar } from "lucide-react";
import GradientIconBg from "./GradientIconBg";

interface SmartInsightsCardProps {
  stats: {
    careerContacts: number;
    activeApplications: number;
    completedSessions: number;
  };
  onQuickAction: (action: string) => void;
  isMobile: boolean;
}

export function SmartInsightsCard({
  stats,
  onQuickAction,
  isMobile
}: SmartInsightsCardProps) {
  const insightText = stats.careerContacts > 0 ? `🚀 You have ${stats.careerContacts} career contacts and ${stats.activeApplications} active applications! ${stats.completedSessions > 0 ? `Plus ${stats.completedSessions} practice sessions completed. ` : ''}Consider reaching out to contacts you haven't spoken to recently.` : "🚀 Start building your career network by adding contacts, tracking job applications, and practicing for interviews.";

  if (isMobile) {
    const mobileInsightText = stats.careerContacts > 0 ? `📈 You have ${stats.careerContacts} career contacts! Consider following up with contacts you haven't spoken to recently.` : "🚀 Start building your career network by adding contacts and tracking job applications.";

    return (
      <Card className="p-6 bg-blue-50/50 backdrop-blur-sm border-blue-100 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <GradientIconBg size={32}>
            <Atom className="w-5 h-5" color="white" />
          </GradientIconBg>
          <h3 className="font-semibold text-gray-900">Smart Insights</h3>
        </div>
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          {mobileInsightText}
        </p>
        <Button onClick={() => onQuickAction("Add Application")} className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Application
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-blue-50/50 backdrop-blur-sm border-blue-100 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <GradientIconBg size={32}>
          <Atom className="w-5 h-5" color="white" />
        </GradientIconBg>
        <h3 className="text-lg font-semibold text-gray-900">Arlo's Insights</h3>
      </div>
      <p className="text-gray-700 mb-6 leading-relaxed">
        {insightText}
      </p>
      <div className="flex gap-4">
        <Button onClick={() => onQuickAction("Add Application")} className="bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Application
        </Button>
        <Button variant="outline" className="border-gray-200 hover:bg-gray-50 rounded-full">
          <Calendar className="h-4 w-4 mr-2" />
          Follow-ups
        </Button>
      </div>
    </Card>
  );
}
