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

interface LicenseExpiryWarningEmailProps {
  clinicName: string;
  clinicDomain: string;
  licenseType: string;
  version: string;
  supportExpiry: string;
  daysUntilExpiry: number;
}

export const LicenseExpiryWarningEmail = ({
  clinicName,
  clinicDomain,
  licenseType,
  version,
  supportExpiry,
  daysUntilExpiry,
}: LicenseExpiryWarningEmailProps) => {
  const urgencyColor =
    daysUntilExpiry <= 7
      ? "#dc3545"
      : daysUntilExpiry <= 14
        ? "#fd7e14"
        : "#ffc107";

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={{ ...h1, color: urgencyColor }}>
              ⚠️ License Expiry Warning
            </Heading>
            <Text style={subtitle}>
              Action required for your NullDental license
            </Text>
          </Section>

          <Section style={{ ...warning, borderColor: urgencyColor }}>
            <Text style={{ ...warningText, color: urgencyColor }}>
              <strong>
                License for {clinicName} expires in {daysUntilExpiry} day
                {daysUntilExpiry !== 1 ? "s" : ""}
              </strong>
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
                <strong>Expiry Date:</strong> {supportExpiry}
              </Text>
            </div>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              Please contact your NullDental administrator to renew this license
              before it expires to avoid service interruption.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              This is an automated message from NullDental Admin System.
            </Text>
            <Text style={footerText}>
              If you have any questions, please contact support@nulldental.com
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

const warning = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffeaa7",
  padding: "20px 48px",
  margin: "20px 48px",
  borderRadius: "4px",
};

const warningText = {
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
  textAlign: "center" as const,
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
  margin: "4px 0",
};

export default LicenseExpiryWarningEmail;
