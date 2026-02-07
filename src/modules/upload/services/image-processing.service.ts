import { Buffer } from 'buffer';

interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

class ImageProcessingService {
  
  async processImage(buffer: Buffer, options: ImageProcessingOptions = {}): Promise<Buffer> {
    try {
      const sharp = await this.loadSharp();
      if (!sharp) {
        console.warn('Sharp not available, returning original image');
        return buffer;
      }

      let processor = sharp(buffer);

      if (options.width || options.height) {
        processor = processor.resize(options.width, options.height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      if (options.format) {
        switch (options.format) {
          case 'jpeg':
            processor = processor.jpeg({ quality: options.quality || 85 });
            break;
          case 'png':
            processor = processor.png({ quality: options.quality || 85 });
            break;
          case 'webp':
            processor = processor.webp({ quality: options.quality || 85 });
            break;
        }
      }

      return await processor.toBuffer();
    } catch (error) {
      console.error('Image processing failed:', error);
      return buffer;
    }
  }

  private async loadSharp(): Promise<any> {
    try {
      const sharpModule = await eval('import("sharp")');
      return sharpModule.default;
    } catch (error) {
      return null;
    }
  }

  async createThumbnail(buffer: Buffer, size: number = 200): Promise<Buffer> {
    return this.processImage(buffer, {
      width: size,
      height: size,
      quality: 80,
      format: 'jpeg'
    });
  }

  async optimizeForWeb(buffer: Buffer): Promise<Buffer> {
    return this.processImage(buffer, {
      width: 1200,
      quality: 85,
      format: 'jpeg'
    });
  }
}

export default new ImageProcessingService();
