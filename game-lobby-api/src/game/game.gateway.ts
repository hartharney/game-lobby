import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';

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

  // Connection event
  handleConnection(client: Socket) {
    console.log(`🎮 Client connected: ${client.id}`);

    // Emit a test event confirming connection
    client.emit('connectionConfirmed', {
      message: 'Welcome to the game lobby!',
    });
  }

  // Notify clients when a session starts
  sessionStarted(payload: { endsAt: Date; nextSessionStartsAt: Date }) {
    this.server.emit('sessionStarted', payload);
  }

  // Notify clients when a session ends
  sessionEnded(payload: {
    winningNumber: number;
    winners: any[];
    nextSessionStartsAt: Date;
  }) {
    this.server.emit('sessionEnded', payload);
  }

  // Emit player join event to all clients
  playerJoined(
    players: {
      userId: Types.ObjectId;
      username: string;
      pickedNumber: number;
    }[],
  ) {
    this.server.emit('playerJoined', { players });
  }
}
