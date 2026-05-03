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

interface GracePeriodEmailProps {
  userName: string;
  daysLeft: 1 | 2 | 3;
}

export default function GracePeriodEmail({ userName, daysLeft }: GracePeriodEmailProps) {
  const isLastDay = daysLeft === 1;
  const accentColor = isLastDay ? "#EF4444" : "#F59E0B";
  const headingText = isLastDay
    ? "Last day to renew"
    : `${daysLeft} days left to renew`;

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {isLastDay
          ? "Your StayDue Pro access ends today — renew now"
          : `Your StayDue Pro has expired — ${daysLeft} days left to renew`}
      </Preview>
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
            <Text style={{ fontSize: "20px", fontWeight: "500", color: accentColor, margin: "0 0 4px 0" }}>
              {headingText}
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
              {isLastDay
                ? "Your StayDue Pro subscription has expired. Today is your last day to renew — after tonight your account will revert to the free tier and WhatsApp reminders will stop."
                : `Your StayDue Pro subscription has expired. You have ${daysLeft} days left to renew before your account reverts to the free tier and WhatsApp reminders stop.`}
            </Text>

            <Section
              style={{
                backgroundColor: "#1A1A1A",
                border: `1px solid ${accentColor}`,
                borderRadius: "8px",
                padding: "16px 20px",
                marginBottom: "20px",
              }}
            >
              <Text style={{ fontSize: "12px", color: "#A3A3A3", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Grace period ends in
              </Text>
              <Text style={{ fontSize: "20px", color: accentColor, fontWeight: "600", margin: "0" }}>
                {isLastDay ? "today" : `${daysLeft} days`}
              </Text>
            </Section>

            <Text style={{ fontSize: "14px", color: "#A3A3A3", margin: "0 0 20px 0", lineHeight: "1.6" }}>
              Submit a new payment from your settings to continue uninterrupted. Your deadlines and
              calendar are safe regardless.
            </Text>

            <div style={{ textAlign: "center" }}>
              <Button
                href="https://www.staydue.app/settings"
                style={{
                  backgroundColor: accentColor,
                  color: isLastDay ? "#FFFFFF" : "#111111",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Renew now
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
