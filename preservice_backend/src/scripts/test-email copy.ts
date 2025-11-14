import 'dotenv/config';
import nodemailer from 'nodemailer';

function required(name: string) {
    const v = process.env[name];
    if (!v) throw new Error(`Variable ${name} manquante dans .env`);
    return v;
}

async function main() {
    const user = required('GMAIL_USER');           // ex: projetlendio@gmail.com
    const appPass = required('GMAIL_APP_PASSWORD'); // App Password (16 chars, sans espaces)
    const to = process.env.MAIL_TEST_TO || user;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass: appPass },
    });

    await transporter.verify(); // vérifie la connexion/identifiants
    const info = await transporter.sendMail({
        from: `"PrestService" <${user}>`,
        to,
        subject: 'Test SMTP via App Password',
        text: 'OK ✅',
    });

    console.log('Envoyé:', info.messageId);
}

main().catch(err => {
    console.error('ERREUR SMTP:', err?.response || err);
    process.exit(1);
});