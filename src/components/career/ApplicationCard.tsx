
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ArrowRight } from "lucide-react";

interface Application {
  id: string;
  job_title: string;
  company_name: string;
  status: string;
  workflow_stage?: string;
  stage_completion?: any;
}

interface ApplicationCardProps {
  application: Application;
  onSelect: (id: string) => void;
  isMobile: boolean;
}

export function ApplicationCard({ application, onSelect, isMobile }: ApplicationCardProps) {
  const getApplicationProgress = (app: Application) => {
    if (!app.stage_completion) return 0;
    const stages = Object.values(app.stage_completion);
    const completedStages = stages.filter((stage: any) => stage?.completed).length;
    return Math.round((completedStages / 7) * 100); // 7 total stages
  };

  const progress = getApplicationProgress(application);

  if (isMobile) {
    return (
      <Card 
        className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => onSelect(application.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{application.job_title}</h4>
                <p className="text-sm text-muted-foreground">{application.company_name}</p>
              </div>
              <Badge className="ml-auto">
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-medium">{progress}%</span>
                </div>
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50/50 transition-all duration-200 group"
      onClick={() => onSelect(application.id)}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {application.job_title}
            </h4>
            <p className="text-muted-foreground">{application.company_name}</p>
          </div>
          <Badge className="ml-2">
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium text-blue-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {application.workflow_stage?.replace('_', ' ').split(' ').map((word: string) => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ') || 'Getting Started'}
          </span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Card>
  );
}
