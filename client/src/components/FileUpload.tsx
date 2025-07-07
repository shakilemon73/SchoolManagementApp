import { useState } from 'react';
import { supabaseFeatures } from '@shared/supabase';
import { Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  studentId: string;
  folder?: string;
  onUploadComplete?: (fileUrl: string) => void;
}

export function FileUpload({ studentId, folder = 'documents', onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadResult = await supabaseFeatures.uploadStudentFile(file, studentId, folder);
      const fileUrl = supabaseFeatures.getFileUrl(uploadResult.path);
      
      setUploadedFiles(prev => [...prev, fileUrl]);
      onUploadComplete?.(fileUrl);
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded to student records.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'Click to upload files'}
              </p>
              <p className="text-xs text-gray-500">
                PDF, Word documents, or images up to 10MB
              </p>
            </div>
          </label>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Uploaded Files:</h4>
            {uploadedFiles.map((fileUrl, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <File className="h-4 w-4" />
                <span className="text-sm">File {index + 1}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(fileUrl, '_blank')}
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}