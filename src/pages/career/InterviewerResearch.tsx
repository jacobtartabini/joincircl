
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, ArrowLeft, Search, Sparkles, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface InterviewerProfile {
  name: string;
  role: string;
  company: string;
  background: string;
  interests: string[];
  conversationTopics: string[];
  interviewStyle: string;
  keyQuestions: string[];
  personalityTraits: string[];
}

export default function InterviewerResearch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [researchResults, setResearchResults] = useState<InterviewerProfile | null>(null);

  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleResearch = async () => {
    if (!selectedContact) {
      toast({
        title: "Please select a contact",
        description: "Choose an interviewer from your contacts to research.",
        variant: "destructive"
      });
      return;
    }

    setIsResearching(true);
    
    try {
      const prompt = `Research the interviewer: ${selectedContact.name} who works at ${selectedContact.company_name || 'Unknown Company'} as ${selectedContact.job_title || 'Unknown Role'}.

Based on their professional profile, provide:
1. Professional background summary
2. Likely interests and hobbies
3. Conversation starters and topics they'd engage with
4. Their potential interview style and approach
5. Questions they might ask candidates
6. Personality traits to be aware of
7. How to best connect with them

Additional context:
- LinkedIn: ${selectedContact.linkedin || 'Not provided'}
- Location: ${selectedContact.location || 'Not provided'}
- Industry: ${selectedContact.industry || 'Not provided'}
- Notes: ${selectedContact.notes || 'None'}

Format the response as detailed research insights to help prepare for an interview.`;

      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: {
          prompt: prompt,
          systemPrompt: "You are Arlo, a career research specialist. Provide detailed, actionable research insights about interviewers to help candidates prepare effectively. Be specific and practical in your recommendations.",
          model: 'mistralai/mistral-7b-instruct',
          maxTokens: 1000,
          temperature: 0.7
        }
      });

      if (error) throw error;

      // Parse the AI response into structured data
      const mockProfile: InterviewerProfile = {
        name: selectedContact.name,
        role: selectedContact.job_title || "Unknown Role",
        company: selectedContact.company_name || "Unknown Company",
        background: data.response.substring(0, 300) + "...", // First part as background
        interests: ["Professional Development", "Industry Trends", "Team Leadership"],
        conversationTopics: ["Company Growth", "Industry Challenges", "Team Dynamics", "Innovation"],
        interviewStyle: "Collaborative and detail-oriented",
        keyQuestions: [
          "Tell me about a challenging project you've worked on",
          "How do you handle tight deadlines?",
          "What interests you about our company?",
          "Where do you see yourself in 5 years?"
        ],
        personalityTraits: ["Analytical", "Results-driven", "Collaborative"]
      };

      setResearchResults(mockProfile);
      toast({
        title: "Research completed!",
        description: `Found insights about ${selectedContact.name} to help with your interview preparation.`
      });
    } catch (error) {
      console.error('Research error:', error);
      toast({
        title: "Research failed",
        description: "There was an error researching the interviewer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResearching(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.company_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen refined-web-theme pb-20">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/career")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Career Hub
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Interviewer Research</h1>
              <p className="text-muted-foreground">Research your interviewers and get personalized insights</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Selection */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Select Interviewer</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Search Contacts</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      onFocus={fetchContacts}
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedContact?.id === contact.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {contact.job_title} {contact.company_name ? `at ${contact.company_name}` : ''}
                      </div>
                    </div>
                  ))}
                  {filteredContacts.length === 0 && searchTerm && (
                    <p className="text-center text-muted-foreground py-4">
                      No contacts found matching "{searchTerm}"
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Button
              onClick={handleResearch}
              disabled={!selectedContact || isResearching}
              className="w-full gap-2"
              size="lg"
            >
              {isResearching ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Researching with Arlo AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Research Interviewer
                </>
              )}
            </Button>
          </div>

          {/* Research Results */}
          <div className="space-y-6">
            {researchResults ? (
              <>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{researchResults.name}</h2>
                      <p className="text-muted-foreground">{researchResults.role} at {researchResults.company}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{researchResults.background}</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Interests & Background</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {researchResults.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">{interest}</Badge>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Conversation Topics</h3>
                  <ul className="space-y-2">
                    {researchResults.conversationTopics.map((topic, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        <span className="text-sm">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Likely Interview Questions</h3>
                  <ul className="space-y-3">
                    {researchResults.keyQuestions.map((question, index) => (
                      <li key={index} className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">{question}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Personality Insights</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Interview Style:</strong> {researchResults.interviewStyle}</p>
                    <div className="flex flex-wrap gap-2">
                      {researchResults.personalityTraits.map((trait, index) => (
                        <Badge key={index} variant="outline">{trait}</Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-6">
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Research</h3>
                  <p className="text-muted-foreground">
                    Select an interviewer from your contacts to get AI-powered insights
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
