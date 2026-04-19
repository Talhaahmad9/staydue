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

interface NewPaymentAlertEmailProps {
  userName: string;
  userEmail: string;
  plan: "monthly" | "semester";
  amount: number;
  transactionId: string;
}

const PLAN_LABEL: Record<string, string> = {
  monthly: "Monthly Plan",
  semester: "Semester Plan",
};

export default function NewPaymentAlertEmail({
  userName,
  userEmail,
  plan,
  amount,
  transactionId,
}: NewPaymentAlertEmailProps) {
  const planLabel = PLAN_LABEL[plan] ?? plan;

  return (
    <Html lang="en">
      <Head />
      <Preview>New payment pending review — {userName}</Preview>
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
            <Text style={{ fontSize: "20px", fontWeight: "500", color: "#FBBF24", margin: "0 0 4px 0" }}>
              New payment to review
            </Text>
            <Text style={{ fontSize: "12px", color: "#737373", margin: "0" }}>
              StayDue Admin
            </Text>
          </Section>

          <Hr style={{ borderColor: "#333333", margin: "0 0 24px 0" }} />

          <Section style={{ marginBottom: "24px" }}>
            <Text style={{ fontSize: "14px", color: "#A3A3A3", margin: "0 0 16px 0" }}>
              A new subscription payment is waiting for your review.
            </Text>

            <Section
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #333333",
                borderRadius: "8px",
                padding: "16px 20px",
                marginBottom: "20px",
              }}
            >
              <Text style={{ fontSize: "12px", color: "#A3A3A3", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>User</Text>
              <Text style={{ fontSize: "15px", color: "#F5F5F5", fontWeight: "500", margin: "0 0 12px 0" }}>{userName} — {userEmail}</Text>

              <Text style={{ fontSize: "12px", color: "#A3A3A3", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Plan</Text>
              <Text style={{ fontSize: "15px", color: "#F5F5F5", fontWeight: "500", margin: "0 0 12px 0" }}>{planLabel}</Text>

              <Text style={{ fontSize: "12px", color: "#A3A3A3", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Amount</Text>
              <Text style={{ fontSize: "15px", color: "#F5F5F5", fontWeight: "500", margin: "0 0 12px 0" }}>₨ {amount.toLocaleString()} PKR</Text>

              <Text style={{ fontSize: "12px", color: "#A3A3A3", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Transaction ID</Text>
              <Text style={{ fontSize: "14px", color: "#A3A3A3", fontFamily: "monospace", margin: "0" }}>{transactionId}</Text>
            </Section>

            <div style={{ textAlign: "center" }}>
              <Button
                href="https://www.staydue.app/admin/subscriptions?status=pending"
                style={{
                  backgroundColor: "#FBBF24",
                  color: "#111111",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Review in admin panel
              </Button>
            </div>
          </Section>

          <Hr style={{ borderColor: "#333333", margin: "24px 0" }} />

          <Section>
            <Text style={{ fontSize: "12px", color: "#737373", margin: "0" }}>
              This is an automated alert from StayDue.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
