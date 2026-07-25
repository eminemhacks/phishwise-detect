export default () => ({
  port: parseInt(process.env.PORT ?? '', 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  db: {
    // Single connection string (Neon, Render, etc). When set, it wins over DB_*.
    url: process.env.DATABASE_URL || '',
    // Enable TLS for managed Postgres. Defaults on when DATABASE_URL is present.
    ssl:
      process.env.DB_SSL === 'true' ||
      (process.env.DB_SSL !== 'false' && !!process.env.DATABASE_URL),
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '', 10) || 5432,
    username: process.env.DB_USERNAME || 'phishwise',
    password: process.env.DB_PASSWORD || 'phishwise',
    name: process.env.DB_NAME || 'phishwise',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  },
  tokens: {
    emailTtlHours: parseInt(process.env.EMAIL_TOKEN_TTL_HOURS ?? '', 10) || 24,
    resetTtlHours: parseInt(process.env.RESET_TOKEN_TTL_HOURS ?? '', 10) || 1,
  },
  // Optional Google Safe Browsing enrichment (OFF by default, never depended on).
  safeBrowsing: {
    enabled: process.env.SAFE_BROWSING_ENABLED === 'true',
    apiKey: process.env.GOOGLE_SAFE_BROWSING_API_KEY || '',
  },
  mail: {
    host: process.env.MAIL_HOST || '',
    port: parseInt(process.env.MAIL_PORT ?? '', 10) || 587,
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER || '',
    password: process.env.MAIL_PASSWORD || '',
    from: process.env.MAIL_FROM || 'PhishWise <no-reply@phishwise.app>',
  },
});
