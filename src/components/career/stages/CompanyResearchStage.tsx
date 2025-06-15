
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Building, HelpCircle } from "lucide-react";
import { JobApplicationWorkflow, WorkflowStage } from "@/hooks/use-job-application-workflow";

interface CompanyResearchStageProps {
  workflow: JobApplicationWorkflow;
  onUpdate: (stage: WorkflowStage, progress: number, completed?: boolean) => void;
}

export function CompanyResearchStage({ workflow, onUpdate }: CompanyResearchStageProps) {
  const completion = workflow.stage_completion.company_research;
  const isCompleted = completion?.completed || false;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Company Research & Questions</h4>
        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Complete</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Building className="h-5 w-5 text-purple-600" />
            <h5 className="font-medium">Company Analysis</h5>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Learn about {workflow.company_name}'s culture, values, and recent news
          </p>
          <Button size="sm" className="rounded-full" variant="outline">
            Research Company
          </Button>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <HelpCircle className="h-5 w-5 text-orange-600" />
            <h5 className="font-medium">Questions to Ask</h5>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Prepare thoughtful questions that show genuine interest
          </p>
          <Button size="sm" className="rounded-full" variant="outline">
            Generate Questions
          </Button>
        </Card>
      </div>

      <Button 
        onClick={() => onUpdate('company_research', 100, true)}
        className="rounded-full"
      >
        Complete Research
      </Button>
    </div>
  );
}
