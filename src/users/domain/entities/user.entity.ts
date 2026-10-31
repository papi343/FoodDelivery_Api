import { Role } from '../../../common/enums/role.enum';

// Entité domaine représentant un utilisateur
export class User {
  constructor(
    public readonly id: number | null,
    public nom: string,
    public email: string,
    public motDePasseHash: string,
    public role: Role = Role.CLIENT,
    public refreshTokenHash: string | null = null,
    public readonly createdAt?: Date,
  ) {}

  // Retourne les infos publiques sans exposer le mot de passe ni le refresh token
  toPublic() {
    return {
      id: this.id,
      nom: this.nom,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
    };
  }
}
