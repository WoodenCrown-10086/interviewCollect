export const config = {
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me-in-production',
  databasePath: process.env.DATABASE_PATH ?? 'server/data/app.db',
  isProduction: process.env.NODE_ENV === 'production',
}
