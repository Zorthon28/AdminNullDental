import { NextRequest, NextResponse } from "next/server";
import { sendTestEmail } from "../../../../lib/email";

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: "Recipient email address is required" },
        { status: 400 }
      );
    }

    const result = await sendTestEmail(to);

    if (result.success) {
      return NextResponse.json({
        message: "Test email sent successfully",
        emailId: result.id,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send test email", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { error: "Failed to send test email" },
      { status: 500 }
    );
  }
}
