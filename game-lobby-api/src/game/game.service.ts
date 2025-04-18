import {
  Injectable,
  BadRequestException,
  OnModuleInit,
  forwardRef,
  Inject,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from './entities/session.entity';
import { Lobby, LobbyDocument } from './entities/lobby.entity';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';
import { GameGateway } from './game.gateway';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GameService implements OnModuleInit {
  private readonly logger = new Logger(GameService.name);

  private nextSessionTime: Date | null = null;
  private sessionDuration = 20_000; // 20 seconds in ms
  private gapBetweenSessions = 30_000; // 30 seconds in ms

  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Lobby.name) private lobbyModel: Model<LobbyDocument>,

    @Inject(forwardRef(() => GameGateway))
    private readonly gameGateway: GameGateway,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async onModuleInit() {
    this.logger.log('GameService initialized — checking existing session.');

    const activeSession = await this.sessionModel.findOne({ isActive: true });
    const now = new Date();

    if (activeSession && activeSession.endsAt > now) {
      this.logger.log(
        '⚠️ Existing active session found — waiting for it to finish.',
      );

      this.nextSessionTime = new Date(
        activeSession.endsAt.getTime() + this.gapBetweenSessions,
      );

      // Calculate remaining time for this session
      const remainingTime = activeSession.endsAt.getTime() - now.getTime();

      // Schedule the winner reveal + next session scheduling after the remaining time
      setTimeout(() => {
        this.revealWinnerAndScheduleNext().catch((err) => {
          console.error('Error revealing winner:', err);
        });
      }, remainingTime);

      return;
    }

    await this.sessionModel.updateMany({ isActive: true }, { isActive: false });
    await this.startSession();
  }

  async syncStateToClient(socket: Socket) {
    const state = await this.getCurrentState();
    this.gameGateway.sendStateToClient(socket, state);
  }

  async joinLobby(userId: string, username: string, pickedNumber: number) {
    let lobby = await this.lobbyModel.findOne();
    if (!lobby) {
      lobby = new this.lobbyModel();
    }

    const objectUserId = new Types.ObjectId(userId);

    if (lobby.players.find((p) => p.userId.equals(objectUserId))) {
      throw new BadRequestException('User already in the lobby.');
    }

    lobby.players.push({ userId: objectUserId, username, pickedNumber });
    await lobby.save();

    this.gameGateway.playersInLobby(lobby.players);

    return {
      message: 'Joined the lobby',
      pickedNumber,
    };
  }

  async startSession() {
    const lobby = await this.lobbyModel.findOne();

    const activeSession = await this.sessionModel.findOne({ isActive: true });
    if (activeSession) {
      throw new BadRequestException('A session is already active.');
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + this.sessionDuration);

    const session = new this.sessionModel({
      isActive: true,
      startedAt: now,
      endsAt,
      players: lobby?.players || [],
    });
    await session.save();

    this.nextSessionTime = new Date(endsAt.getTime() + this.gapBetweenSessions);
    this.gameGateway.sessionStarted({
      startedAt: now,
      endsAt,
      nextSessionStartsAt: this.nextSessionTime,
    });

    setTimeout(() => {
      this.revealWinnerAndScheduleNext().catch(console.error);
    }, this.sessionDuration);

    return {
      message: 'Session started.',
      sessionEndsAt: endsAt,
      nextSessionStartsAt: this.nextSessionTime,
    };
  }

  async getCurrentState() {
    const activeSession = await this.sessionModel.findOne({ isActive: true });
    const now = new Date();

    if (activeSession) {
      const remainingTime = activeSession.endsAt.getTime() - now.getTime();
      return {
        status: 'active',
        startedAt: activeSession.startedAt,
        endsAt: activeSession.endsAt,
        remainingTime,
      };
    } else {
      return {
        status: 'waiting',
        nextSessionStartsAt: this.nextSessionTime,
        remainingTime: this.nextSessionTime
          ? this.nextSessionTime.getTime() - now.getTime()
          : null,
      };
    }
  }

  private async revealWinnerAndScheduleNext() {
    const session = await this.sessionModel.findOne({ isActive: true });
    if (!session) return;

    // Pick a random winning number
    session.winningNumber = Math.floor(Math.random() * 10) + 1;

    // Find winners
    const winners = session.players.filter(
      (p) => p.pickedNumber === session.winningNumber,
    );

    // Update player records
    for (const player of session.players) {
      if (player.pickedNumber === session.winningNumber) {
        await this.userService.recordWin(player.userId.toString(), 10);
      } else {
        await this.userService.recordLoss(player.userId.toString());
      }
    }

    session.isActive = false;
    await session.save();

    // move this into revealWinnerAndScheduleNext
    await this.clearLobby();
    this.gameGateway.playersInLobby([]);

    // Notify clients
    this.gameGateway.sessionEnded({
      winningNumber: session.winningNumber,
      winners,
      nextSessionStartsAt: this.nextSessionTime as Date,
    });

    // Move queue into lobby players
    const lobby = await this.lobbyModel.findOne();
    if (lobby) {
      lobby.players = lobby.queue;
      lobby.queue = [];
      await lobby.save();

      this.gameGateway.playersInLobby(lobby.players);
    }

    // Schedule next session
    setTimeout(() => {
      this.startSession().catch(console.error);
    }, this.gapBetweenSessions);

    return {
      winningNumber: session.winningNumber,
      winners,
      nextSessionStartsAt: this.nextSessionTime,
    };
  }

  private async clearLobby() {
    await this.lobbyModel.updateOne({}, { $set: { players: [] } });
  }

  async leaveLobby(userId: string) {
    const lobby = await this.lobbyModel.findOne();
    if (!lobby) {
      throw new BadRequestException('No lobby found.');
    }

    const objectUserId = new Types.ObjectId(userId);

    const playerIndex = lobby.players.findIndex((p) =>
      p.userId.equals(objectUserId),
    );
    if (playerIndex !== -1) {
      lobby.players.splice(playerIndex, 1);
      await lobby.save();
      this.gameGateway.playersInLobby([...lobby.players, ...lobby.queue]);
      return { message: 'Left lobby' };
    }

    const queueIndex = lobby.queue.findIndex((p) =>
      p.userId.equals(objectUserId),
    );
    if (queueIndex !== -1) {
      lobby.queue.splice(queueIndex, 1);
      await lobby.save();
      this.gameGateway.playersInLobby([...lobby.players, ...lobby.queue]);
      return { message: 'Left queue' };
    }

    throw new BadRequestException('User not in this lobby or queue.');
  }

  async endSession() {
    const session = await this.sessionModel.findOne({ isActive: true });
    if (!session) {
      throw new BadRequestException('No active session.');
    }

    // Properly delegate to the single winner resolver
    const result = await this.revealWinnerAndScheduleNext();
    return result;
  }

  async getActiveSession() {
    const session = await this.sessionModel.findOne({ isActive: true });
    return {
      activeSession: session,
      nextSessionStartsAt: this.nextSessionTime,
    };
  }

  async getLeaderboard() {
    return this.userModel.aggregate([
      {
        $project: {
          username: 1,
          wins: { $size: { $ifNull: ['$winHistory', []] } },
          longestStreak: { $ifNull: ['$longestWinStreak', 0] },
        },
      },
      { $sort: { wins: -1 } },
      { $limit: 10 },
    ]);
  }
}
