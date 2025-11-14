import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

type EventLike = { title?: string; location?: string; startdate?: Date | string; date?: Date | string; _id?: any };
type ServeurLike = { email: string; nom?: string; prenom?: string };

@Injectable()
export class EmailService implements OnModuleInit {
    private readonly log = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;
    private readonly from = process.env.MAIL_FROM ?? '"PrestService" <no-reply@nelagency.com>';
    private readonly appUrl = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001';

    async onModuleInit() {
        if (process.env.MAIL_ENABLED === 'false') {
            this.log.warn('[Email] MAIL_ENABLED=false → emails désactivés');
            return;
        }
        try {
            await this.transporter.verify();
            this.log.log(`[Email] SMTP prêt en mode ${process.env.GMAIL_USER ? 'Gmail' : 'SMTP générique'} (from=${this.from})`);
        } catch (e: any) {
            this.log.error(`[Email] SMTP verify a échoué : ${e?.message || e}`);
        }
    }

    constructor() {
        const useGmail = !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD;

        const common = {
            logger: process.env.MAIL_DEBUG === 'true',
            debug: process.env.MAIL_DEBUG === 'true',
        };

        this.transporter = nodemailer.createTransport(
            useGmail
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
                    auth:
                        process.env.SMTP_USER && process.env.SMTP_PASS
                            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                            : undefined,
                    ...common
                },
        );
    }

    // ---------- Helpers ----------
    private dateOnly(d?: string | Date) {
        if (!d) return '—';
        const dd = new Date(d);
        if (isNaN(+dd)) return '—';
        return dd.toLocaleString('fr-FR', { dateStyle: 'long' });
    }

    private layoutHTML(params: {
        title: string;
        greeting?: string;
        intro?: string;
        details?: Record<string, any>;
        ctaLabel?: string;
        ctaHref?: string;
        outro?: string;
    }) {
        const rows =
            params.details &&
            Object.entries(params.details)
                .map(
                    ([k, v]) => `
            <tr>
              <td style="padding:8px 12px;color:#555;">${k}</td>
              <td style="padding:8px 12px;color:#111;font-weight:600;">${v ?? '—'}</td>
            </tr>`,
                )
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
                : ''
            }

      ${params.ctaHref
                ? `<div style="margin:20px 0 6px 0;">
               <a href="${params.ctaHref}" target="_blank"
                  style="display:inline-block;padding:12px 18px;border-radius:10px;text-decoration:none;background:#f59e0b;color:#111;font-weight:700;">
                  ${params.ctaLabel ?? 'Ouvrir'}
               </a>
             </div>`
                : ''
            }

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

    private async send(to: string, subject: string, html: string) {
        if (process.env.MAIL_ENABLED === 'false') {
            this.log.warn(`[DISABLED] mail to=${to} subject="${subject}"`);
            return;
        }
        try {
            const info = await this.transporter.sendMail({ from: this.from, to, subject, html });
            this.log.log(`email sent -> ${to} (${info.messageId})`);
        } catch (e: any) {
            this.log.warn(`email fail -> ${to}: ${e?.message || e}`);
        }
    }

    // ---------- Templates métiers (équivalents à ton ancien MailService) ----------
    async generic(
        to: string,
        subject: string,
        params: {
            greeting?: string;
            intro?: string;
            details?: Record<string, any>;
            ctaLabel?: string;
            ctaHref?: string;
            outro?: string;
        },
    ) {
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

    async participationApproved(
        serveur: ServeurLike,
        event: EventLike,
        opts?: { subject?: string; intro?: string; outro?: string; ctaLabel?: string; ctaHref?: string },
    ) {
        const subject = opts?.subject ?? `Votre candidature à “${event.title ?? 'Évènement'}” est confirmée`;
        const html = this.layoutHTML({
            title: subject,
            greeting: `Bonjour ${[serveur.nom, serveur.prenom].filter(Boolean).join(' ') || ''}`.trim() || 'Bonjour,',
            intro:
                opts?.intro ??
                `Bonne nouvelle ! Votre candidature à l’évènement <strong>${event.title ?? '—'}</strong> a été <strong>confirmée</strong>.`,
            details: {
                'Évènement': event.title ?? '—',
                'Date': this.dateOnly((event as any).startdate ?? (event as any).date),
                'Lieu': (event as any).location ?? '—',
            },
            ctaLabel: opts?.ctaLabel ?? 'Ouvrir mon espace',
            ctaHref: opts?.ctaHref ?? `${this.appUrl}/serveur`,
            outro: opts?.outro ?? `Vous pouvez consulter vos missions et vos détails depuis votre espace serveur.`,
        });
        await this.send(serveur.email, subject, html);
    }

    async eventPublishedToServeur(to: string, event: EventLike) {
        await this.generic(to, `Nouvel événement publié : ${event.title ?? ''}`, {
            intro: `Un nouvel évènement a été publié.`,
            details: {
                'Évènement': event.title ?? '—',
                'Date': this.dateOnly((event as any).startdate ?? (event as any).date),
                'Lieu': (event as any).location ?? '—',
            },
            ctaLabel: 'Voir mes événements',
            ctaHref: `${this.appUrl}/serveur`,
        });
    }

    async participationRequestedAdmin(to: string, event?: EventLike, serveur?: ServeurLike) {
        await this.generic(to, `Demande de participation reçue`, {
            intro: `Un serveur a postulé à un événement.`,
            details: {
                'Serveur': [serveur?.nom, serveur?.prenom].filter(Boolean).join(' ') || '—',
                'Évènement': event?.title ?? '—',
                'Date': this.dateOnly((event as any)?.startdate ?? (event as any)?.date),
            },
            ctaLabel: 'Gérer les candidatures',
            ctaHref: `${this.appUrl}/admin/evenements`,
        });
    }

    async timesheetSubmittedAdmin(to: string, event?: EventLike, serveur?: ServeurLike) {
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

    async timesheetReviewedServeur(to: string, status: 'approved' | 'rejected', comment?: string) {
        await this.generic(to, status === 'approved' ? 'Feuille approuvée' : 'Feuille rejetée', {
            intro:
                status === 'approved'
                    ? `Votre feuille d’heures a été approuvée.`
                    : `Votre feuille d’heures a été rejetée.`,
            details: comment ? { 'Commentaire': comment } : undefined,
            ctaLabel: 'Voir mes feuilles',
            ctaHref: `${this.appUrl}/serveur/timesheets`,
        });
    }

    async timesheetPaidServeur(to: string, amount: number, finalize: boolean) {
        await this.generic(to, finalize ? 'Paiement finalisé' : 'Paiement enregistré', {
            intro: finalize
                ? `Le paiement de votre feuille d’heures a été finalisé.`
                : `Un paiement partiel a été enregistré.`,
            details: { 'Montant': `${amount} TND` },
            ctaLabel: 'Voir mes paiements',
            ctaHref: `${this.appUrl}/serveur/timesheets`,
        });
    }
}