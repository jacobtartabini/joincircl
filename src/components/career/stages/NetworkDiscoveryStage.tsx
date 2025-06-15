
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Users, Network, Atom } from "lucide-react";
import { JobApplicationWorkflow, WorkflowStage } from "@/hooks/use-job-application-workflow";
import { MultiContactSelector } from "@/components/ui/multi-contact-selector";
import { useContacts } from "@/hooks/use-contacts";
import { Contact } from "@/types/contact";

interface NetworkDiscoveryStageProps {
  workflow: JobApplicationWorkflow;
  onUpdate: (stage: WorkflowStage, progress: number, completed?: boolean) => void;
}

export function NetworkDiscoveryStage({ workflow, onUpdate }: NetworkDiscoveryStageProps) {
  const { contacts, isLoading } = useContacts();
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const completion = workflow.stage_completion.network_discovery;
  const isCompleted = completion?.completed || false;

  const handleCompleteStage = () => {
    onUpdate('network_discovery', 100, true);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

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

      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-blue-600" />
              <h5 className="font-medium text-gray-900">Find Relevant Connections</h5>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Select contacts from your network who might be helpful for this application. 
              This could include current employees, referrals, or industry connections.
            </p>

            <MultiContactSelector
              contacts={contacts}
              selectedContacts={selectedContacts}
              onSelectionChange={setSelectedContacts}
              label="Select relevant contacts"
              placeholder="Search by name, company, or job title..."
            />

            {selectedContacts.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h6 className="text-sm font-medium text-blue-900 mb-2">
                  Selected Network Contacts ({selectedContacts.length})
                </h6>
                <div className="space-y-2">
                  {selectedContacts.map(contact => (
                    <div key={contact.id} className="text-sm text-blue-800">
                      <span className="font-medium">{contact.name}</span>
                      {contact.job_title && contact.company_name && (
                        <span className="text-blue-600"> - {contact.job_title} at {contact.company_name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button 
            onClick={handleCompleteStage}
            className="rounded-full"
            disabled={selectedContacts.length === 0}
          >
            <Users className="h-4 w-4 mr-2" />
            Complete Network Discovery
          </Button>
          
          {selectedContacts.length === 0 && (
            <Button 
              onClick={handleCompleteStage}
              variant="outline"
              className="rounded-full"
            >
              Skip for Now
            </Button>
          )}
        </div>
      </div>

      {/* Arlo's Insight */}
      <Card className="p-4 bg-blue-50/50 border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="atom-gradient-network" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#a21caf" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <Atom className="w-full h-full" stroke="url(#atom-gradient-network)" strokeWidth="2" />
          </svg>
          <span className="text-sm font-medium text-blue-900">Arlo's Tip</span>
        </div>
        <p className="text-sm text-blue-800">
          Leveraging your network can increase your chances of landing an interview by 5x. 
          Even weak connections can provide valuable insights about the company culture and hiring process.
        </p>
      </Card>
    </div>
  );
}
