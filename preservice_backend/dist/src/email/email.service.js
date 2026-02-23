"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = EmailService_1 = class EmailService {
    log = new common_1.Logger(EmailService_1.name);
    transporter;
    from = process.env.MAIL_FROM ?? '"PrestService" <no-reply@nelagency.com>';
    appUrl = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001';
    async onModuleInit() {
        if (process.env.MAIL_ENABLED === 'false') {
            this.log.warn('[Email] MAIL_ENABLED=false → emails désactivés');
            return;
        }
        try {
            await this.transporter.verify();
            this.log.log(`[Email] SMTP prêt en mode ${process.env.GMAIL_USER ? 'Gmail' : 'SMTP générique'} (from=${this.from})`);
        }
        catch (e) {
            this.log.error(`[Email] SMTP verify a échoué : ${e?.message || e}`);
        }
    }
    constructor() {
        const useGmail = !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD;
        const common = {
            logger: process.env.MAIL_DEBUG === 'true',
            debug: process.env.MAIL_DEBUG === 'true',
        };
        this.transporter = nodemailer.createTransport(useGmail
            ? {
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            }
            : {
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT || 587),
                secure: process.env.SMTP_SECURE === 'true',
                auth: process.env.SMTP_USER && process.env.SMTP_PASS
                    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                    : undefined,
                ...common
            });
    }
    dateOnly(d) {
        if (!d)
            return '—';
        const dd = new Date(d);
        if (isNaN(+dd))
            return '—';
        return dd.toLocaleString('fr-FR', { dateStyle: 'long' });
    }
    layoutHTML(params) {
        const rows = params.details &&
            Object.entries(params.details)
                .map(([k, v]) => `
            <tr>
              <td style="padding:8px 12px;color:#555;">${k}</td>
              <td style="padding:8px 12px;color:#111;font-weight:600;">${v ?? '—'}</td>
            </tr>`)
                .join('');
        return `<!doctype html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;background:#f6f7fb;padding:24px;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);">
    <tr>
      <td style="background:linear-gradient(135deg,#111827,#1f2937);padding:24px 28px;">
        <h1 style="margin:0;font-size:20px;color:#fff;">${params.title}</h1>
      </td>
    </tr>
    <tr><td style="padding:24px 28px;">
      <p style="margin:0 0 12px 0;">${params.greeting ?? 'Bonjour,'}</p>
      ${params.intro ? `<p style="margin:0 0 16px 0;">${params.intro}</p>` : ''}

      ${rows
            ? `<table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;margin:16px 0;">
               <tbody>${rows}</tbody>
             </table>`
            : ''}

      ${params.ctaHref
            ? `<div style="margin:20px 0 6px 0;">
               <a href="${params.ctaHref}" target="_blank"
                  style="display:inline-block;padding:12px 18px;border-radius:10px;text-decoration:none;background:#f59e0b;color:#111;font-weight:700;">
                  ${params.ctaLabel ?? 'Ouvrir'}
               </a>
             </div>`
            : ''}

      ${params.outro ? `<p style="margin:16px 0 0 0;color:#555;">${params.outro}</p>` : ''}
    </td></tr>
    <tr>
      <td style="padding:16px 28px;color:#888;border-top:1px solid #f0f0f0;font-size:12px;">
        Cet email a été envoyé automatiquement par PrestService.
      </td>
    </tr>
  </table>
</body>
</html>`;
    }
    async send(to, subject, html) {
        if (process.env.MAIL_ENABLED === 'false') {
            this.log.warn(`[DISABLED] mail to=${to} subject="${subject}"`);
            return;
        }
        try {
            const info = await this.transporter.sendMail({ from: this.from, to, subject, html });
            this.log.log(`email sent -> ${to} (${info.messageId})`);
        }
        catch (e) {
            this.log.warn(`email fail -> ${to}: ${e?.message || e}`);
        }
    }
    async generic(to, subject, params) {
        const html = this.layoutHTML({
            title: subject,
            greeting: params.greeting ?? 'Bonjour,',
            intro: params.intro ?? '',
            details: params.details ?? {},
            ctaLabel: params.ctaLabel ?? 'Ouvrir',
            ctaHref: params.ctaHref ?? this.appUrl,
            outro: params.outro ?? 'À bientôt,',
        });
        await this.send(to, subject, html);
    }
    async participationApproved(serveur, event, opts) {
        const subject = opts?.subject ?? `Votre candidature à “${event.title ?? 'Évènement'}” est confirmée`;
        const html = this.layoutHTML({
            title: subject,
            greeting: `Bonjour ${[serveur.nom, serveur.prenom].filter(Boolean).join(' ') || ''}`.trim() || 'Bonjour,',
            intro: opts?.intro ??
                `Bonne nouvelle ! Votre candidature à l’évènement <strong>${event.title ?? '—'}</strong> a été <strong>confirmée</strong>.`,
            details: {
                'Évènement': event.title ?? '—',
                'Date': this.dateOnly(event.startdate ?? event.date),
                'Lieu': event.location ?? '—',
            },
            ctaLabel: opts?.ctaLabel ?? 'Ouvrir mon espace',
            ctaHref: opts?.ctaHref ?? `${this.appUrl}/serveur`,
            outro: opts?.outro ?? `Vous pouvez consulter vos missions et vos détails depuis votre espace serveur.`,
        });
        await this.send(serveur.email, subject, html);
    }
    async eventPublishedToServeur(to, event) {
        await this.generic(to, `Nouvel événement publié : ${event.title ?? ''}`, {
            intro: `Un nouvel évènement a été publié.`,
            details: {
                'Évènement': event.title ?? '—',
                'Date': this.dateOnly(event.startdate ?? event.date),
                'Lieu': event.location ?? '—',
            },
            ctaLabel: 'Voir mes événements',
            ctaHref: `${this.appUrl}/serveur`,
        });
    }
    async participationRequestedAdmin(to, event, serveur) {
        await this.generic(to, `Demande de participation reçue`, {
            intro: `Un serveur a postulé à un événement.`,
            details: {
                'Serveur': [serveur?.nom, serveur?.prenom].filter(Boolean).join(' ') || '—',
                'Évènement': event?.title ?? '—',
                'Date': this.dateOnly(event?.startdate ?? event?.date),
            },
            ctaLabel: 'Gérer les candidatures',
            ctaHref: `${this.appUrl}/admin/evenements`,
        });
    }
    async timesheetSubmittedAdmin(to, event, serveur) {
        await this.generic(to, `Feuille d’heures soumise`, {
            intro: `Un serveur a soumis ses horaires.`,
            details: {
                'Serveur': [serveur?.nom, serveur?.prenom].filter(Boolean).join(' ') || '—',
                'Évènement': event?.title ?? '—',
            },
            ctaLabel: 'Revoir les feuilles',
            ctaHref: `${this.appUrl}/admin/timesheets`,
        });
    }
    async timesheetReviewedServeur(to, status, comment) {
        await this.generic(to, status === 'approved' ? 'Feuille approuvée' : 'Feuille rejetée', {
            intro: status === 'approved'
                ? `Votre feuille d’heures a été approuvée.`
                : `Votre feuille d’heures a été rejetée.`,
            details: comment ? { 'Commentaire': comment } : undefined,
            ctaLabel: 'Voir mes feuilles',
            ctaHref: `${this.appUrl}/serveur/timesheets`,
        });
    }
    async timesheetPaidServeur(to, amount, finalize) {
        await this.generic(to, finalize ? 'Paiement finalisé' : 'Paiement enregistré', {
            intro: finalize
                ? `Le paiement de votre feuille d’heures a été finalisé.`
                : `Un paiement partiel a été enregistré.`,
            details: { 'Montant': `${amount} TND` },
            ctaLabel: 'Voir mes paiements',
            ctaHref: `${this.appUrl}/serveur/timesheets`,
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map