
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Brain, CheckCircle, Upload, Zap } from "lucide-react";
import { JobApplicationWorkflow, WorkflowStage } from "@/hooks/use-job-application-workflow";

interface ResumeReviewStageProps {
  workflow: JobApplicationWorkflow;
  onUpdate: (stage: WorkflowStage, progress: number, completed?: boolean) => void;
}

export function ResumeReviewStage({ workflow, onUpdate }: ResumeReviewStageProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const completion = workflow.stage_completion.resume_review;
  const isCompleted = completion?.completed || false;

  const handleAnalyzeResume = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      onUpdate('resume_review', 80);
    }, 3000);
  };

  const handleCompleteStage = () => {
    onUpdate('resume_review', 100, true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Resume Review & Optimization</h4>
        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Complete</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h5 className="font-medium text-gray-900">Upload Your Resume</h5>
              <p className="text-sm text-muted-foreground">
                Upload your current resume for AI analysis and optimization
              </p>
            </div>
            <Button className="rounded-full">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        </Card>

        {/* Analysis Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <h5 className="font-medium text-gray-900">AI Analysis</h5>
            </div>
            
            {!analysisComplete && !isAnalyzing && (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Arlo will analyze your resume against the job requirements and provide tailored suggestions.
                </p>
                <Button 
                  onClick={handleAnalyzeResume}
                  className="w-full rounded-full"
                  disabled={!workflow.job_description}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Analyze Resume
                </Button>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-blue-600">Analyzing your resume...</p>
              </div>
            )}

            {analysisComplete && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Match Score</span>
                    <Badge className="bg-green-50 text-green-700">85%</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h6 className="text-sm font-medium text-gray-900">Top Suggestions:</h6>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Add "Python" and "Machine Learning" keywords</li>
                      <li>• Quantify your project management achievements</li>
                      <li>• Highlight cloud computing experience</li>
                    </ul>
                  </div>
                </div>
                
                <Button 
                  onClick={handleCompleteStage}
                  className="w-full rounded-full"
                >
                  Apply Suggestions & Complete
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Arlo's Insight */}
      <Card className="p-4 bg-purple-50/50 border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">Arlo's Tip</span>
        </div>
        <p className="text-sm text-purple-800">
          A tailored resume can increase your chances of getting an interview by up to 40%. 
          I'll help you highlight the most relevant skills and experiences for this specific role.
        </p>
      </Card>
    </div>
  );
}
