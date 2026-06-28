import { AdminRole } from '@prisma/client';

export class Admin {
  constructor(
    private readonly id: string,
    private name: string | null,
    private email: string,
    private password: string,
    private createdAt: Date,
    private updatedAt: Date,
    private role: AdminRole = AdminRole.EDITOR,
    private posts?: any | null,
  ) {}

  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }

  getName(): string | null {
    return this.name;
  }

  getRole(): AdminRole {
    return this.role;
  }
}
