import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Session, SessionSchema } from './entities/session.entity';
import { Lobby, LobbySchema } from './entities/lobby.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { GameGateway } from './game.gateway';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: User.name, schema: UserSchema },
      { name: Lobby.name, schema: LobbySchema },
    ]),
  ],
  providers: [GameService, GameGateway, UserService],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}
