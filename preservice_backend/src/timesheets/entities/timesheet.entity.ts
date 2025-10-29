import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TimesheetDocument = Timesheet & Document;
export type TimesheetStatus = 'submitted' | 'approved' | 'rejected';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

// ---- Sous-document Paiement ----
@Schema({ _id: false, timestamps: { createdAt: true, updatedAt: false } })
export class TsPayment {
    @Prop({ type: Number, required: true, min: 0.01 })
    amount!: number;

    @Prop({ type: String })
    note?: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy!: Types.ObjectId;

    @Prop({ type: Date, default: () => new Date() })
    createdAt!: Date;
}
export const TsPaymentSchema = SchemaFactory.createForClass(TsPayment);

@Schema({ timestamps: true })
export class Timesheet {
    @Prop({ type: Types.ObjectId, ref: 'Event', required: true, index: true })
    event: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Serveur', required: true, index: true })
    serveur: Types.ObjectId;

    @Prop({ type: Date, required: true })
    startAt: Date;

    @Prop({ type: Date, required: true })
    endAt: Date;

    @Prop({ type: Number, default: 0, min: 0 }) // minutes de pause
    breakMinutes: number;

    @Prop({ type: Number, required: true, min: 0 }) // minutes travaillées (calculé)
    workedMinutes: number;

    @Prop({ type: String, enum: ['submitted', 'approved', 'rejected'], default: 'submitted' })
    status: TimesheetStatus;

    @Prop({ type: String })
    note?: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    validatedBy?: Types.ObjectId;

    @Prop({ type: Date })
    validatedAt?: Date;

    @Prop({ type: String })
    validationComment?: string;

    // ---- Paiement ----
    @Prop({ type: Number, default: 0, min: 0 })
    paidAmount: number;               // cumul payé

    @Prop({ type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' })
    paymentStatus: PaymentStatus;     // statut de paye

    @Prop({ type: [TsPaymentSchema], default: [] })
    payments: TsPayment[];            // journal des paiements

    @Prop({ type: Date })
    paidAt?: Date;                    // date de finalisation (optionnel)

    @Prop({ type: Types.ObjectId, ref: 'User' })
    paidBy?: Types.ObjectId;          // qui a finalisé (optionnel)
}
export const TimesheetSchema = SchemaFactory.createForClass(Timesheet);
TimesheetSchema.index({ event: 1, serveur: 1 }, { unique: true });