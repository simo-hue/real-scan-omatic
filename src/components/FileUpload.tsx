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
      
      // Convert HEIC to JPEG blob
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9
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
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/heic,image/heif,.heic,.heif,video/*,text/*,.pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isConverting}
            />
            
            <div className="p-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-6 bg-gradient-to-br from-primary/20 to-accent-purple/20 rounded-2xl backdrop-blur-sm border border-primary/20 animate-pulse-glow">
                  {isConverting ? (
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  ) : (
                    <Upload className="h-12 w-12 text-primary" />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xl font-semibold text-foreground">
                  {isConverting ? 'Conversione in corso...' : 'Trascina i file qui'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isConverting ? 'Attendi il completamento' : 'oppure clicca per selezionare'}
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary/50" />
                <span>JPG • PNG • WEBP • HEIC • Video • PDF</span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary/50" />
              </div>
              
              {isConverting && (
                <div className="mt-6 space-y-3 px-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">
                      {currentConvertingFile ? `Conversione: ${currentConvertingFile}` : 'Elaborazione...'}
                    </span>
                    <span className="text-primary font-semibold">
                      {Math.round(conversionProgress)}%
                    </span>
                  </div>
                  <Progress value={conversionProgress} className="h-2" />
                </div>
              )}
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="h-5 w-1 bg-gradient-to-b from-primary to-accent-purple rounded-full" />
                File selezionati ({selectedFiles.length})
              </div>
              <div className="space-y-2">
                {selectedFiles.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 glass-effect rounded-xl hover:border-primary/50 transition-all duration-300 group hover:scale-[1.02]"
                  >
                    {item.preview ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-primary/20">
                        <img 
                          src={item.preview} 
                          alt={item.file.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ) : (
                      <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                        {getFileIcon(item.file.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.file.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                        {item.metadata?.width && item.metadata?.height && (
                          <>
                            <span>•</span>
                            <span>{item.metadata.width} × {item.metadata.height}px</span>
                          </>
                        )}
                        {item.metadata?.duration !== undefined && (
                          <>
                            <span>•</span>
                            <span>{Math.floor(item.metadata.duration / 60)}:{String(Math.floor(item.metadata.duration % 60)).padStart(2, '0')} min</span>
                          </>
                        )}
                        {item.metadata?.pageCount !== undefined && item.metadata.pageCount > 0 && (
                          <>
                            <span>•</span>
                            <span>{item.metadata.pageCount} pagine</span>
                          </>
                        )}
                      </div>
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
                  disabled={isValidatingUrl || !!acceptedUrl}
                />
                <div className="text-xs text-muted-foreground text-center">
                  Supporta link diretti a immagini, video, pagine web e PDF
                </div>
              </div>

              <Button
                type="submit"
                disabled={!urlInput.trim() || isValidatingUrl || !!acceptedUrl}
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

          {acceptedUrl && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="h-5 w-1 bg-gradient-to-b from-accent-cyan to-accent-purple rounded-full" />
                URL accettato
              </div>
              <div className="flex items-center gap-3 p-4 glass-effect rounded-xl border-2 border-accent-cyan/50 hover:border-accent-cyan transition-all duration-300 group bg-accent-cyan/5 animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="p-2 bg-accent-cyan/20 rounded-lg text-accent-cyan animate-pulse-glow">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {acceptedUrl}
                    </p>
                    <Badge className="bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30 text-xs">
                      {getUrlType(acceptedUrl)}
                    </Badge>
                  </div>
                  <p className="text-xs text-accent-cyan/80 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Pronto per l'analisi
                  </p>
                </div>
                <button
                  onClick={removeUrl}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4 text-destructive" />
                </button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
