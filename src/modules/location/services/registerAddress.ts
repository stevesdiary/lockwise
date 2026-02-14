import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import sequelize from '../../../shared/core/database';
import { Street } from '../../estate/models/street.model';
import { Unit } from '../../estate/models/unit.model';

export async function importStreetsAndUnits(filePath: string, estateId: string) {
  // Validate file path to prevent path traversal
  const normalizedPath = path.normalize(filePath);
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  
  if (!normalizedPath.startsWith(uploadDir)) {
    throw new Error('Invalid file path: Path traversal detected');
  }
  
  // Verify file exists and is readable
  if (!fs.existsSync(normalizedPath)) {
    throw new Error('File not found');
  }
  
  const workbook = XLSX.readFile(normalizedPath);
  const streetsSheet = workbook.Sheets['Streets'];
  const unitsSheet = workbook.Sheets['Units'];

  const streetRows: any[] = XLSX.utils.sheet_to_json(streetsSheet);
  const unitRows: any[] = XLSX.utils.sheet_to_json(unitsSheet);

  const result = {
    streetsCreated: [] as Street[],
    unitsCreated: [] as Unit[],
    errors: [] as Array<{ row: any; reason: string }>
  };

  const transaction = await sequelize.transaction();

  try {
    // ✅ 1. Insert Streets
    for (const row of streetRows) {
      const name = row['Street Name'];
      if (!name) {
        result.errors.push({ row, reason: 'Missing street name' });
        continue;
      }

      const [street] = await Street.findOrCreate({
        where: { name, estate_id: estateId },
        defaults: { name, estate_id: estateId },
        transaction
      });

      result.streetsCreated.push(street);
    }

    // ✅ 2. Insert Units (only if streets are created)
    for (const row of unitRows) {
      const streetName = row['Street Name'];
      const number = row['Unit Number'];
      if (!streetName || !number) {
        result.errors.push({ row, reason: 'Missing street or unit number' });
        continue;
      }

      const street = await Street.findOne({ where: { name: streetName, estate_id: estateId }, transaction });
      if (!street) {
        result.errors.push({ row, reason: `Street not found: ${streetName}` });
        continue;
      }

      const [unit] = await Unit.findOrCreate({
        where: { unit_identifier: number, street_id: street.id },
        defaults: {
          unit_identifier: number,
          block: row['Block'] || null,
          floor: row['Floor'] || null,
          unit_type: row['Type'] || 'flat',
          street_id: street.id
        },
        transaction
      });

      result.unitsCreated.push(unit);
    }

    await transaction.commit();
    // Securely delete file after processing
    if (fs.existsSync(normalizedPath)) {
      fs.unlinkSync(normalizedPath);
    }
    return result;

  } catch (err) {
    await transaction.rollback();
    // Securely delete file on error
    if (fs.existsSync(normalizedPath)) {
      fs.unlinkSync(normalizedPath);
    }
    throw err;
  }
}
