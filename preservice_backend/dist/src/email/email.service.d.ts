import { OnModuleInit } from '@nestjs/common';
type EventLike = {
    title?: string;
    location?: string;
    startdate?: Date | string;
    date?: Date | string;
    _id?: any;
};
type ServeurLike = {
    email: string;
    nom?: string;
    prenom?: string;
};
export declare class EmailService implements OnModuleInit {
    private readonly log;
    private transporter;
    private readonly from;
    private readonly appUrl;
    onModuleInit(): Promise<void>;
    constructor();
    private dateOnly;
    private layoutHTML;
    private send;
    generic(to: string, subject: string, params: {
        greeting?: string;
        intro?: string;
        details?: Record<string, any>;
        ctaLabel?: string;
        ctaHref?: string;
        outro?: string;
    }): Promise<void>;
    participationApproved(serveur: ServeurLike, event: EventLike, opts?: {
        subject?: string;
        intro?: string;
        outro?: string;
        ctaLabel?: string;
        ctaHref?: string;
    }): Promise<void>;
    eventPublishedToServeur(to: string, event: EventLike): Promise<void>;
    participationRequestedAdmin(to: string, event?: EventLike, serveur?: ServeurLike): Promise<void>;
    timesheetSubmittedAdmin(to: string, event?: EventLike, serveur?: ServeurLike): Promise<void>;
    timesheetReviewedServeur(to: string, status: 'approved' | 'rejected', comment?: string): Promise<void>;
    timesheetPaidServeur(to: string, amount: number, finalize: boolean): Promise<void>;
}
export {};
