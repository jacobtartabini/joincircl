
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SubscriptionTab = () => {
  const { toast } = useToast();
  
  const handleUpgradeClick = () => {
    toast({
      title: "Upgrade Subscription",
      description: "Opening subscription options...",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>
          Manage your subscription plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Current Plan</div>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="mr-2">Free</Badge>
                <span className="text-sm text-muted-foreground">
                  Basic features
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4 bg-muted">
            <h3 className="font-medium">Available Plans</h3>
          </div>
          <div className="p-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Premium</div>
                <div className="text-sm text-muted-foreground">
                  $9.99/month
                </div>
                <div className="mt-2 text-sm">
                  Unlimited contacts, automations, advanced insights
                </div>
              </div>
              <Button onClick={handleUpgradeClick}>Upgrade</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionTab;
