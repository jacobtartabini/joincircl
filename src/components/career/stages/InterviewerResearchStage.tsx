
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Search, Users } from "lucide-react";
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

      <Card className="p-4 bg-indigo-50/50 border-indigo-100">
        <div className="flex items-center gap-2 mb-2">
          <Search className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-900">Coming Soon</span>
        </div>
        <p className="text-sm text-indigo-800">
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
