import { UserRole } from '../entities/user.entity';
export declare class CreateUserDto {
    nom: string;
    email: string;
    numero_tel: string;
    adresse?: string;
    mot_passe: string;
    isActive?: boolean;
    role?: UserRole;
}
