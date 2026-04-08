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
import { DeadlineNotificationPayload } from "@/types/notification";

interface ReminderEmailProps {
  payload: DeadlineNotificationPayload;
}

export default function ReminderEmail({ payload }: ReminderEmailProps) {
  const { deadline } = payload;
  const { title, courseCode, courseTitle, dueDate, interval, allUpcoming } = deadline;

  const getPreviewText = () => {
    switch (interval) {
      case "3-day":
        return `3 days left — ${title}`;
      case "1-day":
        return `Due tomorrow — ${title}`;
      case "day-of":
        return `Due today — ${title}`;
    }
  };

  const getUrgencyBannerConfig = () => {
    switch (interval) {
      case "3-day":
        return {
          bg: "#242424",
          borderColor: "#0D9488",
          label: "Upcoming deadline",
          labelColor: "#0D9488",
        };
      case "1-day":
        return {
          bg: "#2D2515",
          borderColor: "#FBBF24",
          label: "Due tomorrow",
          labelColor: "#FBBF24",
        };
      case "day-of":
        return {
          bg: "#2D1515",
          borderColor: "#F87171",
          label: "Due today",
          labelColor: "#F87171",
        };
    }
  };

  const getCardBorderColor = () => {
    switch (interval) {
      case "3-day":
        return "#0D9488";
      case "1-day":
        return "#FBBF24";
      case "day-of":
        return "#F87171";
    }
  };

  const getUrgencyPillConfig = (urgency: string) => {
    switch (urgency) {
      case "today":
        return { bg: "#2D1515", color: "#F87171" };
      case "tomorrow":
        return { bg: "#2D2515", color: "#FBBF24" };
      case "3-day":
        return { bg: "#1A3330", color: "#0D9488" };
      case "upcoming":
      default:
        return { bg: "#242424", color: "#737373" };
    }
  };

  const bannerConfig = getUrgencyBannerConfig();
  const borderColor = getCardBorderColor();

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
      <Preview>{getPreviewText()}</Preview>
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
              backgroundColor: bannerConfig!.bg,
              borderLeft: `3px solid ${bannerConfig!.borderColor}`,
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "24px",
            }}
          >
            <Text
              style={{
                fontSize: "11px",
                fontWeight: "500",
                color: bannerConfig!.labelColor,
                margin: "0",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              {bannerConfig!.label}
            </Text>
          </Section>

          {/* Primary Deadline Card */}
          <Section
            style={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #333333",
              borderLeft: `3px solid ${borderColor}`,
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <Text
              style={{
                fontSize: "18px",
                fontWeight: "500",
                color: "#F5F5F5",
                margin: "0 0 12px 0",
              }}
            >
              {title}
            </Text>

            <Text
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#0D9488",
                margin: "0 0 4px 0",
              }}
            >
              {courseCode}
            </Text>

            <Text
              style={{
                fontSize: "13px",
                color: "#737373",
                margin: "0 0 12px 0",
              }}
            >
              {courseTitle}
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
                  Due{" "}
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
                  {dueDate}
                </Text>
              </Column>
            </Row>
          </Section>

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

          {/* Upcoming Deadlines Summary */}
          {allUpcoming && allUpcoming.length > 0 && (
            <Section style={{ marginBottom: "24px" }}>
              <Text
                style={{
                  fontSize: "11px",
                  fontWeight: "500",
                  color: "#737373",
                  margin: "0 0 12px 0",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                }}
              >
                Your other upcoming deadlines
              </Text>

              {allUpcoming.slice(0, 4).map((deadline, index) => {
                const pillConfig = getUrgencyPillConfig(deadline.urgency);
                return (
                  <div key={index}>
                    <Row style={{ marginBottom: index < 3 ? "12px" : "0" }}>
                      <Column style={{ paddingRight: "12px" }}>
                        <Text
                          style={{
                            fontSize: "13px",
                            color: "#A3A3A3",
                            margin: "0 0 2px 0",
                          }}
                        >
                          {deadline.title}
                        </Text>
                        <Text
                          style={{
                            fontSize: "11px",
                            color: "#737373",
                            margin: "0",
                          }}
                        >
                          {deadline.courseCode}
                        </Text>
                      </Column>
                      <Column style={{ textAlign: "right" }}>
                        <div
                          style={{
                            backgroundColor: pillConfig.bg,
                            color: pillConfig.color,
                            fontSize: "10px",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            display: "inline-block",
                            marginBottom: "2px",
                          }}
                        >
                          {deadline.urgency}
                        </div>
                      </Column>
                    </Row>
                    {index < Math.min(3, allUpcoming.length - 1) && (
                      <hr
                        style={{
                          borderColor: "#2A2A2A",
                          borderTop: "1px solid #2A2A2A",
                          margin: "12px 0",
                        }}
                      />
                    )}
                  </div>
                );
              })}

              {allUpcoming.length === 0 && (
                <Text
                  style={{
                    fontSize: "13px",
                    color: "#737373",
                  }}
                >
                  No other upcoming deadlines.
                </Text>
              )}
            </Section>
          )}

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
