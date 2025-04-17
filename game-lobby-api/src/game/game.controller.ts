import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { JwtRequest } from '../auth/interfaces/jwt-request.interface';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // Start a new session
  @UseGuards(JwtAuthGuard)
  @Post('start-session')
  startSession() {
    return this.gameService.startSession();
  }

  // Get active session
  @Get('active-session')
  getActiveSession() {
    return this.gameService.getActiveSession();
  }

  // Join Lobby
  @UseGuards(JwtAuthGuard)
  @Post('join-lobby')
  joinLobby(
    @Request() req: JwtRequest,
    @Body() body: { pickedNumber: string },
  ) {
    const { userId, username } = req.user;
    const { pickedNumber } = body;
    if (!pickedNumber) {
      throw new BadRequestException('pickedNumber is required.');
    }
    return this.gameService.joinLobby(userId, username, +pickedNumber);
  }

  // Leave a lobby
  @UseGuards(JwtAuthGuard)
  @Post('leave-lobby')
  leaveLobby(@Request() req: JwtRequest) {
    return this.gameService.leaveLobby(req.user.userId);
  }

  // End the current session
  @Post('end-session')
  endSession() {
    return this.gameService.endSession();
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.gameService.getLeaderboard();
  }
}
