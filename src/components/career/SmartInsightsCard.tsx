import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Plus } from "lucide-react";
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
    return <Card className="p-6 bg-blue-50/50 backdrop-blur-sm border-blue-100 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
            <Zap className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Smart Insights</h3>
        </div>
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          {mobileInsightText}
        </p>
        <Button onClick={() => onQuickAction("Add Application")} className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Application
        </Button>
      </Card>;
  }
  return <Card className="p-6 bg-blue-50/50 backdrop-blur-sm border-blue-100 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
          <Zap className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Smart Career Insights</h3>
      </div>
      <p className="text-gray-700 mb-6 leading-relaxed">
        {insightText}
      </p>
      <div className="flex gap-4">
        <Button onClick={() => onQuickAction("Add Application")} className="bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-full">Application</Button>
        <Button variant="outline" className="border-gray-200 hover:bg-gray-50 rounded-full">Follow-ups</Button>
      </div>
    </Card>;
}