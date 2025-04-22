import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';

import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { UptimeService } from './uptime.service';
import { HttpModule } from '@nestjs/axios';
dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    AuthModule,
    UserModule,
    GameModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    UptimeService,
  ],
})
export class AppModule {}
