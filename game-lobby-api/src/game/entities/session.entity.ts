import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema()
export class Session {
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  startedAt: Date;

  @Prop({ required: true })
  endsAt: Date;

  @Prop({ type: [Object], default: [] })
  players: { userId: Types.ObjectId; username: string; pickedNumber: number }[];

  @Prop()
  winningNumber: number;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
