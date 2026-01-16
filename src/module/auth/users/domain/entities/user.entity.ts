
export class Admin {
  constructor(
    private readonly id: string,
    private name: string | null,
    private email: string,
    private password: string,
    private createdAt: Date,
    private updatedAt: Date,
    private posts?: any | null,
  ) {}

  // setter
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
}
