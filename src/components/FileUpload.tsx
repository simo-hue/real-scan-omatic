import { useCallback, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Video } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export const FileUpload = ({ onFilesSelected }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') || 
                     file.type.startsWith('video/') || 
                     file.type.startsWith('text/') ||
                     file.type === 'application/pdf';
      
      if (!isValid) {
        toast({
          title: "Tipo di file non supportato",
          description: `${file.name} non è un file valido`,
          variant: "destructive",
        });
      }
      return isValid;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      onFilesSelected(validFiles);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="w-full space-y-6">
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all ${
          dragActive 
            ? 'border-accent bg-accent/5 scale-[1.02]' 
            : 'border-border bg-card hover:border-accent/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onChange={handleChange}
          accept="image/*,video/*,text/*,.pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="p-12 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl">
              <Upload className="h-10 w-10 text-accent" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              Trascina i file qui
            </p>
            <p className="text-sm text-muted-foreground">
              oppure clicca per selezionare
            </p>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Supporta immagini, video, testo e PDF
          </p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            File selezionati ({selectedFiles.length})
          </p>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-accent/50 transition-all group"
              >
                <div className="text-muted-foreground">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
