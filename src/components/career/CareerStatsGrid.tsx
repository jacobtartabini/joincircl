
import { Card } from "@/components/ui/card";
import { Target, Calendar, BookOpen, TrendingUp } from "lucide-react";

interface CareerStats {
  activeApplications: number;
  upcomingInterviews: number;
  completedSessions: number;
  overallProgress: number;
}

interface CareerStatsGridProps {
  stats: CareerStats;
  isMobile: boolean;
}

export function CareerStatsGrid({ stats, isMobile }: CareerStatsGridProps) {
  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.activeApplications}</p>
              <p className="text-xs text-muted-foreground">Active Apps</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.upcomingInterviews}</p>
              <p className="text-xs text-muted-foreground">Interviews</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Apps</p>
            <p className="text-xl font-bold text-gray-900">{stats.activeApplications}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Interviews</p>
            <p className="text-xl font-bold text-gray-900">{stats.upcomingInterviews}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sessions</p>
            <p className="text-xl font-bold text-gray-900">{stats.completedSessions}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-xl font-bold text-gray-900">{stats.overallProgress}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
