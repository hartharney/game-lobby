import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { Inject, Logger } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { Types } from 'mongoose';

declare module 'express' {
  interface Request {
    user: {
      userId: Types.ObjectId;
      email: string;
    };
  }
}

export class JWTStrategy extends PassportStrategy(Strategy) {
  logger: Logger;

  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
    this.logger = new Logger(JWTStrategy.name);
  }
  async validate(payload: any) {
    const user = await this.userService.findOne(payload.sub);

    console.log('payload', payload);

    // console.log('JWTStrategy.validate', payload, user);
    return {
      userId: payload.sub,
      email: payload.email,
      username: payload.username,
      user,
    };
  }
}
