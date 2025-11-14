import 'dotenv/config';
import nodemailer from 'nodemailer'

async function main() {
    const user = process.env.GMAIL_USER!;
    const pass = process.env.GMAIL_APP_PASSWORD!;
    const to = process.env.MAIL_TEST_TO || user;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass },
        logger: true,  // temporaire
        debug: true,   // temporaire
    });

    await transporter.verify();
    const info = await transporter.sendMail({
        from: `"PrestService" <${user}>`,
        to,
        subject: 'Test SMTP via App Password',
        text: 'OK ✅',
    });

    console.log('Envoyé:', info.messageId);
}

main().catch((err) => {
    console.error('ERREUR SMTP:', err?.response || err);
    process.exit(1);
});