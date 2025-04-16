import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from './entities/session.entity';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';
import { GameGateway } from './game.gateway';

@Injectable()
export class GameService implements OnModuleInit {
  private nextSessionTime: Date | null = null;
  private sessionDuration = 20_000; // in ms
  private gapBetweenSessions = 30_000; // in ms

  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly gameGateway: GameGateway,
  ) {}

  async onModuleInit() {
    console.log('🚀 GameService initialized — checking existing session.');

    const activeSession = await this.sessionModel.findOne({ isActive: true });

    const now = new Date();

    if (activeSession && activeSession.endsAt > now) {
      console.log(
        '⚠️ Existing active session found — skipping new session start.',
      );
      this.nextSessionTime = new Date(
        activeSession.endsAt.getTime() + this.gapBetweenSessions,
      );
      return;
    }

    // Either no session or it's expired — clean up and start a new one
    await this.sessionModel.updateMany({ isActive: true }, { isActive: false });

    await this.startSession();
  }

  async startSession() {
    const activeSession = await this.sessionModel.findOne({ isActive: true });
    if (activeSession) {
      throw new BadRequestException('A session is already active.');
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + this.sessionDuration);

    const session = new this.sessionModel({
      isActive: true,
      startedAt: now,
      endsAt: endsAt,
    });
    await session.save();

    this.nextSessionTime = new Date(endsAt.getTime() + this.gapBetweenSessions);

    this.gameGateway.sessionStarted({
      endsAt: endsAt,
      nextSessionStartsAt: this.nextSessionTime,
    });

    // Automatically end the session when time's up
    setTimeout(() => {
      this.endSessionAndScheduleNext().catch((err) => {
        console.error('Error ending session:', err);
      });
    }, this.sessionDuration);

    return {
      message: 'Session started.',
      sessionEndsAt: endsAt,
      nextSessionStartsAt: this.nextSessionTime,
    };
  }

  private async endSessionAndScheduleNext() {
    const session = await this.sessionModel.findOne({ isActive: true });
    if (!session) return;

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

    this.gameGateway.sessionEnded({
      winningNumber: session.winningNumber,
      winners,
      nextSessionStartsAt: this.nextSessionTime as Date,
    });

    // Wait gap then start next session
    setTimeout(() => {
      this.startSession().catch((err) => {
        console.error('Error starting next session:', err);
      });
    }, this.gapBetweenSessions);
  }

  async joinSession(userId: string, username: string, pickedNumber: number) {
    const session = await this.sessionModel.findOne({ isActive: true });
    if (!session) {
      throw new BadRequestException('No active session.');
    }

    const objectUserId = new Types.ObjectId(userId);

    if (session.players.find((p) => p.userId.equals(objectUserId))) {
      throw new BadRequestException('User already joined this session.');
    }

    // Add the new player to the session
    session.players.push({ userId: objectUserId, username, pickedNumber });
    await session.save();

    // Emit player join event to notify clients
    this.gameGateway.playerJoined(session.players); // Pass the updated player list

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
