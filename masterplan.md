# 🚀 Master Plan: "Quick QR" (SaaS) - V2

## 1. App Overview & Objectives

**"Quick QR"** is a focused, high-end SaaS (Software as a Service) web application that simplifies the creation, design, and management of QR codes.

The primary objective is to acquire users by offering a seamless and valuable "freemium" experience. The core user journey is designed to convert free users into paying customers by demonstrating immediate value (a "teaser" QR code) and upselling powerful, subscription-based features.

* **Core Value Prop:** "Create, design, and manage beautiful QR codes — from personal use to professional marketing."
* **Trust & Security:** All user data, QR links, and analytics are securely stored (e.g., via Supabase) and encrypted at rest. We are committed to user privacy and GDPR compliance.
* **Business Model:** Freemium (Free Static codes, Paid Dynamic codes).
* **Key Hook:** An instant "blurred QR" teaser that drives user signup and engagement.

---

## 2. Target Audience

* **Free Users:** Individuals, students, and hobbyists who need a quick, no-fuss static QR code for a personal website, WiFi password, or event.
* **Pro Users (Customers):** Small businesses, marketers, real estate agents, and creators who need to track marketing campaign effectiveness (analytics) and maintain flexibility (dynamic URLs) for their printed materials.
* **Future Opportunity (Post-MVP):** Small agencies or designers who need to create and manage QR codes for their clients (potential white-label dashboard).

---

## 3. Core Features & Functionality

### 🔐 Tier 1: Public (Logged-Out)
* **Instant Generator:** A single URL input on the landing page.
* **"Teaser" QR Code:** Instantly generates a **blurred/watermarked** QR code to show the app works.
* **Signup Prompt:** A clear CTA to "Sign up to unlock" the clear QR code.
* **Growth Hack (Optional):** Offer an alternative "Send clear QR to your inbox" to capture email leads who aren't ready to sign up.

### ✅ Tier 2: Free User (Logged-In)
* **User Dashboard:** A central hub to view and manage all created QR codes.
* **Static QR Codes:**
    * Ability to create up to 20 static QR codes.
    * These codes point *directly* to the destination URL.
* **Dynamic QR Code Trial:**
    * Ability to create **one (1) Dynamic QR code**.
    * This code expires after **30 days**.
    * **Grace Period:** The code enters a 3-day "grace period" after expiry (showing a warning in the dashboard) before hard deactivation, creating urgency to upgrade.
* **Basic Design Studio:**
    * Add a frame with custom text (e.g., "SCAN ME").
    * Add a logo (from a pre-set list or by uploading their own).
* **Convenience Feature:**
    * **"Duplicate QR"** option in the dashboard.

### ⭐️ Tier 3: Pro User (Paid)
* **Dynamic QR Codes (Paid):**
    * **Model:** 100 INR / $10 USD **per year, per code**.
    * Users can "activate" their trial code or purchase new ones.
    * **Future Pricing (Post-MVP):** Explore bundled plans (e.g., "5 Dynamic Codes for $40/year").
* **Editable Destinations:** The ability to change the destination URL of a dynamic QR code *at any time*.
* **Scan Analytics:**
    * A dedicated analytics page for each dynamic QR code (total scans, time, geography, device).
    * **Privacy-First:** Analytics will be GDPR-compliant. IP addresses will **not** be stored directly. They will be used *only* for a one-time geo-lookup (to get country/city) and then immediately discarded or hashed to ensure user privacy.
* **Spam Prevention:**
    * All users (free and pro) will have a "Report this QR" link available on the redirect page if a code is flagged as malicious.

---

## 4. High-Level Technical Stack

This stack is chosen for rapid development, scalability, and a modern user experience.

* **Frontend (UI):** **React**
* **UI Library:** **Tailwind CSS + Shadcn/ui**
    * *Why:* To achieve the desired "high-end, professional" look.
* **Hosting:** **Vercel** or **Netlify**
    * *Why:* Natively built for modern React apps, offering seamless CI/CD (Continuous Integration/Continuous Deployment) and global CDN.
* **Backend-as-a-Service (BaaS):** **Supabase**
    * *Why:* All-in-one backend for speed and scalability.
    * **Database:** Supabase (PostgreSQL).
    * **Authentication:** Supabase Auth (for users).
    * **Storage:** Supabase Storage (for user-uploaded logos).
    * **Serverless Functions:** Supabase Edge Functions for:
        1.  **Razorpay Payment Webhook:** To securely confirm payments.
        2.  **Nightly Cron Job:** To manage trial/paid expirations and grace periods.
        3.  **Analytics Ingestion:** A fast endpoint to receive scan pings.
