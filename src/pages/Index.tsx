import { Sparkles, Palette, BarChart3, Zap, Shield, Download } from "lucide-react";
import QRGenerator from "@/components/QRGenerator";
import FeatureCard from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 space-y-6 animate-in fade-in duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Beautiful QR Codes in Seconds</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
              Create, Design & Track
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Professional QR Codes
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From personal projects to marketing campaigns. Quick QR makes it effortless 
              to create stunning, trackable QR codes that drive results.
            </p>
          </div>

          {/* QR Generator */}
          <div className="animate-in slide-in-from-bottom duration-700 delay-200">
            <QRGenerator />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features to create, customize, and track your QR codes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-12 text-center space-y-6 border border-primary/20">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users creating professional QR codes for their business and personal projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signin">
                <Button variant="hero" size="xl">
                  Create Your First QR Code
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="xl">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">Quick QR</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Quick QR. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
