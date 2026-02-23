import { ServeurStatus } from '../entities/serveur.entity';
export declare class CreateServeurDto {
    nom: string;
    prenom: string;
    phone: string;
    email: string;
    mot_passe: string;
    years?: number;
    skills?: string[];
    status?: ServeurStatus;
    isActive?: boolean;
}
