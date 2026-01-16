import { Category } from 'src/module/categories/domain/entities/category';
import { MediaType } from '../enums/media.enum';

export class Post {
  constructor(
    private readonly id: string,
    private title: string,
    private content: string | null,
    private mediaType: MediaType,
    private mediaUrl: string | null,
    private readonly categoryId: string | null,
    private readonly adminId: string,
    private readonly publishedAt: Date,
    private readonly updatedAt: Date,
    private isPublished: boolean,
    private category?: Category,
  ) {}

  // Getters
  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getContent(): string | null {
    return this.content;
  }

  getMediaType(): MediaType {
    return this.mediaType;
  }

  getMediaUrl(): string | null {
    return this.mediaUrl;
  }

  getCategoryId(): string | null {
    return this.categoryId;
  }

  getAdminId(): string {
    return this.adminId;
  }

  getPublishedAt(): Date {
    return this.publishedAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getIsPublished(): boolean {
    return this.isPublished;
  }

  // Setters pour les propriétés modifiables
  setTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Le titre ne peut pas être vide');
    }
    this.title = title;
  }

  setContent(content: string | null): void {
    this.content = content;
  }

  setMediaType(mediaType: MediaType): void {
    this.mediaType = mediaType;
  }

  setMediaUrl(mediaUrl: string | null): void {
    this.mediaUrl = mediaUrl;
  }

  setIsPublished(isPublished: boolean): void {
    this.isPublished = isPublished;
  }

  // Méthodes métier
  publish(): void {
    if (this.isPublished) {
      throw new Error('Le post est déjà publié');
    }
    this.isPublished = true;
  }

  unpublish(): void {
    if (!this.isPublished) {
      throw new Error('Le post est déjà dépublié');
    }
    this.isPublished = false;
  }

  hasMedia(): boolean {
    return this.mediaUrl !== null && this.mediaUrl.trim().length > 0;
  }

  hasContent(): boolean {
    return this.content !== null && this.content.trim().length > 0;
  }

  isVideoPost(): boolean {
    return this.mediaType === MediaType.VIDEO;
  }

  isImagePost(): boolean {
    return this.mediaType === MediaType.IMAGE;
  }

  isTextOnly(): boolean {
    return !this.hasMedia() && this.hasContent();
  }

  // Méthode pour obtenir un résumé du contenu
  getContentPreview(maxLength: number = 150): string {
    if (!this.content) return '';

    if (this.content.length <= maxLength) {
      return this.content;
    }

    return this.content.substring(0, maxLength).trim() + '...';
  }

  // Méthode pour vérifier si le post est récent
  isRecent(daysThreshold: number = 7): boolean {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.publishedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= daysThreshold;
  }

  // Méthode pour vérifier si le post a été modifié
  wasModified(): boolean {
    return this.publishedAt.getTime() !== this.updatedAt.getTime();
  }

  // Méthode pour valider le post avant publication
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Le titre est obligatoire');
    }

    if (this.title && this.title.length > 200) {
      errors.push('Le titre ne peut pas dépasser 200 caractères');
    }

    if (!this.hasContent() && !this.hasMedia()) {
      errors.push('Le post doit avoir du contenu ou un média');
    }

    if (this.mediaUrl && !this.isValidUrl(this.mediaUrl)) {
      errors.push("L'URL du média n'est pas valide");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Méthode utilitaire privée pour valider les URLs
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Méthode pour obtenir une représentation JSON
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      mediaType: this.mediaType,
      mediaUrl: this.mediaUrl,
      categoryId: this.categoryId,
      adminId: this.adminId,
      publishedAt: this.publishedAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isPublished: this.isPublished,
    };
  }

  // Méthode statique pour créer une instance depuis un objet
  static fromJSON(data: any): Post {
    return new Post(
      data.id,
      data.title,
      data.content,
      data.mediaType,
      data.mediaUrl,
      data.categoryId,
      data.adminId,
      new Date(data.publishedAt),
      new Date(data.updatedAt),
      data.isPublished,
    );
  }

  // Méthode pour cloner le post
  clone(): Post {
    return new Post(
      this.id,
      this.title,
      this.content,
      this.mediaType,
      this.mediaUrl,
      this.categoryId,
      this.adminId,
      new Date(this.publishedAt),
      new Date(this.updatedAt),
      this.isPublished,
    );
  }

  // Méthode pour comparer deux posts
  equals(other: Post): boolean {
    return this.id === other.id;
  }

  // Méthode toString pour debug
  toString(): string {
    return `Post(id: ${this.id}, title: "${this.title}", published: ${this.isPublished})`;
  }
}
