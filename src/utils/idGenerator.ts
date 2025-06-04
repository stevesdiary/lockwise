import {customAlphabet} from 'nanoid';
// import * as nanoid from 'nanoid';

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

export default { 
  generateEstateId, 
  generateVerificationCode, 
  generateId, 
  nanoid  
};
