import { useState, useCallback } from "react";
import { Upload, Sparkles, Image as ImageIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 32 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 32MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setConvertedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const convertToGhibli = async () => {
    if (!selectedImage) return;

    setIsConverting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/convert-to-ghibli`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageData: selectedImage,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 429) {
          toast({
            title: "Rate limit exceeded",
            description: "Please try again in a moment",
            variant: "destructive",
          });
          return;
        }
        
        if (response.status === 402) {
          toast({
            title: "Credits depleted",
            description: "Please add credits to your workspace",
            variant: "destructive",
          });
          return;
        }

        throw new Error(errorData.error || "Conversion failed");
      }

      const data = await response.json();
      
      if (data.image) {
        setConvertedImage(data.image);
        toast({
          title: "✨ Conversion complete!",
          description: "Your image has been transformed to Cartoonified style",
        });
      } else {
        throw new Error("No image returned");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const downloadImage = () => {
    if (!convertedImage) return;
    
    const link = document.createElement("a");
    link.href = convertedImage;
    link.download = "Cartoonify-style-image.png";
    link.click();
  };

  return (
    <div className="min-h-screen bg-[url('')] bg-cover bg-center">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-10"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">

            <h1 className="text-5xl md:text-6xl font-bold mb-10 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-normal">
              Transform Your Photos into
              <br />
              cartoonified Magic
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the enchanting art style of cartoon . Upload any photo and watch it transform into
              beautiful hand-drawn anime artwork in seconds.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Upload Section */}
          {!selectedImage && (
            <Card className="p-8 md:p-12 shadow-[var(--shadow-soft)] bg-[var(--gradient-card)] border-2 transition-all duration-300 hover:shadow-[var(--shadow-glow)]">
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileInput}
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <Upload className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">Drop your image here</h3>
                    <p className="text-muted-foreground mb-4">or click to browse from your device</p>
                    <p className="text-sm text-muted-foreground">Maximum file size: 32MB</p>
                  </div>
                  <Button
                    size="lg"
                    className="cursor-pointer bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-[var(--shadow-soft)]"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Choose Image
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Image Display & Conversion */}
          {selectedImage && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Original Image */}
                <Card className="p-4 shadow-[var(--shadow-soft)] bg-[var(--gradient-card)]">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-primary" />
                      Original
                    </h3>
                  </div>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedImage}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Card>

                {/* Converted Image */}
                <Card className="p-4 shadow-[var(--shadow-soft)] bg-[var(--gradient-card)]">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-secondary" />
                      Cartoonified Style
                    </h3>
                  </div>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    {convertedImage ? (
                      <img
                        src={convertedImage}
                        alt="Converted"
                        className="w-full h-full object-cover animate-in fade-in duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {isConverting ? (
                          <div className="text-center">
                            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-sm text-muted-foreground">Creating magic...</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Converted image will appear here</p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={convertToGhibli}
                  disabled={isConverting}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-[var(--shadow-soft)] min-w-[200px]"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {isConverting ? "Converting..." : "Convert to cartoonified"}
                </Button>

                {convertedImage && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={downloadImage}
                    className="border-2 min-w-[200px] hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download
                  </Button>
                )}

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setSelectedImage(null);
                    setConvertedImage(null);
                  }}
                  className="border-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                >
                  Start Over
                </Button>
              </div>
            </div>
          )}

          {/* Examples Section */}
          <div className="mt-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">See the Magic in Action</h2>
              <p className="text-muted-foreground">
                Examples of photos transformed into beautiful cartoonified-style artwork
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { src: "https://media.wired.com/photos/64f9d24e1b27a741aa23c0dd/4:3/w_1384,h_1038,c_limit/Studio-Ghibli-Ranked-Culture-HERON_img_1.jpg", alt: "Cartoonify Art Example 1" },
                { src: "https://deep-image.ai/blog/content/images/2025/04/02a0f980-13a1-11f0-96c9-0a4467d79a51-width-1216_height-832_generated--1--1.png", alt: "Cartoonify Art Example 2" },
                { src: "https://i.pinimg.com/736x/bf/d5/9e/bfd59e323e648a99564b2a33c667841f.jpg", alt: "Cartoonify Art Example 3" }
              ].map((example, i) => (
                <Card key={i} className="overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] transition-all duration-300 hover:scale-[1.02] bg-[var(--gradient-card)]">
                  <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <img
                      src={example.src}
                      alt={example.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      {example.alt}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
