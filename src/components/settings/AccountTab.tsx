
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Globe, Moon, Sun, Monitor, LogOut, Loader2 } from "lucide-react";
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
      navigate('/auth');
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

      // Fetch user data for export
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
      
      navigate('/auth');
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
      {/* General Settings */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Language</label>
              <Select 
                value={preferences?.language || 'en'} 
                onValueChange={(value) => updatePreferences({ language: value })}
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Timezone</label>
              <Select 
                value={preferences?.timezone || 'America/New_York'} 
                onValueChange={(value) => updatePreferences({ timezone: value })}
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (UTC-5)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (UTC-6)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (UTC-7)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (UTC-8)</SelectItem>
                  <SelectItem value="America/Anchorage">Alaska Time (UTC-9)</SelectItem>
                  <SelectItem value="Pacific/Honolulu">Hawaii Time (UTC-10)</SelectItem>
                  <SelectItem value="Europe/London">GMT (UTC+0)</SelectItem>
                  <SelectItem value="Europe/Paris">CET (UTC+1)</SelectItem>
                  <SelectItem value="Europe/Athens">EET (UTC+2)</SelectItem>
                  <SelectItem value="Asia/Tokyo">JST (UTC+9)</SelectItem>
                  <SelectItem value="Asia/Shanghai">CST (UTC+8)</SelectItem>
                  <SelectItem value="Australia/Sydney">AEDT (UTC+11)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Theme</label>
            <div className="flex gap-2">
              {[
                { value: "light", icon: Sun, label: "Light" },
                { value: "dark", icon: Moon, label: "Dark" },
                { value: "system", icon: Monitor, label: "System" }
              ].map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  variant={preferences?.theme === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePreferences({ theme: value })}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Email Notifications</label>
              <p className="text-xs text-gray-500">Receive important updates via email</p>
            </div>
            <Switch
              checked={preferences?.email_notifications || false}
              onCheckedChange={(checked) => updatePreferences({ email_notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Push Notifications</label>
              <p className="text-xs text-gray-500">Get notified about activity in real-time</p>
            </div>
            <Switch
              checked={preferences?.push_notifications || false}
              onCheckedChange={(checked) => updatePreferences({ push_notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Marketing Emails</label>
              <p className="text-xs text-gray-500">Receive tips and product updates</p>
            </div>
            <Switch
              checked={preferences?.marketing_emails || false}
              onCheckedChange={(checked) => updatePreferences({ marketing_emails: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <label className="text-sm font-medium text-blue-900">Export Your Data</label>
              <p className="text-xs text-blue-700">Download all your account data</p>
            </div>
            <Button variant="outline" size="sm" className="border-blue-200 text-blue-700" onClick={handleExportData}>
              <Globe className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="text-sm font-medium text-gray-900">Sign Out</label>
              <p className="text-xs text-gray-500">Sign out of your account</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-200 text-gray-700" 
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Sign Out
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <label className="text-sm font-medium text-red-900">Delete Account</label>
              <p className="text-xs text-red-700">Permanently delete your account and data</p>
            </div>
            <Button variant="outline" size="sm" className="border-red-200 text-red-700" onClick={handleDeleteAccount}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountTab;
