import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { JwtRequest } from '../auth/interfaces/jwt-request.interface';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // Start a new session (for demo/dev only — ideally protected)
  @Post('start-session')
  startSession() {
    return this.gameService.startSession(20);
  }

  // Get active session
  @Get('active-session')
  getActiveSession() {
    return this.gameService.getActiveSession();
  }

  // Join a session
  @UseGuards(JwtAuthGuard)
  @Post('join')
  join(@Request() req: JwtRequest) {
    return this.gameService.joinSession(req.user.userId, req.user.username);
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
