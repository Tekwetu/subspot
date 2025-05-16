import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from './dto/auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secretKey = configService.get<string>('JWT_SECRET');
    if (!secretKey) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email };
  }
}
