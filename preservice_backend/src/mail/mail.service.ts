// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

type EventLike = { title?: string; location?: string; startdate?: Date | string; date?: Date | string; _id?: any };
type ServeurLike = { email: string; nom?: string; prenom?: string };
type AdminLike = { email?: string; firstName?: string; lastName?: string };

@Injectable()
export class MailService {
    private readonly log = new Logger(MailService.name);
    constructor(private readonly mailer: MailerService) { }

    private dateOnly(d?: string | Date) {
        if (!d) return '—';
        const dd = new Date(d);
        if (isNaN(+dd)) return '—';
        return dd.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: undefined });
    }

    async participationApproved(
        serveur: ServeurLike,
        event: EventLike,
        opts?: {
            subject?: string;
            intro?: string;
            outro?: string;
            ctaLabel?: string;
            ctaHref?: string;
        },
    ) {
        const appUrl = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001';
        const href = opts?.ctaHref ?? `${appUrl}/serveur`;
        const subject = opts?.subject ?? `Votre candidature à “${event.title ?? 'Évènement'}” est confirmée`;
        const intro =
            opts?.intro ??
            `Bonne nouvelle ! Votre candidature à l’évènement <strong>${event.title ?? '—'}</strong> a été <strong>confirmée</strong>.`;
        const outro =
            opts?.outro ??
            `Vous pouvez consulter vos missions et vos détails depuis votre espace serveur.`;

        await this.mailer.sendMail({
            to: serveur.email,
            subject,
            template: 'participation-approved', // src/mail/templates/participation-approved.hbs
            context: {
                name: [serveur.nom, serveur.prenom].filter(Boolean).join(' ') || 'Cher(ère) serveur(se)',
                eventTitle: event.title ?? '—',
                eventDate: this.dateOnly((event as any).startdate ?? (event as any).date),
                eventLocation: event.location ?? '—',
                intro,
                outro,
                ctaLabel: opts?.ctaLabel ?? 'Ouvrir mon espace',
                ctaHref: href,
            },
        });
    }

    async generic(to: string, subject: string, params: {
        greeting?: string;
        intro?: string;
        details?: Record<string, any>;
        ctaLabel?: string;
        ctaHref?: string;
        outro?: string;
    }) {
        try {
            await this.mailer.sendMail({
                to,
                subject,
                template: 'generic', // src/mail/templates/generic.hbs
                context: {
                    greeting: params.greeting ?? 'Bonjour,',
                    intro: params.intro ?? '',
                    details: params.details ?? {},
                    ctaLabel: params.ctaLabel ?? 'Ouvrir',
                    ctaHref: params.ctaHref ?? (process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'),
                    outro: params.outro ?? 'À bientôt,',
                },
            });
        } catch (e) {
            this.log.warn(`generic mail failed for ${to}: ${e?.message || e}`);
        }
    }

    async eventPublishedToServeur(to: string, event: EventLike) {
        await this.generic(to, `Nouvel événement publié : ${event.title ?? ''}`, {
            intro: `Un nouvel évènement a été publié.`,
            details: {
                "Évènement": event.title ?? '—',
                "Date": this.dateOnly((event as any).startdate ?? (event as any).date),
                "Lieu": (event as any).location ?? '—',
            },
            ctaLabel: 'Voir mes événements',
            ctaHref: `${process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'}/serveur`,
        });
    }

    async participationRequestedAdmin(to: string, event?: EventLike, serveur?: ServeurLike) {
        await this.generic(to, `Demande de participation reçue`, {
            intro: `Un serveur a postulé à un événement.`,
            details: {
                "Serveur": [serveur?.nom, serveur?.prenom].filter(Boolean).join(' ') || '—',
                "Évènement": event?.title ?? '—',
                "Date": this.dateOnly((event as any)?.startdate ?? (event as any)?.date),
            },
            ctaLabel: 'Gérer les candidatures',
            ctaHref: `${process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'}/admin/evenements`,
        });
    }

    async timesheetSubmittedAdmin(to: string, event?: EventLike, serveur?: ServeurLike) {
        await this.generic(to, `Feuille d’heures soumise`, {
            intro: `Un serveur a soumis ses horaires.`,
            details: {
                "Serveur": [serveur?.nom, serveur?.prenom].filter(Boolean).join(' ') || '—',
                "Évènement": event?.title ?? '—',
            },
            ctaLabel: 'Revoir les feuilles',
            ctaHref: `${process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'}/admin/timesheets`,
        });
    }

    async timesheetReviewedServeur(to: string, status: 'approved' | 'rejected', comment?: string) {
        await this.generic(to, status === 'approved' ? 'Feuille approuvée' : 'Feuille rejetée', {
            intro: status === 'approved'
                ? `Votre feuille d’heures a été approuvée.`
                : `Votre feuille d’heures a été rejetée.`,
            details: comment ? { "Commentaire": comment } : undefined,
            ctaLabel: 'Voir mes feuilles',
            ctaHref: `${process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'}/serveur/timesheets`,
        });
    }

    async timesheetPaidServeur(to: string, amount: number, finalize: boolean) {
        await this.generic(to, finalize ? 'Paiement finalisé' : 'Paiement enregistré', {
            intro: finalize
                ? `Le paiement de votre feuille d’heures a été finalisé.`
                : `Un paiement partiel a été enregistré.`,
            details: { "Montant": `${amount} TND` },
            ctaLabel: 'Voir mes paiements',
            ctaHref: `${process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'}/serveur/timesheets`,
        });
    }
}
