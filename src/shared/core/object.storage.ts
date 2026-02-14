export class ObjectStorage {
  async upload(file: any) {
    // S3 or cloud storage upload logic
    return { url: 'https://example.com/file.jpg' };
  }
}

export default new ObjectStorage();
