try {
    process.loadEnvFile();
} catch {
    // fine in production
}

const required = ['DATABASE_URL', 'JWT_SECRET', 'APP_ORIGINS'];
for (const name of required) {
    if (!process.env[name]) throw new Error(`Missing environment variable $ {name}`);
}

export const env = {
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  appOrigins: process.env.APP_ORIGINS.split(',').map((origin) => origin.trim()),
  trustProxy: Number(process.env.TRUST_PROXY ?? 1),
  resendApiKey: process.env.RESEND_API_KEY || null,
  emailFrom: process.env.EMAIL_FROM ?? 'Ikofi <no-reply@example.com>',
  jobSecret: process.env.JOB_SECRET || null,
};