import { useCallback, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Video, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { z } from 'zod';

const urlSchema = z.string().url({ message: "URL non valido" }).max(2048, { message: "URL troppo lungo" });

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onUrlSubmit: (url: string) => void;
}

export const FileUpload = ({ onFilesSelected, onUrlSubmit }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
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

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUrl = urlInput.trim();
    
    // Validate URL
    const validation = urlSchema.safeParse(trimmedUrl);
    if (!validation.success) {
      toast({
        title: "URL non valido",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsValidatingUrl(true);
    try {
      onUrlSubmit(trimmedUrl);
      setUrlInput('');
      toast({
        title: "URL accettato",
        description: "Avvia l'analisi per processare il contenuto",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile processare l'URL",
        variant: "destructive",
      });
    } finally {
      setIsValidatingUrl(false);
    }
  };

  return (
    <div className="w-full space-y-6 p-6 bg-card/60 backdrop-blur-sm rounded-xl">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-effect">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Da URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6 mt-6">
          <div
            className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
              dragActive 
                ? 'border-primary bg-primary/5 scale-[1.02] shadow-[0_0_30px_hsl(217_91%_60%_/_0.3)]' 
                : 'border-border/50 bg-card/30 hover:border-primary/50 hover:bg-primary/5'
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
                <div className="p-6 bg-gradient-to-br from-primary/20 to-accent-purple/20 rounded-2xl backdrop-blur-sm border border-primary/20 animate-pulse-glow">
                  <Upload className="h-12 w-12 text-primary" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xl font-semibold text-foreground">
                  Trascina i file qui
                </div>
                <div className="text-sm text-muted-foreground">
                  oppure clicca per selezionare
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary/50" />
                <span>Immagini • Video • Testo • PDF</span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary/50" />
              </div>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="h-5 w-1 bg-gradient-to-b from-primary to-accent-purple rounded-full" />
                File selezionati ({selectedFiles.length})
              </div>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 glass-effect rounded-xl hover:border-primary/50 transition-all duration-300 group hover:scale-[1.02]"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
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
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="url" className="space-y-6 mt-6">
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div className="glass-effect p-8 rounded-xl border border-border/50 space-y-4">
              <div className="flex justify-center">
                <div className="p-6 bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 rounded-2xl backdrop-blur-sm border border-accent-cyan/20 animate-pulse-glow">
                  <LinkIcon className="h-12 w-12 text-accent-cyan" />
                </div>
              </div>

              <div className="space-y-2 text-center">
                <div className="text-xl font-semibold text-foreground">
                  Inserisci URL da analizzare
                </div>
                <div className="text-sm text-muted-foreground">
                  Pagine web, immagini, video o documenti online
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://esempio.com/immagine.jpg"
                  className="glass-effect border-primary/30 focus:border-primary text-foreground"
                  disabled={isValidatingUrl}
                />
                <div className="text-xs text-muted-foreground text-center">
                  Supporta link diretti a immagini, video, pagine web e PDF
                </div>
              </div>

              <Button
                type="submit"
                disabled={!urlInput.trim() || isValidatingUrl}
                className="w-full bg-gradient-to-r from-accent-cyan via-accent-purple to-primary hover:opacity-90 transition-all"
              >
                {isValidatingUrl ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Validazione...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Aggiungi URL
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};
