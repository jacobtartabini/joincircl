
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/ClerkAuthContext";
import { useUser } from '@clerk/clerk-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { LogOut } from "lucide-react";

const ClerkAccountTab = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useUser();
  const { deleteAccount, signOut } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      if (!user?.id) {
        throw new Error("User ID not found");
      }
      
      await deleteAccount();
      
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
      navigate("/auth/sign-in");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      
      toast({
        title: "Delete Failed",
        description: "We couldn't delete your account. Please contact support for assistance.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign Out Failed",
        description: "There was a problem signing out.",
        variant: "destructive"
      });
    } finally {
      setIsLogoutDialogOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account with Clerk
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={user?.emailAddresses[0]?.emailAddress || ""}
            disabled
          />
          <p className="text-sm text-muted-foreground mt-1">
            To change your email, use the profile management in Clerk
          </p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={user?.fullName || ""}
            disabled
          />
          <p className="text-sm text-muted-foreground mt-1">
            To change your name, use the profile management in Clerk
          </p>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-md">
          <p className="text-sm">
            Account settings including password changes are managed through Clerk's secure platform. 
            Use the user menu to access your profile settings.
          </p>
        </div>
        
        <Separator className="my-4" />
        <div className="space-y-4">
          <h3 className="font-medium">Account Actions</h3>
          <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                Log Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Log out of your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to log out of your Circl account?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  Log Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t pt-6">
        <h3 className="font-medium text-destructive mb-2">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. All your data will be permanently deleted.
        </p>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default ClerkAccountTab;
