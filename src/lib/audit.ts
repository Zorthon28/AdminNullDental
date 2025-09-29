// Audit logging utility
export const logAuditEvent = async (
  adminUserId: number,
  action: string,
  details?: string
) => {
  try {
    const response = await fetch("/api/audit-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminUserId,
        action,
        details,
      }),
    });

    if (!response.ok) {
      console.error(
        "Failed to log audit event:",
        response.status,
        response.statusText
      );
      const errorText = await response.text();
      console.error("Error details:", errorText);
    } else {
      console.log("✅ Audit event logged:", action, details);
    }
  } catch (error) {
    console.error("❌ Failed to log audit event:", error);
  }
};
