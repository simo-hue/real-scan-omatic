import { useCallback, useState, useEffect } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Video, Link as LinkIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { z } from 'zod';
// @ts-ignore - heic2any doesn't have types
import heic2any from 'heic2any';

const urlSchema = z.string().url({ message: "URL non valido" }).max(2048, { message: "URL troppo lungo" });

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onUrlSubmit: (url: string) => void;
}

interface FileWithPreview {
  file: File;
  preview?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    pageCount?: number;
  };
}

export const FileUpload = ({ onFilesSelected, onUrlSubmit }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [acceptedUrl, setAcceptedUrl] = useState<string>('');
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [currentConvertingFile, setCurrentConvertingFile] = useState<string>('');
  const { toast } = useToast();

  // Cleanup preview URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      selectedFiles.forEach(item => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [selectedFiles]);

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

  const extractImageMetadata = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  };

  const extractVideoMetadata = (file: File): Promise<{ duration: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({
          duration: video.duration
        });
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load video'));
      };
      
      video.src = url;
    });
  };

  const extractPdfMetadata = async (file: File): Promise<{ pageCount: number }> => {
    // PDF page count extraction would require pdf.js library
    // For now, return a placeholder
    return { pageCount: 0 };
  };

  const convertHeicToJpg = async (file: File): Promise<File> => {
    try {
      console.log('Converting HEIC file:', file.name);
      
      // Convert HEIC to JPEG blob with optimized quality for faster conversion
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8 // Reduced from 0.9 for faster conversion
      });
      
      // Handle array of blobs (heic2any can return array)
      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      
      // Create new File from blob with .jpg extension
      const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      const convertedFile = new File([blob], newFileName, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      console.log('HEIC conversion successful:', newFileName);
      return convertedFile;
    } catch (error) {
      console.error('HEIC conversion error:', error);
      throw new Error('Impossibile convertire il file HEIC');
    }
  };

  const handleFiles = async (files: File[]) => {
    setIsConverting(true);
    setConversionProgress(0);
    
    try {
      const processedFiles: File[] = [];
      const totalFiles = files.length;
      let processedCount = 0;
      
      for (const file of files) {
        // Check if file is HEIC/HEIF and convert it
        const isHeic = file.type === 'image/heic' || 
                      file.type === 'image/heif' || 
                      file.name.match(/\.(heic|heif)$/i);
        
        if (isHeic) {
          setCurrentConvertingFile(file.name);
          setConversionProgress((processedCount / totalFiles) * 100);
          
          try {
            const convertedFile = await convertHeicToJpg(file);
            processedFiles.push(convertedFile);
            
            toast({
              title: "✓ Conversione completata",
              description: `${file.name} → JPG`,
              duration: 2000,
            });
          } catch (conversionError) {
            toast({
              title: "Errore conversione",
              description: `Impossibile convertire ${file.name}. Usa JPG o PNG`,
              variant: "destructive",
            });
            continue;
          }
        } else {
          // Validate non-HEIC files
          const isImage = file.type.startsWith('image/');
          const isValid = isImage || 
                         file.type.startsWith('video/') || 
                         file.type.startsWith('text/') ||
                         file.type === 'application/pdf';
          
          if (!isValid) {
            toast({
              title: "Tipo di file non supportato",
              description: `${file.name} non è supportato`,
              variant: "destructive",
            });
            continue;
          }
          
          processedFiles.push(file);
        }
        
        processedCount++;
        setConversionProgress((processedCount / totalFiles) * 100);
      }

      if (processedFiles.length > 0) {
        const filesWithPreview: FileWithPreview[] = [];
        
        for (const file of processedFiles) {
          const isImage = file.type.startsWith('image/');
          const isVideo = file.type.startsWith('video/');
          const isPdf = file.type === 'application/pdf';
          
          const fileWithPreview: FileWithPreview = {
            file,
            preview: isImage ? URL.createObjectURL(file) : undefined,
            metadata: {}
          };
          
          // Extract metadata based on file type
          try {
            if (isImage) {
              const imgMetadata = await extractImageMetadata(file);
              fileWithPreview.metadata = imgMetadata;
            } else if (isVideo) {
              const videoMetadata = await extractVideoMetadata(file);
              fileWithPreview.metadata = videoMetadata;
            } else if (isPdf) {
              const pdfMetadata = await extractPdfMetadata(file);
              fileWithPreview.metadata = pdfMetadata;
            }
          } catch (error) {
            console.error('Failed to extract metadata:', error);
          }
          
          filesWithPreview.push(fileWithPreview);
        }
        
        setSelectedFiles(prev => [...prev, ...filesWithPreview]);
        onFilesSelected(processedFiles);
      }
    } finally {
      setIsConverting(false);
      setConversionProgress(0);
      setCurrentConvertingFile('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const item = prev[index];
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
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
      setAcceptedUrl(trimmedUrl);
      setUrlInput('');
      toast({
        title: "URL accettato",
        description: "URL pronto per l'analisi",
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

  const removeUrl = () => {
    setAcceptedUrl('');
    onUrlSubmit('');
  };

  const getUrlType = (url: string) => {
    if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) return 'Immagine';
    if (url.match(/\.(mp4|webm|ogg|mov)$/i)) return 'Video';
    if (url.match(/\.pdf$/i)) return 'PDF';
    return 'Pagina Web';
  };

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-8">
          <TabsTrigger value="upload" className="text-xs">
            <Upload className="h-3 w-3 mr-1" />
            File
          </TabsTrigger>
          <TabsTrigger value="url" className="text-xs">
            <LinkIcon className="h-3 w-3 mr-1" />
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3 mt-3">
          <div
            className={`relative border-2 border-dashed rounded-lg transition-all duration-300 ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border/50 bg-card/30 hover:border-primary/50'
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
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/heic,image/heif,.heic,.heif,video/*,text/*,.pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isConverting}
            />
            
            <div className="p-6 text-center space-y-2">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-lg">
                  {isConverting ? (
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 text-primary" />
                  )}
                </div>
              </div>
              
              <div className="text-sm font-medium text-foreground">
                {isConverting ? 'Conversione...' : 'Trascina file'}
              </div>
              <div className="text-xs text-muted-foreground">
                {isConverting ? 'Attendi' : 'o clicca per selezionare'}
              </div>
              
              {isConverting && (
                <div className="mt-3 space-y-2">
                  <Progress value={conversionProgress} className="h-1" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(conversionProgress)}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">
                File ({selectedFiles.length})
              </p>
              <div className="space-y-1.5">
                {selectedFiles.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-card/60 rounded-lg border border-border/50 group"
                  >
                    {item.preview ? (
                      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-primary/20">
                        <img 
                          src={item.preview} 
                          alt={item.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-primary/10 rounded text-primary flex-shrink-0">
                        {getFileIcon(item.file.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-destructive/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="url" className="space-y-3 mt-3">
          <form onSubmit={handleUrlSubmit} className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="p-3 bg-accent-cyan/10 rounded-lg">
                  <LinkIcon className="h-8 w-8 text-accent-cyan" />
                </div>
              </div>
              
              <Input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="text-xs h-9"
                disabled={isValidatingUrl}
              />
              
              <Button
                type="submit"
                disabled={!urlInput.trim() || isValidatingUrl}
                className="w-full h-9 text-xs"
                variant="secondary"
              >
                {isValidatingUrl ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    Validazione...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1.5" />
                    Conferma URL
                  </>
                )}
              </Button>
            </div>
          </form>

          {acceptedUrl && (
            <div className="p-3 bg-card/60 rounded-lg border border-border/50 group">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded text-primary flex-shrink-0">
                  <LinkIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {acceptedUrl}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getUrlType(acceptedUrl)}
                  </p>
                </div>
                <button
                  onClick={removeUrl}
                  className="p-1 hover:bg-destructive/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
