import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { passportConfig } from './config/passport.js';
import { router } from './routes/index.js';
import mongoose from 'mongoose';
import morgan from 'morgan';
import connectDB from './config/database/mongodb.js';
import { initializeMonedas } from './config/initData.js';

const app = express();

// Middlewares
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://frontend:5173',
      'http://127.0.0.1:5173',
      undefined // Permitir solicitudes sin origin para desarrollo local
    ];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passportConfig.initialize());
app.use(morgan('dev'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Rutas centralizadas
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Montamos todas las rutas bajo /api
app.use('/api', router);

// Redirigir cualquier intento de acceso a /auth hacia /api/auth
app.use('/auth/*', (req, res, next) => {
  const newUrl = `/api${req.originalUrl}`;
  console.log('Redirigiendo de', req.originalUrl, 'a', newUrl);
  res.redirect(307, newUrl);
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Si es un error de MongoDB
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    return res.status(503).json({
      error: 'Error de base de datos',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
  }
  
  // Si es un error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      message: err.message
    });
  }
  
  res.status(500).json({ 
    error: err.message || 'Error interno del servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 3000;

// Conexión a MongoDB e inicialización de datos
connectDB()
  .then(async () => {
    // Inicializar monedas predeterminadas
    await initializeMonedas();
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
      console.log(`Frontend URL configurada: ${process.env.FRONTEND_URL}`);
    });
  })
  .catch(error => {
    console.error('Error al conectar a la base de datos:', error);
    process.exit(1);
  }); 