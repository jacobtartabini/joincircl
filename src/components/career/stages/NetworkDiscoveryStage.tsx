import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Users, Network, Atom, Brain, MessageCircle, Loader2 } from "lucide-react";
import { JobApplicationWorkflow, WorkflowStage } from "@/hooks/use-job-application-workflow";
import { MultiContactSelector } from "@/components/ui/multi-contact-selector";
import { useContacts } from "@/hooks/use-contacts";
import { Contact } from "@/types/contact";
import { aiService } from "@/services/aiService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
interface NetworkMatch {
  contact: Contact;
  relevanceScore: number;
  reasoning: string;
  suggestedApproach: string;
  matchType: 'company' | 'role' | 'industry' | 'referral' | 'general';
}

interface NetworkDiscoveryStageProps {
  workflow: JobApplicationWorkflow;
  onUpdate: (stage: WorkflowStage, progress: number, completed?: boolean) => void;
}
export function NetworkDiscoveryStage({
  workflow,
  onUpdate
}: NetworkDiscoveryStageProps) {
  const {
    contacts,
    isLoading
  } = useContacts();
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [networkMatches, setNetworkMatches] = useState<NetworkMatch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const completion = workflow.stage_completion.network_discovery;
  const isCompleted = completion?.completed || false;
  const analyzeNetworkConnections = async () => {
    if (!workflow || contacts.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const jobContext = `
        Job Title: ${workflow.job_title}
        Company: ${workflow.company_name}
        Job Description: ${workflow.job_description || 'Not provided'}
      `;

      // Analyze each contact for relevance
      const matches: NetworkMatch[] = [];
      
      for (const contact of contacts) {
        let relevanceScore = 0;
        let reasoning = '';
        let matchType: NetworkMatch['matchType'] = 'general';
        let suggestedApproach = '';

        // Company match - highest priority
        if (contact.company_name?.toLowerCase().includes(workflow.company_name.toLowerCase())) {
          relevanceScore = 95;
          matchType = 'company';
          reasoning = `Currently works at ${contact.company_name}, giving them insider knowledge about company culture, hiring processes, and team dynamics.`;
          suggestedApproach = `Reach out for insights about the company culture, team structure, and what they're looking for in candidates. They might also be able to provide a referral.`;
        }
        // Role similarity
        else if (contact.job_title?.toLowerCase().includes(workflow.job_title.toLowerCase()) || 
                 workflow.job_title.toLowerCase().includes(contact.job_title?.toLowerCase() || '')) {
          relevanceScore = 80;
          matchType = 'role';
          reasoning = `Has experience in a similar role (${contact.job_title}), providing valuable insights into the position requirements and career path.`;
          suggestedApproach = `Ask about their experience in similar roles, day-to-day responsibilities, and advice for succeeding in this type of position.`;
        }
        // Industry match
        else if (contact.industry && workflow.job_description?.toLowerCase().includes(contact.industry.toLowerCase())) {
          relevanceScore = 70;
          matchType = 'industry';
          reasoning = `Works in ${contact.industry}, which is relevant to this position and can provide industry-specific insights.`;
          suggestedApproach = `Connect to discuss industry trends, challenges, and opportunities that might be relevant to the role.`;
        }
        // High-value connections (inner circle)
        else if (contact.circle === 'inner' && contact.referral_potential !== 'low') {
          relevanceScore = 60;
          matchType = 'referral';
          reasoning = `Strong personal connection who might be able to provide general career advice or introductions to relevant contacts.`;
          suggestedApproach = `Discuss your career goals and see if they know anyone at ${workflow.company_name} or in similar roles.`;
        }
        // General network
        else if (contact.circle === 'middle' || contact.career_priority) {
          relevanceScore = 40;
          matchType = 'general';
          reasoning = `Professional contact who might have broader network connections or general career insights.`;
          suggestedApproach = `Share your application and see if they have any connections or advice that could be helpful.`;
        }

        // Boost score for career-priority contacts
        if (contact.career_priority) {
          relevanceScore = Math.min(relevanceScore + 15, 100);
        }

        // Include contacts with reasonable relevance
        if (relevanceScore >= 40) {
          matches.push({
            contact,
            relevanceScore,
            reasoning,
            suggestedApproach,
            matchType
          });
        }
      }

      // Sort by relevance score
      matches.sort((a, b) => b.relevanceScore - a.relevanceScore);
      setNetworkMatches(matches);
      setAnalysisComplete(true);
      
      // Auto-select top matches
      const topMatches = matches.slice(0, 3).map(match => match.contact);
      setSelectedContacts(topMatches);
      
    } catch (error) {
      console.error('Error analyzing network:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!isLoading && contacts.length > 0 && workflow && !analysisComplete) {
      analyzeNetworkConnections();
    }
  }, [isLoading, contacts, workflow, analysisComplete]);

  const handleCompleteStage = () => {
    onUpdate('network_discovery', 100, true);
  };

  const getMatchTypeColor = (type: NetworkMatch['matchType']) => {
    switch (type) {
      case 'company': return 'bg-green-100 text-green-800';
      case 'role': return 'bg-blue-100 text-blue-800';
      case 'industry': return 'bg-purple-100 text-purple-800';
      case 'referral': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchTypeLabel = (type: NetworkMatch['matchType']) => {
    switch (type) {
      case 'company': return 'Same Company';
      case 'role': return 'Similar Role';
      case 'industry': return 'Industry Match';
      case 'referral': return 'Strong Connection';
      default: return 'Network Contact';
    }
  };
  if (isLoading || isAnalyzing) {
    return <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm text-muted-foreground">
            {isLoading ? 'Loading your network...' : 'Arlo is analyzing your connections...'}
          </span>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>;
  }
  return <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Network Discovery</h4>
        {isCompleted && <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Complete</span>
          </div>}
      </div>

      <div className="space-y-6">
        {/* AI Analysis Results */}
        {networkMatches.length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <h5 className="font-medium text-gray-900">Arlo's Network Analysis</h5>
                <Badge variant="secondary" className="ml-auto">
                  {networkMatches.length} relevant connections found
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Based on your application to {workflow.company_name} for {workflow.job_title}, 
                here are the most relevant connections in your network:
              </p>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {networkMatches.slice(0, 8).map((match) => (
                  <div key={match.contact.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={match.contact.avatar_url || ""} />
                        <AvatarFallback>
                          {match.contact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h6 className="font-medium text-gray-900 truncate">{match.contact.name}</h6>
                          <Badge className={getMatchTypeColor(match.matchType)} variant="secondary">
                            {getMatchTypeLabel(match.matchType)}
                          </Badge>
                          <span className="text-xs text-gray-500 ml-auto">
                            {match.relevanceScore}% match
                          </span>
                        </div>
                        
                        {match.contact.job_title && match.contact.company_name && (
                          <p className="text-sm text-gray-600 mb-2">
                            {match.contact.job_title} at {match.contact.company_name}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-700 mb-2">{match.reasoning}</p>
                        
                        <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                          <strong>Suggested approach:</strong> {match.suggestedApproach}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => {
                          if (selectedContacts.find(c => c.id === match.contact.id)) {
                            setSelectedContacts(prev => prev.filter(c => c.id !== match.contact.id));
                          } else {
                            setSelectedContacts(prev => [...prev, match.contact]);
                          }
                        }}
                      >
                        {selectedContacts.find(c => c.id === match.contact.id) ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Selected
                          </>
                        ) : (
                          <>
                            <Users className="h-3 w-3" />
                            Select
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Manual Selection Fallback */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-blue-600" />
              <h5 className="font-medium text-gray-900">Additional Network Contacts</h5>
            </div>
            
            <p className="text-sm text-muted-foreground">
              You can also manually select other contacts from your network who might be helpful.
            </p>

            <MultiContactSelector 
              contacts={contacts} 
              selectedContacts={selectedContacts} 
              onSelectionChange={setSelectedContacts} 
              label="Search and select additional contacts" 
              placeholder="Search by name, company, or job title..." 
            />
          </div>
        </Card>

        {/* Selected Contacts Summary */}
        {selectedContacts.length > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h6 className="text-sm font-medium text-blue-900 mb-2">
              Selected Network Contacts ({selectedContacts.length})
            </h6>
            <div className="space-y-2">
              {selectedContacts.map(contact => (
                <div key={contact.id} className="flex items-center justify-between text-sm text-blue-800">
                  <div>
                    <span className="font-medium">{contact.name}</span>
                    {contact.job_title && contact.company_name && (
                      <span className="text-blue-600"> - {contact.job_title} at {contact.company_name}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 h-6 px-2"
                  >
                    <MessageCircle className="h-3 w-3" />
                    Draft Message
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex gap-3">
          <Button onClick={handleCompleteStage} className="rounded-full" disabled={selectedContacts.length === 0}>
            <Users className="h-4 w-4 mr-2" />
            Complete Network Discovery
          </Button>
          
          {selectedContacts.length === 0 && <Button onClick={handleCompleteStage} variant="outline" className="rounded-full">
              Skip for Now
            </Button>}
        </div>
      </div>

      {/* Arlo's Insight */}
      <Card className="p-4 bg-blue-50/50 border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="atom-gradient-network" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#a21caf" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <Atom className="w-full h-full" stroke="url(#atom-gradient-network)" strokeWidth="2" />
          </svg>
          <span className="text-sm font-medium text-blue-900">Arlo's Analysis</span>
        </div>
        {networkMatches.length > 0 ? (
          <p className="text-sm text-blue-800">
            I've analyzed your network and found {networkMatches.length} potentially relevant connections for this application. 
            Focus on the highest-scoring matches - they're most likely to provide valuable insights or referrals.
          </p>
        ) : (
          <p className="text-sm text-blue-800">
            Leveraging your network can increase your chances of landing an interview by 5x. 
            Even weak connections can provide valuable insights about the company culture and hiring process.
          </p>
        )}
      </Card>
    </div>;
}