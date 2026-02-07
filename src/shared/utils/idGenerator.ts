import {customAlphabet} from 'nanoid';
import AccessCodeService from '../../modules/access/services/access-code.service';

const nanoid = customAlphabet("1234567890", 6)();

function generateEstateId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString(); // Generates an 8-digit random number
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates an 8-digit random number
}

function generateId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString(); // Generates an 8-digit random number
}

async function generateAccessCode(estateId: string): Promise<string> {
  const result = await AccessCodeService.generateCode({ estate_id: estateId });
  return result.code;
}

function generateCustomAccessCode(eventName: string): string {
  return `${eventName.toUpperCase().replace(/\s+/g, '')}-${nanoid}`;
}

export default { 
  generateEstateId, 
  generateVerificationCode, 
  generateId, 
  generateAccessCode,
  generateCustomAccessCode,
  nanoid  
};
