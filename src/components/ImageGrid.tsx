import { useState } from 'react';
import { Image as ImageIcon, Wand2, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { GeneratedImage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { StreamingAnimation } from './StreamingAnimation';

interface ImageGridProps {
  images: GeneratedImage[];
  onGenerateVariations: (imageId: string) => void;
  onDeleteImages: (imageIds: string[]) => void;
  isGenerating: boolean;
  highlightedId: string | null;
  onHighlight: (id: string | null) => void;
  batchSize: number;
}

export function ImageGrid({ 
  images, 
  onGenerateVariations, 
  onDeleteImages,
  isGenerating,
  highlightedId,
  onHighlight,
  batchSize
}: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  const toggleImageSelection = (imageId: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId);
    } else {
      newSelection.add(imageId);
    }
    setSelectedImages(newSelection);
  };

  const handleDeleteSelected = () => {
    onDeleteImages(Array.from(selectedImages));
    setSelectedImages(new Set());
  };

  const getHighlightClass = (image: GeneratedImage) => {
    if (!highlightedId) return '';
    if (image.id === highlightedId) return 'ring-4 ring-purple-500';
    if (image.parentId === highlightedId) return 'ring-4 ring-blue-500';
    if (image.parentId && images.find(img => img.id === image.parentId)?.parentId === highlightedId) {
      return 'ring-4 ring-green-500';
    }
    return 'opacity-40';
  };

  return (
    <div className="space-y-4">
      {selectedImages.size > 0 && (
        <div className="flex items-center justify-between bg-card p-2 rounded-lg">
          <span className="text-sm">
            {selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Show skeleton loading when generating */}
      {isGenerating && (
        <StreamingAnimation count={batchSize} className="mb-4" />
      )}

      {images.length === 0 && !isGenerating ? (
        <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <p className="text-muted-foreground">Click on a prompt to generate images</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image) => (
            <Card 
              key={image.id} 
              className={cn(
                "bg-card border-border overflow-hidden group transition-all duration-200",
                highlightedId && getHighlightClass(image)
              )}
              onMouseEnter={() => onHighlight(image.id)}
              onMouseLeave={() => onHighlight(null)}
            >
              <CardContent className="p-0 relative">
                <div className="absolute top-2 left-2 z-10 flex gap-2 flex-wrap max-w-[90%]">
                  <Checkbox
                    checked={selectedImages.has(image.id)}
                    onCheckedChange={() => toggleImageSelection(image.id)}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                  <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                    {image.id}
                  </Badge>
                  {image.parentId && (
                    <Badge variant="secondary" className="bg-purple-500/50 backdrop-blur-sm">
                      Variation of: {image.parentId}
                    </Badge>
                  )}
                </div>
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-[300px] object-cover cursor-pointer"
                  onClick={() => setSelectedImage(image.id)}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => onGenerateVariations(image.id)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Variations
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl bg-background border-border">
          {selectedImage && (
            <div className="relative">
              <img
                src={images.find(img => img.id === selectedImage)?.url}
                alt="Selected image"
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                  {selectedImage}
                </Badge>
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button 
                  variant="secondary"
                  onClick={() => onGenerateVariations(selectedImage)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Variations
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}