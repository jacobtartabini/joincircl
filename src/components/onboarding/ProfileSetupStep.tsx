
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Loader2, User } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';

interface ProfileSetupStepProps {
  onNext: (data?: any) => void;
  onSkip: () => void;
}

export default function ProfileSetupStep({ onNext, onSkip }: ProfileSetupStepProps) {
  const { profile, updateProfile, uploadAvatar } = useUserProfile();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone_number: profile?.phone_number || '',
    location: profile?.location || '',
    company_name: profile?.company_name || '',
    job_title: profile?.job_title || '',
    bio: profile?.bio || '',
  });

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      return;
    }

    setUploading(true);
    try {
      await uploadAvatar(file);
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = async () => {
    setSaving(true);
    try {
      const success = await updateProfile(formData);
      if (success) {
        onNext({ profileData: formData });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const isBasicInfoComplete = formData.first_name && formData.last_name;
  const getCompletionPercentage = () => {
    const fields = Object.values(formData);
    const filledFields = fields.filter(field => field && field.trim()).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        className="hidden" 
      />

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <User className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Complete Your Profile</h1>
        <p className="text-lg text-muted-foreground">Help others recognize and connect with you</p>
        <div className="mt-2">
          <span className="text-sm text-blue-600 font-medium">{getCompletionPercentage()}% Complete</span>
        </div>
      </div>

      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={profile?.avatar_url} alt="Profile" />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {formData.first_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                  {formData.last_name?.charAt(0) || ''}
                </AvatarFallback>
              </Avatar>
              <button 
                onClick={handlePhotoUpload} 
                disabled={uploading}
                className="absolute -bottom-2 -right-2 p-2 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                ) : (
                  <Camera className="h-4 w-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                  First Name *
                </Label>
                <Input 
                  id="firstName"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="rounded-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                  Last Name *
                </Label>
                <Input 
                  id="lastName"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="rounded-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</Label>
                <Input 
                  id="phone"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className="rounded-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-foreground">Location</Label>
                <Input 
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="rounded-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="City, Country"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b pb-2">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium text-foreground">Company</Label>
                <Input 
                  id="company"
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  className="rounded-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Your company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="text-sm font-medium text-foreground">Job Title</Label>
                <Input 
                  id="jobTitle"
                  value={formData.job_title}
                  onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                  className="rounded-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Your job title"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium text-foreground">Bio</Label>
            <Textarea 
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
              placeholder="Tell us a bit about yourself..."
            />
          </div>

          <div className="pt-6 flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
            
            <Button 
              onClick={handleContinue}
              disabled={!isBasicInfoComplete || saving}
              className="bg-blue-600 hover:bg-blue-700 px-8 rounded-full min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
