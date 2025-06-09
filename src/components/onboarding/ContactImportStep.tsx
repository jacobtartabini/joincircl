
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Linkedin, Phone, Plus, Users } from 'lucide-react';

interface ContactImportStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export default function ContactImportStep({ onNext, onSkip }: ContactImportStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const importMethods = [
    {
      id: 'linkedin',
      title: 'Import from LinkedIn',
      description: 'Connect your LinkedIn to import professional contacts',
      icon: Linkedin,
      iconColor: 'text-[#0077B5]',
      comingSoon: true,
    },
    {
      id: 'contacts',
      title: 'Import from Contacts',
      description: 'Import contacts from your phone or device',
      icon: Phone,
      iconColor: 'text-gray-700',
      comingSoon: true,
    },
    {
      id: 'manual',
      title: 'Add Manually',
      description: 'Start by adding contacts one by one',
      icon: Plus,
      iconColor: 'text-blue-600',
      comingSoon: false,
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    if (methodId === 'manual') {
      // For now, we'll just continue to the next step
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Add Your Contacts</h1>
        <p className="text-lg text-muted-foreground">Start building your network in Circl</p>
      </div>

      <div className="space-y-4 mb-8">
        {importMethods.map((method) => {
          const IconComponent = method.icon;
          return (
            <Card 
              key={method.id}
              className={`border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                selectedMethod === method.id 
                  ? 'border-blue-500 bg-blue-50/50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              } ${method.comingSoon ? 'opacity-60' : ''}`}
              onClick={() => !method.comingSoon && handleMethodSelect(method.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <IconComponent className={`h-8 w-8 ${method.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{method.title}</h3>
                      {method.comingSoon && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip for now
        </Button>
        
        <div className="text-sm text-muted-foreground">
          You can always import contacts later from Settings
        </div>
      </div>
    </div>
  );
}
