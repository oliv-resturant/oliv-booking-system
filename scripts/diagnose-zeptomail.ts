
import dotenv from 'dotenv';
import { execSync } from 'child_process';
dotenv.config();

const API_TOKEN = process.env.ZEPTOMAIL_API_TOKEN;
const FROM_EMAIL = process.env.ZEPTOMAIL_FROM_EMAIL;
const RECIPIENT = process.env.TEST_EMAIL || 'deepbhanu89@gmail.com';

async function diagnose() {
    console.log('🔍 ZeptoMail API Detailed Diagnosis\n');

    if (!API_TOKEN) {
        console.error('❌ ZEPTOMAIL_API_TOKEN missing');
        return;
    }

    const cleanToken = API_TOKEN.replace(/^Zoho-enczapikey\s+/, '').trim();

    console.log(`Token Details:`);
    console.log(`- Prefix present in .env: ${API_TOKEN.startsWith('Zoho-enczapikey')}`);
    console.log(`- Cleaned token length: ${cleanToken.length}`);
    console.log(`- From email: ${FROM_EMAIL}`);
    console.log(`- Recipient: ${RECIPIENT}\n`);

    const urls = [
        'https://zeptomail.zoho.eu/v1.1/email',
        'https://zeptomail.zoho.com/v1.1/email'
    ];

    for (const url of urls) {
        console.log(`📡 testing endpoint: ${url}`);

        const curlCmd = `curl.exe -s -X POST "${url}" ` +
            `-H "accept: application/json" ` +
            `-H "content-type: application/json" ` +
            `-H "authorization: Zoho-enczapikey ${cleanToken}" ` +
            `-d "{\\\"from\\\": {\\\"address\\\": \\\"${FROM_EMAIL}\\\"},\\\"to\\\": [{\\\"email_address\\\": {\\\"address\\\": \\\"${RECIPIENT}\\\"}}],\\\"subject\\\": \\\"Diagnostic Test\\\",\\\"htmlbody\\\": \\\"<p>Diagnostic Test</p>\\\"}"`;

        try {
            const output = execSync(curlCmd).toString();
            console.log(`   Response: ${output}`);
        } catch (error: any) {
            console.log(`   ❌ CURL ERROR: ${error.message}`);
        }
        console.log('');
    }
}

diagnose();
