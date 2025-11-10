import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, ArrowLeft, Download, Image as ImageIcon, Type, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCodeStyling, { type Options as QRCodeOptions } from "qr-code-styling";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateUniqueShortCode } from "@/lib/qr-utils";

const CreateQR = () => {
  const navigate = useNavigate();
  const [qrType, setQrType] = useState<"static" | "dynamic">("static");
  const [qrName, setQrName] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [frameText, setFrameText] = useState("SCAN ME");
  const [qrColor, setQrColor] = useState("#4F75FF");
  const [cornerColor, setCornerColor] = useState("#47D7D7");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signin");
      }
    };
    checkAuth();
  }, [navigate]);

  // Generate/Update QR Code
  useEffect(() => {
    if (destinationUrl && qrRef.current) {
      if (qrRef.current) {
        qrRef.current.innerHTML = "";
      }

      const qrOptions: Partial<QRCodeOptions> = {
        width: 300,
        height: 300,
        type: "svg",
        data: destinationUrl,
        dotsOptions: {
          color: qrColor,
          type: "rounded" as const,
        },
        backgroundOptions: {
          color: "#ffffff",
        },
        cornersSquareOptions: {
          color: cornerColor,
          type: "extra-rounded" as const,
        },
        cornersDotOptions: {
          color: cornerColor,
          type: "dot" as const,
        },
      };

      // Only add image options if logo is present
      if (logoPreview) {
        qrOptions.image = logoPreview;
        qrOptions.imageOptions = {
          crossOrigin: "anonymous",
          margin: 8,
        };
      }

      qrCode.current = new QRCodeStyling(qrOptions);

      qrCode.current.append(qrRef.current);
    }
  }, [destinationUrl, qrColor, cornerColor, logoPreview]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo file size must be less than 2MB");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (!qrCode.current) {
      toast.error("Please generate a QR code first");
      return;
    }
    
    qrCode.current.download({
      name: qrName || "qr-code",
      extension: "png",
    });
    toast.success("QR Code downloaded successfully!");
  };

  const handleSave = async () => {
    if (!qrName.trim()) {
      toast.error("Please enter a name for your QR code");
      return;
    }
    if (!destinationUrl.trim()) {
      toast.error("Please enter a destination URL");
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to save QR codes");
        navigate("/signin");
        return;
      }

      // Check QR code limits
      const { data: existingQRs, error: countError } = await supabase
        .from('qr_codes')
        .select('id, type')
        .eq('user_id', user.id);

      if (countError) {
        console.error("Error checking QR limits:", countError);
        toast.error("Failed to check QR code limits");
        setSaving(false);
        return;
      }

      const staticCount = existingQRs?.filter(qr => qr.type === 'static').length || 0;
      const dynamicCount = existingQRs?.filter(qr => qr.type === 'dynamic').length || 0;

      // Enforce limits
      if (qrType === 'static' && staticCount >= 20) {
        toast.error("You've reached the limit of 20 free static QR codes. Delete some to create more.");
        setSaving(false);
        return;
      }

      if (qrType === 'dynamic' && dynamicCount >= 1) {
        toast.error("Free users can only create 1 dynamic QR code. Upgrade to create more!");
        setSaving(false);
        return;
      }

      // Upload logo if present
      let logoUrl = "";
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('qr-logos')
          .upload(fileName, logoFile);

        if (uploadError) {
          console.error("Logo upload error:", uploadError);
          toast.error("Failed to upload logo");
          setSaving(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('qr-logos')
          .getPublicUrl(fileName);
        
        logoUrl = publicUrl;
      }

      // Generate short code for dynamic QR codes
      let shortUrl = null;
      if (qrType === 'dynamic') {
        shortUrl = await generateUniqueShortCode(supabase);
      }

      // Calculate expiry for dynamic codes (30 days trial)
      let expiresAt = null;
      if (qrType === 'dynamic') {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);
        expiresAt = expiry.toISOString();
      }

      // Insert QR code
      const { data: qrData, error: qrError } = await supabase
        .from('qr_codes')
        .insert({
          user_id: user.id,
          name: qrName,
          type: qrType,
          short_url: shortUrl,
          destination_url: destinationUrl,
          status: qrType === 'dynamic' ? 'trial' : 'active',
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (qrError) {
        console.error("QR code insert error:", qrError);
        toast.error("Failed to save QR code");
        setSaving(false);
        return;
      }

      // Insert design settings
      const { error: designError } = await supabase
        .from('qr_design')
        .insert({
          qr_code_id: qrData.id,
          frame_text: frameText,
          logo_url: logoUrl,
          dot_color: qrColor,
          background_color: '#ffffff',
        });

      if (designError) {
        console.error("Design insert error:", designError);
        toast.error("Failed to save design settings");
        setSaving(false);
        return;
      }

      toast.success("QR Code saved successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Quick QR
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="hero" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save QR Code"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Settings */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Create QR Code</h1>
                <p className="text-muted-foreground">
                  Customize your QR code with colors, logos, and frames
                </p>
              </div>

              <Card className="p-6 space-y-6">
                {/* QR Type Selection */}
                <div className="space-y-2">
                  <Label>QR Code Type</Label>
                  <Tabs value={qrType} onValueChange={(v) => setQrType(v as "static" | "dynamic")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="static">Static</TabsTrigger>
                      <TabsTrigger value="dynamic">Dynamic</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <p className="text-xs text-muted-foreground">
                    {qrType === "static" 
                      ? "Static QR codes point directly to your URL (up to 20 free)" 
                      : "Dynamic QR codes can be edited anytime (1 free trial for 30 days)"}
                  </p>
                </div>

                {/* QR Name */}
                <div className="space-y-2">
                  <Label htmlFor="qr-name">QR Code Name</Label>
                  <Input
                    id="qr-name"
                    placeholder="e.g., My Website QR"
                    value={qrName}
                    onChange={(e) => setQrName(e.target.value)}
                  />
                </div>

                {/* Destination URL */}
                <div className="space-y-2">
                  <Label htmlFor="destination-url">Destination URL</Label>
                  <Input
                    id="destination-url"
                    type="url"
                    placeholder="https://example.com"
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                  />
                  {qrType === "dynamic" && (
                    <div className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-md border border-primary/10">
                      <p className="font-medium text-foreground mb-1">📍 Dynamic QR Code</p>
                      <p>
                        Your QR code will use a redirect URL. You can change the destination URL anytime without reprinting the QR code!
                      </p>
                    </div>
                  )}
                </div>

                {/* Design Customization */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Design Customization
                  </h3>

                  {/* QR Color */}
                  <div className="space-y-2">
                    <Label htmlFor="qr-color">QR Code Color</Label>
                    <div className="flex gap-3 items-center">
                      <Input
                        id="qr-color"
                        type="color"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        placeholder="#4F75FF"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Corner Color */}
                  <div className="space-y-2">
                    <Label htmlFor="corner-color">Corner Color</Label>
                    <div className="flex gap-3 items-center">
                      <Input
                        id="corner-color"
                        type="color"
                        value={cornerColor}
                        onChange={(e) => setCornerColor(e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={cornerColor}
                        onChange={(e) => setCornerColor(e.target.value)}
                        placeholder="#47D7D7"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Frame Text */}
                  <div className="space-y-2">
                    <Label htmlFor="frame-text" className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Frame Text (Optional)
                    </Label>
                    <Input
                      id="frame-text"
                      placeholder="SCAN ME"
                      value={frameText}
                      onChange={(e) => setFrameText(e.target.value)}
                      maxLength={20}
                    />
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Logo (Optional)
                    </Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      {logoFile ? "Change Logo" : "Upload Logo"}
                    </Button>
                    {logoPreview && (
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <img src={logoPreview} alt="Logo preview" className="w-12 h-12 object-contain" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{logoFile?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {((logoFile?.size || 0) / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setLogoFile(null);
                            setLogoPreview("");
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Max size: 2MB. Recommended: Square, transparent background
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Side - Preview */}
            <div className="space-y-6">
              <Card className="p-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-center">Preview</h3>
                  
                  <div className="flex flex-col items-center space-y-4">
                    {destinationUrl ? (
                      <>
                        {/* QR Code with Frame */}
                        <div className="relative bg-white p-6 rounded-2xl shadow-lg">
                          {frameText && (
                            <div className="text-center mb-4">
                              <p className="text-lg font-bold text-gray-800">{frameText}</p>
                            </div>
                          )}
                          <div ref={qrRef} className="flex justify-center" />
                        </div>

                        {/* Info */}
                        <div className="text-center space-y-2">
                          <p className="text-sm font-medium">
                            {qrType === "static" ? "Static QR Code" : "Dynamic QR Code"}
                          </p>
                          <p className="text-xs text-muted-foreground break-all">
                            {destinationUrl}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 space-y-3">
                        <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">
                          Enter a URL to see your QR code preview
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Quick Tips */}
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold mb-3 text-sm">💡 Quick Tips</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• Use high contrast colors for better scanning</li>
                  <li>• Keep logos simple and centered</li>
                  <li>• Test your QR code before printing</li>
                  <li>• Dynamic codes can be edited after creation</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateQR;
