
import dotenv from 'dotenv';
dotenv.config();

const templates = [
    { name: 'ZEPTOMAIL_TEMPLATE_CONFIRMED_DEPOSIT', label: 'booking-confirmed-deposit', vars: { customer_name: 'Test', event_date: '1. März 2026', event_time: '19:00', guest_count: 4, estimated_total: '6000.00', deposit_amount: '1800.00', deposit_percentage: '30', booking_id: 'TEST001', special_requests: 'None', allergy_details: 'None' } },
    { name: 'ZEPTOMAIL_TEMPLATE_CONFIRMED_NO_DEPOSIT', label: 'booking-confirmed-no-deposit', vars: { customer_name: 'Test', event_date: '1. März 2026', event_time: '19:00', guest_count: 4, estimated_total: '1500.00', booking_edit_url: 'http://localhost:3000', special_requests: 'None', allergy_details: 'None' } },
    { name: 'ZEPTOMAIL_TEMPLATE_CANCELLED', label: 'booking-cancelled', vars: { customer_name: 'Test', event_date: '1. März 2026', event_time: '19:00', guest_count: 4, estimated_total: '1500.00', cancellation_reason: 'Customer request', rebooking_url: 'http://localhost:3000' } },
    { name: 'ZEPTOMAIL_TEMPLATE_COMPLETED', label: 'booking-completed', vars: { customer_name: 'Test', event_date: '1. März 2026', estimated_total: '1500.00', feedback_url: 'http://localhost:3000' } },
    { name: 'ZEPTOMAIL_TEMPLATE_REMINDER', label: 'booking-reminder', vars: { customer_name: 'Test', event_date: '1. März 2026', event_time: '19:00', guest_count: 4, estimated_total: '1500.00', booking_edit_url: 'http://localhost:3000', special_requests: 'None', allergy_details: 'None' } },
    { name: 'ZEPTOMAIL_TEMPLATE_NO_SHOW', label: 'booking-no-show', vars: { customer_name: 'Test', event_date: '1. März 2026' } },
    { name: 'ZEPTOMAIL_TEMPLATE_DECLINED', label: 'booking-declined', vars: { customer_name: 'Test', event_date: '1. März 2026', decline_reason: 'Fully booked' } },
    { name: 'ZEPTOMAIL_TEMPLATE_UNLOCK_REQUESTED', label: 'unlock-requested', vars: { customer_name: 'Test', event_date: '1. März 2026', booking_id: 'TEST001', admin_url: 'http://localhost:3000/admin' } },
    { name: 'ZEPTOMAIL_TEMPLATE_UNLOCK_GRANTED', label: 'unlock-granted', vars: { customer_name: 'Test', event_date: '1. März 2026', booking_edit_url: 'http://localhost:3000' } },
    { name: 'ZEPTOMAIL_TEMPLATE_UNLOCK_DECLINED', label: 'unlock-declined', vars: { customer_name: 'Test', event_date: '1. März 2026', decline_reason: 'No changes allowed' } },
];

const RAW_TOKEN = process.env.ZEPTOMAIL_API_TOKEN!;
const FROM_EMAIL = process.env.ZEPTOMAIL_FROM_EMAIL!;
const TO = process.env.TEST_EMAIL || 'dabhanushali@enacton.email';

async function testAll() {
    console.log('🧪 Testing ALL ZeptoMail templates\n');
    console.log(`From: ${FROM_EMAIL}  →  To: ${TO}\n`);

    let passed = 0, failed = 0;

    for (const t of templates) {
        const key = process.env[t.name];
        process.stdout.write(`  ${t.label.padEnd(36)}`);

        if (!key) {
            console.log('⚠️  MISSING key in .env');
            failed++;
            continue;
        }

        // Try sending
        try {
            const res = await fetch('https://api.zeptomail.eu/v1.1/email/template', {
                method: 'POST',
                headers: { 'accept': 'application/json', 'content-type': 'application/json', 'Authorization': RAW_TOKEN },
                body: JSON.stringify({ mail_template_key: key, from: { address: FROM_EMAIL, name: 'Oliv Test' }, to: [{ email_address: { address: TO, name: 'Test' } }], merge_info: t.vars }),
                signal: AbortSignal.timeout(10000),
            });
            const data = await res.json();
            if (res.ok) {
                console.log(`✅ OK  (${data.request_id?.slice(-8) || 'sent'})`);
                passed++;
            } else {
                console.log(`❌ FAIL  ${JSON.stringify(data?.error)}`);
                failed++;
            }
        } catch (e: any) {
            console.log(`❌ ERROR  ${e.message}`);
            failed++;
        }
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
}

testAll();
