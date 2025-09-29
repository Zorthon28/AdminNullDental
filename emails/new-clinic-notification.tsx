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

interface NewClinicNotificationEmailProps {
  clinicName: string;
  clinicDomain: string;
  licenseType: string;
  adminContact: string;
  registrationDate: string;
}

export const NewClinicNotificationEmail = ({
  clinicName,
  clinicDomain,
  licenseType,
  adminContact,
  registrationDate,
}: NewClinicNotificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>🎉 New Clinic Added</Heading>
            <Text style={subtitle}>
              A new clinic has been registered in the system
            </Text>
          </Section>

          <Section style={success}>
            <Text style={successText}>Welcome to the NullDental network!</Text>
          </Section>

          <Section style={content}>
            <Heading as="h3" style={h3}>
              New Clinic Details:
            </Heading>
            <div style={clinicInfo}>
              <Text style={infoItem}>
                <strong>Clinic Name:</strong> {clinicName}
              </Text>
              <Text style={infoItem}>
                <strong>Domain:</strong> {clinicDomain}
              </Text>
              <Text style={infoItem}>
                <strong>License Type:</strong> {licenseType}
              </Text>
              <Text style={infoItem}>
                <strong>Contact:</strong> {adminContact}
              </Text>
              <Text style={infoItem}>
                <strong>Registration Date:</strong> {registrationDate}
              </Text>
            </div>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              The clinic has been successfully added to the NullDental system
              and is ready for license assignment.
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
  color: "#155724",
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
  backgroundColor: "#d4edda",
  border: "1px solid #c3e6cb",
  padding: "20px 48px",
  margin: "20px 48px",
  borderRadius: "4px",
};

const successText = {
  color: "#155724",
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

const clinicInfo = {
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

export default NewClinicNotificationEmail;
