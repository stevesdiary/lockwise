import dotenv from 'dotenv';
import path from 'path';

// Load .env.test before any modules are imported in test workers
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });
