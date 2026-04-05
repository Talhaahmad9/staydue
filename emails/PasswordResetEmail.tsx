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
} from "@react-email/components";
import React from "react";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export default function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Reset your StayDue password</Preview>
      <Body
        style={{
          backgroundColor: "#111111",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
          color: "#F5F5F5",
        }}
      >
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          {/* Header */}
          <Section style={{ marginBottom: "24px" }}>
            <Text
              style={{
                fontSize: "20px",
                fontWeight: "500",
                color: "#0D9488",
                margin: "0 0 4px 0",
              }}
            >
              StayDue
            </Text>
            <Text style={{ fontSize: "12px", color: "#737373", margin: "0" }}>
              Never miss a deadline.
            </Text>
          </Section>

          {/* Main Card */}
          <Section
            style={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #333333",
              borderRadius: "12px",
              padding: "32px 24px",
              marginBottom: "24px",
            }}
          >
            {/* Heading */}
            <Text
              style={{
                fontSize: "20px",
                fontWeight: "500",
                color: "#F5F5F5",
                margin: "0 0 12px 0",
              }}
            >
              Reset your password
            </Text>

            {/* Body Text */}
            <Text
              style={{
                fontSize: "14px",
                color: "#A3A3A3",
                margin: "0 0 24px 0",
                lineHeight: "1.5",
              }}
            >
              Click the button below to set a new password. This link expires in 1 hour.
            </Text>

            {/* CTA Button */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <Button
                href={resetUrl}
                style={{
                  backgroundColor: "#0D9488",
                  color: "#F5F5F5",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "500",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Reset password
              </Button>
            </div>

            {/* Security Note */}
            <Text
              style={{
                fontSize: "12px",
                color: "#737373",
                margin: "0",
                lineHeight: "1.5",
              }}
            >
              If you didn&apos;t request this, you can safely ignore this email. Your password
              won&apos;t change.
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={{ borderColor: "#2A2A2A", margin: "24px 0" }} />
          <Section style={{ textAlign: "center" }}>
            <Text
              style={{
                fontSize: "11px",
                color: "#4A4A4A",
                margin: "0 0 8px 0",
              }}
            >
              You&apos;re receiving this because a password reset was requested for your StayDue
              account.
            </Text>
            <Text style={{ fontSize: "11px", margin: "0" }}>
              <a
                href="https://www.staydue.app"
                style={{
                  color: "#737373",
                  textDecoration: "none",
                }}
              >
                Visit StayDue
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
