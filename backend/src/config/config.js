import dotenv from 'dotenv';

dotenv.config();

export default {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUrl: process.env.MONGODB_URI || process.env.MONGO_URL,
  jwtSecret: process.env.JWT_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  apiUrl: process.env.API_URL || process.env.BACKEND_URL,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
  }
}; 