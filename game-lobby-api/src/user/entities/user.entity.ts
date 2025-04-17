import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: [] })
  winHistory: { date: Date; score: number }[];

  @Prop({ default: 0 })
  totalGamesPlayed: number;

  @Prop({ default: 0 })
  streak: number;

  @Prop({ default: 0 })
  longestWinStreak: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
