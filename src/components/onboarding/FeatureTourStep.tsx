
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
  CheckCircle
} from 'lucide-react';

interface FeatureTourStepProps {
  onNext: () => void;
}

export default function FeatureTourStep({ onNext }: FeatureTourStepProps) {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Users,
      title: 'Circles',
      subtitle: 'Organize Your Network',
      description: 'Sort your contacts into Inner, Middle, and Outer circles based on their importance in your life.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Target,
      title: 'Keystones',
      subtitle: 'Never Miss Important Moments',
      description: 'Track birthdays, anniversaries, and other important dates to strengthen your relationships.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Calendar,
      title: 'Timeline',
      subtitle: 'Track Your Interactions',
      description: 'Log conversations and interactions to remember important details for future conversations.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: Brain,
      title: 'Arlo',
      subtitle: 'Your AI Relationship Assistant',
      description: 'Get personalized insights and suggestions on how to strengthen your relationships.',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
    },
  ];

  const handleNext = () => {
    if (currentFeature < features.length - 1) {
      setCurrentFeature(currentFeature + 1);
    } else {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (currentFeature > 0) {
      setCurrentFeature(currentFeature - 1);
    }
  };

  const currentFeatureData = features[currentFeature];
  const IconComponent = currentFeatureData.icon;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Meet Circl's Features</h1>
        <p className="text-lg text-muted-foreground">Discover how Circl helps you nurture relationships</p>
      </div>

      <Card className={`border-0 shadow-lg ${currentFeatureData.bgColor} transition-all duration-500`}>
        <CardContent className="p-8 text-center">
          <div className={`w-20 h-20 bg-gradient-to-br ${currentFeatureData.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
            <IconComponent className="h-10 w-10 text-white" />
          </div>
          
          <Badge variant="secondary" className="mb-4">
            {currentFeatureData.subtitle}
          </Badge>
          
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {currentFeatureData.title}
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {currentFeatureData.description}
          </p>

          <div className="flex justify-center gap-2 mb-8">
            {features.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentFeature 
                    ? 'bg-blue-500 w-8' 
                    : index < currentFeature 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={handlePrevious}
              disabled={currentFeature === 0}
              className="text-muted-foreground"
            >
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              {currentFeature + 1} of {features.length}
            </span>
            
            <Button 
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
            >
              {currentFeature === features.length - 1 ? (
                <>
                  Get Started
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
    </div>
  );
}
