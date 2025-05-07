
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold">Help Center</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Welcome to Circl! This help center provides guides and resources to help you get the most out of your relationship management.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div className="border p-4 rounded-md">
                <h4 className="text-base font-medium">How do I add a new contact?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Click the "Add Contact" button on the Home or Circles page to create a new contact. Fill out the form with contact details and assign them to a circle.
                </p>
              </div>
              <div className="border p-4 rounded-md">
                <h4 className="text-base font-medium">What are Keystones?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Keystones are important events or reminders related to your contacts. Use them to keep track of birthdays, follow-ups, or other significant dates.
                </p>
              </div>
              <div className="border p-4 rounded-md">
                <h4 className="text-base font-medium">How do circles work?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Circles help you organize your contacts based on relationship closeness. Inner circle contacts are your closest relationships, middle circle for regular connections, and outer circle for occasional interactions.
                </p>
              </div>
              <div className="border p-4 rounded-md">
                <h4 className="text-base font-medium">How do I log interactions with contacts?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Click the "Interaction" button on any contact card to record calls, meetings, emails or other interactions. These interactions help you keep track of your communication history.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Video Tutorials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border p-4 rounded-md">
                <h4 className="text-base font-medium">Getting Started with Circl</h4>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  A complete overview of the core features and how to use them.
                </p>
                <div className="bg-gray-100 h-32 flex items-center justify-center rounded">
                  <p className="text-sm text-muted-foreground">Video Tutorial</p>
                </div>
              </div>
              <div className="border p-4 rounded-md">
                <h4 className="text-base font-medium">Advanced Contact Management</h4>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Tips and tricks for effectively organizing your network.
                </p>
                <div className="bg-gray-100 h-32 flex items-center justify-center rounded">
                  <p className="text-sm text-muted-foreground">Video Tutorial</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Link to="/contact">
              <Button>Still Need Help? Contact Support</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
