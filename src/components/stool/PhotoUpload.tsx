
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, X } from "lucide-react";

interface PhotoUploadProps {
  photos: File[];
  onPhotoAdd: (file: File) => void;
  onPhotoRemove: (index: number) => void;
}

export const PhotoUpload = ({ photos, onPhotoAdd, onPhotoRemove }: PhotoUploadProps) => {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoAdd(file);
    }
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="w-5 h-5" />
          <span>Photos (Optional)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload">
              <Button
                type="button"
                variant="outline"
                className="w-full cursor-pointer"
                asChild
              >
                <span>
                  <Camera className="w-4 h-4 mr-2" />
                  Add Photo
                </span>
              </Button>
            </label>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    onClick={() => onPhotoRemove(index)}
                    className="absolute top-1 right-1 w-6 h-6 p-0 bg-red-500 hover:bg-red-600"
                    size="sm"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
