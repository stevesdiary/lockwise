const required = [
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'NODE_ENV',
] as const;

const requiredInProduction = [
  'ALLOWED_ORIGINS',
  'PAYSTACK_SECRET_KEY',
] as const;

function validateEnv(): void {
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    for (const key of requiredInProduction) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Check your .env file against .env.example`
    );
  }
}

validateEnv();
