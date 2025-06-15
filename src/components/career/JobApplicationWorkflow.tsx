import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Circle, 
  Clock,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { useJobApplicationWorkflow, WorkflowStage } from "@/hooks/use-job-application-workflow";
import { ApplicationInfoStage } from "./stages/ApplicationInfoStage";
import { ResumeReviewStage } from "./stages/ResumeReviewStage";
import { NetworkDiscoveryStage } from "./stages/NetworkDiscoveryStage";
import { InterviewerResearchStage } from "./stages/InterviewerResearchStage";
import { InterviewPrepStage } from "./stages/InterviewPrepStage";
import { CompanyResearchStage } from "./stages/CompanyResearchStage";
import { FollowUpStage } from "./stages/FollowUpStage";
import GradientIconBg from "./GradientIconBg";
import { Atom } from "lucide-react";

interface JobApplicationWorkflowProps {
  applicationId: string;
  onBack: () => void;
}

export function JobApplicationWorkflow({ applicationId, onBack }: JobApplicationWorkflowProps) {
  const { workflow, stages, isLoading, updateStageCompletion, getOverallProgress } = useJobApplicationWorkflow(applicationId);
  const [expandedStage, setExpandedStage] = useState<WorkflowStage | null>('application_info');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Application not found</p>
      </div>
    );
  }

  const getStageStatus = (stageKey: WorkflowStage) => {
    const completion = workflow.stage_completion[stageKey];
    if (completion?.completed) return 'completed';
    if (completion?.progress > 0) return 'in-progress';
    return 'not-started';
  };

  const getStageIcon = (stageKey: WorkflowStage) => {
    const status = getStageStatus(stageKey);
    if (status === 'completed') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === 'in-progress') return <Clock className="h-5 w-5 text-blue-600" />;
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  const renderStageContent = (stageKey: WorkflowStage) => {
    switch (stageKey) {
      case 'application_info':
        return <ApplicationInfoStage workflow={workflow} onUpdate={updateStageCompletion} />;
      case 'resume_review':
        return <ResumeReviewStage workflow={workflow} onUpdate={updateStageCompletion} />;
      case 'network_discovery':
        return <NetworkDiscoveryStage workflow={workflow} onUpdate={updateStageCompletion} />;
      case 'interviewer_research':
        return <InterviewerResearchStage workflow={workflow} onUpdate={updateStageCompletion} />;
      case 'interview_prep':
        return <InterviewPrepStage workflow={workflow} onUpdate={updateStageCompletion} />;
      case 'company_research':
        return <CompanyResearchStage workflow={workflow} onUpdate={updateStageCompletion} />;
      case 'follow_up':
        return <FollowUpStage workflow={workflow} onUpdate={updateStageCompletion} />;
      default:
        return <div className="p-4 text-center text-muted-foreground">Stage content coming soon...</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
      </div>

      {/* Application Overview */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workflow.job_title}</h1>
            <p className="text-lg text-muted-foreground">{workflow.company_name}</p>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
            {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-blue-600">{getOverallProgress()}%</span>
          </div>
          <Progress value={getOverallProgress()} className="h-2" />
        </div>

        {/* Arlo Insight */}
        <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <GradientIconBg size={24}>
              <Atom className="h-4 w-4" color="white" />
            </GradientIconBg>
            <span className="text-sm font-medium text-blue-900">Arlo's Insight</span>
          </div>
          <p className="text-sm text-blue-800">
            Great start! You're {getOverallProgress()}% through your application workflow. 
            {getOverallProgress() < 30 && " Focus on completing your application info first."}
            {getOverallProgress() >= 30 && getOverallProgress() < 70 && " You're making good progress! Keep going."}
            {getOverallProgress() >= 70 && " Excellent work! You're almost ready for your interview."}
          </p>
        </div>
      </Card>

      {/* Workflow Timeline */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const isExpanded = expandedStage === stage.key;
          const status = getStageStatus(stage.key);
          const completion = workflow.stage_completion[stage.key];

          return (
            <Card key={stage.key} className="bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl overflow-hidden">
              <Collapsible 
                open={isExpanded} 
                onOpenChange={(open) => setExpandedStage(open ? stage.key : null)}
              >
                <CollapsibleTrigger asChild>
                  <div className="p-6 cursor-pointer hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          {getStageIcon(stage.key)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{stage.title}</h3>
                          <p className="text-sm text-muted-foreground">{stage.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {completion && (
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {completion.progress}%
                            </div>
                            <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${completion.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="border-t border-gray-100">
                    {renderStageContent(stage.key)}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
