
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, Linkedin, Phone, Users } from 'lucide-react';

// Change to named export for consistency
export const UserOnboarding = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("welcome");
  
  useEffect(() => {
    // Check if this is the user's first visit
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    
    if (user && !hasSeenOnboarding) {
      // Delay showing the onboarding dialog to prevent it from showing immediately on login
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user]);
  
  const handleClose = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsOpen(false);
  };
  
  const nextStep = (nextTab: string) => {
    setActiveTab(nextTab);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Circl</DialogTitle>
          <DialogDescription>
            Let's help you get started with your relationship management journey.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="welcome">1. Welcome</TabsTrigger>
            <TabsTrigger value="import">2. Import</TabsTrigger>
            <TabsTrigger value="tips">3. Tips</TabsTrigger>
          </TabsList>
          
          <TabsContent value="welcome" className="p-2 space-y-4">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Your Relationship Hub</h3>
              <p className="text-center mb-4">
                Circl helps you maintain and strengthen your relationships with important people in your life.
              </p>
              
              <div className="w-full space-y-3">
                <div className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-3">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Organize Your Network</h4>
                    <p className="text-sm text-muted-foreground">Keep track of all your contacts in one place</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-3">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Remember Important Dates</h4>
                    <p className="text-sm text-muted-foreground">Never miss birthdays, anniversaries or other keystones</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-3">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Strengthen Connections</h4>
                    <p className="text-sm text-muted-foreground">Get insights on how to nurture your relationships</p>
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={() => nextStep("import")} className="w-full">
              Next: Import Contacts
            </Button>
          </TabsContent>
          
          <TabsContent value="import" className="p-2 space-y-4">
            <h3 className="text-lg font-medium mb-2">Add Your First Contacts</h3>
            <p className="mb-4">
              Start by importing existing contacts or add them manually.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-md p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="flex justify-center mb-2">
                  <Linkedin className="h-8 w-8 text-[#0077B5]" />
                </div>
                <h4 className="text-center font-medium">Import from LinkedIn</h4>
                <p className="text-center text-sm text-muted-foreground mt-1">
                  Connect to LinkedIn to import your professional connections
                </p>
              </div>
              
              <div className="border rounded-md p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="flex justify-center mb-2">
                  <Phone className="h-8 w-8 text-gray-700" />
                </div>
                <h4 className="text-center font-medium">Import from Contacts</h4>
                <p className="text-center text-sm text-muted-foreground mt-1">
                  Import contacts from your phone or device
                </p>
              </div>
            </div>
            
            <div className="flex items-center py-2">
              <div className="flex-grow h-px bg-gray-200"></div>
              <span className="px-3 text-sm text-muted-foreground">or</span>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>
            
            <Button variant="outline" className="w-full">
              Add Contacts Manually
            </Button>
            
            <Button onClick={() => nextStep("tips")} className="w-full">
              Next: Tips & Tricks
            </Button>
          </TabsContent>
          
          <TabsContent value="tips" className="p-2 space-y-4">
            <h3 className="text-lg font-medium mb-2">Tips for Success</h3>
            
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium flex items-center">
                  <Badge className="mr-2">Tip 1</Badge> Organize with Circles
                </h4>
                <p className="text-sm mt-1">
                  Sort contacts into Inner, Middle, and Outer circles based on their importance in your life.
                </p>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium flex items-center">
                  <Badge className="mr-2">Tip 2</Badge> Track Important Dates
                </h4>
                <p className="text-sm mt-1">
                  Add birthdays, anniversaries, and other keystones to ensure you never miss important events.
                </p>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium flex items-center">
                  <Badge className="mr-2">Tip 3</Badge> Log Your Interactions
                </h4>
                <p className="text-sm mt-1">
                  Keep notes after each meaningful interaction to remember important details for future conversations.
                </p>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium flex items-center">
                  <Badge className="mr-2">Tip 4</Badge> Review Connection Insights
                </h4>
                <p className="text-sm mt-1">
                  Check the insights section for each contact to get suggestions on strengthening your relationship.
                </p>
              </div>
            </div>
            
            <Button onClick={handleClose} className="w-full">
              Get Started with Circl
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Skip tutorial
          </Button>
          <div className="text-sm text-muted-foreground">
            Step {activeTab === "welcome" ? "1" : activeTab === "import" ? "2" : "3"} of 3
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add default export as well for backward compatibility
export default UserOnboarding;
