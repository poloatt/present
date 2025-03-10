import dotenv from 'dotenv';

dotenv.config({ path: '.env.staging' });

const config = {
  env: 'staging',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUrl: process.env.MONGODB_URI || 'mongodb://mongodb-staging:27017/present',
  jwtSecret: process.env.JWT_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  apiUrl: process.env.BACKEND_URL || 'http://localhost:5001',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080',
  corsOrigins: [
    'http://localhost:8080',
    'http://localhost:5001',
    'http://localhost:5173'
  ],
  sessionSecret: process.env.SESSION_SECRET,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback'
  },
  isDev: false
};

// Validación de configuración crítica en staging
const requiredEnvVars = [
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'SESSION_SECRET',
  'MONGODB_URI',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`La variable de entorno ${envVar} es requerida en staging`);
  }
}

console.log('Configuración de MongoDB en Staging:', {
  url: config.mongoUrl,
  environment: config.env
});

console.log('Configuración de URLs en Staging:', {
  frontend: config.frontendUrl,
  backend: config.apiUrl,
  corsOrigins: config.corsOrigins
});

export default config; 