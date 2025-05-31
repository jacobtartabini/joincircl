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
      navigate('/signin'); // Updated to navigate to /signin
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

      navigate('/signin'); // Updated to navigate to /signin
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
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language & Timezone */}
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

          {/* Theme */}
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

      {/* Notifications */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              label: "Email Notifications",
              description: "Receive important updates via email",
              key: "email_notifications"
            },
            {
              label: "Push Notifications",
              description: "Get notified about activity in real-time",
              key: "push_notifications"
            },
            {
              label: "Marketing Emails",
              description: "Receive tips and product updates",
              key: "marketing_emails"
            }
          ].map(({ label, description, key }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">{label}</label>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
              <Switch
                checked={preferences?.[key] || false}
                onCheckedChange={(checked) => updatePreferences({ [key]: checked })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleExportData} variant="outline">
            <Globe className="mr-2 h-4 w-4" />
            Export My Data
          </Button>
          <Button onClick={handleDeleteAccount} variant="destructive">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Delete My Account
          </Button>
          <Button onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging Out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountTab;
