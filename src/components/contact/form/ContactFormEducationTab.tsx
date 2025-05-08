
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Contact } from "@/types/contact";

interface ContactFormEducationTabProps {
  formData: Partial<Contact>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ContactFormEducationTab = ({
  formData,
  handleChange,
  handleNumberChange
}: ContactFormEducationTabProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="university">University</Label>
        <Input
          id="university"
          name="university"
          value={formData.university || ""}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="major">Major</Label>
          <Input
            id="major"
            name="major"
            value={formData.major || ""}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minor">Minor</Label>
          <Input
            id="minor"
            name="minor"
            value={formData.minor || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="graduation_year">Graduation Year</Label>
        <Input
          id="graduation_year"
          name="graduation_year"
          type="number"
          min="1900"
          max="2100"
          value={formData.graduation_year || ""}
          onChange={handleNumberChange}
        />
      </div>
    </div>
  );
};
