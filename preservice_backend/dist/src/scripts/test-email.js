"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const nodemailer_1 = __importDefault(require("nodemailer"));
async function main() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    const to = process.env.MAIL_TEST_TO || user;
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass },
        logger: true,
        debug: true,
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
//# sourceMappingURL=test-email.js.map