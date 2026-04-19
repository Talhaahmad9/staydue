import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Button,
  Hr,
  Preview,
  Img,
} from "@react-email/components";
import React from "react";
import { BatchNotificationPayload } from "@/types/notification";

interface OverdueDigestEmailProps {
  payload: BatchNotificationPayload;
}

export default function OverdueDigestEmail({ payload }: OverdueDigestEmailProps) {
  const { userName, deadlines } = payload;
  const count = deadlines.length;
  const previewText = count === 1
    ? `Missed deadline: ${deadlines[0].title}`
    : `You have ${count} overdue deadlines`;

  return (
    <Html lang="en">
      <Head>
        <style>{`
          @media only screen and (max-width: 600px) {
            .email-logo {
              width: 160px !important;
              height: 54px !important;
            }
          }
        `}</style>
      </Head>
      <Preview>{previewText}</Preview>
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
              width={200}
              height={67}
              className="email-logo"
              style={{ display: "block", margin: "0 auto 4px", maxWidth: "100%", height: "auto" }}
            />
          </Section>

          {/* Urgency Banner */}
          <Section
            style={{
              backgroundColor: "#2D1515",
              borderLeft: "3px solid #F87171",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "24px",
            }}
          >
            <Text
              style={{
                fontSize: "11px",
                fontWeight: "500",
                color: "#F87171",
                margin: "0",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              {count === 1 ? "Deadline passed" : `${count} deadlines passed`}
            </Text>
          </Section>

          {/* Greeting */}
          <Text
            style={{
              fontSize: "16px",
              color: "#F5F5F5",
              margin: "0 0 4px 0",
            }}
          >
            Hi {userName},
          </Text>
          <Text
            style={{
              fontSize: "14px",
              color: "#A3A3A3",
              margin: "0 0 24px 0",
            }}
          >
            {count === 1
              ? "You have a deadline that has passed."
              : `You have ${count} deadlines that have passed. If you've already submitted, mark them as done in StayDue.`}
          </Text>

          {/* Overdue Deadline Cards */}
          {deadlines.map((deadline, index) => (
            <Section
              key={index}
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #333333",
                borderLeft: "3px solid #F87171",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              <Text
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#F5F5F5",
                  margin: "0 0 10px 0",
                }}
              >
                {deadline.title}
              </Text>
              <Text
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "#0D9488",
                  margin: "0 0 4px 0",
                }}
              >
                {deadline.courseCode}
              </Text>
              <Text
                style={{
                  fontSize: "13px",
                  color: "#737373",
                  margin: "0 0 12px 0",
                }}
              >
                {deadline.courseTitle}
              </Text>
              <Row>
                <Column>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#737373",
                      margin: "0",
                    }}
                  >
                    Was due on
                  </Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#A3A3A3",
                      margin: "0",
                    }}
                  >
                    {deadline.dueDate}
                  </Text>
                </Column>
              </Row>
            </Section>
          ))}

          {/* CTA Button */}
          <Section style={{ textAlign: "center", marginBottom: "24px" }}>
            <Button
              href="https://www.staydue.app/dashboard"
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
              Open StayDue
            </Button>
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
              Mark these as submitted in StayDue if you&apos;ve already turned them in.
            </Text>
            <Text style={{ fontSize: "11px", color: "#4A4A4A", margin: "0 0 8px 0" }}>
              You&apos;re receiving this because you connected your Moodle calendar to StayDue.
            </Text>
            <Text style={{ fontSize: "11px", margin: "0" }}>
              <a
                href="https://www.staydue.app/settings"
                style={{
                  color: "#737373",
                  textDecoration: "none",
                }}
              >
                Manage your notifications
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
