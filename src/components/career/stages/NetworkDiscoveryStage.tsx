
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Users, MessageCircle } from "lucide-react";
import { JobApplicationWorkflow, WorkflowStage } from "@/hooks/use-job-application-workflow";

interface NetworkDiscoveryStageProps {
  workflow: JobApplicationWorkflow;
  onUpdate: (stage: WorkflowStage, progress: number, completed?: boolean) => void;
}

export function NetworkDiscoveryStage({ workflow, onUpdate }: NetworkDiscoveryStageProps) {
  const completion = workflow.stage_completion.network_discovery;
  const isCompleted = completion?.completed || false;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Network Discovery</h4>
        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Complete</span>
          </div>
        )}
      </div>

      <Card className="p-4 bg-orange-50/50 border-orange-100">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-900">Coming Soon</span>
        </div>
        <p className="text-sm text-orange-800">
          This feature will help you discover relevant connections in your network who might be connected 
          to {workflow.company_name} and assist with drafting personalized outreach messages.
        </p>
      </Card>

      <Button 
        onClick={() => onUpdate('network_discovery', 100, true)}
        className="rounded-full"
        variant="outline"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Skip for Now
      </Button>
    </div>
  );
}
