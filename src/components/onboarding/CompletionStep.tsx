
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, Target, Plus, Users, Calendar, Brain } from 'lucide-react';

interface CompletionStepProps {
  onComplete: () => void;
}

export default function CompletionStep({ onComplete }: CompletionStepProps) {
  const nextSteps = [
    {
      icon: Plus,
      title: 'Add your first contact',
      description: 'Start building your network by adding someone important to you',
      color: 'bg-blue-100 text-blue-600',
      action: 'Go to Contacts',
    },
    {
      icon: Target,
      title: 'Set your first Keystone',
      description: 'Add an important date like a birthday or anniversary',
      color: 'bg-purple-100 text-purple-600',
      action: 'Add Keystone',
    },
    {
      icon: Calendar,
      title: 'Log an interaction',
      description: 'Record a recent conversation to start tracking relationships',
      color: 'bg-green-100 text-green-600',
      action: 'Add Interaction',
    },
    {
      icon: Brain,
      title: 'Chat with Arlo',
      description: 'Ask our AI assistant for relationship advice and insights',
      color: 'bg-orange-100 text-orange-600',
      action: 'Chat with Arlo',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Welcome to Circl! 🎉</h1>
        <p className="text-lg text-muted-foreground mb-4">
          You're all set up and ready to strengthen your relationships
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Onboarding Complete
        </div>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 mb-8">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground">
              Here are some suggested next steps to make the most of Circl:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {nextSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${step.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    <Button variant="outline" size="sm" className="text-xs">
                      {step.action}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Button 
              onClick={onComplete}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-12 py-3 text-base font-medium shadow-lg"
            >
              Start Using Circl
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Pro Tips for Success</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Start with your inner circle - add 5-10 close contacts first</li>
                <li>• Set up birthday reminders so you never miss important dates</li>
                <li>• Log interactions regularly to remember important conversations</li>
                <li>• Use Arlo AI for personalized relationship insights and reminders</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
