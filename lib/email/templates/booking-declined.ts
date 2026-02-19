import type { Booking, Lead } from "@/lib/db/schema";

interface BookingDeclinedEmailParams {
  booking: Booking & {
    lead?: Lead | null;
  };
  reason?: string;
}

/**
 * Template for Booking Declined Email
 * German language - sent when booking request is declined
 */
export function generateBookingDeclinedEmail(params: BookingDeclinedEmailParams): {
  subject: string;
  html: string;
} {
  const { booking, reason } = params;
  const lead = booking.lead;
  const customerName = lead?.contactName || "Gast";

  const formattedDate = new Date(booking.eventDate).toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Ihre Buchungsanfrage - Oliv Restaurant`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .info-box { background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">❌ Buchung nicht möglich</h1>
          <p style="margin: 10px 0 0 0;">Oliv Restaurant</p>
        </div>

        <div class="content">
          <p>Hallo ${customerName},</p>
          <p>leider können wir Ihre Buchungsanfrage für den <strong>${formattedDate}</strong> nicht bestätigen.</p>

          ${reason ? `
            <div class="info-box">
              <h3 style="margin: 0 0 10px 0; color: #0c5460;">Begründung:</h3>
              <p style="margin: 0; color: #0c5460;">${reason}</p>
            </div>
          ` : `
            <div class="info-box">
              <p style="margin: 0; color: #0c5460;">
                Leider ist das Restaurant zum gewünschten Zeitpunkt bereits ausgebucht oder wir können Ihre Anfrage aus anderen logistischen Gründen nicht erfüllen.
              </p>
            </div>
          `}

          <div class="details">
            <h3>📋 Angefragte Details:</h3>
            <p><strong>Gewünschtes Datum:</strong> ${formattedDate}</p>
            <p><strong>Gewünschte Uhrzeit:</strong> ${booking.eventTime}</p>
            <p><strong>Anzahl Gäste:</strong> ${booking.guestCount} Personen</p>
          </div>

          <p>Wir möchten Ihnen gerne ein alternatives Datum oder eine alternative Uhrzeit anbieten. Bitte kontaktieren Sie uns, um gemeinsam eine Lösung zu finden:</p>
          <p>
            📧 E-Mail: info@oliv-restaurant.ch<br/>
            📞 Telefon: +41 XX XXX XX XX
          </p>

          <p>Wir bedauern die Umstände und hoffen, Ihnen trotzdem einen schönen Abend bei uns bieten zu können.</p>
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
