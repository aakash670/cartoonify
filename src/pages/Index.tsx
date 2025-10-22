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
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Transform this image into a beautiful Studio Ghibli anime style. Keep the composition and subjects but apply the distinctive Ghibli art style with soft colors, hand-drawn aesthetic, whimsical details, and that magical atmosphere characteristic of Studio Ghibli films.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: selectedImage,
                  },
                },
              ],
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      const data = await response.json();
      const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (generatedImage) {
        setConvertedImage(generatedImage);
        toast({
          title: "✨ Conversion complete!",
          description: "Your image has been transformed to Ghibli style",
        });
      }
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "Please try again",
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
    link.download = "ghibli-style-image.png";
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-10"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border mb-6 shadow-[var(--shadow-soft)]">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium">AI-Powered Transformation</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              Transform Your Photos into
              <br />
              Studio Ghibli Magic
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the enchanting art style of Studio Ghibli. Upload any photo and watch it transform into
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
                  <label htmlFor="file-upload">
                    <Button size="lg" className="cursor-pointer bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-[var(--shadow-soft)]">
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Choose Image
                    </Button>
                  </label>
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
                      Ghibli Style
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
                  {isConverting ? "Converting..." : "Convert to Ghibli"}
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
                Examples of photos transformed into beautiful Ghibli-style artwork
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] transition-all duration-300 hover:scale-[1.02] bg-[var(--gradient-card)]">
                  <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Example transformation {i}
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
