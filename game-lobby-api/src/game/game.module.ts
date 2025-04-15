import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Session, SessionSchema } from './entities/session.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { GameGateway } from './game.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [GameService, GameGateway],
  controllers: [GameController],
})
export class GameModule {}
