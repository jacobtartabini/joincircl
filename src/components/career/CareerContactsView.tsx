
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Building,
  User,
  Star,
  Plus
} from "lucide-react";
import { useContacts } from "@/hooks/use-contacts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export default function CareerContactsView() {
  const { contacts } = useContacts();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Filter contacts to show only career-related ones
  const careerContacts = contacts.filter(contact => {
    const isCareerRelated = 
      contact.career_priority || 
      contact.job_title || 
      contact.company_name ||
      (contact.career_tags && contact.career_tags.length > 0) ||
      (contact.tags && contact.tags.some(tag => 
        ['recruiter', 'mentor', 'hiring manager', 'hr', 'career', 'internship', 'job'].some(keyword =>
          tag.toLowerCase().includes(keyword)
        )
      ));
    
    if (!isCareerRelated) return false;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchLower) ||
        contact.company_name?.toLowerCase().includes(searchLower) ||
        contact.job_title?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Apply category filter
    if (selectedFilter !== "all") {
      if (selectedFilter === "priority" && !contact.career_priority) return false;
      if (selectedFilter === "recent" && contact.last_contact) {
        const lastContact = new Date(contact.last_contact);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (lastContact < weekAgo) return false;
      }
    }

    return true;
  });

  const toggleCareerPriority = async (contactId: string, currentPriority: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await (supabase as any)
        .from('contacts')
        .update({ career_priority: !currentPriority })
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating career priority:', error);
      }
    } catch (error) {
      console.error('Error updating career priority:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Career Contacts</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your professional network ({careerContacts.length} contacts)
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Career Contact
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contacts by name, company, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("all")}
          >
            All
          </Button>
          <Button
            variant={selectedFilter === "priority" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("priority")}
          >
            <Star className="h-3 w-3 mr-1" />
            Priority
          </Button>
          <Button
            variant={selectedFilter === "recent" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("recent")}
          >
            Recent
          </Button>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {careerContacts.map((contact) => (
          <Card key={contact.id} className="p-6 glass-card hover:glass-card-enhanced transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contact.avatar_url || ''} />
                  <AvatarFallback>
                    {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
                  {contact.job_title && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{contact.job_title}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCareerPriority(contact.id, contact.career_priority || false)}
                className="p-1"
              >
                <Star 
                  className={`h-4 w-4 ${
                    contact.career_priority 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-400'
                  }`} 
                />
              </Button>
            </div>

            <div className="space-y-2 mb-4">
              {contact.company_name && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building className="h-3 w-3" />
                  <span>{contact.company_name}</span>
                </div>
              )}
              
              {contact.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-3 w-3" />
                  <span>{contact.location}</span>
                </div>
              )}

              {contact.last_contact && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span>Last contact: {format(new Date(contact.last_contact), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {(contact.tags || contact.career_tags) && (
              <div className="flex flex-wrap gap-1 mb-4">
                {contact.tags?.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {contact.career_tags?.slice(0, 2).map((tag, index) => (
                  <Badge key={`career-${index}`} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {contact.personal_email && (
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
              )}
              
              {contact.mobile_phone && (
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
              )}
              
              <Button variant="outline" size="sm">
                <User className="h-3 w-3" />
              </Button>
            </div>

            {/* Arlo Suggestions */}
            {contact.career_priority && !contact.last_contact && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 Arlo suggests: Send an introduction message to build this connection
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {careerContacts.length === 0 && (
        <Card className="p-12 text-center glass-card">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Career Contacts Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start building your professional network by adding career-related contacts
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Career Contact
          </Button>
        </Card>
      )}
    </div>
  );
}
