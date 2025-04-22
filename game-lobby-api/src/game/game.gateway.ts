import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Types } from 'mongoose';
import { GameService } from './game.service';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/game',
})
export class GameGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);

  players: {
    userId: Types.ObjectId;
    username: string;
    pickedNumber: number;
  }[] = [];

  constructor(
    @Inject(forwardRef(() => GameService))
    private readonly gameService: GameService,
  ) {}

  // When a client connects
  handleConnection(client: Socket) {
    this.logger.log(`🎮 Client connected: ${client.id}`);

    client.emit('connectionConfirmed', {
      message: 'Welcome to the game lobby!',
    });

    client.on('getPlayers', () => {
      client.emit('playersInLobby', { players: this.players });
    });

    client.on('getGameState', async () => {
      const state = await this.gameService.getCurrentState();
      client.emit('gameState', state);
    });

    this.gameService
      .syncStateToClient(client)
      .then((state) => {
        client.emit('gameState', state);
      })
      .catch((error) => {
        this.logger.error('Error syncing state to client:', error);
      });
  }

  // Notify all clients or a specific client when a session starts
  sessionStarted(
    payload: {
      endsAt: Date;
      startedAt: Date;
      nextSessionStartsAt: Date | null;
    },
    socket?: Socket,
  ) {
    this.logger.log(
      `🚀 Session started! ${socket ? '(to specific client)' : '(to all)'}`,
      payload,
    );

    if (socket) {
      socket.emit('sessionStarted', payload);
    } else {
      this.server.emit('sessionStarted', payload);
    }
  }

  // Notify all clients or a specific client when a session ends
  sessionEnded(
    payload: {
      winningNumber: number | null;
      winners: any[];
      nextSessionStartsAt: Date | null;
    },
    socket?: Socket,
  ) {
    this.logger.log(
      `🎉 Session ended! ${socket ? '(to specific client)' : '(to all)'}`,
      payload,
    );

    if (socket) {
      socket.emit('sessionEnded', payload);
    } else {
      this.server.emit('sessionEnded', payload);
    }
  }

  // Notify all clients when no session runs (optional)
  sessionSkipped(payload: { nextSessionStartsAt: Date }) {
    this.logger.log('⏭️ Session skipped — no players available.', payload);
    this.server.emit('sessionSkipped', payload);
  }

  // Emit current players/queue to all clients
  playersInLobby(
    players: {
      userId: Types.ObjectId;
      username: string;
      pickedNumber: number;
    }[],
  ) {
    this.players = players;
    this.server.emit('playersInLobby', { players });
  }

  // Send state updates to a specific client
  sendStateToClient(socket: Socket, state: any) {
    socket.emit('stateUpdate', state);
  }

  broadcastStateToClients(state: any) {
    this.server.emit('stateUpdate', state);
  }
}
