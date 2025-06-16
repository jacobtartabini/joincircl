
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Users, 
  Calendar, 
  Brain, 
  ArrowRight,
  CheckCircle,
  Play,
  Lightbulb
} from 'lucide-react';

interface AppTutorialStepProps {
  onNext: (data?: any) => void;
  onSkip: () => void;
}

export default function AppTutorialStep({ onNext, onSkip }: AppTutorialStepProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [completedFeatures, setCompletedFeatures] = useState<Set<number>>(new Set());

  const features = [
    {
      icon: Users,
      title: 'Circles',
      subtitle: 'Organize Your Network',
      description: 'Sort your contacts into Inner, Middle, and Outer circles based on their importance in your life. This helps you prioritize who to stay in touch with.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      tips: [
        'Inner Circle: Close family and friends (5-15 people)',
        'Middle Circle: Regular contacts you want to maintain (30-50 people)',
        'Outer Circle: Professional contacts and acquaintances'
      ]
    },
    {
      icon: Target,
      title: 'Keystones',
      subtitle: 'Never Miss Important Moments',
      description: 'Track birthdays, anniversaries, and other important dates to strengthen your relationships. Set reminders so you never forget.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      tips: [
        'Add birthdays and anniversaries',
        'Set custom reminders for important events',
        'Track relationship milestones'
      ]
    },
    {
      icon: Calendar,
      title: 'Interactions',
      subtitle: 'Track Your Conversations',
      description: 'Log conversations and interactions to remember important details for future conversations. Build stronger relationships through context.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      tips: [
        'Log calls, messages, and meetings',
        'Add notes about what you discussed',
        'Set follow-up reminders'
      ]
    },
    {
      icon: Brain,
      title: 'Arlo AI',
      subtitle: 'Your Relationship Assistant',
      description: 'Get personalized insights and suggestions on how to strengthen your relationships. Arlo helps you stay proactive.',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      tips: [
        'Get reminders to reach out to contacts',
        'Receive relationship insights and suggestions',
        'Ask questions about your network'
      ]
    },
  ];

  const currentFeatureData = features[currentFeature];
  const IconComponent = currentFeatureData.icon;

  const handleNext = () => {
    const newCompleted = new Set(completedFeatures);
    newCompleted.add(currentFeature);
    setCompletedFeatures(newCompleted);

    if (currentFeature < features.length - 1) {
      setCurrentFeature(currentFeature + 1);
    } else {
      onNext({ 
        tutorialCompleted: true,
        featuresViewed: Array.from(newCompleted)
      });
    }
  };

  const handlePrevious = () => {
    if (currentFeature > 0) {
      setCurrentFeature(currentFeature - 1);
    }
  };

  const handleSkipTutorial = () => {
    onSkip();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Learn Circl in 2 Minutes</h1>
        <p className="text-lg text-muted-foreground">Discover the key features that will help you strengthen your relationships</p>
      </div>

      <Card className={`border-0 shadow-lg ${currentFeatureData.bgColor} transition-all duration-500`}>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            {/* Feature Icon and Info */}
            <div className="flex-shrink-0">
              <div className={`w-20 h-20 bg-gradient-to-br ${currentFeatureData.color} rounded-2xl flex items-center justify-center shadow-lg mb-4`}>
                <IconComponent className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Feature Content */}
            <div className="flex-1">
              <Badge variant="secondary" className="mb-3">
                {currentFeatureData.subtitle}
              </Badge>
              
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {currentFeatureData.title}
              </h2>
              
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {currentFeatureData.description}
              </p>

              {/* Tips */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Key Tips:
                </h3>
                <ul className="space-y-2">
                  {currentFeatureData.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mt-8 mb-6">
            {features.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentFeature 
                    ? 'bg-blue-500 w-8' 
                    : completedFeatures.has(index)
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={handlePrevious}
              disabled={currentFeature === 0}
              className="text-muted-foreground"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {currentFeature + 1} of {features.length}
              </span>
              
              <Button 
                variant="ghost"
                onClick={handleSkipTutorial}
                className="text-muted-foreground"
              >
                Skip Tutorial
              </Button>
            </div>
            
            <Button 
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
            >
              {currentFeature === features.length - 1 ? (
                <>
                  Complete Tutorial
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo Hint */}
      <Card className="mt-6 border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-center justify-center">
            <Play className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-700">
              After completing this tutorial, you can explore these features hands-on in the app!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
