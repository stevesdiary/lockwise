import * as XLSX from 'xlsx';
import { Buffer } from 'buffer';
import sequelize from '../../../shared/core/database';
import { cloudStorage } from './unified-storage.service';
import NotificationService from '../../communication/services/notification.service';
import { Street } from '../../estate/models/street.model';
import { Unit } from '../../estate/models/unit.model';

interface BulkUploadResult<T> {
  created: T[];
  updated: T[];
  skipped: T[];
  errors: Array<{ row: number; data: any; reason: string }>;
  totalProcessed: number;
  successCount: number;
}

interface EstateData {
  name: string;
  address: string;
  type: 'residential' | 'mixed' | 'commercial' | 'other';
  city?: string;
  state?: string;
  country?: string;
  estate_code?: string;
  number_of_appartments?: number;
  total_number_of_floors?: number;
}

interface ResidentData {
  user_id: string;
  estate_id: string;
  unit_id: string;
  move_in_date: Date;
  lease_start_date?: Date;
  lease_end_date?: Date;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status: 'active' | 'inactive' | 'pending';
}

interface AddressData {
  estate_id: string;
  street: string;
  building?: string;
  apartment_number: string;
  city: string;
  state: string;
  country: string;
  zip_code?: string;
  available: boolean;
}

interface StreetsUnitsRow {
  street_name: string;
  unit_identifier: string;
  unit_type?: string;
  block?: string;
  floor?: number | null;
}

class BulkUploadService {
  
