import type { Booking, Lead } from "@/lib/db/schema";

interface BookingNoShowEmailParams {
  booking: Booking & {
    lead?: Lead | null;
  };
}

/**
 * Template for No Show Email
 * German language
 */
export function generateBookingNoShowEmail(params: BookingNoShowEmailParams): {
  subject: string;
  html: string;
} {
  const { booking } = params;
  const lead = booking.lead;
  const customerName = lead?.contactName || "Gast";

  const formattedDate = new Date(booking.eventDate).toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Nicht erschienen - Oliv Restaurant - ${formattedDate}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #6c757d; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">📭 Nicht erschienen</h1>
          <p style="margin: 10px 0 0 0;">Oliv Restaurant</p>
        </div>

        <div class="content">
          <p>Hallo ${customerName},</p>
          <p>leider haben wir Sie am <strong>${formattedDate}</strong> nicht zu Ihrer Buchung begrüssen können.</p>

          <p>Da wir ohne Absage nicht erscheinen konnten, mussten wir die Reservierung stornieren. Dies hilft uns, andere Gäste zu berücksichtigen und unsere Planung zu optimieren.</p>

          <div class="details">
            <h3>📋 Buchungsdetails:</h3>
            <p><strong>Datum:</strong> ${formattedDate}</p>
            <p><strong>Uhrzeit:</strong> ${booking.eventTime}</p>
            <p><strong>Anzahl Gäste:</strong> ${booking.guestCount} Personen</p>
          </div>

          <p>Wir hoffen, dass Sie in Zukunft wieder bei uns reservieren. Bitte beachten Sie, dass wir bei zukünftigen Buchungen um eine frühzeitige Absage bitten (mindestens 24 Stunden vorher), falls Sie doch nicht kommen können.</p>

          <p>Bei Fragen oder falls Sie eine neue Buchung erstellen möchten, kontaktieren Sie uns gerne:</p>
          <p>
            📧 E-Mail: info@oliv-restaurant.ch<br/>
            📞 Telefon: +41 XX XXX XX XX
          </p>

          <p>Mit freundlichen Grüßen,<br/>Ihr Oliv-Team</p>
        </div>

        <div class="footer">
          <p>Oliv Restaurant | Ihre Adresse | Schweiz</p>
          <p><a href="https://oliv-restaurant.ch" style="color: #2c3e50;">www.oliv-restaurant.ch</a></p>
          <p style="font-size: 12px; margin-top: 10px;">
            Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht direkt auf diese E-Mail.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
