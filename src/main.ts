import 'dotenv/config';
import './shared/config/env'; // Validates required env vars — must be before other imports
import startServer, { shutdown } from "./shared/core";

startServer();

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  shutdown('uncaughtException');
});
