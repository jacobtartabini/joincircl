import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { HelpCircle, MailQuestion, Bug, Scale } from "lucide-react";

const ResourcesTab = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resources</CardTitle>
        <CardDescription>
          Help, support, and additional resources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <Button 
            variant="outline" 
            className="justify-start text-left h-auto py-3"
            onClick={() => navigate('/help')}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            <div>
              <p className="font-medium">Help</p>
              <p className="text-sm text-muted-foreground">Access guides, tutorials and FAQs</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start text-left h-auto py-3"
            onClick={() => navigate('/contact')}
          >
            <MailQuestion className="mr-2 h-4 w-4" />
            <div>
              <p className="font-medium">Contact</p>
              <p className="text-sm text-muted-foreground">Get in touch with our support team</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start text-left h-auto py-3"
            onClick={() => navigate('/bugs')}
          >
            <Bug className="mr-2 h-4 w-4" />
            <div>
              <p className="font-medium">Bugs</p>
              <p className="text-sm text-muted-foreground">Report bugs or technical issues</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start text-left h-auto py-3"
            onClick={() => navigate('/legal')}
          >
            <Scale className="mr-2 h-4 w-4" />
            <div>
              <p className="font-medium">Legal</p>
              <p className="text-sm text-muted-foreground">Terms of service and privacy policy</p>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcesTab;
