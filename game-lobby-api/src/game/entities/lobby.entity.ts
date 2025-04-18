import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Lobby {
  @Prop([
    {
      userId: { type: Types.ObjectId, ref: 'User' },
      username: String,
      pickedNumber: Number,
    },
  ])
  players: {
    userId: Types.ObjectId;
    username: string;
    pickedNumber: number;
  }[];

  @Prop([
    {
      userId: { type: Types.ObjectId, ref: 'User' },
      username: String,
      pickedNumber: Number,
    },
  ])
  queue: {
    userId: Types.ObjectId;
    username: string;
    pickedNumber: number;
  }[];
}

export type LobbyDocument = Lobby & Document;
export const LobbySchema = SchemaFactory.createForClass(Lobby);
