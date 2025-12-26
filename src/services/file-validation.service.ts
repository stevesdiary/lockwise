import { Buffer } from 'buffer';

interface FileValidationResult {
  isValid: boolean;
  error?: string;
  mimeType?: string;
  extension?: string;
}

class FileValidationService {
  
  private readonly allowedImageTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];

  private readonly allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  private readonly maxFileSizes = {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024, // 10MB
    default: 2 * 1024 * 1024 // 2MB
  };

  async validateFile(buffer: Buffer, originalName: string, mimeType: string): Promise<FileValidationResult> {
    // Check file size
    const sizeLimit = this.getFileSizeLimit(mimeType);
    if (buffer.length > sizeLimit) {
      return {
        isValid: false,
        error: `File size exceeds limit of ${sizeLimit / (1024 * 1024)}MB`
      };
    }

    // Validate MIME type
    if (!this.isAllowedMimeType(mimeType)) {
      return {
        isValid: false,
        error: 'File type not allowed'
      };
    }

    // Check file signature (magic bytes)
    const signatureValidation = this.validateFileSignature(buffer, mimeType);
    if (!signatureValidation.isValid) {
      return signatureValidation;
    }

    // Scan for malicious content
    const securityCheck = this.performSecurityScan(buffer, originalName);
    if (!securityCheck.isValid) {
      return securityCheck;
    }

    return {
      isValid: true,
      mimeType,
      extension: this.getFileExtension(originalName)
    };
  }

  private isAllowedMimeType(mimeType: string): boolean {
    return [...this.allowedImageTypes, ...this.allowedDocumentTypes].includes(mimeType);
  }

  private getFileSizeLimit(mimeType: string): number {
    if (this.allowedImageTypes.includes(mimeType)) {
      return this.maxFileSizes.image;
    }
    if (this.allowedDocumentTypes.includes(mimeType)) {
      return this.maxFileSizes.document;
    }
    return this.maxFileSizes.default;
  }

  private validateFileSignature(buffer: Buffer, mimeType: string): FileValidationResult {
    const signatures: { [key: string]: number[][] } = {
      'image/jpeg': [[0xFF, 0xD8, 0xFF]],
      'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
      'image/gif': [[0x47, 0x49, 0x46, 0x38]],
      'image/webp': [[0x52, 0x49, 0x46, 0x46]],
      'application/pdf': [[0x25, 0x50, 0x44, 0x46]]
    };

    const expectedSignatures = signatures[mimeType];
    if (!expectedSignatures) {
      return { isValid: true }; // Skip validation for unknown types
    }

    const fileHeader = Array.from(buffer.slice(0, 8));
    const isValidSignature = expectedSignatures.some(signature =>
      signature.every((byte, index) => fileHeader[index] === byte)
    );

    if (!isValidSignature) {
      return {
        isValid: false,
        error: 'File signature does not match declared type'
      };
    }

    return { isValid: true };
  }

  private performSecurityScan(buffer: Buffer, filename: string): FileValidationResult {
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024));
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /document\.write/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        return {
          isValid: false,
          error: 'File contains potentially malicious content'
        };
      }
    }

    // Check filename for suspicious extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.vbs'];
    const hasDoubleExtension = dangerousExtensions.some(ext => 
      filename.toLowerCase().includes(ext)
    );

    if (hasDoubleExtension) {
      return {
        isValid: false,
        error: 'Suspicious file extension detected'
      };
    }

    return { isValid: true };
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  isImageFile(mimeType: string): boolean {
    return this.allowedImageTypes.includes(mimeType);
  }

  isDocumentFile(mimeType: string): boolean {
    return this.allowedDocumentTypes.includes(mimeType);
  }
}

export default new FileValidationService();