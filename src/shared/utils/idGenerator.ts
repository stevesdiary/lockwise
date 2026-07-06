import {customAlphabet} from 'nanoid';

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

async function generateAccessCode(_estateId: string): Promise<string> {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
