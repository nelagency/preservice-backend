"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
let MailService = MailService_1 = class MailService {
    mailer;
    log = new common_1.Logger(MailService_1.name);
    constructor(mailer) {
        this.mailer = mailer;
    }
    dateOnly(d) {
        if (!d)
            return '—';
        const dd = new Date(d);
        if (isNaN(+dd))
            return '—';
        return dd.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: undefined });
    }
    async participationApproved(serveur, event, opts) {
        const appUrl = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001';
        const href = opts?.ctaHref ?? `${appUrl}/serveur`;
        const subject = opts?.subject ?? `Votre candidature à “${event.title ?? 'Évènement'}” est confirmée`;
        const intro = opts?.intro ??
            `Bonne nouvelle ! Votre candidature à l’évènement <strong>${event.title ?? '—'}</strong> a été <strong>confirmée</strong>.`;
        const outro = opts?.outro ??
            `Vous pouvez consulter vos missions et vos détails depuis votre espace serveur.`;
        await this.mailer.sendMail({
            to: serveur.email,
            subject,
            template: 'participation-approved',
            context: {
                name: [serveur.nom, serveur.prenom].filter(Boolean).join(' ') || 'Cher(ère) serveur(se)',
                eventTitle: event.title ?? '—',
                eventDate: this.dateOnly(event.startdate ?? event.date),
                eventLocation: event.location ?? '—',
                intro,
                outro,
                ctaLabel: opts?.ctaLabel ?? 'Ouvrir mon espace',
                ctaHref: href,
            },
        });
    }
    async generic(to, subject, params) {
        try {
            await this.mailer.sendMail({
                to,
                subject,
                template: 'generic',
                context: {
                    greeting: params.greeting ?? 'Bonjour,',
                    intro: params.intro ?? '',
                    details: params.details ?? {},
                    ctaLabel: params.ctaLabel ?? 'Ouvrir',
                    ctaHref: params.ctaHref ?? (process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'),
                    outro: params.outro ?? 'À bientôt,',
                },
            });
        }
        catch (e) {
            this.log.warn(`generic mail failed for ${to}: ${e?.message || e}`);
        }
    }
    async eventPublishedToServeur(to, event) {
        await this.generic(to, `Nouvel événement publié : ${event.title ?? ''}`, {
            intro: `Un nouvel évènement a été publié.`,
            details: {
                "Évènement": event.title ?? '—',
                "Date": this.dateOnly(event.startdate ?? event.date),
                "Lieu": event.location ?? '—',
            },
            ctaLabel: 'Voir mes événements',
            ctaHref: `${process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'}/serveur`,
        });
    }
    async participationRequestedAdmin(to, event, serveur) {
        await this.generic(to, `Demande de participation reçue`, {
            intro: `Un serveur a postulé à un événement.`,
            details: {
                "Serveur": [serveur?.nom, serveur?.prenom].filter(Boolean).join(' ') || '—',
                "Évènement": event?.title ?? '—',
                "Date": this.dateOnly(event?.startdate ?? event?.date),
            },
            ctaLabel: 'Gérer les candidatures',
            ctaHref: `${process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'}/admin/evenements`,
        });
    }
    async timesheetSubmittedAdmin(to, event, serveur) {
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
    async timesheetReviewedServeur(to, status, comment) {
        await this.generic(to, status === 'approved' ? 'Feuille approuvée' : 'Feuille rejetée', {
            intro: status === 'approved'
                ? `Votre feuille d’heures a été approuvée.`
                : `Votre feuille d’heures a été rejetée.`,
            details: comment ? { "Commentaire": comment } : undefined,
            ctaLabel: 'Voir mes feuilles',
            ctaHref: `${process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'}/serveur/timesheets`,
        });
    }
    async timesheetPaidServeur(to, amount, finalize) {
        await this.generic(to, finalize ? 'Paiement finalisé' : 'Paiement enregistré', {
            intro: finalize
                ? `Le paiement de votre feuille d’heures a été finalisé.`
                : `Un paiement partiel a été enregistré.`,
            details: { "Montant": `${amount} TND` },
            ctaLabel: 'Voir mes paiements',
            ctaHref: `${process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'}/serveur/timesheets`,
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], MailService);
//# sourceMappingURL=mail.service.js.map