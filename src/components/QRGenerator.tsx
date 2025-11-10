import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Download } from "lucide-react";
import QRCodeStyling from "qr-code-styling";
import { toast } from "sonner";

interface QRGeneratorProps {
  onGenerate?: (url: string) => void;
}

const QRGenerator = ({ onGenerate }: QRGeneratorProps) => {
  const [url, setUrl] = useState("");
  const [qrGenerated, setQrGenerated] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (qrGenerated && qrRef.current && url) {
      // Clear any existing QR code
      if (qrRef.current) {
        qrRef.current.innerHTML = "";
      }

      // Create new QR code
      qrCode.current = new QRCodeStyling({
        width: 280,
        height: 280,
        type: "svg",
        data: url,
        dotsOptions: {
          color: "hsl(217, 91%, 60%)",
          type: "rounded",
        },
        backgroundOptions: {
          color: "#ffffff",
        },
        cornersSquareOptions: {
          color: "hsl(189, 94%, 60%)",
          type: "extra-rounded",
        },
        cornersDotOptions: {
          color: "hsl(189, 94%, 60%)",
          type: "dot",
        },
      });

      qrCode.current.append(qrRef.current);
    }
  }, [qrGenerated, url]);

  const handleGenerate = () => {
    if (url.trim()) {
      setQrGenerated(true);
      onGenerate?.(url);
      toast.success("QR code generated!");
    }
  };

  const handleDownload = () => {
    if (qrCode.current) {
      qrCode.current.download({
        name: "qr-code",
        extension: "png",
      });
      toast.success("QR code downloaded!");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && url.trim()) {
      handleGenerate();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="p-6 shadow-lg">
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="Enter your URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-base"
            />
            <Button 
              variant="hero" 
              size="lg" 
              onClick={handleGenerate}
              disabled={!url.trim()}
            >
              <Sparkles className="w-4 h-4" />
              Generate
            </Button>
          </div>

          {qrGenerated && (
            <div className="mt-6 flex flex-col items-center space-y-4 animate-in fade-in duration-500">
              <div 
                ref={qrRef} 
                className="p-4 bg-white rounded-xl border-4 border-primary/20"
              />
              
              <Button variant="hero" size="lg" onClick={handleDownload}>
                <Download className="w-4 h-4" />
                Download QR Code
              </Button>

              <p className="text-xs text-muted-foreground text-center max-w-md">
                Your QR code is ready! Click download to save it to your device.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default QRGenerator;
