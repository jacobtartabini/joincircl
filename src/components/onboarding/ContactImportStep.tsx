
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Upload, ArrowRight, X } from 'lucide-react';

interface ContactImportStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export default function ContactImportStep({ onNext, onSkip }: ContactImportStepProps) {
  const handleImport = () => {
    // Simulate import process
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Import Your Contacts</h1>
        <p className="text-lg text-muted-foreground">Connect your existing network to get started faster</p>
      </div>

      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Upload a CSV file</h3>
              <p className="text-sm text-muted-foreground">
                Import contacts from your email, CRM, or other tools
              </p>
            </div>
          </div>

          <div className="pt-6 flex justify-between">
            <Button 
              onClick={onSkip}
              variant="outline"
              className="px-8 rounded-full"
            >
              <X className="mr-2 h-4 w-4" />
              Skip for now
            </Button>
            <Button 
              onClick={handleImport}
              className="bg-green-600 hover:bg-green-700 px-8 rounded-full"
            >
              Import Contacts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
