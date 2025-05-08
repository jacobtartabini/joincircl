import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { LogOut, HelpCircle, MailQuestion, Bug, Scale, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, updateProfile, deleteAccount, signOut } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    if (user && profile) {
      setName(profile.full_name || "");
      setEmail(user.email || "");
      setBio(profile.bio || "");
      setPhoneNumber(profile.phone_number || "");
      setAvatarUrl(profile.avatar_url || null);
      
      // Check if the user signed in with Google
      setIsGoogleUser(user.app_metadata?.provider === 'google');
    }
  }, [user, profile]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateProfile({
        full_name: name,
        bio: bio,
        phone_number: phoneNumber
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    setUploading(true);

    try {
      // Delete old avatar if exists
      if (profile?.avatar_url) {
        try {
          const urlParts = profile.avatar_url.split('/');
          const oldFilePath = urlParts.slice(urlParts.indexOf('avatars') + 1).join('/');
          
          if (oldFilePath) {
            await supabase.storage.from('avatars').remove([oldFilePath]);
          }
        } catch (removeError) {
          console.error("Error removing old avatar:", removeError);
          // Continue even if there's an error removing the old avatar
        }
      }

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        // Update user profile with new avatar URL
        await updateProfile({ avatar_url: data.publicUrl });
        setAvatarUrl(data.publicUrl);

        toast({
          title: "Avatar Updated",
          description: "Your profile picture has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Your new password and confirmation password do not match.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });
      
      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Password Update Failed",
        description: error.message || "There was a problem updating your password.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  const handleUpgradeClick = () => {
    toast({
      title: "Upgrade Subscription",
      description: "Opening subscription options...",
    });
  };
  
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-start gap-2 mb-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarUrl || ''} />
                  <AvatarFallback className="text-lg">
                    {name ? name.charAt(0).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Input 
                    id="avatar-upload" 
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload} 
                  />
                  <label htmlFor="avatar-upload">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="cursor-pointer flex items-center gap-1 mt-2" 
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <Upload size={16} className="mr-1" />
                        {uploading ? "Uploading..." : "Upload Photo"}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Your phone number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about yourself"
                    rows={4}
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Update your email and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Contact support to change your email address
                </p>
              </div>
              
              {isGoogleUser ? (
                <div className="p-4 bg-blue-50 rounded-md">
                  <p className="text-sm">
                    You signed in with Google. To manage your password, please visit your Google account settings.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              )}
              
              <Separator className="my-4" />
              <div className="space-y-4">
                <h3 className="font-medium">Account Actions</h3>
                <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2"
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
        </TabsContent>
        
        <TabsContent value="subscription" className="space-y-4 mt-4">
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
        </TabsContent>

        <TabsContent value="resources" className="space-y-4 mt-4">
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
        </TabsContent>
      </Tabs>
      
      <footer className="border-t pt-6 pb-8 text-center text-sm text-muted-foreground">
        © 2025 Jacob Tartabini. All rights reserved. Unauthorized reproduction or distribution of any content is prohibited.
      </footer>
    </div>
  );
};

export default Settings;
