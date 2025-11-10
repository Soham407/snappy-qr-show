import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Download, Zap, Shield, Smartphone, QrCode } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

const Index = () => {
  const [inputValue, setInputValue] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    // Generate initial QR code
    generateQRCode("https://lovable.dev");
  }, []);

  const generateQRCode = async (text: string) => {
    if (!text.trim()) {
      toast.error("Please enter some text or URL");
      return;
    }

    try {
      const url = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: "#0891b2",
          light: "#ffffff",
        },
      });
      setQrCodeUrl(url);
      toast.success("QR code generated!");
    } catch (error) {
      toast.error("Failed to generate QR code");
      console.error(error);
    }
  };

  const handleGenerate = () => {
    generateQRCode(inputValue);
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = "qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6">
            <QrCode className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            QR Code Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Create custom QR codes instantly. Free, fast, and simple to use.
            Perfect for sharing links, text, and more.
          </p>
        </div>

        {/* Generator Card */}
        <Card className="max-w-4xl mx-auto p-8 shadow-[var(--shadow-elevated)] animate-scale-in">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="text-left">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Enter Text or URL
                </label>
                <Input
                  placeholder="https://example.com"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
                  className="h-12 text-base"
                />
              </div>
              <Button
                onClick={handleGenerate}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                size="lg"
              >
                Generate QR Code
              </Button>
            </div>

            {/* QR Code Display */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {qrCodeUrl ? (
                <>
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <img
                      src={qrCodeUrl}
                      alt="Generated QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download QR Code
                  </Button>
                </>
              ) : (
                <div className="w-64 h-64 border-2 border-dashed border-border rounded-xl flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Your QR code will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-6 text-center hover:shadow-[var(--shadow-elevated)] transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Instant Generation</h3>
            <p className="text-muted-foreground">
              Create QR codes in seconds with our lightning-fast generator
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-[var(--shadow-elevated)] transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-4">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
            <p className="text-muted-foreground">
              All QR codes are generated locally in your browser
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-[var(--shadow-elevated)] transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Universal Compatibility</h3>
            <p className="text-muted-foreground">
              Works perfectly on all devices and QR code scanners
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground border-t">
        <p>Built with Lovable • Free QR Code Generator</p>
      </footer>
    </div>
  );
};

export default Index;
