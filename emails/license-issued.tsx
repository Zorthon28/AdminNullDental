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
  Img,
} from "@react-email/components";

interface LicenseIssuedEmailProps {
  clinicName: string;
  clinicDomain: string;
  licenseType: string;
  version: string;
  activationDate: string;
  supportExpiry: string;
}

export const LicenseIssuedEmail = ({
  clinicName,
  clinicDomain,
  licenseType,
  version,
  activationDate,
  supportExpiry,
}: LicenseIssuedEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://your-domain.com/images/logo.png"
              alt="NullDental"
              width="150"
              height="40"
              style={{ margin: "0 auto 20px", display: "block" }}
            />
            <Heading style={h1}>✅ License Issued</Heading>
            <Text style={subtitle}>
              A new license has been created and assigned
            </Text>
          </Section>

          <Section style={content}>
            <Heading as="h3" style={h3}>
              License Details:
            </Heading>
            <div style={licenseInfo}>
              <Text style={infoItem}>
                <strong>Clinic:</strong> {clinicName}
              </Text>
              <Text style={infoItem}>
                <strong>Domain:</strong> {clinicDomain}
              </Text>
              <Text style={infoItem}>
                <strong>License Type:</strong> {licenseType}
              </Text>
              <Text style={infoItem}>
                <strong>Version:</strong> {version}
              </Text>
              <Text style={infoItem}>
                <strong>Activation Date:</strong> {activationDate}
              </Text>
              <Text style={infoItem}>
                <strong>Support Expiry:</strong> {supportExpiry}
              </Text>
            </div>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              The license has been successfully issued and is now active in the
              system.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              This is an automated message from NullDental Admin System.
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

const content = {
  padding: "0 48px 40px",
};

const h3 = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "40px 0 20px",
};

const licenseInfo = {
  backgroundColor: "#f8f9fa",
  padding: "20px",
  borderRadius: "4px",
  margin: "20px 0",
};

const infoItem = {
  color: "#333",
  fontSize: "14px",
  margin: "8px 0",
  lineHeight: "1.4",
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

export default LicenseIssuedEmail;
