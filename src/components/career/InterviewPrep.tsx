
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Mic, Play, Brain } from "lucide-react";

export default function InterviewPrep() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Interview Prep</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Practice with Arlo and build your confidence
          </p>
        </div>
        <Button className="gap-2">
          <Play className="h-4 w-4" />
          Start Practice Session
        </Button>
      </div>

      {/* Coming Soon Placeholder */}
      <Card className="p-12 text-center glass-card">
        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          AI-Powered Interview Prep Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Practice behavioral and technical questions with personalized feedback from Arlo
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" size="sm">
            <Mic className="h-3 w-3 mr-1" />
            Record Practice
          </Button>
          <Button variant="outline" size="sm">
            <BookOpen className="h-3 w-3 mr-1" />
            Question Bank
          </Button>
        </div>
      </Card>
    </div>
  );
}
