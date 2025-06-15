import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, MessageSquare, Mic } from "lucide-react";
import { JobApplicationWorkflow, WorkflowStage } from "@/hooks/use-job-application-workflow";
interface InterviewPrepStageProps {
  workflow: JobApplicationWorkflow;
  onUpdate: (stage: WorkflowStage, progress: number, completed?: boolean) => void;
}
export function InterviewPrepStage({
  workflow,
  onUpdate
}: InterviewPrepStageProps) {
  const completion = workflow.stage_completion.interview_prep;
  const isCompleted = completion?.completed || false;
  return <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        
        {isCompleted && <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Complete</span>
          </div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h5 className="font-medium">Practice Questions</h5>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Review common interview questions tailored to this role
          </p>
          <Button size="sm" className="rounded-full" variant="outline">
            Start Practice
          </Button>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Mic className="h-5 w-5 text-green-600" />
            <h5 className="font-medium">Mock Interview</h5>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Practice with AI-powered mock interviews
          </p>
          <Button size="sm" className="rounded-full" variant="outline">
            Start Interview
          </Button>
        </Card>
      </div>

      <Button onClick={() => onUpdate('interview_prep', 100, true)} className="rounded-full">
        Complete Preparation
      </Button>
    </div>;
}