import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Preview,
  Img,
} from "@react-email/components";
import React from "react";

interface ProActivatedEmailProps {
  userName: string;
  plan: "monthly" | "semester";
  endDate: Date;
}

const PLAN_LABEL: Record<string, string> = {
  monthly: "Monthly Plan",
  semester: "Semester Plan",
};

export default function ProActivatedEmail({ userName, plan, endDate }: ProActivatedEmailProps) {
  const planLabel = PLAN_LABEL[plan] ?? plan;
  const expiryStr = endDate.toLocaleDateString("en-PK", {
    timeZone: "Asia/Karachi",
    dateStyle: "long",
  });

  return (
    <Html lang="en">
      <Head />
      <Preview>Your StayDue Pro is now active</Preview>
      <Body
        style={{
          backgroundColor: "#111111",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
          color: "#F5F5F5",
        }}
      >
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Section style={{ marginBottom: "24px" }}>
            <Img
              src="https://www.staydue.app/staydue_logo.svg"
              alt="StayDue"
              width={120}
              height={40}
              style={{ marginBottom: "16px" }}
            />
            <Text style={{ fontSize: "20px", fontWeight: "500", color: "#0D9488", margin: "0 0 4px 0" }}>
              Pro activated
            </Text>
            <Text style={{ fontSize: "12px", color: "#737373", margin: "0" }}>
              Never miss a deadline.
            </Text>
          </Section>

          <Hr style={{ borderColor: "#333333", margin: "0 0 24px 0" }} />

          <Section style={{ marginBottom: "24px" }}>
            <Text style={{ fontSize: "15px", color: "#D4D4D4", margin: "0 0 16px 0", lineHeight: "1.6" }}>
              Hi {userName},
            </Text>
            <Text style={{ fontSize: "15px", color: "#D4D4D4", margin: "0 0 20px 0", lineHeight: "1.6" }}>
              Your payment has been verified and your{" "}
              <strong style={{ color: "#F5F5F5" }}>StayDue Pro — {planLabel}</strong> is now active.
            </Text>

            <Section
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #0D9488",
                borderRadius: "8px",
                padding: "16px 20px",
                marginBottom: "20px",
              }}
            >
              <Text style={{ fontSize: "12px", color: "#A3A3A3", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Plan
              </Text>
              <Text style={{ fontSize: "16px", color: "#0D9488", fontWeight: "600", margin: "0 0 12px 0" }}>
                {planLabel}
              </Text>
              <Text style={{ fontSize: "12px", color: "#A3A3A3", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Active until
              </Text>
              <Text style={{ fontSize: "16px", color: "#F5F5F5", fontWeight: "500", margin: "0" }}>
                {expiryStr}
              </Text>
            </Section>

            <Text style={{ fontSize: "14px", color: "#A3A3A3", margin: "0 0 20px 0", lineHeight: "1.6" }}>
              WhatsApp reminders and all Pro features are now enabled. Head to your dashboard to confirm everything looks right.
            </Text>

            <div style={{ textAlign: "center" }}>
              <Button
                href="https://www.staydue.app/dashboard"
                style={{
                  backgroundColor: "#0D9488",
                  color: "#FFFFFF",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Go to dashboard
              </Button>
            </div>
          </Section>

          <Hr style={{ borderColor: "#333333", margin: "24px 0" }} />

          <Section>
            <Text style={{ fontSize: "12px", color: "#737373", margin: "0", lineHeight: "1.6" }}>
              Questions? Reply to this email or contact{" "}
              <a href="mailto:support@staydue.app" style={{ color: "#0D9488" }}>
                support@staydue.app
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
