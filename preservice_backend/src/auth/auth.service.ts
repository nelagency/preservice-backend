import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserSchema, UserRole } from 'src/users/entities/user.entity';
import { RefreshTokensService } from './refresh-tokens.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private configService: ConfigService,
        private jwt: JwtService,
        @InjectModel(User.name) private users: Model<UserDocument>,
        private readonly rts: RefreshTokensService,
    ) { }

    private signToken(user: any) {
        const payload = {
            sub: user.id?.toString() ?? user._id?.toString(),
            email: user.email,
            role: user.role,
            nom: user.nom,
            isActive: user.isActive,
        };
        const ACCESS_SECRET = this.configService.get('auth.accessToken')
        const ACCESS_EXPIRES_IN = this.configService.get('auth.accessIn')
        return {
            access_token: this.jwt.sign(payload, {
                secret: ACCESS_SECRET,
                expiresIn: ACCESS_EXPIRES_IN,
            }),
            user: payload,
        };
    }

    async validateUser(email: string, mot_passe: string) {
        const doc = await this.users.findOne({ email }).select('+mot_passe').lean(false);

        if (!doc) throw new UnauthorizedException('Email ou mot de passe invalide');

        const ok = await bcrypt.compare(mot_passe, (doc as any).mot_passe);

        if (!ok) throw new UnauthorizedException('Mot de passe invalide');

        if (doc.isActive === false) throw new UnauthorizedException('Compte inactif');

        const user = doc.toJSON();

        return user;
    }

    async login(email: string, mot_passe: string, meta?: { ua?: string; ip?: string }) {
        const user = await this.validateUser(email, mot_passe);
        const at = this.signToken(user);
        const rt = await this.rts.generate(at.user.sub, 'user', meta);
        return { ...at, refresh_token: rt.token, refresh_expires_at: rt.expiresAt };
    }

    async register(data: {
        nom: string; email: string; numero_tel: string; adresse?: string; mot_passe: string; role?: UserRole;
    }, meta?: { ua?: string; ip?: string }) {
        const exists = await this.users.exists({ email: data.email });
        if (exists) throw new UnauthorizedException('Email déjà utilisé');

        const created = new this.users(data as any);
        await created.save();
        const user = created.toJSON();

        const at = this.signToken(user);
        const rt = await this.rts.generate(at.user.sub, 'user', meta);

        return { ...at, refresh_token: rt.token, refresh_expires_at: rt.expiresAt };
    }

    async refresh(oldRefreshToken: string, userIdHint?: string, meta?: { ua?: string; ip?: string }) {
        const { newToken, userId, expiresAt, cookie } = await this.rts.verifyAndRotate(oldRefreshToken, userIdHint, 'user', meta);
        // émettre un nouveau access token pour ce user
        const userDoc = await this.users.findById(userId).lean();
        if (!userDoc) throw new UnauthorizedException('Utilisateur introuvable');
        const at = this.signToken(userDoc);
        return { ...at, refresh_token: newToken, refresh_expires_at: expiresAt, cookie };
    }
}