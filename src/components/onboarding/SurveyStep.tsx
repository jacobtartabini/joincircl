
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardList, ArrowRight } from 'lucide-react';

interface SurveyStepProps {
  onNext: (surveyData: SurveyData) => void;
}

export interface SurveyData {
  role: string;
  howHeardAboutUs: string;
  goals: string;
  additionalNotes: string;
}

export default function SurveyStep({ onNext }: SurveyStepProps) {
  const [formData, setFormData] = useState<SurveyData>({
    role: '',
    howHeardAboutUs: '',
    goals: '',
    additionalNotes: '',
  });

  const roleOptions = [
    { value: 'developer', label: 'Developer' },
    { value: 'designer', label: 'Designer' },
    { value: 'founder', label: 'Founder/Entrepreneur' },
    { value: 'student', label: 'Student' },
    { value: 'product_manager', label: 'Product Manager' },
    { value: 'other', label: 'Other' },
  ];

  const referralOptions = [
    { value: 'social_media', label: 'Social Media' },
    { value: 'referral', label: 'Friend/Colleague Referral' },
    { value: 'online_search', label: 'Online Search' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'blog_article', label: 'Blog/Article' },
    { value: 'other', label: 'Other' },
  ];

  const goalOptions = [
    { value: 'build_mvp', label: 'Build an MVP quickly' },
    { value: 'prototype_ideas', label: 'Prototype ideas' },
    { value: 'learn_development', label: 'Learn web development' },
    { value: 'client_projects', label: 'Work on client projects' },
    { value: 'personal_projects', label: 'Build personal projects' },
    { value: 'other', label: 'Other' },
  ];

  const handleContinue = () => {
    if (!formData.role || !formData.howHeardAboutUs || !formData.goals) {
      return;
    }
    onNext(formData);
  };

  const isComplete = formData.role && formData.howHeardAboutUs && formData.goals;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Tell Us About Yourself</h1>
        <p className="text-lg text-muted-foreground">Help us personalize your experience</p>
      </div>

      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-foreground">
              What's your current role? *
            </Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
              <SelectTrigger className="rounded-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referral" className="text-sm font-medium text-foreground">
              How did you hear about Lovable? *
            </Label>
            <Select value={formData.howHeardAboutUs} onValueChange={(value) => setFormData({...formData, howHeardAboutUs: value})}>
              <SelectTrigger className="rounded-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {referralOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals" className="text-sm font-medium text-foreground">
              What's your main goal with Lovable? *
            </Label>
            <Select value={formData.goals} onValueChange={(value) => setFormData({...formData, goals: value})}>
              <SelectTrigger className="rounded-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <SelectValue placeholder="Select your primary goal" />
              </SelectTrigger>
              <SelectContent>
                {goalOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes" className="text-sm font-medium text-foreground">
              Anything else you'd like us to know? (Optional)
            </Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
              className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              placeholder="Share any additional context or questions..."
              rows={3}
            />
          </div>

          <div className="pt-6 flex justify-end">
            <Button 
              onClick={handleContinue}
              disabled={!isComplete}
              className="bg-blue-600 hover:bg-blue-700 px-8 rounded-full min-w-[120px]"
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
