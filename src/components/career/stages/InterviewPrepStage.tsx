import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, MessageSquare, Mic, Video, Target, Clock, Users } from "lucide-react";
import { JobApplicationWorkflow, WorkflowStage } from "@/hooks/use-job-application-workflow";
import { MockInterviewSession } from "../interview/MockInterviewSession";
import { InterviewFeedback } from "../interview/InterviewFeedback";
interface InterviewPrepStageProps {
  workflow: JobApplicationWorkflow;
  onUpdate: (stage: WorkflowStage, progress: number, completed?: boolean) => void;
}

type InterviewView = 'overview' | 'mock-session' | 'feedback';
export function InterviewPrepStage({
  workflow,
  onUpdate
}: InterviewPrepStageProps) {
  const [currentView, setCurrentView] = useState<InterviewView>('overview');
  const [sessionData, setSessionData] = useState<any>(null);
  const completion = workflow.stage_completion.interview_prep;
  const isCompleted = completion?.completed || false;

  const handleStartMockInterview = () => {
    setCurrentView('mock-session');
  };

  const handleMockInterviewComplete = (data: any) => {
    setSessionData(data);
    setCurrentView('feedback');
    onUpdate('interview_prep', 75, false);
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
  };

  const handleRetakeMockInterview = () => {
    setCurrentView('mock-session');
  };

  if (currentView === 'mock-session') {
    return (
      <MockInterviewSession
        workflow={workflow}
        onBack={handleBackToOverview}
        onComplete={handleMockInterviewComplete}
      />
    );
  }

  if (currentView === 'feedback' && sessionData) {
    return (
      <InterviewFeedback
        sessionData={sessionData}
        onBack={handleBackToOverview}
        onRetake={handleRetakeMockInterview}
      />
    );
  }
  return <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        
        {isCompleted && <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Complete</span>
          </div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-white border-gray-100 rounded-xl hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <h5 className="font-semibold text-gray-900">Practice Questions</h5>
            </div>
            <p className="text-sm text-muted-foreground">
              Review {workflow.job_title} specific questions and practice your responses with AI feedback
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>15-30 min</span>
            </div>
            <Button size="sm" className="rounded-full w-full" variant="outline">
              Start Practice
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 rounded-xl hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 text-white" />
              </div>
              <h5 className="font-semibold text-gray-900">Full Mock Interview</h5>
            </div>
            <p className="text-sm text-blue-700">
              Complete simulated interview with video recording, AI analysis, and personalized feedback
            </p>
            <div className="flex items-center gap-4 text-xs text-blue-600">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>20-45 min</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>AI Analysis</span>
              </div>
            </div>
            <Button 
              size="sm" 
              className="rounded-full w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleStartMockInterview}
            >
              <Video className="h-4 w-4 mr-2" />
              Start Mock Interview
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-white border-gray-100 rounded-xl hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <h5 className="font-semibold text-gray-900">Peer Practice</h5>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect with other job seekers for mutual interview practice sessions
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Coming Soon</span>
            </div>
            <Button size="sm" className="rounded-full w-full" variant="outline" disabled>
              Find Practice Partner
            </Button>
          </div>
        </Card>
      </div>

      {/* Previous Sessions */}
      {sessionData && (
        <Card className="p-6 bg-green-50 border-green-200 rounded-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-green-900">Recent Mock Interview</h5>
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-full border-green-300 text-green-700 hover:bg-green-100"
                onClick={() => setCurrentView('feedback')}
              >
                View Feedback
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">78</div>
                <div className="text-xs text-green-700">Overall Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-xs text-green-700">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">22m</div>
                <div className="text-xs text-green-700">Duration</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Button onClick={() => onUpdate('interview_prep', 100, true)} className="rounded-full">
        Complete Preparation
      </Button>
    </div>;
}