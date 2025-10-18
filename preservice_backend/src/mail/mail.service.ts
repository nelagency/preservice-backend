// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

type EventLike = { title?: string; location?: string; startdate?: Date | string; date?: Date | string; _id?: any };
type ServeurLike = { email: string; nom?: string; prenom?: string };

@Injectable()
export class MailService {
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
        const appUrl = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3000';
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
}
