
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

const SubscriptionTab = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  
  const handleUpgradeClick = () => {
    setIsUpgradeOpen(true);
  };

  const handleCloseUpgrade = () => {
    setIsUpgradeOpen(false);
    toast({
      title: "Subscription Dialog Closed",
      description: "You can upgrade anytime from settings.",
    });
  };

  const upgradeContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Premium Plan Details</h3>
        <p className="text-sm text-muted-foreground">
          Upgrade to our Premium plan to unlock all features
        </p>
      </div>
      
      <div className="bg-muted p-4 rounded-lg space-y-2">
        <div className="font-medium">Premium Plan - $9.99/month</div>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center">✓ Unlimited contacts</li>
          <li className="flex items-center">✓ Advanced automation tools</li>
          <li className="flex items-center">✓ Detailed analytics and insights</li>
          <li className="flex items-center">✓ Priority customer support</li>
          <li className="flex items-center">✓ Custom tags and fields</li>
        </ul>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={handleCloseUpgrade}>Cancel</Button>
        <Button>Confirm Upgrade</Button>
      </div>
    </div>
  );

  // Render on mobile using Sheet (slide-in panel)
  if (isMobile) {
    return (
      <>
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

        <Sheet open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
          <SheetContent side="bottom" className="h-[80vh] overflow-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Upgrade Subscription</SheetTitle>
              <SheetDescription>
                Upgrade your plan for more features
              </SheetDescription>
            </SheetHeader>
            {upgradeContent}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Render on desktop using Dialog
  return (
    <>
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

      <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Subscription</DialogTitle>
            <DialogDescription>
              Upgrade your plan for more features
            </DialogDescription>
          </DialogHeader>
          {upgradeContent}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionTab;
