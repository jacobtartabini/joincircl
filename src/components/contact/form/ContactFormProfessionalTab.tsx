import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Contact } from "@/types/contact";
interface ContactFormProfessionalTabProps {
  formData: Partial<Contact>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}
export const ContactFormProfessionalTab = ({
  formData,
  handleChange
}: ContactFormProfessionalTabProps) => {
  return <div className="space-y-4">
      <div className="space-y-2 rounded-full">
        <Label htmlFor="company_name">Company Name</Label>
        <Input id="company_name" name="company_name" value={formData.company_name || ""} onChange={handleChange} className="rounded-full" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="job_title">Job Title</Label>
        <Input id="job_title" name="job_title" value={formData.job_title || ""} onChange={handleChange} className="rounded-full" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input id="industry" name="industry" value={formData.industry || ""} onChange={handleChange} className="rounded-full" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input id="department" name="department" value={formData.department || ""} onChange={handleChange} className="rounded-full" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="work_address">Work Address</Label>
        <Textarea id="work_address" name="work_address" value={formData.work_address || ""} onChange={handleChange} rows={3} className="rounded-2xl" />
      </div>
    </div>;
};