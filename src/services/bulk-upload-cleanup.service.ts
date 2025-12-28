import bulkUploadService from './bulk-upload.service';

class BulkUploadCleanupService {
  
  async cleanupOldFiles(daysOld: number = 30): Promise<{ deletedCount: number; errors: string[] }> {
    const errors: string[] = [];
    let deletedCount = 0;

    try {
      deletedCount = await bulkUploadService.cleanupOldBulkFiles(daysOld);
      console.log(`Cleaned up ${deletedCount} old bulk upload files`);
    } catch (error) {
      const errorMsg = `Bulk file cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }

    return { deletedCount, errors };
  }

  // Schedule cleanup to run daily
  scheduleCleanup(): void {
    const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
    
    setInterval(async () => {
      console.log('Running scheduled bulk upload file cleanup...');
      await this.cleanupOldFiles(30); // Clean files older than 30 days
    }, CLEANUP_INTERVAL);
    
    console.log('Bulk upload file cleanup scheduled to run daily');
  }
}

export default new BulkUploadCleanupService();