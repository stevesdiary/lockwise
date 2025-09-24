import * as XLSX from 'xlsx';
import fs from 'fs';
import sequelize from '../core/database';
import { Address } from '../models/address.model';
import { AddressCreationAttributes } from '../types/address.type';

interface AddressUploadResult {
  addressesCreated: Address[];
  errors: Array<{ row: any; reason: string }>;
  totalProcessed: number;
}

export class AddressUploadService {
  async uploadAddressesFromFile(filePath: string, estateId: string): Promise<AddressUploadResult> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

    const result: AddressUploadResult = {
      addressesCreated: [],
      errors: [],
      totalProcessed: rows.length
    };

    const transaction = await sequelize.transaction();

    try {
      for (const row of rows) {
        try {
          const addressData = this.mapRowToAddress(row, estateId);
          
          if (!addressData.apartment_number) {
            result.errors.push({ row, reason: 'Missing apartment number' });
            continue;
          }

          const [address] = await Address.findOrCreate({
            where: { 
              estate_id: estateId, 
              apartment_number: addressData.apartment_number 
            },
            defaults: addressData,
            transaction
          });

          result.addressesCreated.push(address);
        } catch (error) {
          result.errors.push({ row, reason: `Processing error: ${error}` });
        }
      }

      await transaction.commit();
      fs.unlinkSync(filePath);
      return result;

    } catch (error) {
      await transaction.rollback();
      fs.unlinkSync(filePath);
      throw error;
    }
  }

  private mapRowToAddress(row: any, estateId: string): AddressCreationAttributes {
    return {
      estate_id: estateId,
      street: row['Street'] || row['street'] || '',
      building: row['Building'] || row['building'] || '',
      apartment_number: row['Apartment Number'] || row['apartment_number'] || row['Unit'] || '',
      city: row['City'] || row['city'] || '',
      state: row['State'] || row['state'] || '',
      country: row['Country'] || row['country'] || '',
      zip_code: row['Zip Code'] || row['zip_code'] || row['Postal Code'] || '',
      available: row['Available'] !== undefined ? Boolean(row['Available']) : true
    };
  }
}

export default new AddressUploadService();