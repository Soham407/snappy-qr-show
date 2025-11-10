import { Link } from "react-router-dom";
import Header from "@/components/Header";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />

      {/* Content */}
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Quick QR, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
            <p className="text-muted-foreground">
              Quick QR provides QR code generation, design, and management services. We offer both free and paid subscription tiers with varying features and limitations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must provide accurate and complete information</li>
              <li>You must be at least 13 years old to use this service</li>
              <li>One person or entity may not maintain more than one free account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Free and Paid Plans</h2>
            <p className="text-muted-foreground mb-2">Our service includes:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Free plan: 20 static QR codes and 1 dynamic QR code (30-day trial)</li>
              <li>Pro plan: $10 per dynamic QR code per year</li>
              <li>Trial dynamic codes expire after 30 days with a 3-day grace period</li>
              <li>Subscriptions automatically renew unless cancelled</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
            <p className="text-muted-foreground mb-2">You agree not to use Quick QR to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Create QR codes that link to illegal, malicious, or harmful content</li>
              <li>Engage in phishing, spam, or fraudulent activities</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account if you violate these terms or engage in abusive behavior.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Refunds</h2>
            <p className="text-muted-foreground">
              Refunds are handled on a case-by-case basis. Please contact our support team if you have concerns about a recent payment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Quick QR is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-muted-foreground">
              Questions about these terms? Please{" "}
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

export default Terms;
