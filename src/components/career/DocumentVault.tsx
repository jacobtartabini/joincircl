
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Eye, Trash2 } from "lucide-react";

export default function DocumentVault() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Document Vault</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Store and manage your career documents
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Coming Soon Placeholder */}
      <Card className="p-12 text-center glass-card">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Document Vault Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Upload and organize your resumes, cover letters, and portfolio materials
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          💡 Arlo will help optimize your documents with AI-powered suggestions
        </p>
      </Card>
    </div>
  );
}
