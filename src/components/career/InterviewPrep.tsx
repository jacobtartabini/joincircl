import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, BookOpen, Clock, Target, TrendingUp } from "lucide-react";
interface InterviewSession {
  id: string;
  session_title: string;
  duration_minutes?: number;
  confidence_score?: number;
  created_at: string;
  questions: Array<{
    question: string;
    category: string;
  }>;
}
export default function InterviewPrep() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const getConfidenceColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };
  const quickPrepOptions = [{
    title: "Common Questions",
    description: "Practice standard interview questions",
    icon: BookOpen,
    duration: "15 min"
  }, {
    title: "Behavioral Questions",
    description: "STAR method practice",
    icon: Target,
    duration: "20 min"
  }, {
    title: "Technical Questions",
    description: "Role-specific technical prep",
    icon: TrendingUp,
    duration: "25 min"
  }];
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Interview Prep</h3>
        <Button onClick={() => setShowNewSessionDialog(true)} size="sm" className="gap-2 glass-button rounded-full">
          <Plus className="h-4 w-4" />
          New Session
        </Button>
      </div>

      {/* Quick Start Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickPrepOptions.map((option, index) => {
        const Icon = option.icon;
        return <Card key={index} className="p-4 glass-card hover:glass-card-enhanced transition-all duration-200 cursor-pointer rounded-2xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground mb-1">{option.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {option.duration}
                    </Badge>
                    <Button size="sm" className="h-6 px-2 text-xs glass-button">
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  </div>
                </div>
              </div>
            </Card>;
      })}
      </div>

      {/* Previous Sessions */}
      <div>
        <h4 className="font-medium text-foreground mb-3">Previous Sessions</h4>
        {sessions.length === 0 ? <Card className="p-8 text-center glass-card rounded-2xl">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium text-foreground mb-2">No Practice Sessions Yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Start practicing to improve your interview confidence
            </p>
            <Button onClick={() => setShowNewSessionDialog(true)} className="glass-button rounded-full">
              Start Your First Session
            </Button>
          </Card> : <div className="space-y-3">
            {sessions.map(session => <Card key={session.id} className="p-4 glass-card">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-foreground truncate">{session.session_title}</h5>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {session.duration_minutes && <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.duration_minutes} min
                        </span>}
                      <span>{session.questions.length} questions</span>
                      <span>{new Date(session.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {session.confidence_score && <Badge className={getConfidenceColor(session.confidence_score)}>
                        {session.confidence_score}% confidence
                      </Badge>}
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                </div>
              </Card>)}
          </div>}
      </div>
    </div>;
}