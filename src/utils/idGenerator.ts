import {customAlphabet} from 'nanoid';
import AccessCodeService from '../services/access.code.service';

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
  return await AccessCodeService.generateCode(estateId);
}

function generateCustomAccessCode(eventName: string): string {
  return AccessCodeService.generateCustomCode(eventName);
}

export default { 
  generateEstateId, 
  generateVerificationCode, 
  generateId, 
  generateAccessCode,
  generateCustomAccessCode,
  nanoid  
};
