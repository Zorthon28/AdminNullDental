import { Resend } from "resend";
import { render } from "@react-email/render";
import { LicenseIssuedEmail } from "../../emails/license-issued";
import { LicenseExpiryWarningEmail } from "../../emails/license-expiry-warning";
import { NewClinicNotificationEmail } from "../../emails/new-clinic-notification";
import { WeeklyReportEmail } from "../../emails/weekly-report";
import { TestEmail } from "../../emails/test-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const from = options.from || "NullDental Admin <admin@nulldental.com>";

    const result = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log("Email sent successfully:", result);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

export async function sendLicenseIssuedEmail(
  to: string,
  licenseData: {
    clinicName: string;
    clinicDomain: string;
    licenseType: string;
    version: string;
    activationDate: string;
    supportExpiry: string;
  }
) {
  const html = await render(LicenseIssuedEmail(licenseData));
  return sendEmail({
    to,
    subject: `License Issued - ${licenseData.clinicName}`,
    html,
  });
}

export async function sendLicenseExpiryWarningEmail(
  to: string,
  licenseData: {
    clinicName: string;
    clinicDomain: string;
    licenseType: string;
    version: string;
    supportExpiry: string;
    daysUntilExpiry: number;
  }
) {
  const html = await render(LicenseExpiryWarningEmail(licenseData));
  return sendEmail({
    to,
    subject: `License Expiry Warning - ${licenseData.clinicName} (${licenseData.daysUntilExpiry} days)`,
    html,
  });
}

export async function sendNewClinicNotificationEmail(
  to: string,
  clinicData: {
    clinicName: string;
    clinicDomain: string;
    licenseType: string;
    adminContact: string;
    registrationDate: string;
  }
) {
  const html = await render(NewClinicNotificationEmail(clinicData));
  return sendEmail({
    to,
    subject: `New Clinic Added - ${clinicData.clinicName}`,
    html,
  });
}

export async function sendWeeklyReportEmail(
  to: string,
  stats: {
    totalLicenses: number;
    activeLicenses: number;
    totalClinics: number;
    newClinicsThisWeek: number;
    reportDate: string;
  }
) {
  const html = await render(WeeklyReportEmail(stats));
  return sendEmail({
    to,
    subject: `Weekly Report - ${stats.reportDate}`,
    html,
  });
}

export async function sendTestEmail(to: string) {
  const html = await render(
    TestEmail({ testTime: new Date().toLocaleString() })
  );
  return sendEmail({
    to,
    subject: "NullDental Email Test",
    html,
  });
}

// Email Templates
export function generateLicenseExpiryWarningEmail(
  license: any,
  daysUntilExpiry: number
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>License Expiry Warning</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .clinic-info { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: #dc3545; margin: 0;">⚠️ License Expiry Warning</h1>
          <p style="margin: 10px 0 0 0;">Action required for your NullDental license</p>
        </div>

        <div class="warning">
          <strong>License for ${license.clinic.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}</strong>
        </div>

        <div class="clinic-info">
          <h3>License Details:</h3>
          <ul>
            <li><strong>Clinic:</strong> ${license.clinic.name}</li>
            <li><strong>Domain:</strong> ${license.clinic.domain}</li>
            <li><strong>License Type:</strong> ${license.type}</li>
            <li><strong>Version:</strong> ${license.version}</li>
            <li><strong>Expiry Date:</strong> ${new Date(license.supportExpiry).toLocaleDateString()}</li>
          </ul>
        </div>

        <p>Please contact your NullDental administrator to renew this license before it expires to avoid service interruption.</p>

        <div class="footer">
          <p>This is an automated message from NullDental Admin System.</p>
          <p>If you have any questions, please contact support@nulldental.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateNewClinicNotificationEmail(clinic: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Clinic Added</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .clinic-info { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: #155724; margin: 0;">🎉 New Clinic Added</h1>
          <p style="margin: 10px 0 0 0;">A new clinic has been registered in the system</p>
        </div>

        <div class="clinic-info">
          <h3>New Clinic Details:</h3>
          <ul>
            <li><strong>Clinic Name:</strong> ${clinic.name}</li>
            <li><strong>Domain:</strong> ${clinic.domain}</li>
            <li><strong>License Type:</strong> ${clinic.licenseType}</li>
            <li><strong>Contact:</strong> ${clinic.adminContact}</li>
            <li><strong>Registration Date:</strong> ${new Date(clinic.createdAt).toLocaleDateString()}</li>
          </ul>
        </div>

        <p>The clinic has been successfully added to the NullDental system and is ready for license assignment.</p>

        <div class="footer">
          <p>This is an automated message from NullDental Admin System.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateLicenseIssuedEmail(license: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>License Issued</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d1ecf1; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .license-info { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: #0c5460; margin: 0;">✅ License Issued</h1>
          <p style="margin: 10px 0 0 0;">A new license has been created and assigned</p>
        </div>

        <div class="license-info">
          <h3>License Details:</h3>
          <ul>
            <li><strong>Clinic:</strong> ${license.clinic.name}</li>
            <li><strong>Domain:</strong> ${license.clinic.domain}</li>
            <li><strong>License Type:</strong> ${license.type}</li>
            <li><strong>Version:</strong> ${license.version}</li>
            <li><strong>Activation Date:</strong> ${new Date(license.activationDate).toLocaleDateString()}</li>
            <li><strong>Support Expiry:</strong> ${new Date(license.supportExpiry).toLocaleDateString()}</li>
          </ul>
        </div>

        <p>The license has been successfully issued and is now active in the system.</p>

        <div class="footer">
          <p>This is an automated message from NullDental Admin System.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateWeeklyReportEmail(stats: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Weekly Report</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .stat-item { display: inline-block; margin: 10px; text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
        .stat-label { font-size: 12px; color: #666; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: #495057; margin: 0;">📊 Weekly Report</h1>
          <p style="margin: 10px 0 0 0;">NullDental Admin System Summary</p>
        </div>

        <div class="stats">
          <div class="stat-item">
            <div class="stat-number">${stats.totalLicenses || 0}</div>
            <div class="stat-label">Total Licenses</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${stats.activeLicenses || 0}</div>
            <div class="stat-label">Active Licenses</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${stats.totalClinics || 0}</div>
            <div class="stat-label">Total Clinics</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${stats.newClinicsThisWeek || 0}</div>
            <div class="stat-label">New Clinics (Week)</div>
          </div>
        </div>

        <p>This is your automated weekly summary report. The system is operating normally.</p>

        <div class="footer">
          <p>This is an automated weekly report from NullDental Admin System.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
