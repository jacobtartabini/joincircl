
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Mail, FileText } from "lucide-react";
import { JobApplicationWorkflow, WorkflowStage } from "@/hooks/use-job-application-workflow";

interface FollowUpStageProps {
  workflow: JobApplicationWorkflow;
  onUpdate: (stage: WorkflowStage, progress: number, completed?: boolean) => void;
}

export function FollowUpStage({ workflow, onUpdate }: FollowUpStageProps) {
  const completion = workflow.stage_completion.follow_up;
  const isCompleted = completion?.completed || false;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Follow-Up & Notes</h4>
        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Complete</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="interview-notes" className="text-sm font-semibold text-gray-700">Interview Reflection</Label>
          <Textarea
            id="interview-notes"
            placeholder="How did the interview go? What went well? What could be improved?"
            className="min-h-[100px] mt-2 px-4 py-3 border border-gray-200 rounded-lg bg-white focus-visible:ring-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <h5 className="font-medium">Thank You Notes</h5>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Send personalized thank you messages to your interviewers
            </p>
            <Button size="sm" className="rounded-full" variant="outline">
              Draft Thank You
            </Button>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="h-5 w-5 text-green-600" />
              <h5 className="font-medium">Next Steps</h5>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Track follow-up timeline and next actions
            </p>
            <Button size="sm" className="rounded-full" variant="outline">
              Set Reminders
            </Button>
          </Card>
        </div>
      </div>

      <Button 
        onClick={() => onUpdate('follow_up', 100, true)}
        className="rounded-full"
      >
        Complete Follow-Up
      </Button>
    </div>
  );
}
