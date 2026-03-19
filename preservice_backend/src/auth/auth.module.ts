import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { User, UserSchema } from 'src/users/entities/user.entity';
import {
  BlacklistedToken,
  BlacklistedTokenSchema,
} from './schemas/blacklisted-token.schema';
import { TokenBlacklistService } from './token-blacklist.service';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { RefreshTokensService } from './refresh-tokens.service';
import { ServeurAuthService } from './serveur-auth.service';
import { ServeurAuthController } from './serveur-auth.controller';
import { ServeurModule } from 'src/serveur/serveur.module';
import { MailModule } from 'src/mail/mail.module';
import {
  AdminAuditLog,
  AdminAuditLogSchema,
} from './schemas/admin-audit-log.schema';
import { AdminAuditLogService } from './admin-audit-log.service';
import { TwoFactorService } from './two-factor.service';
import { AuthRateLimitService } from './auth-rate-limit.service';

@Module({
  imports: [
    JwtModule.register({}), // options passées à l'appel .sign()
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: BlacklistedToken.name, schema: BlacklistedTokenSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: AdminAuditLog.name, schema: AdminAuditLogSchema },
    ]),
    ServeurModule,
    MailModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    TokenBlacklistService,
    RefreshTokensService,
    ServeurAuthService,
    AdminAuditLogService,
    TwoFactorService,
    AuthRateLimitService,
  ],
  controllers: [AuthController, ServeurAuthController],
})
export class AuthModule {}
