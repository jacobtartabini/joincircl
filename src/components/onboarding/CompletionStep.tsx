
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface CompletionStepProps {
  onComplete: () => void;
}

export default function CompletionStep({ onComplete }: CompletionStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">You're All Set!</h1>
        <p className="text-lg text-muted-foreground">Welcome to Lovable. Let's start building something amazing!</p>
      </div>

      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Setup Complete</h3>
              <p className="text-sm text-muted-foreground">
                Your profile is ready and you're all set to start using Lovable. Time to create your first project!
              </p>
            </div>
          </div>

          <div className="pt-6 flex justify-center">
            <Button 
              onClick={onComplete}
              className="bg-emerald-600 hover:bg-emerald-700 px-8 rounded-full min-w-[200px]"
            >
              Start Building
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
