import B2 from "backblaze-b2";

interface B2Config {
  applicationKeyId: string;
  applicationKey: string;
  bucketName: string;
  bucketId?: string;
}

class BackblazeB2Service {
  private b2: B2;
  private bucketName: string;
  private bucketId: string | null = null;
  private downloadUrl: string | null = null;

  constructor(config: B2Config) {
    this.b2 = new B2({
      applicationKeyId: config.applicationKeyId,
      applicationKey: config.applicationKey,
    });
    this.bucketName = config.bucketName;
    this.bucketId = config.bucketId || null;
  }

  private async initialize() {
    if (!this.bucketId) {
      await this.b2.authorize();
      const response = await this.b2.listBuckets();
      const bucket = response.data.buckets.find(
        (b: any) => b.bucketName === this.bucketName
      );
      if (!bucket) throw new Error(`Bucket ${this.bucketName} not found`);
      this.bucketId = bucket.bucketId;
      this.downloadUrl = response.data.downloadUrl;
    }
  }

  async uploadFile(
    fileName: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    await this.initialize();

    const uploadUrl = await this.b2.getUploadUrl({ bucketId: this.bucketId! });

    const response = await this.b2.uploadFile({
      uploadUrl: uploadUrl.data.uploadUrl,
      uploadAuthToken: uploadUrl.data.authorizationToken,
      fileName,
      data: buffer,
      mime: contentType,
    });

    // Return public URL for public buckets
    return `${this.downloadUrl}/file/${this.bucketName}/${fileName}`;
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.initialize();

    const fileInfo = await this.b2.listFileNames({
      bucketId: this.bucketId!,
      startFileName: fileName,
      maxFileCount: 1,
      delimiter: '',
      prefix: ''
    });

    const file = fileInfo.data.files.find((f: any) => f.fileName === fileName);
    if (!file) throw new Error("File not found");

    await this.b2.deleteFileVersion({
      fileId: file.fileId,
      fileName: file.fileName,
    });
  }

  async getDownloadAuthorization(
    fileName: string,
    validDurationInSeconds: number = 3600
  ): Promise<string> {
    await this.initialize();

    const auth = await this.b2.getDownloadAuthorization({
      bucketId: this.bucketId!,
      fileNamePrefix: fileName,
      validDurationInSeconds,
    });

    return `${this.downloadUrl}/file/${this.bucketName}/${fileName}?Authorization=${auth.data.authorizationToken}`;
  }
}

// Initialize B2 service
const b2Config: B2Config = {
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID || "",
  applicationKey: process.env.B2_APPLICATION_KEY || "",
  bucketName: process.env.B2_BUCKET_NAME || "lockwise-uploads",
  bucketId: process.env.B2_BUCKET_ID,
};

export const b2Storage = new BackblazeB2Service(b2Config);
export default BackblazeB2Service;
