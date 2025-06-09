
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, Target, Plus } from 'lucide-react';

interface CompletionStepProps {
  onComplete: () => void;
}

export default function CompletionStep({ onComplete }: CompletionStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">You're All Set!</h1>
        <p className="text-lg text-muted-foreground">Welcome to your relationship management journey</p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Ready to strengthen your relationships?
            </h2>
            <p className="text-muted-foreground">
              Start by adding your first contacts and setting up important dates.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Add your first contact</h3>
                <p className="text-sm text-muted-foreground">Start building your network</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Set your first Keystone</h3>
                <p className="text-sm text-muted-foreground">Never miss important dates</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={onComplete}
              className="bg-blue-600 hover:bg-blue-700 rounded-full px-8 py-3 text-base font-medium"
            >
              Start Using Circl
            </Button>
            <Button 
              variant="outline" 
              onClick={onComplete}
              className="rounded-full px-8 py-3 text-base"
            >
              I'll explore later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
