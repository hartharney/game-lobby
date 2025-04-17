import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Types } from 'mongoose';
import { GameService } from './game.service';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject } from '@nestjs/common';

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
    console.log(`🎮 Client connected: ${client.id}`);

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

    this.gameService.syncStateToClient(client);
  }

  // Notify all clients when a session starts
  sessionStarted(payload: {
    endsAt: Date;
    startedAt: Date;
    nextSessionStartsAt: Date;
  }) {
    console.log('🚀 Session started!', payload);
    this.server.emit('sessionStarted', payload);
  }

  // Notify all clients when a session ends
  sessionEnded(payload: {
    winningNumber: number;
    winners: any[];
    nextSessionStartsAt: Date;
  }) {
    console.log('🎉 Session ended!', payload);
    this.server.emit('sessionEnded', payload);

    // Clear lobby state after session
    this.players = [];
  }

  // Notify all clients when no session runs (optional)
  sessionSkipped(payload: { nextSessionStartsAt: Date }) {
    console.log('⏭️ Session skipped — no players available.', payload);
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
}
