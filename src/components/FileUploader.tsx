import { Upload, FileText } from 'lucide-react';

interface FileUploaderProps {
  onFileLoad: (content: string, filename: string) => void;
  onStatusChange: (status: 'idle' | 'loading' | 'success' | 'error', progress?: number, error?: string) => void;
}

export default function FileUploader({ onFileLoad, onStatusChange }: FileUploaderProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onStatusChange('loading', 0);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        onFileLoad(content, file.name);
        onStatusChange('success');
        setTimeout(() => onStatusChange('idle'), 1500);
      } catch (error) {
        onStatusChange('error', 0, error instanceof Error ? error.message : 'Unknown error');
        setTimeout(() => onStatusChange('idle'), 3000);
      }
    };
    reader.onerror = () => {
      onStatusChange('error', 0, 'Failed to read file');
      setTimeout(() => onStatusChange('idle'), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center w-full h-64 border-3 border-dashed border-blue-300 rounded-2xl cursor-pointer bg-white hover:bg-blue-50 transition-all duration-300 hover:border-blue-400 hover:shadow-lg"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <div className="p-4 bg-blue-100 rounded-full mb-4">
            <Upload className="w-10 h-10 text-blue-600" />
          </div>
          <p className="mb-2 text-lg font-semibold text-gray-700">
            Upload IIS Log File
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Click to select a .log file (max 500MB)
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".log"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
