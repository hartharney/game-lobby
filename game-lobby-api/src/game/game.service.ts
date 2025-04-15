import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from './entities/session.entity';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';
import { GameGateway } from './game.gateway';

@Injectable()
export class GameService {
  private nextSessionTime: Date | null = null;

  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly gameGateway: GameGateway,
  ) {}

  async startSession(duration: number) {
    const activeSession = await this.sessionModel.findOne({ isActive: true });
    if (activeSession) {
      throw new BadRequestException('A session is already active.');
    }

    if (this.nextSessionTime && new Date() < this.nextSessionTime) {
      throw new BadRequestException(
        `Next session can only start at ${this.nextSessionTime.toISOString()}`,
      );
    }

    const now = new Date();
    const session = new this.sessionModel({
      isActive: true,
      startedAt: now,
      endsAt: new Date(now.getTime() + duration * 1000),
    });
    await session.save();

    this.nextSessionTime = new Date(session.endsAt.getTime() + 30_000);

    // Notify clients via WebSocket
    this.gameGateway.sessionStarted({
      endsAt: session.endsAt,
      nextSessionStartsAt: this.nextSessionTime,
    });

    return {
      message: 'Session started.',
      sessionEndsAt: session.endsAt,
      nextSessionStartsAt: this.nextSessionTime,
    };
  }

  async joinSession(userId: string, username: string) {
    const session = await this.sessionModel.findOne({ isActive: true });
    if (!session) {
      throw new BadRequestException('No active session.');
    }

    const objectUserId = new Types.ObjectId(userId);

    if (session.players.find((p) => p.userId.equals(objectUserId))) {
      throw new BadRequestException('User already joined this session.');
    }

    const pickedNumber = Math.floor(Math.random() * 10) + 1;

    session.players.push({ userId: objectUserId, username, pickedNumber });
    await session.save();

    return {
      message: 'Joined session',
      pickedNumber,
      sessionEndsAt: session.endsAt,
    };
  }

  async endSession() {
    const session = await this.sessionModel.findOne({ isActive: true });
    if (!session) {
      throw new BadRequestException('No active session.');
    }

    session.isActive = false;
    session.winningNumber = Math.floor(Math.random() * 10) + 1;

    const winners = session.players.filter(
      (p) => p.pickedNumber === session.winningNumber,
    );

    for (const winner of winners) {
      await this.userModel.findByIdAndUpdate(winner.userId, {
        $inc: { wins: 1 },
      });
    }

    await session.save();

    // Notify clients via WebSocket
    this.gameGateway.sessionEnded({
      winningNumber: session.winningNumber,
      winners,
      nextSessionStartsAt: this.nextSessionTime as Date,
    });

    return {
      winningNumber: session.winningNumber,
      winners,
      nextSessionStartsAt: this.nextSessionTime,
    };
  }

  async getActiveSession() {
    const session = await this.sessionModel.findOne({ isActive: true });
    return {
      activeSession: session,
      nextSessionStartsAt: this.nextSessionTime,
    };
  }

  async getLeaderboard() {
    return this.userModel
      .find()
      .sort({ wins: -1 })
      .limit(10)
      .select('username wins')
      .lean();
  }
}
