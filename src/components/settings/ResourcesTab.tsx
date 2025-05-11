
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { HelpCircle, MailQuestion, Bug, Scale } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";

const ResourcesTab = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  
  const handleLogout = () => {
    console.log("User logged out");
    navigate("/auth");
  };
  
  const handleDeleteAccount = () => {
    console.log("Account deleted");
    navigate("/auth");
  };
  
  const logoutContent = (
    <>
      <div className="space-y-2">
        <p>Are you sure you want to log out?</p>
        <p className="text-sm text-muted-foreground">
          You will need to log back in to access your account.
        </p>
      </div>
      <div className={`flex ${isMobile ? "flex-col-reverse space-y-reverse space-y-2" : "justify-end space-x-2"} pt-4`}>
        <Button 
          variant="outline" 
          onClick={() => setLogoutDialogOpen(false)}
          className={isMobile ? "w-full" : ""}
        >
          Cancel
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleLogout}
          className={isMobile ? "w-full" : ""}
        >
          Log Out
        </Button>
      </div>
    </>
  );
  
  const deleteAccountContent = (
    <>
      <div className="space-y-2">
        <p>Are you sure you want to delete your account?</p>
        <p className="text-sm text-muted-foreground">
          This action cannot be undone. All your data will be permanently deleted.
        </p>
      </div>
      <div className={`flex ${isMobile ? "flex-col-reverse space-y-reverse space-y-2" : "justify-end space-x-2"} pt-4`}>
        <Button 
          variant="outline" 
          onClick={() => setDeleteAccountDialogOpen(false)}
          className={isMobile ? "w-full" : ""}
        >
          Cancel
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleDeleteAccount}
          className={isMobile ? "w-full" : ""}
        >
          Delete Account
        </Button>
      </div>
    </>
  );
  
  return (
    <>
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
            
            <div className="pt-4 border-t mt-4">
              <h3 className="text-sm font-medium mb-3">Account Actions</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => setLogoutDialogOpen(true)}
                >
                  Log Out
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
                  onClick={() => setDeleteAccountDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal/Sheet for Logout */}
      {isMobile ? (
        <Sheet open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <SheetContent side="bottom" className="pb-6">
            <SheetHeader className="mb-4">
              <SheetTitle>Log Out</SheetTitle>
              <SheetDescription>
                You're about to log out from your account
              </SheetDescription>
            </SheetHeader>
            {logoutContent}
          </SheetContent>
        </Sheet>
      ) : (
        <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Log Out</AlertDialogTitle>
              <AlertDialogDescription>
                You're about to log out from your account
              </AlertDialogDescription>
            </AlertDialogHeader>
            {logoutContent}
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      {/* Modal/Sheet for Delete Account */}
      {isMobile ? (
        <Sheet open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
          <SheetContent side="bottom" className="pb-6">
            <SheetHeader className="mb-4">
              <SheetTitle>Delete Account</SheetTitle>
              <SheetDescription>
                This action cannot be undone
              </SheetDescription>
            </SheetHeader>
            {deleteAccountContent}
          </SheetContent>
        </Sheet>
      ) : (
        <AlertDialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteAccountContent}
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default ResourcesTab;
