import type { Metadata } from "next";
import StaticPageLayout from "@/components/landing/StaticPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service — StayDue",
  description: "Terms and conditions for using StayDue.",
};

export default function TermsPage(): React.ReactElement {
  return (
    <StaticPageLayout>
      <div className="space-y-2 mb-10">
        <p className="text-xs md:text-sm uppercase tracking-widest text-text-muted font-medium">Legal</p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-text-primary leading-tight">
          Terms of Service
        </h1>
        <p className="text-sm md:text-base text-text-muted">Last updated: April 16, 2026</p>
      </div>

      <div className="space-y-1 text-sm md:text-base text-text-secondary leading-relaxed">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of StayDue
          (the &ldquo;Service&rdquo;), operated by Talha Ahmad (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
          &ldquo;our&rdquo;). By creating an account or using the Service, you confirm that you
          have read, understood, and agree to be bound by these Terms. If you do not agree, do
          not use the Service.
        </p>

        <Section title="1. Agreement to Terms">
          <p>
            By accessing or using StayDue, you represent that you are at least 13 years old and
            have the legal capacity to enter into this agreement. If you are under 18, you
            represent that a parent or guardian has reviewed and agreed to these Terms on your
            behalf.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            StayDue is designed for university students using Moodle-based learning management
            systems. You may use the Service if you have access to a valid Moodle calendar export
            URL and agree to these Terms. There is no restriction by university or geography,
            though certain features (WhatsApp reminders) are currently limited to Pakistani mobile
            numbers.
          </p>
        </Section>

        <Section title="3. Account Responsibilities">
          <p>You are responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activity that occurs under your account</li>
            <li>Ensuring that the information you provide to StayDue is accurate</li>
            <li>Notifying us promptly of any unauthorized use of your account</li>
          </ul>
          <p>
            You must not share your account with others or use another person&apos;s account
            without their explicit permission.
          </p>
        </Section>

        <Section title="4. Acceptable Use">
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose or in violation of any regulation</li>
            <li>Attempt to gain unauthorized access to the Service or its underlying systems</li>
            <li>Use automated tools, bots, or scripts to abuse, scrape, or overload the Service</li>
            <li>Impersonate any person, entity, or institution</li>
            <li>Submit false, misleading, or fabricated payment information</li>
            <li>
              Use another person&apos;s Moodle credentials or calendar URL without authorization
            </li>
          </ul>
        </Section>

        <Section title="5. Subscription and Payments">
          <p>
            StayDue offers paid subscription plans — Monthly (PKR 300) and Semester (PKR 1,000)
            — that unlock WhatsApp reminder features. Email reminders are available on all
            accounts at no charge.
          </p>
          <p>
            <strong className="text-text-primary font-medium">Payment process.</strong> You submit
            a subscription request by providing a payment screenshot and transaction ID. We
            manually review and activate subscriptions within 24 hours of verification.
          </p>
          <p>
            <strong className="text-text-primary font-medium">No refunds.</strong> All subscription
            payments are final. We do not offer refunds once a subscription has been activated. If
            you have a concern before activation, contact us and we will address it before
            proceeding.
          </p>
          <p>
            <strong className="text-text-primary font-medium">Pricing changes.</strong> We reserve
            the right to change plan pricing at any time. Pricing changes will not affect
            subscription periods that are currently active.
          </p>
        </Section>

        <Section title="6. WhatsApp Trial">
          <p>
            Upon verifying a Pakistani mobile number, you receive a 7-day free trial for WhatsApp
            reminders. The trial is:
          </p>
          <ul>
            <li>Non-transferable and limited to one per phone number, across all accounts</li>
            <li>Not extendable under any circumstances</li>
            <li>
              Not available if the phone number has previously been used for a trial on any other
              StayDue account
            </li>
          </ul>
        </Section>

        <Section title="7. Service Availability">
          <p>
            We aim to keep StayDue available at all times but do not guarantee uninterrupted or
            error-free access. Calendar sync depends on your Moodle institution&apos;s server
            availability. We are not responsible for missed notifications due to service outages,
            Moodle downtime, carrier delivery failures for WhatsApp, or email spam filtering.
          </p>
        </Section>

        <Section title="8. Intellectual Property">
          <p>
            All content, features, and functionality of StayDue — including its design, source
            code, text, and branding — are owned by us and protected under applicable intellectual
            property laws. You may not copy, reproduce, distribute, or create derivative works
            from any part of the Service without our prior written permission.
          </p>
        </Section>

        <Section title="9. Termination">
          <p>
            We reserve the right to suspend or terminate your account at any time, with or without
            notice, if we have reasonable grounds to believe you have violated these Terms or
            engaged in conduct harmful to the Service or its users.
          </p>
          <p>
            You may delete your account at any time via Settings → Danger Zone → Delete Account.
            Deletion is permanent and irreversible.
          </p>
        </Section>

        <Section title="10. Disclaimer of Warranties">
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
            warranty of any kind, express or implied. We do not warrant that the Service will be
            uninterrupted, error-free, or free of viruses, that reminders will always be delivered,
            or that deadline data imported from Moodle will be accurate, complete, or up to date.
            Use of the Service is at your own risk.
          </p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>
            To the maximum extent permitted by applicable law, we shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising out of or
            related to your use of the Service, including but not limited to missed academic
            deadlines, academic penalties, lost grades, or any other academic consequences. Our
            total liability for any claim arising under these Terms shall not exceed the amount
            you paid us in the 30 days preceding the claim.
          </p>
        </Section>

        <Section title="12. Governing Law">
          <p>
            These Terms are governed by and construed in accordance with the laws of Pakistan. Any
            dispute arising out of or relating to these Terms or the Service shall be subject to
            the exclusive jurisdiction of the courts of Karachi, Pakistan.
          </p>
        </Section>

        <Section title="13. Changes to These Terms">
          <p>
            We may revise these Terms from time to time. We will notify you of material changes
            by email or in-app notice. Continued use of the Service after changes take effect
            constitutes your acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="14. Contact">
          <p>For questions about these Terms, contact us at:</p>
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
