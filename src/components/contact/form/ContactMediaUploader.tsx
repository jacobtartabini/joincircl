import { useRef } from "react";
import { FileImage, File, X } from "lucide-react";
import { Label } from "@/components/ui/label";
interface ContactMediaUploaderProps {
  type: "image" | "document";
  files: File[];
  onUpload: (files: File[]) => void;
  onRemove: (index: number) => void;
  acceptTypes: string;
  label: string;
  description: string;
}
export default function ContactMediaUploader({
  type,
  files,
  onUpload,
  onRemove,
  acceptTypes,
  label,
  description
}: ContactMediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      onUpload(newFiles);
    }
  };
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  return <div className="space-y-2">
      <Label>{label}</Label>
      <div onClick={openFileDialog} className="border-2 border-dashed p-4 cursor-pointer hover:bg-muted/50 transition-colors rounded-2xl">
        <div className="text-center">
          {type === "image" ? <FileImage className="h-8 w-8 mx-auto mb-2 text-muted-foreground" /> : <File className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />}
          <p className="text-sm font-medium">Click to upload {label.toLowerCase()}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <input ref={fileInputRef} type="file" accept={acceptTypes} multiple className="hidden" onChange={handleFileChange} />
      </div>
      
      {files.length > 0 && (type === "image" ? <div className="grid grid-cols-3 gap-2 mt-2">
            {files.map((file, index) => <div key={index} className="relative">
                <img src={URL.createObjectURL(file)} alt={`Upload ${index}`} className="h-20 w-full object-cover rounded" />
                <button type="button" className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5" onClick={e => {
          e.stopPropagation();
          onRemove(index);
        }}>
                  <X size={12} />
                </button>
              </div>)}
          </div> : <div className="space-y-2 mt-2">
            {files.map((file, index) => <div key={index} className="flex justify-between items-center bg-muted p-2 rounded">
                <div className="flex items-center">
                  <File size={16} className="mr-2" />
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                </div>
                <button type="button" className="text-red-500 hover:text-red-700" onClick={e => {
          e.stopPropagation();
          onRemove(index);
        }}>
                  <X size={16} />
                </button>
              </div>)}
          </div>)}
    </div>;
}