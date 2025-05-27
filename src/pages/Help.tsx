
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ChevronDown, ChevronUp, PlayCircle, HelpCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const Help = () => {
  const navigate = useNavigate();
  const [openFAQs, setOpenFAQs] = useState<string[]>([]);

  const toggleFAQ = (question: string) => {
    setOpenFAQs(current => 
      current.includes(question) 
        ? current.filter(q => q !== question) 
        : [...current, question]
    );
  };

  const faqItems: FAQItem[] = [
    {
      question: "How do I add a new contact?",
      answer: "Click the \"Add Contact\" button on the Home or Circles page to create a new contact. Fill out the form with contact details and assign them to a circle."
    },
    {
      question: "What are Keystones?",
      answer: "Keystones are important events or reminders related to your contacts. Use them to keep track of birthdays, follow-ups, or other significant dates."
    },
    {
      question: "How do circles work?",
      answer: "Circles help you organize your contacts based on relationship closeness. Inner circle contacts are your closest relationships, middle circle for regular connections, and outer circle for occasional interactions."
    },
    {
      question: "How do I log interactions with contacts?",
      answer: "Click the \"Interaction\" button on any contact card to record calls, meetings, emails or other interactions. These interactions help you keep track of your communication history."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Help Center</h1>
            <p className="text-gray-600 mt-1">Get help and learn how to use Circl effectively</p>
          </div>
        </div>
        
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">Getting Started</CardTitle>
            </div>
            <p className="text-gray-600">
              Welcome to Circl! This help center provides guides and resources to help you get the most out of your relationship management.
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* FAQ Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {faqItems.map(faq => (
                  <Collapsible 
                    key={faq.question} 
                    open={openFAQs.includes(faq.question)} 
                    onOpenChange={() => toggleFAQ(faq.question)} 
                  >
                    <CollapsibleTrigger className="flex w-full justify-between items-center p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <h4 className="font-medium text-gray-900">{faq.question}</h4>
                      {openFAQs.includes(faq.question) ? 
                        <ChevronUp size={18} className="text-gray-500" /> : 
                        <ChevronDown size={18} className="text-gray-500" />
                      }
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pt-3 pb-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
            
            {/* Video Tutorials Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Video Tutorials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gray-100 h-40 flex items-center justify-center relative group cursor-pointer">
                    <PlayCircle className="h-12 w-12 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Getting Started with Circl</h4>
                    <p className="text-sm text-gray-600">
                      A complete overview of the core features and how to use them effectively.
                    </p>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gray-100 h-40 flex items-center justify-center relative group cursor-pointer">
                    <PlayCircle className="h-12 w-12 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Advanced Contact Management</h4>
                    <p className="text-sm text-gray-600">
                      Tips and tricks for effectively organizing and maintaining your network.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-center">
                <Link to="/contact">
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                    Still Need Help? Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;
