
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Clock, Users } from "lucide-react";
import { JobApplicationWorkflow, WorkflowStage } from "@/hooks/use-job-application-workflow";

interface InterviewerResearchStageProps {
  workflow: JobApplicationWorkflow;
  onUpdate: (stage: WorkflowStage, progress: number, completed?: boolean) => void;
}

export function InterviewerResearchStage({ workflow, onUpdate }: InterviewerResearchStageProps) {
  const completion = workflow.stage_completion.interviewer_research;
  const isCompleted = completion?.completed || false;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Interviewer Research</h4>
        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Complete</span>
          </div>
        )}
      </div>

      <Card className="p-4 bg-blue-50/50 border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="atom-gradient-interviewer" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#a21caf" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <Clock className="w-full h-full" stroke="url(#atom-gradient-interviewer)" strokeWidth="2" />
          </svg>
          <span className="text-sm font-medium text-blue-900">Coming Soon</span>
        </div>
        <p className="text-sm text-blue-800">
          This feature will help you research your interviewers' backgrounds, recent work, and interests 
          to help you prepare meaningful conversation starters and questions.
        </p>
      </Card>

      <Button 
        onClick={() => onUpdate('interviewer_research', 100, true)}
        className="rounded-full"
        variant="outline"
      >
        <Users className="h-4 w-4 mr-2" />
        Skip for Now
      </Button>
    </div>
  );
}
