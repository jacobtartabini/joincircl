
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, ArrowRight } from 'lucide-react';

interface SurveyStepProps {
  onNext: () => void;
}

export default function SurveyStep({ onNext }: SurveyStepProps) {
  const [role, setRole] = useState('');
  const [howHeard, setHowHeard] = useState('');
  const [goals, setGoals] = useState('');

  const handleContinue = () => {
    // Here you would typically save the survey data
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Briefcase className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Tell us about yourself</h1>
        <p className="text-lg text-muted-foreground">Help us personalize your experience</p>
      </div>

      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-foreground">
              What's your role?
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="rounded-full border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="founder">Founder/Entrepreneur</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="howHeard" className="text-sm font-medium text-foreground">
              How did you hear about us?
            </Label>
            <Select value={howHeard} onValueChange={setHowHeard}>
              <SelectTrigger className="rounded-full border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="social-media">Social Media</SelectItem>
                <SelectItem value="search">Search Engine</SelectItem>
                <SelectItem value="friend">Friend/Colleague</SelectItem>
                <SelectItem value="blog">Blog/Article</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals" className="text-sm font-medium text-foreground">
              What are your main goals? (Optional)
            </Label>
            <Textarea
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Tell us what you're hoping to achieve..."
              className="rounded-2xl border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              rows={4}
            />
          </div>

          <div className="pt-6 flex justify-end">
            <Button 
              onClick={handleContinue}
              className="bg-purple-600 hover:bg-purple-700 px-8 rounded-full min-w-[120px]"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
