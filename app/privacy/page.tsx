import type { Metadata } from "next";
import StaticPageLayout from "@/components/landing/StaticPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — StayDue",
  description: "How StayDue collects, uses, and protects your information.",
};

export default function PrivacyPage(): React.ReactElement {
  return (
    <StaticPageLayout>
      <div className="space-y-2 mb-10">
        <p className="text-xs md:text-sm uppercase tracking-widest text-text-muted font-medium">Legal</p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-text-primary leading-tight">
          Privacy Policy
        </h1>
        <p className="text-sm md:text-base text-text-muted">Last updated: April 16, 2026</p>
      </div>

      <div className="prose-content">
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">
          StayDue (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is operated by Talha
          Ahmad. This Privacy Policy explains how we collect, use, disclose, and protect your
          information when you use StayDue (the &ldquo;Service&rdquo;). By creating an account or
          using the Service, you agree to this policy.
        </p>

        <Section title="1. Information We Collect">
          <p>
            <strong className="text-text-primary font-medium">Account information.</strong> When
            you create an account, we collect your name, email address, password (stored as a
            secure hash — never in plain text), and your university admission year.
          </p>
          <p>
            <strong className="text-text-primary font-medium">Phone number.</strong> If you opt in
            to WhatsApp reminders, we collect your Pakistani mobile phone number in E.164 format
            (+92XXXXXXXXXX). Providing a phone number is optional.
          </p>
          <p>
            <strong className="text-text-primary font-medium">Calendar data.</strong> When you
            connect your Moodle calendar, we collect your Moodle ICS export URL and the deadline
            title, due date, and course information contained in your calendar feed.
          </p>
          <p>
            <strong className="text-text-primary font-medium">Payment information.</strong> When
            you submit a subscription request, we collect a screenshot of your payment receipt, a
            transaction ID, and your preferred payment method name. We do not collect or store
            credit card numbers, full bank account numbers, or other financial credentials.
          </p>
          <p>
            <strong className="text-text-primary font-medium">Usage data.</strong> We automatically
            collect limited usage information including login timestamps, deadline interaction
            events (marking a deadline done or undone), and calendar sync timestamps.
          </p>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul>
            <li>Create and manage your account</li>
            <li>Fetch and display your assignment deadlines on the dashboard</li>
            <li>Send deadline reminder emails to your registered email address</li>
            <li>
              Send deadline reminder messages to your WhatsApp number (only if you provide one and
              opt in)
            </li>
            <li>Process and review your subscription payment</li>
            <li>Respond to your support requests</li>
            <li>Detect and prevent fraudulent use of the Service</li>
            <li>Improve the Service</li>
          </ul>
        </Section>

        <Section title="3. Third-Party Services">
          <p>
            We rely on the following third-party services to operate StayDue. By using the
            Service, you agree to the applicable privacy practices of each service listed below.
          </p>

          <SubSection title="MongoDB Atlas (MongoDB, Inc.)">
            Your account data, deadlines, and subscription records are stored on MongoDB Atlas
            database servers. Data may be processed and stored in the United States.{" "}
            <ExternalLink href="https://www.mongodb.com/legal/privacy-policy">
              Privacy Policy
            </ExternalLink>
          </SubSection>

          <SubSection title="Vercel, Inc.">
            StayDue is hosted and served through Vercel. All requests to the Service pass through
            Vercel&apos;s infrastructure.{" "}
            <ExternalLink href="https://vercel.com/legal/privacy-policy">
              Privacy Policy
            </ExternalLink>
          </SubSection>

          <SubSection title="Cloudflare, Inc. (R2 Object Storage)">
            Payment receipt screenshots are stored in Cloudflare R2 private object storage.
            Screenshots are accessible only via time-limited signed URLs generated for admin
            review.{" "}
            <ExternalLink href="https://www.cloudflare.com/privacypolicy/">
              Privacy Policy
            </ExternalLink>
          </SubSection>

          <SubSection title="Resend">
            We use Resend to deliver transactional emails, including OTP verification codes,
            password reset emails, and deadline reminder emails. Your email address and associated
            deadline information are transmitted to Resend for delivery.{" "}
            <ExternalLink href="https://resend.com/legal/privacy-policy">
              Privacy Policy
            </ExternalLink>
          </SubSection>

          <SubSection title="Meta Platforms, Inc. (WhatsApp Business Cloud API)">
            If you provide a phone number and opt in to WhatsApp reminders, your phone number and
            deadline information are transmitted to Meta&apos;s WhatsApp Business Cloud API to
            deliver notification messages to your WhatsApp account. By providing your phone number
            and activating WhatsApp reminders, you consent to this processing by Meta. You may
            withdraw consent at any time by removing your phone number in Settings →
            Notifications.{" "}
            <ExternalLink href="https://www.whatsapp.com/legal/privacy-policy">
              Privacy Policy
            </ExternalLink>
          </SubSection>

          <SubSection title="Google (OAuth Sign-in)">
            If you choose to sign in with Google, your name and email address from your Google
            account are shared with StayDue under the OAuth 2.0 scopes you approve. We do not
            receive access to your Google account beyond what is required for authentication.{" "}
            <ExternalLink href="https://policies.google.com/privacy">Privacy Policy</ExternalLink>
          </SubSection>
        </Section>

        <Section title="4. Data Retention">
          <ul>
            <li>
              <strong className="text-text-primary font-medium">Active accounts:</strong> your data
              is retained for as long as your account remains active.
            </li>
            <li>
              <strong className="text-text-primary font-medium">Deleted accounts:</strong> all
              account data, deadlines, and subscription records are permanently deleted within 30
              days of account deletion. You can delete your account at any time via Settings →
              Danger Zone → Delete Account.
            </li>
            <li>
              <strong className="text-text-primary font-medium">Payment screenshots:</strong>{" "}
              retained for up to 90 days after subscription expiry for accounting reconciliation,
              then permanently deleted.
            </li>
            <li>
              <strong className="text-text-primary font-medium">Backups:</strong> deleted data may
              persist in encrypted database backups for up to 30 additional days before being
              overwritten.
            </li>
          </ul>
        </Section>

        <Section title="5. Your Rights">
          <p>You may at any time:</p>
          <ul>
            <li>
              <strong className="text-text-primary font-medium">View and edit your account</strong>{" "}
              via Settings → Account
            </li>
            <li>
              <strong className="text-text-primary font-medium">Remove your phone number</strong>{" "}
              to stop WhatsApp messages via Settings → Notifications
            </li>
            <li>
              <strong className="text-text-primary font-medium">
                Delete your account and all associated data
              </strong>{" "}
              via Settings → Danger Zone → Delete Account
            </li>
            <li>
              <strong className="text-text-primary font-medium">Contact us</strong> for any other
              privacy-related request using the contact details below
            </li>
          </ul>
        </Section>

        <Section title="6. Security">
          <p>We take reasonable technical and organisational measures to protect your data:</p>
          <ul>
            <li>Passwords are hashed using bcrypt before storage</li>
            <li>One-time verification codes are hashed with SHA-256 and expire within 15 minutes</li>
            <li>All communication is over HTTPS</li>
            <li>
              Payment screenshots are stored in private cloud storage and accessible only via
              short-lived, signed URLs
            </li>
            <li>
              Session tokens are managed via secure, HTTP-only cookies using NextAuth
            </li>
          </ul>
          <p>
            No security system is impenetrable. If you become aware of a security concern, please
            contact us immediately.
          </p>
        </Section>

        <Section title="7. Children's Privacy">
          <p>
            StayDue is not intended for use by anyone under the age of 13. We do not knowingly
            collect personal information from children under 13. If you believe we have
            inadvertently collected such information, please contact us and we will delete it
            promptly.
          </p>
        </Section>

        <Section title="8. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant
            changes by email or by displaying a notice in the Service. Your continued use of the
            Service after changes take effect constitutes your acceptance of the updated policy.
            The &ldquo;Last updated&rdquo; date at the top of this page reflects when the policy
            was last revised.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            For privacy-related questions, requests, or to exercise your rights, contact us at:
          </p>
          <p>
            <strong className="text-text-primary font-medium">Email:</strong>{" "}
            <span className="text-brand">contact@staydue.app</span>
          </p>
        </Section>
      </div>
    </StaticPageLayout>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="mt-10 space-y-3">
      <h2 className="text-base md:text-lg font-medium text-text-primary">{title}</h2>
      <div className="space-y-3 text-sm md:text-base text-text-secondary leading-relaxed">{children}</div>
    </div>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="mt-4 pl-4 border-l border-line-subtle">
      <p className="text-sm md:text-base font-medium text-text-primary mb-1">{title}</p>
      <p className="text-sm md:text-base text-text-secondary leading-relaxed">{children}</p>
    </div>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand hover:text-brand-hover transition-colors underline underline-offset-2"
    >
      {children}
    </a>
  );
}
