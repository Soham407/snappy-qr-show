import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { initiatePayment } from "@/lib/payment-utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Pricing = () => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUpgradeClick = async () => {
    setLoading(true);
    
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to upgrade");
      navigate("/signin");
      setLoading(false);
      return;
    }

    // Fetch user's dynamic QR codes that are in trial status
    const { data: codes, error } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("type", "dynamic")
      .eq("status", "trial")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching QR codes:", error);
      toast.error("Failed to load your QR codes");
      setLoading(false);
      return;
    }

    if (!codes || codes.length === 0) {
      toast.info("You don't have any trial QR codes to upgrade");
      navigate("/create");
      setLoading(false);
      return;
    }

    setQrCodes(codes);
    setDialogOpen(true);
    setLoading(false);
  };

  const handlePayment = async (qrCode: any) => {
    setDialogOpen(false);
    await initiatePayment({
      qrCodeId: qrCode.id,
      qrCodeName: qrCode.name,
      onSuccess: () => {
        toast.success("QR code upgraded successfully!");
        navigate("/dashboard");
      },
      onFailure: (error) => {
        console.error("Payment failed:", error);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
              Simple, Transparent
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 border-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Free</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">forever</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>20 Static QR Codes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>1 Dynamic QR Code (30-day trial)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>Custom frames & logos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>Download in multiple formats</span>
                  </li>
                </ul>
                <Link to="/" className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Pro Plan */}
            <Card className="p-8 border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                Popular
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Pro</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">$10</span>
                    <span className="text-muted-foreground">per code / year</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>All Free features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>Dynamic QR Codes at $10/year each</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>Edit destination URL anytime</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>Advanced scan analytics & tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>Priority email support</span>
                  </li>
                </ul>
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={handleUpgradeClick}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Upgrade to Pro"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* QR Code Selection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select QR Code to Upgrade</DialogTitle>
            <DialogDescription>
              Choose which dynamic QR code you'd like to upgrade to Pro
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {qrCodes.map((qr) => (
              <Card key={qr.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{qr.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {qr.destination_url.length > 40 
                        ? qr.destination_url.substring(0, 40) + "..." 
                        : qr.destination_url}
                    </p>
                  </div>
                  <Button 
                    variant="hero" 
                    size="sm"
                    onClick={() => handlePayment(qr)}
                  >
                    Upgrade
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
