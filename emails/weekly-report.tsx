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

interface WeeklyReportEmailProps {
  totalLicenses: number;
  activeLicenses: number;
  totalClinics: number;
  newClinicsThisWeek: number;
  reportDate: string;
}

export const WeeklyReportEmail = ({
  totalLicenses,
  activeLicenses,
  totalClinics,
  newClinicsThisWeek,
  reportDate,
}: WeeklyReportEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>📊 Weekly Report</Heading>
            <Text style={subtitle}>
              NullDental Admin System Summary - {reportDate}
            </Text>
          </Section>

          <Section style={stats}>
            <div style={statGrid}>
              <div style={statItem}>
                <div style={statNumber}>{totalLicenses}</div>
                <div style={statLabel}>Total Licenses</div>
              </div>
              <div style={statItem}>
                <div style={statNumber}>{activeLicenses}</div>
                <div style={statLabel}>Active Licenses</div>
              </div>
              <div style={statItem}>
                <div style={statNumber}>{totalClinics}</div>
                <div style={statLabel}>Total Clinics</div>
              </div>
              <div style={statItem}>
                <div style={statNumber}>{newClinicsThisWeek}</div>
                <div style={statLabel}>New Clinics (Week)</div>
              </div>
            </div>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              This is your automated weekly summary report. The system is
              operating normally.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              This is an automated weekly report from NullDental Admin System.
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
  color: "#495057",
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

const stats = {
  padding: "20px 48px",
};

const statGrid = {
  display: "flex",
  justifyContent: "space-around",
  flexWrap: "wrap" as const,
};

const statItem = {
  textAlign: "center" as const,
  minWidth: "120px",
  margin: "10px",
};

const statNumber = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#007bff",
  marginBottom: "8px",
};

const statLabel = {
  fontSize: "12px",
  color: "#6c757d",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
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

export default WeeklyReportEmail;
