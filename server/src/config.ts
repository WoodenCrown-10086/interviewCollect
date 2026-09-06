export const config = {
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me-in-production',
  databasePath: process.env.DATABASE_PATH ?? 'server/data/app.db',
  isProduction: process.env.NODE_ENV === 'production',
  // cookie secure：默认跟随生产环境；无 HTTPS 的服务器（纯 IP+HTTP）显式设 COOKIE_SECURE=false
  cookieSecure:
    process.env.COOKIE_SECURE !== undefined
      ? process.env.COOKIE_SECURE === 'true'
      : process.env.NODE_ENV === 'production',
}
