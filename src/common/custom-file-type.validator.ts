// src/module/post/validators/custom-file-type.validator.ts

import { FileValidator } from '@nestjs/common';

export class CustomFileTypeValidator extends FileValidator {
  private readonly validImageMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  private readonly validVideoMimes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
  ];

  buildErrorMessage(): string {
    return 'Type de fichier invalide. Formats acceptés: JPG, JPEG, PNG, WebP, GIF, MP4, MOV, AVI, MKV';
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!file) return true; // Le fichier est optionnel

    const validMimes = [...this.validImageMimes, ...this.validVideoMimes];
    const validExtensions = /\.(jpg|jpeg|png|webp|gif|mp4|mov|avi|mkv)$/i;

    // Vérifier le MIME type
    const mimeValid = validMimes.includes(file.mimetype);
    
    // Vérifier l'extension du fichier
    const extensionValid = validExtensions.test(file.originalname);

    return mimeValid && extensionValid;
  }
}