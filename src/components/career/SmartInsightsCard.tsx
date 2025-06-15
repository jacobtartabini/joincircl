
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Atom, Plus, Calendar } from "lucide-react";

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
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id="atom-gradient-mobile" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#a21caf" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <Atom size={28} stroke="url(#atom-gradient-mobile)" strokeWidth="2" />
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
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="atom-gradient-desktop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#a21caf" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <Atom size={28} stroke="url(#atom-gradient-desktop)" strokeWidth="2" />
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
