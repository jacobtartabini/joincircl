import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Monitor, Loader2 } from "lucide-react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AccountTab = () => {
  const { preferences, loading, updatePreferences } = useUserPreferences();
  const [signingOut, setSigningOut] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/signin'); // <- updated route
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
    setSigningOut(false);
  };

  const handleExportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileData, contactsData, interactionsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('contacts').select('*').eq('user_id', user.id),
        supabase.from('interactions').select('*').eq('user_id', user.id)
      ]);

      const exportData = {
        profile: profileData.data,
        contacts: contactsData.data,
        interactions: interactionsData.data,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `circl-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Data export downloaded successfully",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('delete-account', {
        method: 'POST'
      });

      if (error) throw error;

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
      });

      navigate('/signin'); // <- updated route
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings Card goes here */}
      {/* Notification Preferences Card goes here */}
      {/* Account Actions and Log Out Button go here */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleExportData} variant="outline">
            Export My Data
          </Button>
          <Button onClick={handleDeleteAccount} variant="destructive">
            Delete My Account
          </Button>
          <Button onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountTab;
