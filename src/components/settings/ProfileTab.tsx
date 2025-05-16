
import { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { offlineStorage } from "@/services/offlineStorage";

const ProfileTab = () => {
  const { toast } = useToast();
  const { user, profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check for locally cached avatar image when offline
  useEffect(() => {
    const loadCachedProfileImage = async () => {
      if (!user) return;
      
      // If we have an avatar URL but are offline, try to load from cache
      if (profile?.avatar_url && !navigator.onLine) {
        try {
          const cachedImage = await offlineStorage.profileImage.get(user.id);
          if (cachedImage) {
            const imageUrl = URL.createObjectURL(cachedImage);
            setLocalAvatarUrl(imageUrl);
          }
        } catch (error) {
          console.error("Error loading cached profile image:", error);
        }
      } else {
        setLocalAvatarUrl(null);
      }
    };
    
    loadCachedProfileImage();
  }, [user, profile?.avatar_url]);

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
        // Also cache the image for offline use
        await offlineStorage.profileImage.save(user.id, file);
        
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

  // Choose avatar URL source based on online status and availability
  const displayAvatarUrl = localAvatarUrl || avatarUrl || '';

  return (
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
            <AvatarImage src={displayAvatarUrl} />
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
                disabled={uploading || !navigator.onLine}
                asChild
              >
                <span>
                  <Upload size={16} className="mr-1" />
                  {uploading ? "Uploading..." : !navigator.onLine ? "Need to be online" : "Upload Photo"}
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
  );
};

export default ProfileTab;
