import React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} from "@react-email/components";

interface TestEmailProps {
  testTime: string;
}

export const TestEmail = ({ testTime }: TestEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>✅ Email Test Successful</Heading>
            <Text style={subtitle}>
              NullDental email system is working correctly
            </Text>
          </Section>

          <Section style={success}>
            <Text style={successText}>
              Great! This test email confirms that your NullDental email
              notifications are properly configured and working.
            </Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              This email was sent at: <strong>{testTime}</strong>
            </Text>
            <Text style={paragraph}>
              If you received this email, your email settings are correctly
              configured.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              This is a test email from NullDental Admin System.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const header = {
  padding: "40px 48px 20px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#0c5460",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 12px",
  padding: "0",
};

const subtitle = {
  color: "#6c757d",
  fontSize: "16px",
  margin: "0",
};

const success = {
  backgroundColor: "#d1ecf1",
  border: "1px solid #bee5eb",
  padding: "20px 48px",
  margin: "20px 48px",
  borderRadius: "4px",
};

const successText = {
  color: "#0c5460",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
  textAlign: "center" as const,
};

const content = {
  padding: "0 48px 40px",
};

const paragraph = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "16px 0",
};

const hr = {
  borderColor: "#e9ecef",
  margin: "20px 48px",
};

const footer = {
  padding: "0 48px",
};

const footerText = {
  color: "#6c757d",
  fontSize: "12px",
  lineHeight: "1.4",
};

export default TestEmail;
