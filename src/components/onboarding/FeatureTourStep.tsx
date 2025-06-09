
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface FeatureTourStepProps {
  onNext: () => void;
}

export default function FeatureTourStep({ onNext }: FeatureTourStepProps) {
  const features = [
    {
      title: "AI-Powered Development",
      description: "Build web applications with natural language prompts"
    },
    {
      title: "Real-time Preview",
      description: "See your changes instantly as you make them"
    },
    {
      title: "Modern Tech Stack",
      description: "React, TypeScript, Tailwind CSS, and more"
    }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Discover Lovable</h1>
        <p className="text-lg text-muted-foreground">Learn about the key features that make Lovable powerful</p>
      </div>

      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">{index + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 flex justify-end">
            <Button 
              onClick={onNext}
              className="bg-yellow-600 hover:bg-yellow-700 px-8 rounded-full"
            >
              Got it!
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
