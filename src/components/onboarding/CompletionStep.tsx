
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, Target, Plus, Users, Calendar, Brain, ArrowRight } from 'lucide-react';
import { StandardModalHeader } from '@/components/ui/StandardModalHeader';

interface CompletionStepProps {
  onComplete: () => void;
}

export default function CompletionStep({ onComplete }: CompletionStepProps) {
  const nextSteps = [
    {
      icon: Plus,
      title: 'Add your first contact',
      description: 'Start building your network by adding someone important to you',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Target,
      title: 'Set your first Keystone',
      description: 'Add an important date like a birthday or anniversary',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Calendar,
      title: 'Log an interaction',
      description: 'Record a recent conversation to start tracking relationships',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Brain,
      title: 'Chat with Arlo',
      description: 'Ask our AI assistant for relationship advice and insights',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Consistent Success Header */}
      <div className="text-center space-y-6">
        <StandardModalHeader
          icon={CheckCircle}
          title="Welcome to Circl! 🎉"
          subtitle="You're all set up and ready to strengthen your relationships"
        />
        
        <div className="glass-card inline-flex items-center gap-2 px-4 py-2">
          <Sparkles className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">Onboarding Complete</span>
        </div>
      </div>

      {/* Next Steps Card */}
      <Card className="glass-card-enhanced border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
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
                <div key={index} className="glass-card p-4 hover:shadow-lg transition-all glass-float group border border-white/20">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                      <div className="flex items-center text-primary text-sm font-medium group-hover:gap-3 gap-2 transition-all">
                        Get started
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Button 
              onClick={onComplete}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-xl px-12 py-3 text-base font-medium shadow-lg glass-float"
            >
              Start Using Circl
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="glass-card border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground mb-2">Pro Tips for Success</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  Start with your inner circle - add 5-10 close contacts first
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  Set up birthday reminders so you never miss important dates
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  Log interactions regularly to remember important conversations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  Use Arlo AI for personalized relationship insights and reminders
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
