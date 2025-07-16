import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Image, X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadDialogProps {
  onImageUpload: (imageData: string, context?: string) => void;
  isLoading: boolean;
}

const ImageUploadDialog = ({ onImageUpload, isLoading }: ImageUploadDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [context, setContext] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check if file type is supported
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedTypes.includes(file.type)) {
      toast({
        title: "Unsupported format",
        description: "Please select a JPEG, PNG, GIF, or WebP image",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert image to standard format using Canvas API
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = () => {
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas
        ctx?.drawImage(img, 0, 0);
        
        // Convert to standard JPEG format
        const standardImageData = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedImage(standardImageData);
      };
      
      img.onerror = () => {
        toast({
          title: "Invalid image",
          description: "Please select a valid image file",
          variant: "destructive",
        });
      };
      
      // Create object URL for the image
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error processing image",
        description: "Please try a different image",
        variant: "destructive",
      });
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      await onImageUpload(selectedImage, context);
      setIsOpen(false);
      setSelectedImage(null);
      setContext("");
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedImage(null);
    setContext("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-12 w-12 rounded-lg border-[#D3D3D3] hover:bg-[#F8F9FA]"
          disabled={isLoading}
        >
          <Camera className="w-5 h-5" style={{ color: '#4A7C59' }} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Food Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!selectedImage ? (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Choose an option:</Label>
              <div className="flex gap-2">
                <Button
                  onClick={handleCameraClick}
                  className="flex-1 h-16 flex-col gap-2 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white"
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-sm">Camera</span>
                </Button>
                <Button
                  onClick={handleGalleryClick}
                  variant="outline"
                  className="flex-1 h-16 flex-col gap-2 border-[#4A7C59] text-[#4A7C59] hover:bg-[#F8F9FA]"
                >
                  <Image className="w-6 h-6" />
                  <span className="text-sm">Gallery</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <img 
                  src={selectedImage} 
                  alt="Selected" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  onClick={() => setSelectedImage(null)}
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-white hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="context" className="text-sm font-medium">
                  Context (optional)
                </Label>
                <Textarea
                  id="context"
                  placeholder="Add any context about the food/menu..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="min-h-[60px] resize-none"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white"
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Analyze
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          capture="environment"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;