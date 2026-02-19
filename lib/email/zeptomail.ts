import { SendMailClient } from "zeptomail";

// Initialize ZeptoMail client
const token = process.env.ZEPTOMAIL_API_TOKEN;

if (!token) {
  console.error("ZEPTOMAIL_API_TOKEN is not configured in environment variables");
}

export const zcClient = new SendMailClient({
  url: "https://zeptomail.zoho.com/",
  token: token || "",
});

export interface EmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: {
    address: string;
    name: string;
  };
}

export interface TemplateEmailParams {
  to: string | string[];
  templateName: string;
  templateData: Record<string, any>;
  subject?: string; // Optional override
  from?: {
    address: string;
    name: string;
  };
}

/**
 * Send email using ZeptoMail with HTML content
 */
export async function sendEmail(params: EmailParams): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    if (!token) {
      return {
        success: false,
        error: "ZeptoMail API token is not configured",
      };
    }

    const fromEmail = params.from?.address || process.env.ZEPTOMAIL_FROM_EMAIL || "bookings@oliv-restaurant.ch";
    const fromName = params.from?.name || process.env.ZEPTOMAIL_FROM_NAME || "Oliv Restaurant";

    const mailOptions = {
      from: {
        address: fromEmail,
        name: fromName,
      },
      to: Array.isArray(params.to) ? params.to.map(email => ({ email_address: { address: email, name: "" } })) : [{ email_address: { address: params.to, name: "" } }],
      subject: params.subject,
      htmlbody: params.html,
    };

    // @ts-ignore - ZeptoMail types may not match exactly
    const response = await zcClient.sendMail(mailOptions);

    return {
      success: true,
      messageId: response.message_id || "sent",
    };
  } catch (error: any) {
    console.error("Error sending email via ZeptoMail:", error);
    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
}

/**
 * Send email using ZeptoMail template
 *
 * @example
 * await sendTemplateEmail({
 *   to: "customer@example.com",
 *   templateName: "booking-confirmed",
 *   templateData: {
 *     customer_name: "John Doe",
 *     event_date: "Freitag, 18. Februar 2026",
 *     event_time: "19:00",
 *     guest_count: 4,
 *     estimated_total: "150.00",
 *   }
 * });
 */
export async function sendTemplateEmail(params: TemplateEmailParams): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    if (!token) {
      return {
        success: false,
        error: "ZeptoMail API token is not configured",
      };
    }

    const fromEmail = params.from?.address || process.env.ZEPTOMAIL_FROM_EMAIL || "bookings@oliv-restaurant.ch";
    const fromName = params.from?.name || process.env.ZEPTOMAIL_FROM_NAME || "Oliv Restaurant";

    const mailOptions = {
      from: {
        address: fromEmail,
        name: fromName,
      },
      to: Array.isArray(params.to) ? params.to.map(email => ({ email_address: { address: email, name: "" } })) : [{ email_address: { address: params.to, name: "" } }],
      subject: params.subject,
      // @ts-ignore - ZeptoMail template syntax
      template: {
        key: params.templateName,
        data: params.templateData,
      },
    };

    // @ts-ignore - ZeptoMail types may not match exactly
    const response = await zcClient.sendMail(mailOptions);

    return {
      success: true,
      messageId: response.message_id || "sent",
    };
  } catch (error: any) {
    console.error("Error sending template email via ZeptoMail:", error);
    return {
      success: false,
      error: error.message || "Failed to send template email",
    };
  }
}

/**
 * Validate email configuration
 */
export function validateEmailConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!process.env.ZEPTOMAIL_API_TOKEN) missing.push("ZEPTOMAIL_API_TOKEN");
  if (!process.env.ZEPTOMAIL_FROM_EMAIL) missing.push("ZEPTOMAIL_FROM_EMAIL");
  if (!process.env.ZEPTOMAIL_FROM_NAME) missing.push("ZEPTOMAIL_FROM_NAME");

  return {
    valid: missing.length === 0,
    missing,
  };
}
