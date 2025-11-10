import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Lock } from "lucide-react";
import QRCodeStyling from "qr-code-styling";
import { useNavigate } from "react-router-dom";

interface QRGeneratorProps {
  onGenerate?: (url: string) => void;
}

const QRGenerator = ({ onGenerate }: QRGeneratorProps) => {
  const [url, setUrl] = useState("");
  const [qrGenerated, setQrGenerated] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);
  const navigate = useNavigate();

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
              <div className="relative">
                {/* The blurred QR code */}
                <div 
                  ref={qrRef} 
                  className="rounded-xl overflow-hidden border-4 border-primary/20 blur-sm w-[280px] h-[280px]"
                />
                
                {/* Overlay with lock and CTA */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
                  <Lock className="w-12 h-12 text-primary mb-3" />
                  <p className="text-lg font-semibold text-foreground mb-2">Your QR Code is Ready!</p>
                  <p className="text-sm text-muted-foreground mb-4">Sign up to unlock and download</p>
                  <Button variant="hero" size="lg" onClick={() => navigate('/signup')}>
                    Sign Up to Unlock
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center max-w-md">
                Create a free account to download this QR code and unlock powerful features like dynamic QR codes, custom designs, and analytics.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default QRGenerator;
