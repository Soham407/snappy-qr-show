import { Link } from "react-router-dom";
import Header from "@/components/Header";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />

      {/* Content */}
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-muted-foreground">
              At Quick QR, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data We Collect</h2>
            <p className="text-muted-foreground mb-2">We collect the following information:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Email address and account information when you sign up</li>
              <li>QR code data you create (URLs, designs, settings)</li>
              <li>Anonymous analytics data (scan counts, general location, device type)</li>
              <li>Payment information (processed securely by Razorpay)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Data</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>To provide and improve our QR code services</li>
              <li>To track analytics for your dynamic QR codes</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send important service updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your data. All data is encrypted at rest and in transit. We are committed to GDPR compliance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Analytics Privacy</h2>
            <p className="text-muted-foreground">
              When QR codes are scanned, we collect anonymous analytics data. IP addresses are never stored directly - they are only used for a one-time geo-lookup to determine country and city, then immediately discarded.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-muted-foreground mb-2">You have the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access your personal data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please{" "}
              <Link to="/contact" className="text-primary hover:underline">
                contact us
              </Link>
              .
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8">
            Last updated: January 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
