import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, Loader2 } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
const ProfileTab = () => {
  const {
    profile,
    loading,
    updateProfile,
    uploadAvatar
  } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    location: "",
    company_name: "",
    job_title: "",
    bio: ""
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone_number: profile.phone_number || "",
        location: profile.location || "",
        company_name: profile.company_name || "",
        job_title: profile.job_title || "",
        bio: profile.bio || ""
      });
    }
  }, [profile]);
  const handleSave = async () => {
    setSaving(true);
    const success = await updateProfile(formData);
    setSaving(false);
  };
  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }
    setUploading(true);
    try {
      await uploadAvatar(file);
    } catch (error) {
      // Error handled in hook
    } finally {
      setUploading(false);
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>;
  }
  return <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {/* Profile Photo */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Profile Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url} alt="Profile" />
                <AvatarFallback className="text-lg font-semibold bg-blue-50 text-blue-700">
                  {profile?.first_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                  {profile?.last_name?.charAt(0) || ''}
                </AvatarFallback>
              </Avatar>
              <button onClick={handlePhotoUpload} disabled={uploading} className="absolute -bottom-1 -right-1 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50 text-base py-[6px]">
                {uploading ? <Loader2 className="h-3 w-3 animate-spin text-gray-600" /> : <Camera className="h-3 w-3 text-gray-600" />}
              </button>
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={handlePhotoUpload} disabled={uploading} className="gap-2 rounded-full">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </Button>
              <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
              <Input id="firstName" value={formData.first_name} onChange={e => setFormData({
              ...formData,
              first_name: e.target.value
            })} className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-full" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
              <Input id="lastName" value={formData.last_name} onChange={e => setFormData({
              ...formData,
              last_name: e.target.value
            })} className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
            <Input id="email" type="email" value={profile?.email || ""} disabled className="border-gray-200 bg-gray-50 text-gray-500" />
            <p className="text-xs text-gray-500">Email cannot be changed here. Contact support if needed.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
            <Input id="phone" value={formData.phone_number} onChange={e => setFormData({
            ...formData,
            phone_number: e.target.value
          })} className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-full" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
            <Input id="location" value={formData.location} onChange={e => setFormData({
            ...formData,
            location: e.target.value
          })} className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company</Label>
            <Input id="company" value={formData.company_name} onChange={e => setFormData({
            ...formData,
            company_name: e.target.value
          })} className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-full" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">Job Title</Label>
            <Input id="title" value={formData.job_title} onChange={e => setFormData({
            ...formData,
            job_title: e.target.value
          })} className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-full" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
            <Textarea id="bio" value={formData.bio} onChange={e => setFormData({
            ...formData,
            bio: e.target.value
          })} rows={4} placeholder="Tell us about yourself..." className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl" />
            <p className="text-xs text-gray-500">Brief description for your profile</p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 px-8 rounded-full">
          {saving ? <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </> : 'Save Changes'}
        </Button>
      </div>
    </div>;
};
export default ProfileTab;