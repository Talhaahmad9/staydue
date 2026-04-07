import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
  Img,
} from "@react-email/components";
import React from "react";

interface OtpEmailProps {
  otp: string;
}

export default function OtpEmail({ otp }: OtpEmailProps) {
  const otpDigits = otp.split("");

  return (
    <Html lang="en">
      <Head />
      <Preview>Your StayDue verification code is {otp}</Preview>
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
          <Section style={{ marginBottom: "24px", textAlign: "center" }}>
            <Img
              src="https://www.staydue.app/staydue_logo.svg"
              alt="StayDue"
              width={140}
              height={47}
              style={{ display: "block", margin: "0 auto 4px" }}
            />
          </Section>

          {/* Main Card */}
          <Section
            style={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #333333",
              borderRadius: "12px",
              padding: "32px 24px",
              marginBottom: "24px",
              textAlign: "center",
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
              Verify your email
            </Text>

            {/* Body Text */}
            <Text
              style={{
                fontSize: "14px",
                color: "#A3A3A3",
                margin: "0 0 28px 0",
                lineHeight: "1.5",
              }}
            >
              Enter this code to complete your signup.
            </Text>

            {/* OTP Boxes */}
            <Section style={{ textAlign: "center", marginBottom: "28px" }}>
              {otpDigits.map((digit, index) => (
                <Text
                  key={index}
                  style={{
                    display: "inline-block",
                    width: "52px",
                    height: "64px",
                    lineHeight: "64px",
                    textAlign: "center",
                    fontSize: "32px",
                    fontWeight: "500",
                    color: "#F5F5F5",
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #0D9488",
                    borderRadius: "10px",
                    margin: "0 6px",
                    verticalAlign: "middle",
                  }}
                >
                  {digit}
                </Text>
              ))}
            </Section>

            {/* Expiry Note */}
            <Text
              style={{
                fontSize: "12px",
                color: "#737373",
                margin: "0",
              }}
            >
              This code expires in 10 minutes.
            </Text>
          </Section>

          {/* Didn't Request Hint */}
          <Section style={{ marginBottom: "24px", textAlign: "center" }}>
            <Text
              style={{
                fontSize: "11px",
                color: "#4A4A4A",
                margin: "0",
              }}
            >
              Didn&apos;t request this? You can ignore this email.
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
              You&apos;re receiving this because you signed up for StayDue.
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
