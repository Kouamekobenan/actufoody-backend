export class Category {
  constructor(
    private readonly _id: string,
    private _name: string,
    private _description: string | null,
    private _posts: any[] = [],
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {}

  // --- Getters ---
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get posts(): any[] {
    return this._posts;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // --- Setters / méthodes métier ---
  rename(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Category name cannot be empty.');
    }
    this._name = newName.trim();
    this.touch();
  }

  updateDescription(newDescription: string | null): void {
    this._description = newDescription ? newDescription.trim() : null;
    this.touch();
  }

  addPost(post: any): void {
    this._posts.push(post);
    this.touch();
  }

  removePost(postId: string): void {
    this._posts = this._posts.filter((p) => p.id !== postId);
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}