  private parseFile(buffer: Buffer, filename: string): any[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  async uploadEstates(buffer: Buffer, filename: string, userId: string): Promise<BulkUploadResult<any>> {
    // Store file for audit
    const fileKey = `bulk-uploads/estates/${Date.now()}-${filename}`;
    const fileUrl = await cloudStorage.uploadFile(fileKey, buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    const rows = this.parseFile(buffer, filename);
    const result: BulkUploadResult<any> = {
      created: [],
      updated: [],
      skipped: [],
      errors: [],
      totalProcessed: rows.length,
      successCount: 0
    };

    const transaction = await sequelize.transaction();

    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          const estateData = this.mapRowToEstate(row);
          
          if (!estateData.name) {
            result.errors.push({ row: i + 1, data: row, reason: 'Estate name is required' });
            continue;
          }

          const estate = await this.createEstate(estateData, transaction);
          if (estate.isNew) {
            result.created.push(estate);
          } else {
            result.skipped.push(estate);
          }
          result.successCount++;

        } catch (error) {
          result.errors.push({ 
            row: i + 1, 
            data: row, 
            reason: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      // Create bulk upload job record
      await this.createBulkUploadJob({
        userId,
        uploadType: 'estates',
        filename,
        sourceFileKey: fileKey,
        sourceFileUrl: fileUrl,
        ...result
      }, transaction);

      await transaction.commit();

      // Queue web push to admin who triggered the upload (fire-and-forget after commit)
      if (result.successCount > 0) {
        NotificationService.queueWebPush([userId], {
          title: 'Bulk Estate Upload Complete',
          body: `${result.successCount} estate(s) created, ${result.errors.length} error(s).`,
          tag: 'bulk-upload-estates',
          url: '/admin/bulk-uploads',
        }).catch(() => undefined);
      }

      return result;

    } catch (error) {
      await transaction.rollback();
      // Clean up uploaded file on failure
      await cloudStorage.deleteFile(fileKey);
      throw error;
    }
  }

  async uploadResidents(buffer: Buffer, filename: string, adminUserId?: string): Promise<BulkUploadResult<any>> {
    // Store file for audit
    const fileKey = `bulk-uploads/residents/${Date.now()}-${filename}`;
    const fileUrl = await cloudStorage.uploadFile(fileKey, buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    const rows = this.parseFile(buffer, filename);
    const result: BulkUploadResult<any> = {
      created: [],
      updated: [],
      skipped: [],
      errors: [],
      totalProcessed: rows.length,
      successCount: 0
    };

    const transaction = await sequelize.transaction();

    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          const residentData = this.mapRowToResident(row);
          
          if (!residentData.user_id || !residentData.estate_id) {
            result.errors.push({ 
              row: i + 1, 
              data: row, 
              reason: 'User ID and Estate ID are required' 
            });
            continue;
          }

          const resident = await this.createResident(residentData, transaction);
          if (resident.isNew) {
            result.created.push(resident);

            // Queue welcome email for each new resident (fire-and-forget, after commit)
            // resident.email and resident.name will be populated once stubs use real models
            if (resident.email && resident.name) {
              NotificationService.sendNotification({
                type: 'email',
                to: resident.email,
                template: 'welcome',
                data: { name: resident.name },
                priority: 'normal',
              }).catch(() => undefined);
            }
          } else {
            result.skipped.push(resident);
          }
          result.successCount++;

        } catch (error) {
          result.errors.push({
            row: i + 1,
            data: row,
            reason: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Create bulk upload job record
      await this.createBulkUploadJob({
        userId: adminUserId || 'system',
        uploadType: 'residents',
        filename,
        sourceFileKey: fileKey,
        sourceFileUrl: fileUrl,
        ...result
      }, transaction);

      await transaction.commit();

      // Notify the uploading admin via web push
      if (adminUserId && result.successCount > 0) {
        NotificationService.queueWebPush([adminUserId], {
          title: 'Bulk Resident Upload Complete',
          body: `${result.successCount} resident(s) onboarded, ${result.errors.length} error(s).`,
          tag: 'bulk-upload-residents',
          url: '/admin/bulk-uploads',
        }).catch(() => undefined);
      }

      return result;

    } catch (error) {
      await transaction.rollback();
      // Clean up uploaded file on failure
      await cloudStorage.deleteFile(fileKey);
      throw error;
    }
  }

  async uploadAddresses(buffer: Buffer, filename: string, estateId: string, userId: string): Promise<BulkUploadResult<any>> {
    // Store file for audit
    const fileKey = `bulk-uploads/addresses/${Date.now()}-${filename}`;
    const fileUrl = await cloudStorage.uploadFile(fileKey, buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    const rows = this.parseFile(buffer, filename);
    const result: BulkUploadResult<any> = {
      created: [],
      updated: [],
      skipped: [],
      errors: [],
      totalProcessed: rows.length,
      successCount: 0
    };

    const transaction = await sequelize.transaction();

    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          const addressData = this.mapRowToAddress(row, estateId);
          
          if (!addressData.apartment_number) {
            result.errors.push({ 
              row: i + 1, 
              data: row, 
              reason: 'Apartment number is required' 
            });
            continue;
          }

          const address = await this.createAddress(addressData, transaction);
          if (address.isNew) {
            result.created.push(address);
          } else {
            result.skipped.push(address);
          }
          result.successCount++;

        } catch (error) {
          result.errors.push({ 
            row: i + 1, 
            data: row, 
            reason: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      // Create bulk upload job record
      await this.createBulkUploadJob({
        userId,
        uploadType: 'addresses',
        filename,
        sourceFileKey: fileKey,
        sourceFileUrl: fileUrl,
        ...result
      }, transaction);

      await transaction.commit();
      return result;

    } catch (error) {
      await transaction.rollback();
      // Clean up uploaded file on failure
      await cloudStorage.deleteFile(fileKey);
      throw error;
    }
  }

  async uploadStreetsUnits(
    buffer: Buffer,
    filename: string,
    estateCode: string,
    userId: string
  ): Promise<{
    totalProcessed: number;
    successCount: number;
    streetsCreated: number;
    unitsCreated: number;
    skippedCount: number;
    errors: Array<{ row: number; data: any; reason: string }>;
    estateId: string;
    estateName: string;
  }> {
    const rows = this.parseFile(buffer, filename);
    const result = {
      totalProcessed: rows.length,
      successCount: 0,
      streetsCreated: 0,
      unitsCreated: 0,
      skippedCount: 0,
      errors: [] as Array<{ row: number; data: any; reason: string }>,
      estateId: '',
      estateName: '',
    };

    const validUnitTypes = ['flat', 'duplex', 'chalet', 'terrace', 'plot', 'house', 'apartment', 'other'];

    const transaction = await sequelize.transaction();

    try {
      // Look up estate by estate_code
      const { Estate } = await import('../../estate/models/estate.model');
      const estate = await Estate.findOne({
        where: { estate_code: estateCode },
        transaction,
      });

      if (!estate) {
        throw new Error(`Estate with code '${estateCode}' not found`);
      }

      const estateId = estate.estate_id;
      result.estateId = estateId;
      result.estateName = estate.name;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          const streetName: string =
            row['street_name'] || row['Street Name'] || row['Street'] || '';
          const unitIdentifier: string =
            row['unit_identifier'] || row['Unit'] || row['Unit ID'] || row['Unit Identifier'] || '';

          if (!streetName) {
            result.errors.push({ row: i + 2, data: row, reason: 'street_name is required' });
            continue;
          }
          if (!unitIdentifier) {
            result.errors.push({ row: i + 2, data: row, reason: 'unit_identifier is required' });
            continue;
          }

          // Deduplicate street within this estate
          const [street, streetCreated] = await Street.findOrCreate({
            where: { name: streetName, estate_id: estateId },
            defaults: { name: streetName, estate_id: estateId },
            transaction,
          });
          if (streetCreated) result.streetsCreated++;

          // Resolve unit_type — coerce invalid values to 'flat'
          const rawType = (row['unit_type'] || row['Type'] || '').toLowerCase();
          const unitType = validUnitTypes.includes(rawType) ? rawType : 'flat';

          const rawFloor = row['floor'] || row['Floor'];
          const floor = rawFloor !== undefined && rawFloor !== '' ? parseInt(rawFloor, 10) || null : null;

          const block: string | null = row['block'] || row['Block'] || null;

          // IMPORTANT: deduplicate on (unit_identifier, street_id) — NOT unit_identifier alone.
          // The unique constraint is now composite (migration 20260418000062).
          const [, unitCreated] = await Unit.findOrCreate({
            where: { unit_identifier: unitIdentifier, street_id: street.street_id },
            defaults: {
              unit_identifier: unitIdentifier,
              street_id: street.street_id,
              unit_type: unitType as any,
              block: block ?? undefined,
              floor: floor ?? undefined,
              status: 'vacant',
            },
            transaction,
          });

          if (unitCreated) {
            result.unitsCreated++;
            result.successCount++;
          } else {
            result.skippedCount++;
          }
        } catch (err) {
          result.errors.push({
            row: i + 2,
            data: row,
            reason: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      await this.createBulkUploadJob(
        {
          userId,
          uploadType: 'streets_units',
          filename,
          sourceFileKey: null,
          sourceFileUrl: null,
          totalProcessed: result.totalProcessed,
          successCount: result.successCount,
          streetsCreated: result.streetsCreated,
          unitsCreated: result.unitsCreated,
          skippedCount: result.skippedCount,
          errors: result.errors,
        },
        transaction
      );

      await transaction.commit();
      return result;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  private mapRowToEstate(row: any): EstateData {
    return {
      name: row['Name'] || row['name'] || row['Estate Name'] || '',
      address: row['Address'] || row['address'] || '',
      type: (row['Type'] || row['type'] || 'residential').toLowerCase(),
      city: row['City'] || row['city'] || '',
      state: row['State'] || row['state'] || '',
      country: row['Country'] || row['country'] || '',
      estate_code: row['Estate Code'] || row['estate_code'] || row['Code'] || '',
      number_of_appartments: parseInt(row['Apartments'] || row['apartments'] || '0') || undefined,
      total_number_of_floors: parseInt(row['Floors'] || row['floors'] || '0') || undefined
    };
  }

  private mapRowToResident(row: any): ResidentData {
    return {
      user_id: row['User ID'] || row['user_id'] || '',
      estate_id: row['Estate ID'] || row['estate_id'] || '',
      unit_id: row['Unit ID'] || row['unit_id'] || '',
      move_in_date: new Date(row['Move In Date'] || row['move_in_date'] || Date.now()),
      lease_start_date: row['Lease Start'] ? new Date(row['Lease Start']) : undefined,
      lease_end_date: row['Lease End'] ? new Date(row['Lease End']) : undefined,
      emergency_contact_name: row['Emergency Contact'] || row['emergency_contact_name'] || '',
      emergency_contact_phone: row['Emergency Phone'] || row['emergency_contact_phone'] || '',
      status: (row['Status'] || row['status'] || 'active').toLowerCase()
    };
  }

  private mapRowToAddress(row: any, estateId: string): AddressData {
    return {
      estate_id: estateId,
      street: row['Street'] || row['street'] || '',
      building: row['Building'] || row['building'] || '',
      apartment_number: row['Apartment'] || row['apartment_number'] || row['Unit'] || '',
      city: row['City'] || row['city'] || '',
      state: row['State'] || row['state'] || '',
      country: row['Country'] || row['country'] || '',
      zip_code: row['Zip'] || row['zip_code'] || row['Postal Code'] || '',
      available: row['Available'] !== undefined ? Boolean(row['Available']) : true
    };
  }

  // Placeholder methods - replace with actual model operations
  private async createEstate(data: EstateData, transaction: any): Promise<any> {
    // Use findOrCreate to prevent duplicates based on name + address
    const [estate, created] = await this.findOrCreateEstate({
      where: { 
        name: data.name,
        address: data.address 
      },
      defaults: data,
      transaction
    });
    return { ...estate, isNew: created };
  }

  private async createResident(data: ResidentData, transaction: any): Promise<any> {
    // Use findOrCreate to prevent duplicates based on user_id + estate_id
    const [resident, created] = await this.findOrCreateResident({
      where: { 
        user_id: data.user_id,
        estate_id: data.estate_id 
      },
      defaults: data,
      transaction
    });
    return { ...resident, isNew: created };
  }

  private async createAddress(data: AddressData, transaction: any): Promise<any> {
    // Use findOrCreate to prevent duplicates based on estate_id + apartment_number
    const [address, created] = await this.findOrCreateAddress({
      where: { 
        estate_id: data.estate_id,
        apartment_number: data.apartment_number 
      },
      defaults: data,
      transaction
    });
    return { ...address, isNew: created };
  }

  // Placeholder model methods - replace with actual Sequelize models
  private async findOrCreateEstate(options: any): Promise<[any, boolean]> {
    // Replace with: return Estate.findOrCreate(options);
    return [{ id: 'estate_' + Date.now(), ...options.defaults }, true];
  }

  private async findOrCreateResident(options: any): Promise<[any, boolean]> {
    // Replace with: return Resident.findOrCreate(options);
    return [{ id: 'resident_' + Date.now(), ...options.defaults }, true];
  }

  private async findOrCreateAddress(options: any): Promise<[any, boolean]> {
    // Replace with: return Address.findOrCreate(options);
    return [{ id: 'address_' + Date.now(), ...options.defaults }, true];
  }

  private async createBulkUploadJob(data: any, transaction: any): Promise<any> {
    // Replace with actual BulkUploadJob model create
    return { id: 'job_' + Date.now(), ...data };
  }

  async cleanupOldBulkFiles(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const oldJobs = await this.getOldBulkUploadJobs(cutoffDate);
    
    let deletedCount = 0;
    for (const job of oldJobs) {
      if (job.sourceFileKey) {
        try {
          await cloudStorage.deleteFile(job.sourceFileKey);
          await this.updateJobFileDeleted(job.id);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete bulk upload file ${job.sourceFileKey}:`, error);
        }
      }
    }
    
    return deletedCount;
  }

  private async getOldBulkUploadJobs(cutoffDate: Date): Promise<any[]> {
    // Replace with actual query
    return [];
  }

  private async updateJobFileDeleted(jobId: string): Promise<void> {
    // Replace with actual update
  }

  validateFileFormat(filename: string): boolean {
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    return allowedExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }
}

export default new BulkUploadService();