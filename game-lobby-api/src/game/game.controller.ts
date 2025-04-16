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
  @Post('start-session')
  startSession() {
    return this.gameService.startSession(); // ✅ fixed
  }

  // Get active session
  @Get('active-session')
  getActiveSession() {
    return this.gameService.getActiveSession();
  }

  // Join a session
  @UseGuards(JwtAuthGuard)
  @Post('join')
  join(@Request() req: JwtRequest, @Body() body: { number: number }) {
    return this.gameService.joinSession(
      req.user.userId,
      req.user.username,
      body.number,
    );
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
