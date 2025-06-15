
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Network, ArrowLeft, Search, MessageCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useContacts } from "@/hooks/use-contacts";
import { Contact } from "@/types/contact";

interface NetworkMatch {
  contact: Contact;
  relevanceScore: number;
  connectionReason: string;
  suggestedApproach: string;
}

export default function NetworkDiscovery() {
  const navigate = useNavigate();
  const { contacts } = useContacts();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [networkMatches, setNetworkMatches] = useState<NetworkMatch[]>([]);

  const handleAnalyze = async () => {
    if (!searchQuery.trim() && !jobDescription.trim()) {
      toast({
        title: "Search criteria required",
        description: "Please enter a company/job or paste a job description.",
        variant: "destructive"
      });
      return;
    }

    if (contacts.length === 0) {
      toast({
        title: "No contacts found",
        description: "You need to have contacts in your network to discover connections.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Analyze contacts based on search criteria
      const relevantContacts = contacts.filter(contact => {
        const query = searchQuery.toLowerCase();
        const description = jobDescription.toLowerCase();
        
        return (
          contact.company_name?.toLowerCase().includes(query) ||
          contact.job_title?.toLowerCase().includes(query) ||
          contact.industry?.toLowerCase().includes(query) ||
          contact.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          contact.career_tags?.some(tag => tag.toLowerCase().includes(query)) ||
          (description && (
            contact.company_name?.toLowerCase().includes(description) ||
            contact.industry?.toLowerCase().includes(description) ||
            contact.job_title?.toLowerCase().includes(description)
          ))
        );
      });

      // Create network matches with AI-generated insights
      const matches: NetworkMatch[] = relevantContacts.map(contact => {
        let relevanceScore = 0;
        let connectionReason = "";
        let suggestedApproach = "";

        // Calculate relevance score
        if (contact.company_name?.toLowerCase().includes(searchQuery.toLowerCase())) {
          relevanceScore += 40;
          connectionReason = `Works at ${contact.company_name}`;
        }
        if (contact.industry?.toLowerCase().includes(searchQuery.toLowerCase())) {
          relevanceScore += 30;
          connectionReason += connectionReason ? ` and has experience in ${contact.industry}` : `Has experience in ${contact.industry}`;
        }
        if (contact.job_title?.toLowerCase().includes(searchQuery.toLowerCase())) {
          relevanceScore += 30;
          connectionReason += connectionReason ? ` with relevant role experience` : `Has relevant role experience as ${contact.job_title}`;
        }

        // Base relevance for any match
        if (relevanceScore === 0) relevanceScore = 20;

        // Adjust based on circle
        if (contact.circle === 'inner') relevanceScore += 20;
        else if (contact.circle === 'middle') relevanceScore += 10;

        // Generate suggested approach
        if (contact.circle === 'inner') {
          suggestedApproach = "Reach out directly for advice and insights about the role/company";
        } else if (contact.circle === 'middle') {
          suggestedApproach = "Send a friendly message asking for their perspective on the industry/company";
        } else {
          suggestedApproach = "Connect professionally and ask for general industry insights";
        }

        return {
          contact,
          relevanceScore: Math.min(relevanceScore, 100),
          connectionReason: connectionReason || "Industry connection",
          suggestedApproach
        };
      });

      // Sort by relevance score
      matches.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      setNetworkMatches(matches.slice(0, 10)); // Show top 10 matches
      
      toast({
        title: "Network analysis complete!",
        description: `Found ${matches.length} relevant connections in your network.`
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your network. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 70) return "text-green-600 bg-green-100";
    if (score >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-blue-600 bg-blue-100";
  };

  const getCircleBadgeColor = (circle: string) => {
    switch (circle) {
      case 'inner': return "bg-green-100 text-green-800";
      case 'middle': return "bg-yellow-100 text-yellow-800";
      case 'outer': return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
              <Network className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Network Discovery</h1>
              <p className="text-muted-foreground">Find relevant connections in your network</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Search Criteria</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="searchQuery">Company or Job Title</Label>
                  <Input
                    id="searchQuery"
                    placeholder="e.g., Google, Software Engineer, Tech"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobDescription">Job Description (Optional)</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste a job description for more targeted network analysis..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                  />
                </div>
              </div>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={(!searchQuery.trim() && !jobDescription.trim()) || isAnalyzing}
              className="w-full gap-2"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Search className="h-4 w-4 animate-spin" />
                  Analyzing Network...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Find Connections
                </>
              )}
            </Button>

            <Card className="p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Your Network</span>
              </div>
              <p className="text-sm text-blue-700">
                {contacts.length} total contacts
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {contacts.filter(c => c.circle === 'inner').length} Inner
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {contacts.filter(c => c.circle === 'middle').length} Middle
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {contacts.filter(c => c.circle === 'outer').length} Outer
                </Badge>
              </div>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            {networkMatches.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Network Matches</h2>
                  <span className="text-sm text-muted-foreground">
                    {networkMatches.length} connections found
                  </span>
                </div>
                
                <div className="space-y-4">
                  {networkMatches.map((match, index) => (
                    <Card key={match.contact.id} className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={match.contact.avatar_url || ""} />
                          <AvatarFallback>
                            {match.contact.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{match.contact.name}</h3>
                              <p className="text-muted-foreground">
                                {match.contact.job_title} {match.contact.company_name && `at ${match.contact.company_name}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getRelevanceColor(match.relevanceScore)}>
                                {match.relevanceScore}% match
                              </Badge>
                              <Badge className={getCircleBadgeColor(match.contact.circle)}>
                                {match.contact.circle}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Why they're relevant:</h4>
                              <p className="text-sm text-gray-600">{match.connectionReason}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Suggested approach:</h4>
                              <p className="text-sm text-gray-600">{match.suggestedApproach}</p>
                            </div>
                            
                            {match.contact.industry && (
                              <div>
                                <span className="text-xs text-gray-500">Industry: </span>
                                <Badge variant="outline" className="text-xs">
                                  {match.contact.industry}
                                </Badge>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-2"
                              onClick={() => navigate(`/contact/${match.contact.id}`)}
                            >
                              View Profile
                            </Button>
                            <Button size="sm" className="gap-2">
                              <MessageCircle className="h-3 w-3" />
                              Draft Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="p-8">
                <div className="text-center">
                  <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Discover</h3>
                  <p className="text-muted-foreground">
                    Enter a company, job title, or paste a job description to find relevant connections in your network
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
