import { CreateServeurDto } from './create-serveur.dto';
declare const UpdateServeurDto_base: import("@nestjs/common").Type<Partial<CreateServeurDto>>;
export declare class UpdateServeurDto extends UpdateServeurDto_base {
    email?: string;
    mot_passe?: string;
}
export {};
