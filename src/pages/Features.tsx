import { Sparkles, Zap, Palette, BarChart3, Download, Shield, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FeatureCard from "@/components/FeatureCard";
import Header from "@/components/Header";

const Features = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <QrCode className="w-4 h-4" />
              <span>Powerful Features</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Create Amazing QR Codes
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From instant generation to advanced analytics, Quick QR provides all the tools you need
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={Zap}
              title="Instant Generation"
              description="Create beautiful QR codes in seconds with our instant generator. No waiting, no complexity."
            />
            <FeatureCard
              icon={Palette}
              title="Custom Design"
              description="Add frames, logos, and custom colors to make your QR codes match your brand perfectly."
            />
            <FeatureCard
              icon={BarChart3}
              title="Scan Analytics"
              description="Track every scan with detailed analytics. Know when, where, and how your QR codes are performing."
            />
            <FeatureCard
              icon={Download}
              title="Dynamic QR Codes"
              description="Change the destination URL anytime without reprinting. Perfect for marketing campaigns."
            />
            <FeatureCard
              icon={Shield}
              title="Secure & Private"
              description="Your data is encrypted and secure. We're committed to GDPR compliance and user privacy."
            />
            <FeatureCard
              icon={Sparkles}
              title="Free Forever"
              description="Start with 20 free static QR codes and 1 trial dynamic code. Upgrade only when you need more."
            />
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link to="/">
              <Button variant="hero" size="xl">
                Start Creating Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
