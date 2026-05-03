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

interface TrialEndingEmailProps {
  userName: string;
}

export default function TrialEndingEmail({ userName }: TrialEndingEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your StayDue trial ends today — upgrade to keep WhatsApp reminders</Preview>
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
            <Text style={{ fontSize: "20px", fontWeight: "500", color: "#F59E0B", margin: "0 0 4px 0" }}>
              Trial ending today
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
              Your 30-day free trial ends today. After tonight, WhatsApp reminders will pause —
              email reminders will continue as normal.
            </Text>
            <Text style={{ fontSize: "14px", color: "#A3A3A3", margin: "0 0 20px 0", lineHeight: "1.6" }}>
              Upgrade to a paid plan to keep WhatsApp reminders running through your exams.
              Monthly (Rs 300) or Semester (Rs 1000) — both include full WhatsApp coverage.
            </Text>

            <div style={{ textAlign: "center" }}>
              <Button
                href="https://www.staydue.app/settings"
                style={{
                  backgroundColor: "#F59E0B",
                  color: "#111111",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Upgrade now
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
