
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Contact } from "@/types/contact";

interface ContactFormBasicTabProps {
  formData: Partial<Contact>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCircleChange: (value: string) => void;
  birthday?: Date;
  handleBirthdayDayChange: (date: Date | undefined) => void;
}

export const ContactFormBasicTab = ({
  formData,
  handleChange,
  handleCircleChange,
  birthday,
  handleBirthdayDayChange
}: ContactFormBasicTabProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="personal_email">Personal Email</Label>
        <Input
          id="personal_email"
          name="personal_email"
          type="email"
          value={formData.personal_email || ""}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobile_phone">Mobile Phone</Label>
        <Input
          id="mobile_phone"
          name="mobile_phone"
          value={formData.mobile_phone || ""}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          type="url"
          placeholder="https://"
          value={formData.website || ""}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthday">Birthday</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !birthday && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {birthday ? format(birthday, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={birthday}
              onSelect={handleBirthdayDayChange}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          placeholder="City, Country"
          value={formData.location || ""}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label>Social Media Profiles</Label>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="linkedin" className="text-xs text-muted-foreground">LinkedIn</Label>
            <Input
              id="linkedin"
              name="linkedin"
              value={formData.linkedin || "https://www.linkedin.com/in/"}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="facebook" className="text-xs text-muted-foreground">Facebook</Label>
            <Input
              id="facebook"
              name="facebook"
              value={formData.facebook || "https://www.facebook.com/"}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="twitter" className="text-xs text-muted-foreground">Twitter</Label>
            <Input
              id="twitter"
              name="twitter"
              value={formData.twitter || "https://www.twitter.com/"}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="instagram" className="text-xs text-muted-foreground">Instagram</Label>
            <Input
              id="instagram"
              name="instagram"
              value={formData.instagram || "https://www.instagram.com/"}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="circle">Circle</Label>
        <Select
          value={formData.circle}
          onValueChange={handleCircleChange}
        >
          <SelectTrigger id="circle">
            <SelectValue placeholder="Select circle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inner">Inner Circle</SelectItem>
            <SelectItem value="middle">Middle Circle</SelectItem>
            <SelectItem value="outer">Outer Circle</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
