import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BeforeAfterPairDocument = BeforeAfterPair & Document;

@Schema({ timestamps: true })
export class BeforeAfterPair {
    @Prop({ type: Types.ObjectId, ref: 'Event', required: true, index: true })
    event: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'MediaAsset', required: true })
    before: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'MediaAsset', required: true })
    after: Types.ObjectId;

    @Prop() caption?: string;
    @Prop({ type: Boolean, default: true, index: true }) approved: boolean; // public direct
}

export const BeforeAfterPairSchema = SchemaFactory.createForClass(BeforeAfterPair);