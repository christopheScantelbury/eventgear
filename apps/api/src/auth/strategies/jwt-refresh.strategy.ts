import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { RedisService } from '../../redis/redis.service';

interface JwtPayload {
  sub: string;
  companyId: string;
  role: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService, private redis: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException();

    const stored = await this.redis.get(`refresh:${payload.sub}`);
    if (!stored || stored !== token) throw new UnauthorizedException();

    return { id: payload.sub, companyId: payload.companyId, role: payload.role };
  }
}