* **Dynamic Redirects:** **Vercel Edge Functions** or **Supabase Edge Functions**
    * *Why:* Needs to be *extremely* fast and globally distributed. An edge function with caching is ideal for minimizing redirect latency.
* **Payment Gateway:** **Razorpay**
    * *Why:* Built for the Indian market (UPI) and supports international cards.
* **QR Code Generation:** **`qr-code-styling`**
    * *Why:* A more advanced library that natively supports colors, logos, frames, and dot shapes, aligning with the "high-end design" goal.

---

## 5. Conceptual Data Model (PostgreSQL)

*All tables should include `created_at` and `updated_at` timestamps for auditing.*

* **`users` (provided by Supabase Auth):**
    * `id` (uuid), `email`, `plan_level` ('free', 'pro')
* **`qr_codes`:**
    * `id` (uuid)
    * `user_id` (fk to `users.id`)
    * `name` (string)
    * `type` ('static' or 'dynamic')
    * `short_url` (if dynamic, e.g., `qra.app/aBcDeF`)
    * `destination_url` (string)
    * `status` ('active', 'trial_expired', 'paid_expired', 'reported')
    * `expires_at` (timestamp)
    * `created_at`, `updated_at`
* **`qr_design`:**
    * `id` (uuid)
    * `qr_code_id` (fk to `qr_codes.id`)
    * `frame_text` (string)
    * `logo_url` (string, points to Supabase Storage)
    * `created_at`, `updated_at`
* **`qr_analytics`:**
    * `id` (uuid)
    * `qr_code_id` (fk to `qr_codes.id`)
    * `scanned_at` (timestamp)
    * `country` (string)
    * `city` (string)
    * `device_type` (string)
* **`payments`:**
    * `id` (uuid)
    * `user_id` (fk to `users.id`)
    * `qr_code_id` (fk to `qr_codes.id`, *nullable* if for a bundle)
    * `amount` (integer)
    * `currency` (string, e.g., 'INR', 'USD')
    * `razorpay_payment_id` (string)
    * `status` ('pending', 'success', 'failed')
    * `created_at`, `updated_at`

---

## 6. Development Phases (Milestones)

1.  **Phase 0: Design & Brand**
    * Create a simple brand identity (logo, color palette).
    * Wireframe the core user flow in Figma:
        1. Landing page (blurred teaser).
        2. Signup / Login modal.
        3. User Dashboard (list of codes).
        4. QR Create/Edit page (with design studio).
        5. Analytics page.
    * This aligns visual goals *before* a single line of code is written.

2.  **Phase 1: Foundation & Core Logic**
    * Set up Supabase project (Auth, DB, Storage).
    * Set up React/Vercel project with Tailwind/Shadcn.
    * Implement user signup and login.
    * Build the "blurred QR" teaser flow.
    * Create the core QR code generator (Static only) using `qr-code-styling`.
    * Build the user dashboard to list/create/delete static codes.

3.  **Phase 2: The "Pro" Features**
    * Implement the Dynamic QR Code system (the Edge Function redirect).
    * Build the Analytics ingestion endpoint and the analytics dashboard.
    * Create the 30-day trial & grace period logic (Supabase cron job).

4.  **Phase 3: Payments & Launch**
    * Build the "Design Studio" UI (frames, logo uploads).
    * Integrate Razorpay for the $10/year-per-code payments.
    * Create the secure Razorpay webhook (Supabase function) to update the `payments` and `qr_codes` tables.
    * Implement the "Report QR" flow.
    * **Public Beta Launch:** Launch to an initial set of users and actively collect feedback.
    * Final polish, testing, and full launch.

---

## 7. Potential Challenges & Solutions

* **Challenge:** Dynamic QR redirects must be *fast*.
    * **Solution:** Use Vercel/Supabase Edge Functions with a cached database read to ensure sub-100ms redirects globally.
* **Challenge:** Abuse/Spam (Phishing links).
    * **Solution:** Implement basic URL validation on input. Have a clear "Report" link on the redirect page that flags a code for manual review and sets its `status` to 'reported'.
* **Challenge:** Payment security.
    * **Solution:** **Never** trust the frontend for payment confirmation. The *only* source of truth is the secure, server-side Razorpay webhook.
* **Challenge:** Analytics Privacy.
    * **Solution:** Anonymize all analytics data. Do not store IPs. Be transparent with a clear privacy policy.