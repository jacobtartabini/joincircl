import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Building, Mail, Phone } from "lucide-react";
import { useContacts } from "@/hooks/use-contacts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export default function CareerContactsView() {
  const {
    contacts
  } = useContacts();
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter contacts that are career-related
  const careerContacts = contacts.filter(contact => contact.career_priority === true || contact.career_tags?.length > 0);
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Career Contacts</h3>
        <Button onClick={() => setShowAddForm(true)} size="sm" className="gap-2 glass-button rounded-full">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {careerContacts.length === 0 ? <Card className="p-8 text-center glass-card">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium text-foreground mb-2">No Career Contacts Yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Start building your professional network by adding career contacts
          </p>
          <Button onClick={() => setShowAddForm(true)} className="glass-button">
            Add Your First Contact
          </Button>
        </Card> : <div className="grid grid-cols-1 gap-3">
          {careerContacts.map(contact => <Card key={contact.id} className="p-4 glass-card hover:glass-card-enhanced transition-all duration-200">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contact.avatar_url || ""} alt={contact.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{contact.name}</h4>
                  {contact.job_title && <p className="text-sm text-muted-foreground truncate">{contact.job_title}</p>}
                  {contact.company_name && <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Building className="h-3 w-3" />
                      <span className="truncate">{contact.company_name}</span>
                    </div>}
                  
                  {contact.career_tags && contact.career_tags.length > 0 && <div className="flex flex-wrap gap-1 mt-2">
                      {contact.career_tags.slice(0, 2).map((tag, index) => <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>)}
                      {contact.career_tags.length > 2 && <Badge variant="outline" className="text-xs">
                          +{contact.career_tags.length - 2}
                        </Badge>}
                    </div>}
                </div>

                <div className="flex flex-col gap-1">
                  {contact.personal_email && <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Mail className="h-4 w-4" />
                    </Button>}
                  {contact.mobile_phone && <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Phone className="h-4 w-4" />
                    </Button>}
                </div>
              </div>
            </Card>)}
        </div>}
    </div>;
}