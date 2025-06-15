
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, FileText, Target, Upload, Play, Plus } from "lucide-react";
import { CareerStatsGrid } from "./CareerStatsGrid";
import { SmartInsightsCard } from "./SmartInsightsCard";

interface CareerOverviewSectionProps {
  stats: {
    activeApplications: number;
    upcomingInterviews: number;
    completedSessions: number;
    overallProgress: number;
    careerContacts: number;
  };
  onQuickAction: (action: string) => void;
  isMobile: boolean;
}

export function CareerOverviewSection({ stats, onQuickAction, isMobile }: CareerOverviewSectionProps) {
  if (isMobile) {
    return (
      <div className="space-y-6">
        <CareerStatsGrid stats={stats} isMobile={true} />
        <SmartInsightsCard stats={stats} onQuickAction={onQuickAction} isMobile={true} />
        
        {/* Progress Overview */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Overall Progress</h3>
            <span className="text-2xl font-bold text-blue-600">{stats.overallProgress}%</span>
          </div>
          <Progress value={stats.overallProgress} className="mb-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-muted-foreground">Applications: {stats.activeApplications}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-muted-foreground">Sessions: {stats.completedSessions}</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <CareerStatsGrid stats={stats} isMobile={false} />
        <SmartInsightsCard stats={stats} onQuickAction={onQuickAction} isMobile={false} />

        {/* Progress Overview */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
            <span className="text-2xl font-bold text-blue-600">{stats.overallProgress}%</span>
          </div>
          <Progress value={stats.overallProgress} className="mb-6" />
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{stats.activeApplications}</div>
              <div className="text-muted-foreground">Applications</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{stats.upcomingInterviews}</div>
              <div className="text-muted-foreground">Interviews</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{stats.completedSessions}</div>
              <div className="text-muted-foreground">Prep Sessions</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column - Tools */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Career Tools</h3>
        
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Mock Interview</h4>
              <p className="text-sm text-muted-foreground">AI-powered practice sessions</p>
            </div>
          </div>
          <Button 
            onClick={() => onQuickAction("Start Mock Interview")}
            variant="outline"
            className="w-full border-gray-200 hover:bg-gray-50 rounded-full"
          >
            <Play className="h-4 w-4 mr-2" />
            Practice
          </Button>
        </Card>

        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Resume Review</h4>
              <p className="text-sm text-muted-foreground">Get AI feedback and suggestions</p>
            </div>
          </div>
          <Button 
            onClick={() => onQuickAction("Upload Resume")}
            variant="outline"
            className="w-full border-gray-200 hover:bg-gray-50 rounded-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </Card>

        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Application Tracker</h4>
              <p className="text-sm text-muted-foreground">Organize your job applications</p>
            </div>
          </div>
          <Button 
            onClick={() => onQuickAction("Add Application")}
            variant="outline"
            className="w-full border-gray-200 hover:bg-gray-50 rounded-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Application
          </Button>
        </Card>
      </div>
    </div>
  );
}
