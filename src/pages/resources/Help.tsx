
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Help() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground">
            Guides and resources to help you use Circl
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-medium">Welcome to Circl!</h3>
            <p className="text-sm text-muted-foreground">
              This help center provides guides and resources to help you get the most out of your relationship management.
            </p>
            
            <h3 className="font-medium">Frequently Asked Questions</h3>
            <div className="space-y-2">
              <div className="border p-3 rounded-md">
                <h4 className="text-sm font-medium">How do I add a new contact?</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Click the "Add Contact" button on the Home or Circles page to create a new contact. Fill out the form with contact details and assign them to a circle.
                </p>
              </div>
              <div className="border p-3 rounded-md">
                <h4 className="text-sm font-medium">What are Keystones?</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Keystones are important events or reminders related to your contacts. Use them to keep track of birthdays, follow-ups, or other significant dates.
                </p>
              </div>
              <div className="border p-3 rounded-md">
                <h4 className="text-sm font-medium">How are circles organized?</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Circles help you organize your contacts based on relationship strength: Inner Circle for closest connections, Middle Circle for regular contacts, and Outer Circle for occasional connections.
                </p>
              </div>
              <div className="border p-3 rounded-md">
                <h4 className="text-sm font-medium">How do I log interactions?</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Click the "Interaction" button on any contact card to log a call, meeting, email, or other type of interaction. This helps you track your communication history.
                </p>
              </div>
              <div className="border p-3 rounded-md">
                <h4 className="text-sm font-medium">What are the contact insights?</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Insights provide analysis of your relationship with a contact, including connection strength and suggestions for maintaining the relationship.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
