import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

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
}
